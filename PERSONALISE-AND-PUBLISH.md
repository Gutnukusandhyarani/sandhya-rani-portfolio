# Personalise and publish

## 1. Confirm the public profile details

The portfolio uses the profile details from the supplied resume. Review `src/data/portfolio.ts` before publishing, especially the email, LinkedIn URL, GitHub profile and availability wording.

## 2. Project repositories are already published

The portfolio is configured to link to these existing public repositories:
- SentinelOps: https://github.com/Gutnukusandhyarani/SentinelOps
- SigmaForge: https://github.com/Gutnukusandhyarani/SigmaForge

Do not upload the project folders again when updating the portfolio repository.

## 3. Resume

The current resume is copied to `public/resume.pdf`. Replace it whenever the resume is updated, keeping the filename `resume.pdf`.

## 4. Dashboard availability

The project case studies show the local dashboard addresses and commands:
- SentinelOps: `python -m sentinelops serve`, then open `http://127.0.0.1:8787` on the same computer.
- SigmaForge: `python -m sigmaforge serve`, then open `http://127.0.0.1:8788` on the same computer.

These are not public dashboard URLs. A recruiter clicking a localhost address on the hosted portfolio would reach their own computer, not your computer. Neither dashboard is publicly hosted today.

## 5. Publish using GitHub Pages (recommended for this repository)

The `.github/workflows/deploy.yml` workflow is already included. After merging the updated portfolio into `main`:
1. Open the GitHub repository → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Open the **Actions** tab and check the `Deploy portfolio to GitHub Pages` workflow.
4. When the workflow succeeds, open **Settings → Pages** and use **Visit site**.

The expected project-site URL is `https://gutnukusandhyarani.github.io/sandhya-rani-portfolio/`.

## 6. Vercel alternative

To use Vercel instead, import `Gutnukusandhyarani/sandhya-rani-portfolio` from GitHub and set:
- Framework preset: Vite
- Root directory: `./` (repository root)
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`

Do not configure both hosts to use the same custom domain.

## 7. Keep the backend private until it is properly prepared

The current SentinelOps server intentionally binds to localhost, stores data in a local SQLite database, and has no public authentication/tenant model. Do not change the bind address or forward its port to the internet. A genuinely public live dashboard requires a secure ingestion service, authenticated agents, persistent managed storage, access controls and deployment testing. See `DASHBOARD-REALTIME-STATUS.md`.
