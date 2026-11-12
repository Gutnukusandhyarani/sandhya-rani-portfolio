# SentinelTrace - Project Report

## Executive summary

SentinelTrace is a completed, small-scale SOC lab that analyzes Linux OpenSSH authentication logs and raises prioritized alerts for three suspicious patterns. It was designed to demonstrate first-level monitoring and triage using an auditable, rule-based workflow.

## Problem

Authentication activity is often recorded as individual log entries. During manual review, repeated failures, a later successful login, or direct remote access to a privileged account may be overlooked or require time-consuming filtering.

## Approach

The tool parses supported SSH authentication lines into normalized events containing timestamp, host, event type, username, and source IP. It groups events by source and evaluates configurable thresholds and time windows. Alerts include severity, evidence summary, and recommended analyst follow-up.

## Detection logic

- **SSH_BRUTE_FORCE:** five or more failures from one source within five minutes.
- **AUTH_SUCCESS_AFTER_FAILURES:** successful authentication from the same source within ten minutes of the repeated-failure burst.
- **REMOTE_ROOT_LOGIN:** successful root SSH authentication from outside the common private/local address ranges.

## Test scenario and measured output

The included sample file contains eight synthetic OpenSSH events. Five are failed attempts from a single source IP, followed by a successful authentication from that source. A separate successful root login is included to validate the privileged-access rule, along with a normal internal login.

| Measure | Observed result |
|---|---:|
| Authentication events parsed | 8 |
| Failed authentication events | 5 |
| Successful authentication events | 3 |
| Alerts generated | 3 |
| Critical alerts | 1 |
| High alerts | 2 |
| Unit tests passing | 5 of 5 |

These counts describe only the included synthetic test scenario. They are not production detection rates, false-positive rates, incident counts, or service-level metrics.

## Outputs

The batch workflow creates JSON and CSV alert exports, a JSON run summary, and a standalone HTML triage report. A file-follow mode can monitor new lines appended to an authorized local log file.

## Analyst workflow

Review Critical alerts first, validate the source and account context, correlate nearby log records, document whether the activity is expected or suspicious, and escalate through approved processes. A detection rule is an indicator for investigation, not proof of compromise.

## Limitations

This lab supports a defined subset of Linux OpenSSH log messages. It does not install a log collector, connect to an enterprise SIEM, enrich events with threat intelligence, correlate multiple endpoints, or take automated containment actions. File rotation is not handled. The bundled IP addresses are documentation-only examples.

## Conclusion

The project demonstrates a complete, reproducible workflow from raw authentication log lines to normalized events, rule-based detections, prioritized alerts, and analyst-oriented reporting. Its next iteration could add Windows event parsing, configurable YAML rules, log rotation handling, and integration with a lab SIEM.
