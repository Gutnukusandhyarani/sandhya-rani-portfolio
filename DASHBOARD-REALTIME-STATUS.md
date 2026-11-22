# Dashboard and real-time status (read before publishing)

## What is working today

### SentinelOps
- The dashboard is a local web application served by the Python process at `http://127.0.0.1:8787`.
- The API reads its SQLite database and exposes health, summary, events and alerts endpoints.
- The browser dashboard refreshes its data every 15 seconds.
- To observe real endpoint activity, run the `monitor` command against a log file that is actively receiving entries, or ingest a fresh authorized event export. The bundled JSONL file is synthetic test data and must not be presented as live telemetry.
- The server intentionally binds to localhost only. It is not an internet-facing multi-user service.

### SigmaForge
- The local rule explorer is served by the Python process at `http://127.0.0.1:8788`.
- It reads the actual rule files and regression cases from disk and computes validation, test and compilation results when API endpoints are requested.
- Its included rules and cases are repository fixtures; these are not live SOC events.

## What is not deployed

Neither dashboard currently has a public hosted URL. The project APIs are localhost-only, and SentinelOps stores data in a local SQLite file. The portfolio therefore does not claim public real-time monitoring or show fabricated dashboard data. The `Open local dashboard` links only work on the same computer where the respective Python server is running.

## What is required for a genuinely public, real-time dashboard

1. Separate the public portfolio frontend from the monitoring backend.
2. Build a secure ingestion API with authentication, per-agent credentials, TLS, rate limiting, schema validation and audit logging.
3. Replace local SQLite with a persistent managed database designed for concurrent remote ingestion.
4. Add a supported endpoint agent that sends only explicitly selected telemetry from systems the operator owns or is authorized to monitor.
5. Add user authentication, tenant isolation, role-based access, retention controls and secret management.
6. Add streaming or short-interval dashboard updates and operational monitoring.
7. Test ingestion, access control, data isolation, restart/recovery, and deployment before exposing it publicly.

Do not expose the current localhost server to the internet or publish real endpoint logs in a public repository. A static hosting service can host the portfolio, but it cannot run the current long-lived collector and SQLite service. Vercel is suitable for the portfolio frontend; the always-on ingestion/collector backend should run on an appropriate managed application host or VM. Vercel Functions have bounded invocation durations, so they are not a direct replacement for the current persistent local collector process.
