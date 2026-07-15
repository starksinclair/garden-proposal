# 🌿 The Garden — a sudoku proposal

A web sudoku game behind a garden gate. She logs in with her birthday, solves the puzzle, and it asks: **"Will you be my girlfriend?"** When she says yes, the garden is claimed forever — she gets a congratulations email, and the login page changes from *"Welcome to this unclaimed garden"* to *"Welcome to this **claimed** garden"* (claimed in plant green), asking only for her password on future visits.

## Stack

- **Next.js 14** (App Router) on **Vercel**
- **Upstash Redis** — stores the single `garden` record: `{ claimed, email, claimedAt }`
- **Resend** — sends the "thanks for saying yes" email
- The game itself is a self-contained `public/game.html` (vanilla JS, vine animations, synthesized acapella choir)

## Flow

1. `GET /api/status` → login page shows unclaimed (email + password) or claimed (password only)
2. `POST /api/login` → password checked **server-side** (accepts many formats of Sep 25, 2005: `09252005`, `25092005`, `sep 25 2005`, `25/09/2005`, ...)
3. On success → sessionStorage flag + redirect to `/game.html`
4. While she plays, a **live score** (max 100) updates from time, wrong answers, and correct streak
5. On sudoku completion, the run is submitted to `POST /api/leaderboard` (stored in Upstash Redis)
6. She wins → proposal screen → **Yes** → `POST /api/claim` → Redis write + Resend email
7. After **Yes**, success view shows a 10s color-coded countdown (green → gold → red), then auto-redirects to `/`
8. Claim is idempotent: replays never re-send the email or overwrite the record

## Deploy (about 15 minutes)

### 1. Upstash Redis
- Easiest: in your Vercel project → **Storage** tab → **Upstash Redis** → create free database. Env vars are injected automatically.
- Or manually at [upstash.com](https://upstash.com): create a Redis DB, copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

### 2. Resend
- Sign up at [resend.com](https://resend.com), add your domain under **Domains**, and add the DNS records it gives you (SPF + DKIM). Wait for "Verified".
- Create an API key → `RESEND_API_KEY`.
- Set `FROM_EMAIL` to something on that domain, e.g. `The Garden <hello@yourdomain.com>`.
- Optional: set `NOTIFY_EMAIL` to your own address to get BCC'd the moment she says yes. 👀

### 3. Vercel
```bash
npm i -g vercel   # if you don't have it
vercel            # from this folder, follow prompts
```
Add the env vars in **Project → Settings → Environment Variables** (see `.env.example`), then `vercel --prod`.

## Test it end-to-end before sending it to her

1. Open the site → should say **unclaimed**.
2. Log in with a test email you control + `09252005`.
3. Use "🌱 grow a hint" repeatedly to speed-solve.
4. Click **Yes** → check the test inbox for the email.
5. Reload the site → should now say **claimed** and ask only for the password.
6. **Reset for the real thing:** in Upstash console → Data Browser → delete the `garden` key. The garden is unclaimed again.

## Hidden testing shortcuts

- `$cheat` (typed anywhere in game): fills all editable cells except the last row, shows a toast.
- `$email` (typed anywhere in game): attempts a test send using the stored login email (`sessionStorage.garden_email`), shows toast status.
- Invisible corner tap (bottom-right): triggers the same behavior as `$cheat`.

## Leaderboard & scoring

- Leaderboard is shown below the game (`public/game.html`) and reads from `GET /api/leaderboard`.
- Scores are capped at **100** and computed from:
  - elapsed solve time (faster is better),
  - wrong answer count (penalty),
  - correct-answer streak (bonus).
- Submission happens automatically when the sudoku is fully solved.

### Testing email endpoint

- `POST /api/test-email` with `{ "email": "you@example.com" }` sends the same "yes" email template without claiming the garden.

## Customizing

- Her accepted password formats: `lib/password.ts`
- The email content: `lib/email.ts`
- The proposal text / game: `public/game.html`
- Leaderboard API route: `app/api/leaderboard/route.ts`
- Test email API route: `app/api/test-email/route.ts`
- Login page copy: `app/page.tsx`

## Local dev

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

💚 Good luck.
