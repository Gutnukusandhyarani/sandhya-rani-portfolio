# Dashboard and deployment status

Last checked: 23 November 2026.

## Portfolio project directory

- Public portfolio: https://sandhya-rani-portfolio.vercel.app/
- Central dashboard directory: https://sandhya-rani-portfolio.vercel.app/projects/
- Source repository: https://github.com/Gutnukusandhyarani/sandhya-rani-portfolio

The portfolio lists three projects and links directly to each project dashboard.

## SentinelOps — hosted endpoint monitoring

- Dashboard: https://sentinelops-git-vercel-supabase-sandhya-6e9f.vercel.app/
- Analyst console: https://sentinelops-git-vercel-supabase-sandhya-6e9f.vercel.app/analyst.html
- Source repository: https://github.com/Gutnukusandhyarani/SentinelOps
- Vercel + Supabase hosted environment on the \`vercel-supabase\` branch.
- The authorized Windows collector reads selected Windows System event IDs and sends bounded batches over HTTPS. Supabase stores persistent normalized events and alerts.
- At the verification checkpoint on 23 November 2026, the public aggregate endpoint reported 153 event records and one high-severity alert.
- Public dashboard APIs return aggregates only. Detailed event and alert access is intended for authenticated analyst sessions.
- Authentication and private analyst routes are deployed. A successful human browser login and a saved triage change still need an end-to-end verification.
- The Windows collector scheduled task exists, but automatic startup via the task scheduler still needs to be verified.

The public dashboard's event total is real stored telemetry from the configured endpoint, not bundled synthetic fixtures. A source-event timestamp is not a collector heartbeat. Do not claim continuous connectivity based only on that timestamp.

## SigmaForge — hosted detection workbench

- Dashboard: https://sigma-forge-mu.vercel.app/
- Source repository: https://github.com/Gutnukusandhyarani/SigmaForge
- Hosted read-only rule workbench with YAML rule validation, ATT&CK tags, fixture-based regression results and supported query compilation.
- At the verification checkpoint on 23 November 2026, the public API reported 6 rules, all 6 valid, and 8 of 8 regression cases passing.
- Supported query outputs include Splunk SPL, Microsoft Sentinel KQL and Elastic query syntax for the documented subset.
- These are repository rules and test fixtures, not live endpoint alerts. Generated queries must be validated in the target SIEM before operational use.

## SentinelTrace — static SOC training dashboard

- Dashboard: https://sandhya-rani-portfolio.vercel.app/sentineltrace/dashboard/
- Source repository: https://github.com/Gutnukusandhyarani/SentinelTrace
- Static dashboard copied into the portfolio's public assets so the interface can be opened without running a local server.
- Dashboard data files remain clearly labelled synthetic training records. Copilot examples use a deterministic mock provider; fixture validation is not an LLM accuracy metric.
- SIEM SPL/KQL examples have not been validated against a connected production Splunk or Microsoft Sentinel workspace.

## Data and security boundaries

- Do not upload real employer, customer or private endpoint logs to public repositories.
- Use collectors only on devices and logs you own or are explicitly authorized to monitor.
- Keep collector credentials, Supabase server credentials and analyst access credentials server-side.
- Do not describe any dashboard as production-grade SOC or enterprise SIEM software.
- Keep synthetic fixtures, mock-copilot outputs, live telemetry aggregates and source-rule tests clearly distinguished.
