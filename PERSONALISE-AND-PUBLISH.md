# Personalise and publish

## 1. Confirm the public profile details

The portfolio uses the profile details in \`src/data/portfolio.ts\`. Review the email, LinkedIn URL, GitHub profile and availability wording before sharing the site.

## 2. Featured project repositories

The portfolio intentionally features two projects:
- SentinelOps: https://github.com/Gutnukusandhyarani/SentinelOps
- SigmaForge: https://github.com/Gutnukusandhyarani/SigmaForge

The standalone SentinelTrace repository is not part of this portfolio's project list, dashboard directory, or career copy.

## 3. Resume

The downloadable resume is served from \`public/resume.pdf\`. Its current version highlights SentinelOps and SigmaForge. Keep the filename \`resume.pdf\` when replacing it with a later revision.

## 4. Project dashboards

Both featured project dashboards are hosted:
- SentinelOps public overview: https://sentinelops-git-vercel-supabase-sandhya-6e9f.vercel.app/
- SentinelOps private analyst console: https://sentinelops-git-vercel-supabase-sandhya-6e9f.vercel.app/analyst.html
- SigmaForge detection workbench: https://sigma-forge-mu.vercel.app/
- Central dashboard directory: https://sandhya-rani-portfolio.vercel.app/projects/

Data boundaries must remain visible:
- SentinelOps public dashboard shows aggregate endpoint telemetry only; detailed records require analyst sign-in.
- SigmaForge reads repository YAML rules and regression fixtures. It does not receive live endpoint telemetry.
- Generated SIEM queries must be validated in the target environment before operational use.

## 5. Publish using Vercel

The portfolio repository is linked to Vercel and deploys from the \`main\` branch. The project uses:
- Framework: Vite
- Install command: \`npm ci\`
- Build command: \`npm run build\`
- Output directory: \`dist\`

After committing changes to \`main\`, check the Vercel production deployment and verify the portfolio, \`/projects/\`, and the public resume link.

## 6. Security and accuracy boundaries

- Keep collector credentials, Supabase server credentials and analyst access credentials server-side.
- Do not upload private endpoint logs, employer records or customer information to public repositories.
- Use collectors only on devices and logs you own or are explicitly authorized to monitor.
- Do not describe either dashboard as a production-grade SOC or enterprise SIEM.
- SentinelOps still needs final end-to-end verification of analyst login, saved triage persistence and scheduled collector startup.
- SigmaForge validation numbers are repository fixture results, not proof of detections running in a connected Splunk or Sentinel workspace.
