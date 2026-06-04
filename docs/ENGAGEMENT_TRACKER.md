# BrightPath × S360 — Engagement Tracker

**Live URL:** https://brightpath-engagement.vercel.app  
**Hosted on:** Vercel (Summit 360 team account)  
**Engagement period:** May 11 – Aug 9, 2026 (13 weeks)  
**Stack:** Static HTML + React 18 (CDN) + Babel (CDN) + Supabase + Google Workspace APIs

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication](#authentication)
4. [Navigation & Tabs](#navigation--tabs)
5. [Views](#views)
   - [Dashboard (Header)](#dashboard-header)
   - [Work Plan](#work-plan)
   - [Gantt Chart](#gantt-chart)
   - [Weekly Update](#weekly-update)
   - [Security Hub](#security-hub)
   - [Team 2FA Accountability](#team-2fa-accountability)
6. [Data Layer](#data-layer)
7. [Supabase Tables](#supabase-tables)
8. [Google Workspace Integration](#google-workspace-integration)
9. [Roster System](#roster-system)
10. [People & Workstreams](#people--workstreams)
11. [File Reference](#file-reference)
12. [Deployment](#deployment)
13. [Known Limitations](#known-limitations)

---

## Overview

The BrightPath × Summit 360 Engagement Tracker is a private, invite-only web application that tracks the 13-week consulting engagement between **Summit 360 (S360)** and **BrightPath MN**. It serves as the single source of truth for:

- Task status across three workstreams (IT Security, MOS Rollout, Claude AI)
- Weekly progress reports (Friday updates)
- IT Security posture — MFA coverage, SSO strategy, and access management
- Google Workspace 2FA compliance, cross-referenced against the HRIS employee roster

The app is built with no backend server or build step — it runs entirely in the browser using React 18 loaded via CDN, with Supabase as the shared persistence layer for real-time collaboration.

---

## Architecture

```
index.html
├── supabase.js          ← shared DB client (window.SupabaseDB)
├── auth-config.js       ← allowed email allowlist
├── auth.js              ← Google OAuth2 PKCE + session guard
├── data.js              ← all hardcoded engagement data (tasks, people, weeks)
├── roster.js            ← HRIS employee roster (BP_ROSTER globals)
├── tweaks-panel.jsx     ← floating debug/override panel
├── gantt.jsx            ← Gantt chart view
├── workplan.jsx         ← task table/board view
├── weekly.jsx           ← Friday weekly update view
├── security.jsx         ← Security Hub (MFA, SSO, GW integration)
├── team-compliance.jsx  ← Team 2FA Accountability view
└── app.jsx              ← root App component + header stats
```

**No build step.** Babel Standalone transpiles JSX in the browser at load time. All inter-module communication goes through `window.*` globals (React, WEEKS, BP_ROSTER, SupabaseDB, GW_METHOD_LABELS, etc.).

---

## Authentication

Authentication uses **Google Identity Services (OAuth2 implicit flow)**. Only specific Google accounts are allowed in.

### How it works

1. `auth.js` calls `window.BPAuth.authGuard()` before React loads.
2. If there's no valid session in `sessionStorage`, the user is redirected to `login.html`.
3. On `login.html`, the user signs in with their Google account.
4. The token is validated against the allowlist in `auth-config.js`.
5. On success, the session is saved and the user is redirected back to `index.html`.

### Allowed users (`auth-config.js`)

The allowlist contains the specific `@brightpath-mn.com` and `@summit-360.com` email addresses that can access the tracker. Any Google account not in this list is rejected.

### Session storage

Sessions are stored in `sessionStorage` (not `localStorage`) so they expire when the browser tab is closed. This is intentional — the tracker contains sensitive org data.

---

## Navigation & Tabs

The top navigation has four primary tabs, controlled by `app.jsx`:

| Tab | Component | Description |
|-----|-----------|-------------|
| **Work Plan** | `WorkPlan` | Task list by workstream with inline editing |
| **Gantt** | `GanttChart` | Visual timeline of all gantt bars + milestones |
| **Weekly** | `WeeklyProgress` | Friday update report for any week |
| **Security** | `SecurityHub` | Security Hub with 4 sub-tabs |

The **Security** tab has its own sub-navigation:

| Sub-tab | Description |
|---------|-------------|
| **MFA Heatmap** | System-by-system MFA support matrix |
| **SSO Strategy** | SSO compatibility and protocol tracking |
| **Access Mgmt** | Super admin reduction, RBAC, offboarding SOP |
| **Team 2FA** | Per-manager 2FA compliance (uses GW + HRIS data) |

---

## Views

### Dashboard (Header)

Rendered by `app.jsx`. Shows top-level KPI cards:

| Card | Source |
|------|--------|
| Tasks Complete | Count of `status === 'done'` tasks |
| In Progress | Count of `status === 'in_progress'` |
| At Risk / Blocked | Count of `at_risk` + `blocked` |
| Security % | Done / total for `sec` workstream |
| MOS % | Done / total for `mos` workstream |
| Claude % | Done / total for `claude` workstream |

Below the KPIs are **Workstream Cards** — one per workstream showing health dot, progress bar, task counts, and next milestone.

---

### Work Plan

**File:** `workplan.jsx`

Displays all tasks grouped by workstream and subgroup. Key features:

- **Inline status editing** — click any status badge to cycle through `not_started → in_progress → done → at_risk → blocked`
- **Owner assignment** — click owner avatars to change S360 or BrightPath owners
- **Due date editing** — click the date cell to set/clear a due date
- **Add task** — "+ Add task" button at the bottom of each workstream group
- **Task detail panel** — click any task row to open a right-side panel with full notes and comment thread
- **Priority badges** — high / med / low, editable inline
- **Filter by owner** — top bar filter to show only tasks belonging to a specific person
- **Sort/group options** — group by workstream, filter by status

All changes are persisted to Supabase (`task_updates` table) in real time.

---

### Gantt Chart

**File:** `gantt.jsx`

Visual 13-week timeline showing:

- **Gantt bars** — horizontal bars per workstream/sub-track, positioned by day-of-engagement
- **Milestone diamonds** — key deliverable markers per workstream
- **Today line** — vertical red line showing the current day
- **Phase bands** — Month 1 / Month 2 / Month 3 bands across the top
- **Week columns** — W1–W13 with date ranges

The Gantt is read-only (visual reference only). Bar positions are defined in `data.js` as `d0` / `d1` day offsets from engagement start (May 11).

---

### Weekly Update

**File:** `weekly.jsx`

A structured Friday report for each of the 13 weeks. Navigate weeks using the numbered week selector at the top.

#### Sections

| Section | Auto-pulled? | Description |
|---------|-------------|-------------|
| What we completed | ✅ Yes | Tasks marked `done` with `statusHistory` timestamped in this week, OR tasks due this week with no history |
| On Deck (next week) | ✅ Yes | Tasks due in the following week, not yet done |
| Risks / Blockers | ✅ Yes | Tasks with `at_risk` or `blocked` status, or overdue undone tasks |
| Wins | ✗ Manual | Free-text narrative field |
| Decisions needed | ✗ Manual | Free-text narrative field |

#### Task pinning

Users can manually pin or remove tasks from any auto-pulled section using the `+ Pin a task here` control. Exclusions and manual pins are saved in the `snapshots` state (persisted in localStorage).

#### Auto-pull logic (Completed section)

A task shows in a week's "completed" section if:
1. Its `statusHistory` contains a `{ status: 'done', when: <timestamp> }` entry where the timestamp falls within the week's date range, **OR**
2. It has no `statusHistory` AND its `due` date falls within the week's date range.

This prevents tasks from bleeding across weeks.

#### Print / PDF

The "Print / PDF" button opens a browser print dialog with a printer-friendly layout that removes navigation and renders all sections cleanly.

---

### Security Hub

**File:** `security.jsx`

The most complex view. Manages all IT security work with live Google Workspace data.

#### MFA Heatmap sub-tab

A table of all business systems showing:

| Column | Description |
|--------|-------------|
| System | App name + category tag |
| Risk | `critical / high / medium / low` |
| MFA Support | `full / partial / none / unknown` |
| SSO Support | `full / partial / none / unknown` |
| Rollout | Phase 1 / Phase 2 / Validate / Inactive |
| Owner | S360 team member responsible |
| Action | Recommended next step |

- Rows can be **edited inline** (notes, status overrides) — saved to `sec_overrides` Supabase table
- Custom systems can be **added** via the "+ Add system" button — saved to `user_sec_systems`
- Rows can be **deleted** (soft-delete for built-in systems, hard-delete for user-added)

#### SSO Strategy sub-tab

Same structure as MFA Heatmap but focused on SSO protocol compatibility (SAML, OIDC, OAuth2, etc.). User-added systems store protocol in `category` column and notes in `mfa_notes` column (DB column reuse).

#### Google Workspace Live Data

The Security Hub connects to **Google Workspace Admin APIs** to pull live user data:

1. **Admin clicks "Connect Google Admin"** → triggers Google OAuth2 with Admin Directory + Reports API scopes
2. **`fetchGWUsers`** — calls Directory API to get all users (active + suspended)
3. **`fetchGWMethods`** — calls Reports API (login audit events) to detect 2FA methods per user

The fetched data is **cached in Supabase** (`gw_cache` table) so all viewers see the same data without needing to re-authenticate.

##### 2FA Method Detection

Uses `login_challenge_method` parameter from login audit events (Reports API):

| API value | Display label |
|-----------|--------------|
| `device_prompt` / `idv_preregistered_phone` | 🔔 Phone Prompt |
| `idv_totp` | 📱 Authenticator App |
| `security_key` | 🔑 Security Key |
| `passkey` | 🔐 Passkey |
| `totp` / `otp` | 📱 Authenticator App |
| `sms` | 💬 SMS Code |
| `backup_code` | 🔢 Backup Code |
| `password` / `none` / `reauth` / `google_password` | *(hidden — not 2FA)* |

The system collects **all unique methods** seen per user across all login events in the last 7–30 days, so a user with both Passkey and Authenticator will show **both badges**.

#### KPI Cards (GW Live)

When GW data is synced, the header KPI cards update live:

| Card | Meaning |
|------|---------|
| Active Accounts | Non-suspended GW users |
| 2FA Enabled | Users with `isEnrolledIn2Sv: true` |
| No 2FA | Active users without 2FA |
| Coverage % | 2FA enrolled / active × 100 |

Each card is clickable and opens a modal with the full user list and 2FA method column.

---

### Team 2FA Accountability

**File:** `team-compliance.jsx`

Groups all active BrightPath employees by their supervisor (manager) and shows 2FA compliance per team. This view is designed to make managers accountable for their team's 2FA adoption.

#### How it works

1. Loads GW cache from Supabase (same cache used by Security Hub — no extra login)
2. Cross-references `BP_ROSTER` (HRIS data) with GW users by email (case-insensitive)
3. Groups employees by supervisor using `supervisorRaw` → ID → email lookup chain
4. Computes per-group stats: total staff, in Workspace, enrolled in 2FA, coverage %

#### Manager group cards

Each card shows:
- Manager name + job title
- Manager's own 2FA status badge (✓ 2FA / ⚠ No 2FA / ⚠ Not in GW)
- Progress bar: enrolled / in Workspace, colored red/yellow/green by threshold
- Staff count

Clicking a card expands it to show the full member table with Name, Title, Email, 2FA Status, and 2FA Method columns.

#### Color thresholds

| Range | Color | Meaning |
|-------|-------|---------|
| 80–100% | 🟢 Green | On track |
| 40–79% | 🟡 Yellow | In progress |
| 0–39% | 🔴 Red | Action required |

#### Sort options

- **Worst first** (default) — teams with lowest 2FA coverage at top
- **Best first** — highest coverage first
- **A–Z** — alphabetical by manager name
- **Team size** — largest teams first

#### Member filter (expanded view)

Inside each expanded card: "All" / "No 2FA only" / "Enrolled only" filter buttons.

---

## Data Layer

### Static data (`data.js`)

All engagement-specific data is hardcoded in `data.js` and exposed as `window.*` globals:

| Global | Type | Description |
|--------|------|-------------|
| `ENGAGEMENT_START` | `Date` | May 11, 2026 |
| `ENGAGEMENT_END` | `Date` | Aug 9, 2026 |
| `WEEKS` | `Array[13]` | Week objects with `idx, num, start, end, label, range` |
| `PHASES` | `Array[3]` | Month 1/2/3 phase bands |
| `PEOPLE` | `Object` | Keyed by initials (LE, RD, BS, etc.) |
| `WORKSTREAMS` | `Object` | sec, mos, claude |
| `GANTT_BARS` | `Array` | Visual bar definitions for Gantt |
| `MILESTONES` | `Array` | Diamond markers with day offsets |
| `TASKS` | `Array` | All workplan tasks (flat) |
| `addDays`, `fmtMon`, etc. | `Function` | Date helpers |

### Dynamic data (Supabase)

User-driven changes are saved to Supabase and merged with static data at load time via an **overlay pattern**:

```
Final task = static task + overlay[taskId]
```

The overlay can override: `status`, `priority`, `due`, `owner_s360`, `owner_client`, `statusHistory`.

---

## Supabase Tables

| Table | Purpose |
|-------|---------|
| `task_updates` | Mutable task fields (status, priority, due, owners, status history) |
| `comments` | Comment threads on tasks |
| `user_tasks` | Tasks added by users (not in data.js) |
| `sec_overrides` | Edited/overridden Security Hub system notes and statuses |
| `user_sec_systems` | User-added systems for MFA Heatmap and SSO Strategy |
| `gw_cache` | Cached Google Workspace user list + 2FA methodMap (shared across all viewers) |

### `gw_cache` structure

```json
{
  "key": "users",
  "data": {
    "users": [ ...GW user objects... ],
    "methodMap": {
      "user@brightpath-mn.com": ["passkey", "idv_totp"],
      ...
    }
  },
  "updated_at": "2026-05-21T...",
  "updated_by": "rey.dumasig@summit-360.com"
}
```

The `methodMap` stores an **array** of method strings per user (multiple methods supported since the multi-badge update).

### Real-time subscriptions

`supabase.js` maintains a Supabase Realtime channel (`bp-realtime`) that listens for:
- `task_updates` → any change (`*`)
- `comments` → `INSERT`
- `user_tasks` → `INSERT`, `UPDATE`, `DELETE`

This enables live collaboration — if two users have the tracker open, task updates appear instantly without page refresh.

---

## Google Workspace Integration

### Scopes required

The admin who connects GW must grant:

| Scope | Used for |
|-------|---------|
| `https://www.googleapis.com/auth/admin.directory.user.readonly` | Fetch all GW users (Directory API) |
| `https://www.googleapis.com/auth/admin.reports.audit.readonly` | Fetch login audit events (Reports API) |

### Sync flow

```
Admin clicks "Connect Google Admin"
  → Google OAuth2 popup (GIS)
  → fetchGWUsers() — Directory API /users/all
  → fetchGWMethods() — Reports API /activity/users/all/applications/login
      Step 1: Broad scan, all login events (last 7 days)
      Step 2: login_challenge events (last 30 days)
      Step 3: 2sv_enroll events (last 180 days)
      Step 4: Usage Report fallback
  → saveGWCache() — writes to Supabase gw_cache
  → All other viewers load from cache (no re-auth needed)
```

### Method detection strategy

The Reports API `login_challenge_method` parameter (from `login_challenge` events) is the primary source. The system scans all login events and **accumulates all unique method values per user** so multi-method users (e.g., Passkey + Authenticator) show both.

Values that are skipped (not real 2FA methods): `password`, `none`, `reauth`, `google_password`, `reauthentication`.

---

## Roster System

**File:** `roster.js`

The employee roster is a static JavaScript file generated from the BrightPath HRIS export (CBIZ EmployeeRoster-System export). Last updated: May 21, 2026.

### Globals exposed

| Global | Type | Description |
|--------|------|-------------|
| `window.BP_ROSTER` | `Array[202]` | All employee records |
| `window.BP_ROSTER_BY_ID` | `Object` | Keyed by employee ID string |
| `window.BP_PARSE_SUP_ID` | `Function` | Parses `"Name (ID)"` → ID string |

### Record structure

```js
{
  id:            '1038',
  email:         'zachary.visina@brightpath-mn.com',
  firstName:     'Zachary',
  lastName:      'Visina',
  title:         'Designated Manager',
  status:        'Active',
  supervisorRaw: 'Shari Newgard (1066)',
}
```

### Updating the roster

To update the roster with a new HRIS export:

1. Export from CBIZ: HR → Reports → Employee Roster
2. Open the `.xlsx` file
3. Replace the `RAW` array in `roster.js` with the new data
4. Keep the `BY_ID` and `parseSupervisorId` logic unchanged
5. Deploy to Vercel

### Status filtering

The Team 2FA Accountability view only includes employees with `status === 'Active'`, a valid numeric `id`, and an `email` containing `@`. Test accounts (`status: 'Testing'`) and contractors (`Not In Payroll`) are excluded from the compliance view.

---

## People & Workstreams

### S360 Team

| ID | Name | Role |
|----|------|------|
| LE | Lane Elmer | Success Manager |
| RD | Rey Dumasig | Engineering |
| MS | Michael Sevilla | Security / IT |

### BrightPath Stakeholders

| ID | Name | Role |
|----|------|------|
| BS | Brandon Spears | Executive Director |
| LC | Lisa Carton | Operations |
| NI | Nicole Buechler | Programs |
| SN | Stephanie Noll | Director of Services |
| JPM | John Paul Miller | QA / Training |
| JE | Jeremy Garrigan | IT |
| RJ | Rick Joslin | Super Admin |
| SR | Secellia Riley | Super Admin |

### Workstreams

| ID | Name | Color | Focus |
|----|------|-------|-------|
| `sec` | IT Security | Blue `#0284c7` | MFA, SSO, access management |
| `mos` | MOS Rollout | Indigo `#4f46e5` | Unified operating surface |
| `claude` | Claude AI | Orange `#c2410c` | Claude Enterprise adoption |

---

## File Reference

| File | Purpose |
|------|---------|
| `index.html` | Entry point. Loads all scripts in dependency order. |
| `login.html` | Standalone login page (Google Sign-In). |
| `app.jsx` | Root `App` component. Orchestrates data loading, real-time subscriptions, tab routing, header KPIs, and workstream cards. |
| `data.js` | All static engagement data — dates, people, workstreams, tasks, gantt bars, milestones. |
| `roster.js` | HRIS employee roster. Exposes `BP_ROSTER`, `BP_ROSTER_BY_ID`, `BP_PARSE_SUP_ID`. |
| `supabase.js` | Supabase client wrapper. All DB operations. Exposes `window.SupabaseDB`. |
| `auth-config.js` | Email allowlist for access control. |
| `auth.js` | Google OAuth2 session guard. Runs before React loads. |
| `workplan.jsx` | Work Plan view — task table with inline editing, task detail panel, add task. |
| `gantt.jsx` | Gantt Chart view — visual 13-week timeline. |
| `weekly.jsx` | Weekly Update view — auto-pulled Friday progress reports per week. |
| `security.jsx` | Security Hub — MFA Heatmap, SSO Strategy, Access Mgmt, GW live data, 2FA modal. |
| `team-compliance.jsx` | Team 2FA Accountability — manager-grouped compliance view. |
| `tweaks-panel.jsx` | Developer panel for overriding the current date and other debug options. |
| `styles.css` | All styles. Component-scoped via class prefixes (`gw-`, `tc-`, `wk-`, `sec-`, etc.). |

---

## Deployment

The app is deployed as a static site on **Vercel** under the `summit-360` team account.

### Deploy command

```bash
cd /Users/rdumasig/Documents/Dev/brightpath-engagement
vercel --prod --yes
```

### No build step

Since there's no bundler, Vercel simply serves the files as-is. Any `.jsx` files are served with `text/babel` type and transpiled in the browser.

### Environment

No environment variables are needed. The Supabase URL and anon key are hardcoded in `supabase.js` (anon key is safe to expose — Supabase Row Level Security controls actual data access).

---

## Known Limitations

| Limitation | Details |
|-----------|---------|
| **GW sync requires admin auth** | Only users with Google Workspace super-admin (or delegated admin) rights can trigger a sync. Non-admins see cached data. |
| **2FA method history window** | The Reports API retains login events for a limited window. If a user hasn't logged in recently (or always uses passkey), older method data may not appear. |
| **No server-side rendering** | Babel transpiles JSX in the browser — initial load is slower than a bundled app. Not a concern for this audience size. |
| **Roster is static** | The HRIS roster is a snapshot baked into `roster.js`. It does not auto-sync with CBIZ. Requires manual re-export and deploy when headcount changes. |
| **Single Supabase project** | All data (tasks, comments, GW cache) shares one Supabase project. If the anon key is rotated, `supabase.js` must be updated. |
| **Session expires on tab close** | `sessionStorage` is used intentionally — users must re-authenticate each browser session. |
| **`user_sec_systems` table** | The "Add system" feature in Security Hub requires this table to exist in Supabase. Run the CREATE TABLE migration if it's missing. |
