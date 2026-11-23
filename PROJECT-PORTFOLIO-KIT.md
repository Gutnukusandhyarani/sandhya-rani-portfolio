# Project Portfolio Kit — SentinelOps and SigmaForge

Last reviewed: 23 November 2026.

This document contains copy-ready resume, LinkedIn, GitHub and interview material for the two projects currently featured in the portfolio. Keep the scope notes alongside claims so that hosted endpoint telemetry is distinguished from repository rule fixtures.

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

## Resume bullets

### SentinelOps
- Built a Python and PowerShell endpoint telemetry pipeline that collects selected Windows System events, normalizes records, evaluates detection rules and persists events and alerts in Supabase.
- Deployed Vercel serverless ingestion and an aggregate-only public dashboard; implemented server-side collector authentication, retry-safe ingestion and a separate analyst-console workflow for event review and alert triage.

### SigmaForge
- Developed a Python workbench to validate YAML detection rules, parse supported condition logic, identify rule-quality issues and map ATT&CK technique metadata.
- Implemented regression-fixture evaluation and query generation for Splunk SPL, Microsoft Sentinel KQL and Elastic syntax; the hosted API reported 6/6 valid rules and 8/8 passing fixture cases at the 23 November 2026 checkpoint.

## LinkedIn project descriptions and launch post

See \`LinkedIn_Project_Copy.txt\` for the complete project descriptions, two-project portfolio launch post, resume bullets, profile summary, ATS keywords and accuracy checklist.

## Interview positioning

**SentinelOps:** Explain the collection-to-detection path: selected Windows System events, read-only collection, bounded HTTPS batches, server-side token validation, Supabase persistence, alert generation and a privacy-separated public/analyst interface. Be candid that browser login, triage persistence and scheduled startup still require final end-to-end checks.

**SigmaForge:** Demonstrate a YAML detection rule, explain the supported condition language and show validation, regression fixtures and generated query output. State that the project exports supported query subsets; destination SIEM validation remains necessary.

## Data-scope and accuracy boundaries

- SentinelOps public summary data was verified at 153 records and one high-severity alert on 23 November 2026. Counts can change as the collector runs; do not present them as permanent performance metrics.
- The Windows event collector reads selected System log event IDs, not a fully privileged Windows Security log feed.
- SigmaForge reported six valid rules and eight passing regression cases at the cited checkpoint. Those are repository fixture results, not proof of deployed detections in Splunk or Sentinel.
- Do not claim production deployment, customer impact, MTTD/MTTR reduction, measured AI accuracy or automated containment without separate evidence.
- These are defensive learning and portfolio projects, not production SIEM services.
