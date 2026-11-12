# SentinelTrace

**Python-based SSH authentication log monitoring and first-level SOC alert triage**

SentinelTrace is a compact, reproducible security operations lab that parses Linux OpenSSH authentication logs, identifies suspicious authentication patterns, prioritizes alerts, and exports analyst-friendly reports.

It addresses a practical first-level monitoring problem: repeated authentication failures and unusual account access can be difficult to spot when an analyst has to inspect raw log lines manually.

> **Lab scope and data integrity:** This project is completed and tested as a controlled portfolio lab. The bundled input uses synthetic events and documentation-only IP addresses. It is not a production SIEM, has not been deployed in an employer environment, and does not process live enterprise telemetry. The optional `--follow` mode can monitor lines appended to an authorized local log file.

## What it does

1. Parses Linux OpenSSH authentication events from `auth.log`.
2. Detects five or more failed SSH authentication attempts from the same source within a configurable time window.
3. Detects a successful login from the same source after a repeated-failure burst.
4. Flags successful remote SSH logins to the `root` account when the source is outside common private/local address ranges.
5. Assigns severity and investigation guidance to each alert.
6. Exports JSON, CSV, and an HTML summary dashboard.
7. Supports file-follow monitoring for newly appended log lines.

## Detection rules

| Rule ID | Condition | Default severity | Analyst next step |
|---|---|---|---|
| `SSH_BRUTE_FORCE` | 5+ failed SSH logins from one source IP within 5 minutes | High | Review source/account context; validate whether activity is expected; follow approved blocking/escalation procedures if malicious. |
| `AUTH_SUCCESS_AFTER_FAILURES` | Successful SSH login from a source that triggered the repeated-failure rule, within 10 minutes of the burst start | Critical | Verify the account owner, review surrounding activity, preserve logs, and escalate under the incident process. |
| `REMOTE_ROOT_LOGIN` | Successful SSH login to `root` from outside common private/local ranges | High | Verify whether remote root access is allowed; review source and account context; prefer named least-privilege accounts where applicable. |

The rules are triage indicators, not proof of compromise. Analyst validation is required before taking action.

## Quick start

Requirements: Python 3.10 or later. The project uses only the Python standard library.

```bash
# Clone or download this repository, then enter the folder
cd sentineltrace_project

# Run the included training dataset
python src/sentineltrace.py data/sample_auth.log --out outputs

# Run the unit tests
python -m unittest discover -s tests -v
```

Expected sample run:

```text
SentinelTrace analysis complete
Events parsed: 8
Alerts generated: 3
[CRITICAL] AUTH_SUCCESS_AFTER_FAILURES | 203.0.113.45 | Successful login after repeated failures
[HIGH] SSH_BRUTE_FORCE | 203.0.113.45 | Repeated SSH authentication failures
[HIGH] REMOTE_ROOT_LOGIN | 203.0.113.60 | Remote SSH login to root account
```

The sample dataset contains 8 synthetic authentication events: 5 failures and 3 successes. The expected result is 3 alerts (1 Critical and 2 High). Five unit tests validate parsing, ignored lines, detection rules, and a normal-login case.

## Output files

After a batch run, `outputs/` contains:

- `alerts.json` - structured alert records.
- `alerts.csv` - spreadsheet-friendly alert records.
- `summary.json` - event counts, severity counts, and triggered rules.
- `report.html` - standalone SOC triage summary page.

## Live-follow mode

For an authorized local Linux host, the optional follow mode watches the end of the selected file and reports newly triggered alerts as new lines are appended:

```bash
python src/sentineltrace.py /var/log/auth.log --follow --out outputs
```

Use this only where you have permission to access the log. It does not install an agent, configure log forwarding, or replace a SIEM. It reads the file supplied to it. Stop with `Ctrl+C`.

## Example investigation workflow

1. Run the analyzer and open `outputs/report.html`.
2. Start with Critical alerts, then review High alerts.
3. Validate the source IP, username, event timing, and surrounding authentication records.
4. Determine whether the activity is expected, suspicious, or inconclusive.
5. Document evidence, decision, and escalation path in the case notes.
6. Recommend containment only through approved organizational procedures.

## Limitations and next steps

- Supports the included Linux OpenSSH syslog-style message patterns; other log formats need parser extensions.
- Time parsing assumes the current year because classic syslog lines do not include a year. For multi-year archives, add a year-aware parser or timestamp-normalized input.
- Detection is deterministic and rule-based; it does not use threat intelligence, geolocation, machine learning, or cross-host correlation.
- File-follow mode watches one file and does not handle log rotation automatically.
- Remote-source classification excludes common private/local ranges; it is not a public-IP reputation or routability check.
- A production deployment would require secure log collection, time synchronization, access control, retention, alert tuning, and monitored response procedures.

## Repository layout

```text
sentineltrace_project/
├── README.md
├── requirements.txt
├── src/
│   └── sentineltrace.py
├── data/
│   └── sample_auth.log
├── tests/
│   └── test_sentineltrace.py
├── outputs/
│   ├── alerts.csv
│   ├── alerts.json
│   ├── report.html
│   └── summary.json
└── docs/
    └── project-report.md
```

## Portfolio summary

**Project title:** SentinelTrace - Python-Based Security Log Monitoring & Threat Detection

**Problem:** Manual inspection of authentication logs can delay detection of repeated login failures and suspicious privileged access.

**Tools:** Python 3, Linux OpenSSH authentication logs, regular expressions, JSON, CSV, HTML, unit testing.

**Demonstrated outcome:** In the bundled controlled test scenario, parsed 8 synthetic authentication events and generated 3 rule-based alerts across 1 Critical and 2 High severity levels; all 5 unit tests pass.

**Skills demonstrated:** Security Monitoring, Log Analysis, Threat Detection, Incident Triage, Alert Prioritization, Python, Linux, TCP/IP fundamentals, Technical Documentation.
