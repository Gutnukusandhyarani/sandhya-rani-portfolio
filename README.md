# Sandhyarani Guntuku — Defensive Security Portfolio

React + TypeScript portfolio presenting two connected defensive-security projects: SentinelOps and SigmaForge.

## Published project repositories

- [SentinelOps — Local Endpoint Monitoring & SIEM Lab](https://github.com/Gutnukusandhyarani/SentinelOps)
- [SigmaForge — Detection-as-Code Workbench](https://github.com/Gutnukusandhyarani/SigmaForge)

The project cards link directly to these public repositories.

## Run locally

```bash
npm ci
npm run dev
```

## Personal details

Edit `src/data/portfolio.ts`. The downloadable resume is stored at `public/resume.pdf`.

## Dashboard availability

Read [DASHBOARD-REALTIME-STATUS.md](./DASHBOARD-REALTIME-STATUS.md) before describing either dashboard as publicly live. Both current dashboards are local Python services, not publicly hosted dashboards. Their localhost addresses are displayed as setup information, not as public links. No synthetic data is presented as live telemetry.

## Publish

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that builds the Vite app and deploys the `dist` directory to GitHub Pages when changes reach `main`. In the repository's **Settings → Pages**, set the source to **GitHub Actions**.

Vercel is also supported as an alternative: import this GitHub repository, use Vite, `npm ci`, `npm run build`, and `dist`.

The current SentinelOps collector and SQLite API must not be exposed directly to the public internet.
