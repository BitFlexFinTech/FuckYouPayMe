# FuckYouPayMe — Production Readiness Checklist

## Active Mocks & Placeholders

| Component | Mock/Placeholder | What's Needed | Where to Enter It | Status |
|---|---|---|---|---|
| **Stripe Payments** | Mock mode — returns fake checkout URLs when no STRIPE_SECRET_KEY set | Real Stripe account with Connect enabled | `.env.local`: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_CLIENT_ID` | 🔲 Not configured |
| **NOWPayments Crypto** | Mock mode — returns fake wallet address when no NOWPAYMENTS_API_KEY set | Real NOWPayments account | `.env.local`: `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET` | 🔲 Not configured |
| **Resend Email** | Dunning engine logs events but does not send real emails when no RESEND_API_KEY set | Resend account + verified domain | `.env.local`: `RESEND_API_KEY` | 🔲 Not configured |
| **Twilio SMS** | Mock mode — logs to console when no TWILIO_ACCOUNT_SID set | Real Twilio account | `.env.local`: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | 🔲 Not configured |
| **Database** | Local-only — no production database configured | Neon (or Supabase) PostgreSQL instance | `.env.local`: `DATABASE_URL` | 🔲 Not configured |
| **Auth** | NextAuth with credentials provider — works locally | NEXTAUTH_SECRET must be set in production | `.env.local`: `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | 🔲 Not configured |

## Go-Live Checklist

### Before Launch

- [ ] Create Stripe account and enable Connect (Standard)
- [ ] Create NOWPayments account and configure IPN callback URL
- [ ] Create Resend account and verify `fuckyoupayme.online` domain
- [ ] Provision Neon PostgreSQL database
- [ ] Run `prisma migration db init` to create schema
- [ ] Set all environment variables on Vercel
- [ ] Configure Stripe webhook endpoint pointing to `/api/payments/stripe/webhook`
- [ ] Configure NOWPayments IPN callback pointing to `/api/payments/crypto/webhook`
- [ ] Set up Vercel Cron job for `/api/dunning/cron` every 6 hours
- [ ] Add Sentry DSN for error tracking
- [ ] Review Terms of Service with a lawyer (recommended before $10k MRR)
- [ ] Review Privacy Policy with a lawyer (recommended before $10k MRR)

### DNS & Domain

- [ ] Domain `fuckyoupayme.online` is registered and pointing to Vercel
- [ ] Configure `NEXT_PUBLIC_APP_URL` to `https://fuckyoupayme.online`
- [ ] Set up `invoices.fuckyoupayme.online` or `fuckyoupayme.online` for Resend sender domain

### Non-Credential Work Remaining

- [x] SMS dunning channel (Twilio) — built: `src/lib/twilio.ts` with mock mode, SMS templates for 4 tones (5 stages each), automatic SMS sending on stages 3+ (after 2 failed email reminders), logged as dunning events with channel="sms"
- [x] Recurring invoices — built: `/api/invoices/recurring` cron endpoint, UI toggle + frequency selector in invoice creation, R badge on list
- [x] Invoice PDF generation — built: `/api/invoices/[id]/pdf` endpoint, branded PDF attached to sent emails, Download PDF button on detail page
- [x] Invoice templates — built: CRUD API (`/api/invoice-templates`), load/save UI in invoice creation modal, persisted to database
- [ ] Crypto mass payout (NOWPayments auto-split) — requires NOWPayments dashboard config
- [x] Admin full CRUD pages — fully populated with real data tables, filters (users, transactions, dunning-log, disputes), admin resolution actions
- [x] PWA push notifications — built: service worker (`/sw.js`), manifest (`/manifest.json`), `PwaRegister` component, subscribe/unsubscribe API, settings page UI with enable/disable toggle
- [x] 2FA TOTP verification — built: setup (generate secret, QR code), verify (validate code + enable), disable, and server-side TOTP validation on login
- [x] Client "dispute" button — built: dispute API endpoint, UI on payment page, dunning pause, resolution in freelancer invoice detail + admin