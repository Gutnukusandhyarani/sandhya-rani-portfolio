# Project Portfolio Kit — Resume, LinkedIn and Profile Copy

Last reviewed: 23 November 2026.

This document contains copy-ready descriptions for SentinelOps, SigmaForge and SentinelTrace. Keep the scope notes alongside the claims; they distinguish hosted endpoint telemetry from repository fixtures and synthetic training data.

## Portfolio links

- Portfolio: https://sandhya-rani-portfolio.vercel.app/
- Project dashboard directory: https://sandhya-rani-portfolio.vercel.app/projects/
- LinkedIn: https://www.linkedin.com/in/sandhya-rani-g-859b4a22b
- GitHub: https://github.com/Gutnukusandhyarani

## Project dashboards and repositories

| Project | Dashboard | Repository | Data scope |
|---|---|---|---|
| SentinelOps | https://sentinelops-git-vercel-supabase-sandhya-6e9f.vercel.app/ | https://github.com/Gutnukusandhyarani/SentinelOps | Hosted endpoint telemetry aggregates; private details require analyst sign-in |
| SigmaForge | https://sigma-forge-mu.vercel.app/ | https://github.com/Gutnukusandhyarani/SigmaForge | Repository YAML rules and regression fixtures |
| SentinelTrace | https://sandhya-rani-portfolio.vercel.app/sentineltrace/dashboard/ | https://github.com/Gutnukusandhyarani/SentinelTrace | Synthetic training records and deterministic mock outputs |

## Resume bullets

### SentinelOps
- Built a Python and PowerShell endpoint telemetry pipeline that collects selected Windows System events, normalizes records, evaluates detection rules and persists events and alerts in Supabase.
- Deployed Vercel serverless ingestion and an aggregate-only public dashboard; implemented server-side collector authentication, retry-safe ingestion and a separate analyst-console workflow for event review and alert triage.

### SigmaForge
- Developed a Python workbench to validate YAML detection rules, parse supported condition logic, identify rule-quality issues and map ATT&CK technique metadata.
- Implemented regression-fixture evaluation and query generation for Splunk SPL, Microsoft Sentinel KQL and Elastic syntax; the hosted API reported 6/6 valid rules and 8/8 passing fixture cases at the 23 November 2026 checkpoint.

### SentinelTrace
- Extended a Python SSH authentication analyzer with five Linux/Windows detection use cases, ATT&CK mappings, illustrative SPL/KQL/Sigma examples and L1 investigation guidance.
- Built a human-reviewed triage-copilot prototype with offline IOC extraction, constrained JSON validation, deterministic mock mode and an optional local Ollama adapter; published a searchable static dashboard using synthetic training records.

## LinkedIn project descriptions and launch post

See \`LinkedIn_Project_Copy.txt\` for the full project descriptions, one portfolio launch post, resume bullets, profile summary, ATS keywords and accuracy checklist.

## Interview positioning

**SentinelOps:** Explain the collection-to-detection path: selected Windows System events, read-only collection, bounded HTTPS batches, server-side token validation, Supabase persistence, alert generation and a privacy-separated public/analyst interface. Be candid that browser login, triage persistence and scheduled startup still require final end-to-end checks.

**SigmaForge:** Demonstrate a YAML detection rule, explain the supported condition language and show validation, regression fixtures and generated query output. State that the project exports supported query subsets; destination SIEM validation remains necessary.

**SentinelTrace:** Explain how an SSH log line becomes a normalized event, how detection hypotheses are formed, what context a Level 1 analyst checks, and why a triage copilot can only provide a draft. The dashboard records are synthetic and the mock backend does not establish AI accuracy.

## Data-scope and accuracy boundaries

- SentinelOps public summary data was verified at 153 records and one high-severity alert on 23 November 2026. Counts can change as the collector runs; do not present them as permanent performance metrics.
- The Windows event collector reads selected System log event IDs, not a fully privileged Windows Security log feed.
- SigmaForge reported six valid rules and eight passing regression cases at the cited checkpoint. Those are repository fixture results, not proof of deployed detections in Splunk or Sentinel.
- SentinelTrace uses synthetic training data for its sample alerts, copilot suggestions and investigation exercises.
- Do not claim production deployment, customer impact, MTTD/MTTR reduction, measured AI accuracy or automated containment without separate evidence.
- The work is a defensive learning and portfolio project, not a production SIEM or SOC service.
