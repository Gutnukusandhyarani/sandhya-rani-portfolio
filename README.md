# Sandhyarani Guntuku — Defensive Security Portfolio

React + TypeScript portfolio showcasing two connected defensive-security projects: SentinelOps and SigmaForge.

## Project dashboards

Open the [central project dashboard directory](https://sandhya-rani-portfolio.vercel.app/projects/) to access both project interfaces.

- [SentinelOps — hosted endpoint monitoring and SIEM lab](https://sentinelops-git-vercel-supabase-sandhya-6e9f.vercel.app/)
- [SigmaForge — hosted detection-as-code workbench](https://sigma-forge-mu.vercel.app/)

Each dashboard has a distinct scope. SentinelOps displays aggregate hosted endpoint telemetry publicly and requires analyst sign-in for detailed records. SigmaForge displays repository rules and fixture-based regression results; it is not connected to live endpoint telemetry.

## Published project repositories

- [SentinelOps](https://github.com/Gutnukusandhyarani/SentinelOps)
- [SigmaForge](https://github.com/Gutnukusandhyarani/SigmaForge)

## Run the portfolio locally

\`\`\`bash
npm ci
npm run dev
\`\`\`

## Personal details

Edit \`src/data/portfolio.ts\`. The downloadable resume is stored at \`public/resume.pdf\`.

## Project evidence and data boundaries

Read [DASHBOARD-REALTIME-STATUS.md](./DASHBOARD-REALTIME-STATUS.md) before describing project dashboards. The portfolio keeps hosted endpoint telemetry and repository rule fixtures clearly distinguished. Never describe sample or mock records as production alerts, a live SIEM connection or measured AI accuracy.

## Publish

The portfolio is deployed on Vercel from the \`main\` branch. Vercel builds the Vite application using \`npm ci\` and \`npm run build\`, with \`dist\` as the output directory. Public static dashboard assets under \`public/\` are copied into the deployed site.

The GitHub Actions workflow is retained for GitHub Pages publishing where enabled. Do not expose local-only development servers or private endpoint logs to the public internet.
