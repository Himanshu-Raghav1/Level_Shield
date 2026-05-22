# Level Shield

AI-era bot detection and anti-scraping system for the Levels.fyi hackathon
problem statement.

## Phase 0: Team Workflow

Use this branch model:

```text
main = stable demo branch only
dev  = shared integration branch
feat/* = individual feature branches
```

Do not code directly on `main`. Build features on separate branches, merge them
into `dev`, and merge `dev` into `main` only when the demo is stable.

## Team Split

Person 1 owns backend/security:

- risk scoring engine
- request middleware
- rate limiting and proof-of-work
- honey maze and canary tokens
- bot simulators

Person 2 owns frontend/demo:

- fake Levels.fyi pages
- analytics dashboard
- behavior telemetry collector
- charts and live demo controls
- user journey polish

## Daily Git Flow

Start from `dev`:

```bash
git checkout dev
git pull origin dev
git checkout -b feat/your-feature-name
```

Commit and push your work:

```bash
git add .
git commit -m "Describe the change"
git push -u origin feat/your-feature-name
```

Open a pull request into `dev`. After `dev` is verified, merge `dev` into
`main` for the final demo.

## Starter Branches

Recommended initial branches:

```text
feat/backend-risk-engine
feat/dashboard-ui
```
