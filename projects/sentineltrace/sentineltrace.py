#!/usr/bin/env python3
"""SentinelTrace: a lightweight SSH authentication log analyzer for SOC lab use.

This tool is designed for authorized, controlled environments. It reads Linux
OpenSSH authentication log lines, detects repeated failures and risky login
patterns, and exports a machine-readable alert set plus an HTML summary.
"""
from __future__ import annotations

import argparse
import csv
import html
import json
import re
import sys
import time
from collections import defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Iterable

SYSLOG_RE = re.compile(
    r"^(?P<month>[A-Z][a-z]{2})\s+(?P<day>\d{1,2})\s+"
    r"(?P<clock>\d{2}:\d{2}:\d{2})\s+(?P<host>\S+)\s+"
    r"sshd(?:\[\d+\])?:\s+(?P<message>.*)$"
)
FAILED_RE = re.compile(
    r"Failed password for (?:invalid user )?(?P<user>\S+) from (?P<ip>[0-9a-fA-F:.]+)"
)
ACCEPTED_RE = re.compile(
    r"Accepted (?:password|publickey) for (?P<user>\S+) from (?P<ip>[0-9a-fA-F:.]+)"
)

RFC1918_AND_LOCAL = (
    "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "127.0.0.0/8",
    "169.254.0.0/16", "::1/128", "fc00::/7", "fe80::/10",
)


@dataclass(frozen=True)
class Event:
    timestamp: datetime
    host: str
    event_type: str
    username: str
    source_ip: str
    raw: str


@dataclass(frozen=True)
class Alert:
    alert_id: str
    rule_id: str
    severity: str
    title: str
    source_ip: str
    username: str
    first_seen: str
    last_seen: str
    event_count: int
    description: str
    recommendation: str


def parse_line(line: str, year: int | None = None) -> Event | None:
    """Parse one OpenSSH auth.log line. Non-SSH or unrecognized lines are ignored."""
    match = SYSLOG_RE.match(line.strip())
    if not match:
        return None
    message = match.group("message")
    fail = FAILED_RE.search(message)
    accepted = ACCEPTED_RE.search(message)
    if not fail and not accepted:
        return None

    event_match = fail or accepted
    event_type = "auth_failure" if fail else "auth_success"
    log_year = year if year is not None else datetime.now().year
    timestamp_text = f"{match.group('month')} {match.group('day')} {log_year} {match.group('clock')}"
    try:
        timestamp = datetime.strptime(timestamp_text, "%b %d %Y %H:%M:%S")
    except ValueError:
        return None
    return Event(
        timestamp=timestamp,
        host=match.group("host"),
        event_type=event_type,
        username=event_match.group("user"),
        source_ip=event_match.group("ip"),
        raw=line.strip(),
    )


def _is_non_private_source(ip_text: str) -> bool:
    """Return True when an address is outside common private/local ranges.

    Documentation-only TEST-NET addresses are intentionally treated as remote
    in the sample lab so the remote-root rule can be demonstrated safely.
    This is not a geo-IP or public-routability determination.
    """
    try:
        import ipaddress
        address = ipaddress.ip_address(ip_text)
        return not any(
            address.version == ipaddress.ip_network(net).version
            and address in ipaddress.ip_network(net)
            for net in RFC1918_AND_LOCAL
        )
    except ValueError:
        return False


def detect(events: Iterable[Event], threshold: int = 5,
           window_minutes: int = 5, followup_minutes: int = 10) -> list[Alert]:
    """Run deterministic first-level detections over parsed authentication events."""
    ordered = sorted(events, key=lambda item: item.timestamp)
    failures_by_ip: dict[str, list[Event]] = defaultdict(list)
    successes: list[Event] = []
    for event in ordered:
        if event.event_type == "auth_failure":
            failures_by_ip[event.source_ip].append(event)
        elif event.event_type == "auth_success":
            successes.append(event)

    alerts: list[Alert] = []
    brute_force_windows: dict[str, tuple[datetime, datetime, list[Event]]] = {}
    window = timedelta(minutes=window_minutes)

    for source_ip, failed_events in failures_by_ip.items():
        left = 0
        for right, current in enumerate(failed_events):
            while failed_events[left].timestamp < current.timestamp - window:
                left += 1
            cluster = failed_events[left:right + 1]
            if len(cluster) >= threshold:
                # Include every failure in the first qualifying window, not only
                # the first threshold-crossing event.
                end = right + 1
                while end < len(failed_events) and failed_events[end].timestamp <= cluster[0].timestamp + window:
                    end += 1
                cluster = failed_events[left:end]
                first, last = cluster[0], cluster[-1]
                brute_force_windows[source_ip] = (first.timestamp, last.timestamp, cluster)
                usernames = ", ".join(sorted({item.username for item in cluster}))
                alert_id = f"SSH_BRUTE_FORCE:{source_ip}:{first.timestamp.isoformat()}"
                alerts.append(Alert(
                    alert_id=alert_id,
                    rule_id="SSH_BRUTE_FORCE",
                    severity="HIGH",
                    title="Repeated SSH authentication failures",
                    source_ip=source_ip,
                    username=usernames,
                    first_seen=first.timestamp.isoformat(timespec="seconds"),
                    last_seen=last.timestamp.isoformat(timespec="seconds"),
                    event_count=len(cluster),
                    description=(f"Observed {len(cluster)} failed SSH authentication attempts "
                                 f"from {source_ip} within {window_minutes} minutes."),
                    recommendation=("Review the source and targeted accounts; confirm whether "
                                    "the activity is expected, then apply approved blocking or "
                                    "account-protection procedures if malicious."),
                ))
                break

    for source_ip, (first_time, last_time, cluster) in brute_force_windows.items():
        for success in successes:
            if success.source_ip != source_ip:
                continue
            elapsed = success.timestamp - first_time
            if success.timestamp >= last_time and timedelta(0) <= elapsed <= timedelta(minutes=followup_minutes):
                alert_id = f"AUTH_SUCCESS_AFTER_FAILURES:{source_ip}:{success.timestamp.isoformat()}"
                alerts.append(Alert(
                    alert_id=alert_id,
                    rule_id="AUTH_SUCCESS_AFTER_FAILURES",
                    severity="CRITICAL",
                    title="Successful login after repeated failures",
                    source_ip=source_ip,
                    username=success.username,
                    first_seen=first_time.isoformat(timespec="seconds"),
                    last_seen=success.timestamp.isoformat(timespec="seconds"),
                    event_count=len(cluster) + 1,
                    description=(f"A successful SSH login for {success.username} followed "
                                 f"a burst of {len(cluster)} failed attempts from the same source."),
                    recommendation=("Prioritize account-owner verification, review surrounding "
                                    "authentication activity, preserve relevant logs, and escalate "
                                    "according to the incident-response process."),
                ))
                break

    for event in successes:
        if event.username.lower() == "root" and _is_non_private_source(event.source_ip):
            alert_id = f"REMOTE_ROOT_LOGIN:{event.source_ip}:{event.timestamp.isoformat()}"
            alerts.append(Alert(
                alert_id=alert_id,
                rule_id="REMOTE_ROOT_LOGIN",
                severity="HIGH",
                title="Remote SSH login to root account",
                source_ip=event.source_ip,
                username=event.username,
                first_seen=event.timestamp.isoformat(timespec="seconds"),
                last_seen=event.timestamp.isoformat(timespec="seconds"),
                event_count=1,
                description=(f"A successful SSH login to the root account was observed from "
                             f"a source outside common private/local address ranges: {event.source_ip}."),
                recommendation=("Verify whether direct remote root access is permitted; review "
                                "the account and source context, and prefer named accounts with "
                                "least privilege where applicable."),
            ))

    # Stable de-duplication protects repeated processing in live-follow mode.
    unique = {alert.alert_id: alert for alert in alerts}
    severity_rank = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    return sorted(unique.values(), key=lambda a: (severity_rank.get(a.severity, 9), a.first_seen, a.rule_id))


def parse_file(path: Path) -> list[Event]:
    events: list[Event] = []
    with path.open("r", encoding="utf-8", errors="replace") as handle:
        for line in handle:
            parsed = parse_line(line)
            if parsed:
                events.append(parsed)
    return events


def write_outputs(events: list[Event], alerts: list[Alert], out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "alerts.json").write_text(
        json.dumps([asdict(alert) for alert in alerts], indent=2), encoding="utf-8"
    )
    with (out_dir / "alerts.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(asdict(alerts[0]).keys()) if alerts else
                                [field for field in Alert.__dataclass_fields__])
        writer.writeheader()
        for alert in alerts:
            writer.writerow(asdict(alert))

    summary = {
        "project": "SentinelTrace",
        "data_source": "Linux OpenSSH authentication log",
        "events_parsed": len(events),
        "authentication_failures": sum(e.event_type == "auth_failure" for e in events),
        "authentication_successes": sum(e.event_type == "auth_success" for e in events),
        "alerts_generated": len(alerts),
        "severity_counts": {severity: sum(a.severity == severity for a in alerts)
                            for severity in ("CRITICAL", "HIGH", "MEDIUM", "LOW")},
        "rules_triggered": sorted({a.rule_id for a in alerts}),
        "dataset_note": "Bundled sample events are synthetic and use documentation-only IP ranges.",
    }
    (out_dir / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    (out_dir / "report.html").write_text(render_report(summary, alerts), encoding="utf-8")


def render_report(summary: dict, alerts: list[Alert]) -> str:
    rows = []
    for alert in alerts:
        rows.append(
            "<tr>"
            f"<td><span class='severity {alert.severity.lower()}'>{html.escape(alert.severity)}</span></td>"
            f"<td><strong>{html.escape(alert.title)}</strong><small>{html.escape(alert.rule_id)}</small></td>"
            f"<td>{html.escape(alert.source_ip)}</td>"
            f"<td>{html.escape(alert.username)}</td>"
            f"<td>{alert.event_count}</td>"
            f"<td>{html.escape(alert.last_seen)}</td>"
            "</tr>"
        )
    if not rows:
        rows.append("<tr><td colspan='6'>No alerts triggered for this input.</td></tr>")
    severity = summary["severity_counts"]
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SentinelTrace | SOC Triage Report</title>
<style>
:root{{--bg:#071426;--panel:#10243c;--muted:#9bb0c9;--text:#edf5ff;--cyan:#42d7f5;--line:#23415e}}
*{{box-sizing:border-box}}body{{margin:0;background:linear-gradient(145deg,#071426,#0b1e35);color:var(--text);font:15px/1.55 Inter,Segoe UI,Arial,sans-serif;padding:34px}}
main{{max-width:1120px;margin:auto}}.top{{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}}h1{{margin:0;font-size:32px;letter-spacing:-1px}}.tag{{color:var(--cyan);font-size:12px;letter-spacing:2px;text-transform:uppercase}}p{{color:var(--muted)}}.grid{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:26px 0}}
.card{{background:var(--panel);border:1px solid var(--line);padding:18px;border-radius:13px}}.num{{font-size:27px;font-weight:700}}.label{{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1px}}
table{{width:100%;border-collapse:collapse;background:var(--panel);border:1px solid var(--line);border-radius:13px;overflow:hidden}}th,td{{text-align:left;padding:14px;border-bottom:1px solid var(--line);vertical-align:top}}th{{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px}}small{{display:block;color:var(--muted);margin-top:3px}}.severity{{display:inline-block;padding:4px 8px;border-radius:20px;font-size:11px;font-weight:700}}.critical{{background:#542538;color:#ffc5d4}}.high{{background:#55351c;color:#ffd2a4}}.medium{{background:#4c471e;color:#f8ef9c}}.low{{background:#21443e;color:#b2f3d5}}.note{{font-size:12px;margin-top:18px;border-left:3px solid var(--cyan);padding:10px 14px;background:#0d2037;color:var(--muted)}}
@media(max-width:760px){{body{{padding:18px}}.grid{{grid-template-columns:repeat(2,minmax(0,1fr))}}table{{display:block;overflow-x:auto;white-space:nowrap}}}}
</style></head><body><main>
<div class="top"><div><div class="tag">Security operations · Lab report</div><h1>SentinelTrace</h1><p>Authentication log monitoring and first-level alert triage</p></div><div class="tag">Generated report</div></div>
<div class="grid">
<div class="card"><div class="label">Events parsed</div><div class="num">{summary['events_parsed']}</div></div>
<div class="card"><div class="label">Alerts generated</div><div class="num">{summary['alerts_generated']}</div></div>
<div class="card"><div class="label">Critical alerts</div><div class="num">{severity['CRITICAL']}</div></div>
<div class="card"><div class="label">High alerts</div><div class="num">{severity['HIGH']}</div></div>
</div>
<h2>Detection results</h2><table><thead><tr><th>Severity</th><th>Detection</th><th>Source IP</th><th>Account</th><th>Events</th><th>Last seen</th></tr></thead><tbody>{''.join(rows)}</tbody></table>
<div class="note">Lab data notice: this report uses synthetic training events and documentation-only IP addresses. Alerts are rule-based indicators for analyst review, not proof of compromise. Validate context before escalation or containment.</div>
</main></body></html>"""


def run_follow(path: Path, out_dir: Path, poll_seconds: float, threshold: int, window_minutes: int) -> None:
    """Read existing events, then monitor appended lines and emit newly seen alerts."""
    events = parse_file(path)
    seen: set[str] = set()
    out_dir.mkdir(parents=True, exist_ok=True)
    stream_path = out_dir / "stream_alerts.jsonl"
    current = detect(events, threshold=threshold, window_minutes=window_minutes)
    for alert in current:
        seen.add(alert.alert_id)
        print(f"[{alert.severity}] {alert.rule_id}: {alert.description}")
    print(f"Live follow enabled for {path}. Append new SSH auth lines; press Ctrl+C to stop.")
    with path.open("r", encoding="utf-8", errors="replace") as handle, stream_path.open("a", encoding="utf-8") as out:
        handle.seek(0, 2)
        try:
            while True:
                line = handle.readline()
                if not line:
                    time.sleep(poll_seconds)
                    continue
                parsed = parse_line(line)
                if not parsed:
                    continue
                events.append(parsed)
                for alert in detect(events, threshold=threshold, window_minutes=window_minutes):
                    if alert.alert_id not in seen:
                        seen.add(alert.alert_id)
                        payload = asdict(alert)
                        out.write(json.dumps(payload) + "\n")
                        out.flush()
                        print(f"[{alert.severity}] {alert.rule_id}: {alert.description}")
        except KeyboardInterrupt:
            print("\nLive follow stopped.")


def main() -> int:
    parser = argparse.ArgumentParser(description="Analyze SSH authentication logs for SOC triage signals.")
    parser.add_argument("log_file", type=Path, help="Path to a Linux OpenSSH auth.log file")
    parser.add_argument("--out", type=Path, default=Path("outputs"), help="Output directory (default: outputs)")
    parser.add_argument("--threshold", type=int, default=5, help="Failed attempts to trigger brute-force rule (default: 5)")
    parser.add_argument("--window", type=int, default=5, help="Brute-force time window in minutes (default: 5)")
    parser.add_argument("--follow", action="store_true", help="Follow appended log lines after displaying current detections")
    parser.add_argument("--poll-seconds", type=float, default=1.0, help="Polling interval for --follow (default: 1 second)")
    args = parser.parse_args()

    if not args.log_file.is_file():
        parser.error(f"log file not found: {args.log_file}")
    if args.threshold < 2 or args.window < 1 or args.poll_seconds <= 0:
        parser.error("threshold must be >=2; window and poll interval must be positive")
    if args.follow:
        run_follow(args.log_file, args.out, args.poll_seconds, args.threshold, args.window)
        return 0

    events = parse_file(args.log_file)
    alerts = detect(events, threshold=args.threshold, window_minutes=args.window)
    write_outputs(events, alerts, args.out)
    print("SentinelTrace analysis complete")
    print(f"Events parsed: {len(events)}")
    print(f"Alerts generated: {len(alerts)}")
    for alert in alerts:
        print(f"[{alert.severity}] {alert.rule_id} | {alert.source_ip} | {alert.title}")
    print(f"Reports written to: {args.out.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
