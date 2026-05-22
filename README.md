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

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
