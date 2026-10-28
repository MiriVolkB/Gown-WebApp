# Rachelli's Gown CRM

A CRM for Rachelli Custom Gowns (a custom-gown business in Israel). **It is a live app that Rachelli uses every day.** Never break it. This repository is **public**: never put passwords, keys, database addresses, or customer data in any file, commit message, or pull request.

## Who you are working with
Esther is learning git and deploying, and is nervous about breaking the live app. Miri owns the repo and the Vercel/Supabase accounts.
- Explain in plain language, with no jargon. Say what you changed and why.
- Work ONE STAGE AT A TIME. When Esther has to do something (run a command, click in a browser, test a screen), give the exact command or the exact clicks, then wait for her to finish before the next stage.
- Do not just say "test it and build". Tell her exactly what to look at and what a good result looks like.
- If a request is unclear, or a decision could go two ways and cannot be undone, ask before building. If a problem is not understood, do not guess a fix. Say so and ask for more information.
- Money is shown in shekels (₪). Names are often Hebrew, so use `dir="auto"` on name text.

## Workflow for every ticket (never skip a step)
1. Start from a clean, updated `master`: `git checkout master && git pull && git status`.
2. Create a NEW branch for the ticket: `feat/...`, `fix/...`, `perf/...` or `chore/...`. **Never work or commit directly on `master`.**
3. Make the change. Keep it small and focused on the ticket.
4. Test locally with `npm run dev`. Esther looks at it in the browser.
5. Run `npx tsc --noEmit` (no output = pass), then `npm run build` (must finish with no errors).
6. `git status`. Add files **by name** (never `git add .`). If `package-lock.json` shows as changed, run `git restore package-lock.json` (never commit it).
7. Commit with a clear title and a short body, push the branch, and open a pull request. The description has: what it does, what is NOT changed, how it was tested.
8. **Never merge a pull request yourself.** Esther merges after the checks are green.
9. After the merge, wait for the Vercel Production deployment to be Ready. Esther checks the live site (read-only, without changing data).
10. Tidy up: `git checkout master && git pull && git branch -d <branch>`.

## Stop and ask first
- Anything in `prisma/migrations`, `prisma/schema.prisma` (database changes go through Miri), `prisma db push`, `prisma migrate`, or `prisma db seed`. Never run these against any database without explicit approval.
- Upgrading Prisma (it must stay on 5.22.x), Next.js, React or any other major dependency. Installing or removing packages.
- `git push --force`, `git reset --hard`, deleting branches that are not yours, or anything that rewrites history.
- Vercel settings, environment variables, or anything in `.env*`. Never print or read out environment values.
- Anything that could change real customer data.

## Tech
Next.js 16 (App Router, Turbopack, `src/proxy.ts` is the login gate), React 19, TypeScript, Tailwind, Prisma 5.22 with PostgreSQL (Supabase, Sydney), `@tanstack/react-query`, `react-big-calendar` with date-fns, lucide-react icons. Hosted on Vercel (Hobby), function region Sydney. The `@/` alias points to `src/`. Local `.env` points to a TEST database, never production.

## Hosting and backups
- **The repository is public, and must stay public.** Vercel's free Hobby plan only deploys commits from people who are not the owner when the repo is public. When it was made private (October 2026), every deployment from Esther's commits was blocked. Do not change the repo's visibility without Miri and a plan for Vercel.
- **A nightly encrypted database backup runs in GitHub Actions** (`.github/workflows/nightly-backup.yml`, plus `backup-restore-test.yml` to test it by hand). It uses two repository secrets, `PROD_DATABASE_URL` and `BACKUP_PASSPHRASE`. Never commit, print or share a backup, the database address, or either secret value.

## Rules for the code
- **Every API route must call `getUser()` and return 401 if there is no user.** `src/proxy.ts` does NOT protect `/api`, so each route must check for itself. Always scope data to the logged-in user (`ownerId`) and check that a record belongs to them before reading or changing it. Check the role where it matters (`OWNER`, `SECRETARY`, `GUEST`). Guest writes return a simulated success.
- Speed matters a lot. Do not load the full clients list on page load; use targeted queries (`select` only what is needed). Share react-query keys instead of fetching the same data twice.
- Wedding events on the calendar come from `/api/clients?fields=weddings`. The wedding side panel loads the full family from `/api/clients/[clientId]` only when it is opened.
- Existing appointments and views must keep working exactly as before unless the ticket says otherwise. Check the Month, Week and Day views and both calendars (Appointments and Weddings) after calendar changes.
- Prefer small, readable changes. Do not leave dead code, `console.log`s, or commented-out blocks behind.
