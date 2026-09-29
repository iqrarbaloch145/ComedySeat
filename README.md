# ComedySeat — Exclusive Comedy Event & Ticketing Marketplace
> *"Pull Up A Seat To Comedy"*

A production-ready, ultra-premium comedy ticketing marketplace built with **Next.js 15 App Router**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Supabase PostgreSQL (RLS)**, and **Stripe Connect Direct Charges**.

Comedy clubs, stand-up producers, improv troupes, and independent comedy creators publish shows and sell tickets on the same marketplace. **Every comedy producer receives ticket sales proceeds directly into their own connected merchant account.** Platform administrators can manage business records, but producer revenues are never pooled or routed through an intermediary platform wallet.

---

## 🌟 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Vanilla CSS & Tailwind CSS, ComedySeat Crimson brand palette (`#d9072a`, `#ca0c2a`) |
| **Database** | Supabase PostgreSQL with strict Row Level Security (RLS), atomic RPC functions & triggers |
| **Authentication** | Supabase Auth (server-side `@supabase/ssr` with cookie sessions) + Guest Auto-Account Creation |
| **File Storage** | Supabase Storage (`event-media` public bucket & `tickets` protected bucket) |
| **Endpoints** | Next.js Route Handlers (`/api/*`) & Server Actions |
| **Payments** | Connected-Merchant Direct Charges (Stripe Connect `{ stripeAccount: organizerStripeAccountId }`) |

---

## 🔑 Key Features & User Workflow

### 1. Frictionless Ticket Buying with Instant Auto-Account Creation
- **No Upfront Registration Required**: Comedy fans can browse shows, select reserved seats or front-row tables, and checkout immediately with just their name and email.
- **Automatic Account Creation**: Upon ticket purchase, the backend checks if an account exists for the buyer's email. If not, it **automatically provisions a new ComedySeat account**, links the order and issued digital passes to it, and signs the buyer in seamlessly.
- **Instant Wallet Access**: The buyer is redirected to the confirmation page where their tickets, QR passes, and new account are immediately accessible under **My Seats**.
- **Security Lockout on Settings**: Unauthenticated visitors are strictly locked out of editing account profiles, payout configuration, or box office settings without logging in.

### 2. Independent Box Office Payment Routing
- **Sonny's LouddMouth Comedy Brand**: Ticket purchases route directly to connected account `acct_org_louddmouth_001`.
- **The Stand NYC & Comedy Cellar**: Ticket purchases route directly to connected account `acct_org_standnyc_002`.
- **ComedySeat Platform Specials**: Admin-curated galas and awards credit the designated administrative merchant account `acct_admin_comedyseat_001`.
- **Disconnected Account Protection**: If a comedy room's payment account is disconnected or incomplete (e.g. *Underground Laugh Lab*), **paid checkout is strictly blocked with a clear user notice**. Proceeds never fall back to an administrative wallet.
- **Single-Producer Checkout**: Checkout validates that seats belong to a single comedy show producer per transaction.

### 3. Anti-Overselling Concurrency Protection
- Built with atomic PostgreSQL stored procedures (`reserve_ticket_inventory`) that lock ticket tier rows using `FOR UPDATE`.
- Incorporates a 10-minute seat hold timer. If checkout is abandoned or times out, reserved seats automatically restore to available inventory.
- Prevents concurrent race conditions when showroom tables are selling fast.

### 4. Box Office QR Admission & Door Check-In
- Each issued ticket generates a cryptographic QR code with a SHA-256 security hash.
- Door staff and comedy producers scan tickets in real-time via the built-in box office scanner.
- Prevents screenshot reuse or duplicate check-in with exact timestamp logging.

---

## 🎭 Comedy Categories
1. **Stand up Comedy** — Live headliner showcases, comedy club nights, and national tours.
2. **Improv** — Fast-paced unscripted comedy, troupe battles, and sketch showcases.
3. **Open Mic** — Raw rookie talent, new joke testing, and underground rooms.
4. **Comedy Festivals** — Multi-day galas, comedy celebrations, and national comedy honors.
5. **Comedy Theater** — Broadway farces, satire plays, and comedic musicals.
6. **Comedy Courses** — 6-week stand-up writing workshops, stagecraft, and improv masterclasses.

---

## 🛡️ Row Level Security (RLS) Policy Summary

| Table | Public Visitors | Comedy Fans | Comedy Producers | Super Admin |
|---|---|---|---|---|
| `profiles` | Read public profiles | Update own profile (cannot set `role='super_admin'`) | Update own profile | Full CRUD |
| `organizers` | Read active comedy clubs | Create own producer profile | Update own profile | Full CRUD |
| `events` | Read published shows | Read published shows | Create, update, archive own shows | Full CRUD (preserves original owner) |
| `ticket_types` | Read active seat tiers | Read active seat tiers | Manage tiers for own shows | Full CRUD |
| `orders` | None | Read own comedy bookings | Read orders for shows they produce | Read all platform orders |
| `issued_tickets` | None | Read own admission passes | Read and check-in passes for own shows | Read and manage all |
| `refunds` | None | Read own refunds | Process refunds for own shows | Manage all refunds |
| `audit_logs` | None | None | None | Read only |

---

## 🧪 Automated Test Suite

Run the full integration test suite with Node.js:
```powershell
node tests/auth-and-ticketing.test.mjs
```
The test suite validates:
- Strict `401 Unauthorized` lockout on payout/payment editing when unauthenticated.
- Official ComedySeat branding, tagline ("Pull Up A Seat To Comedy"), and category structure.
- `/auth/login` and `/auth/register` operational readiness.
- Direct box office payment routing ($70) credited straight to Sonny's LouddMouth merchant account (`acct_org_louddmouth_001`).
- Door ticket scanner validation and tamper-proof check-in status.
