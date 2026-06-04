# BrightPath × Summit 360 — Executive Progress Report
**Engagement Period:** May 11 – August 9, 2026 · 13-Week Project-Based Consulting  
**Report Date:** May 28, 2026 · End of Week 3  
**Prepared by:** Rey Dumasig, Summit 360 Solutions  
**Submitted to:** Brandon Spears, Executive Director — BrightPath, LLC

---

## 1. Engagement Overview

Summit 360 is engaged to deliver three parallel workstreams across a 90-day program:

| Workstream | Objective | Timeline |
|---|---|---|
| **IT Security** | Harden Google Workspace identity, enforce MFA, design SSO architecture, and deliver access management SOPs | Weeks 1–13 (primary focus Weeks 1–4) |
| **MOS Rollout** | Replace disconnected Google Trackers with a unified management operating surface | Weeks 3–13 |
| **Claude AI** | Stand up Claude Enterprise for 20 seats and drive org-wide adoption | Weeks 4–9 |

**Engagement fee:** $14,500 project-based  
**S360 Team:** Lane Elmer (Success Manager), Rey Dumasig (Engineering), Michael Sevilla (Security/IT)

---

## 2. Overall Progress — Week 3 Snapshot

### Task Status Summary

| Status | Count | % of Total |
|---|---|---|
| ✅ Done | 2 | 3% |
| 🔵 In Progress | 15 | 25% |
| ⚠️ At Risk | 1 | 2% |
| ⬜ Not Started | 43 | 70% |
| **Total** | **61** | |

> **Note:** The majority of "Not Started" tasks are scheduled for Weeks 3–13 and are on track per the project plan. The focus of Weeks 1–3 is IT Security, where work is actively underway.

### Milestone Status

| Milestone | Due | Status |
|---|---|---|
| Security roadmap delivered | May 22, 2026 | 🔵 In Progress |
| Claude Enterprise live | Jun 1, 2026 | ⬜ Not Started (on track) |
| MOS shell ready for review | Jun 5, 2026 | ⬜ Not Started (on track) |
| Company-wide Claude kickoff | Jun 15, 2026 | ⬜ Not Started (on track) |
| Leadership operating in MOS | Jul 3, 2026 | ⬜ Not Started (on track) |
| MOS as primary surface | Aug 7, 2026 | ⬜ Not Started (on track) |

---

## 3. What Has Been Completed

### Engagement Kickoff & Administration
- ✅ **SOW countersignature & engagement kickoff** — Completed May 11, 2026. Engagement formally launched, project structure confirmed with BrightPath leadership.
- ✅ **Weekly cadences established** — ED 1:1 (Mondays) and Steering Committee (Thursdays, with Brandon, Lisa Carton, Nicole Buechler, Stephanie Noll, Jeremy Garrigan) are running.

### IT Security
- ✅ **Google Workspace super-admin access provisioned for S360** — S360 delegated admin account active since April 21. Full Admin Console access enabled for security assessment and configuration work.

---

## 4. IT Security Workstream — Detail

IT Security is the primary focus of Weeks 1–3. Work spans five areas: posture assessment, MFA rollout, SSO design, access management, and security cleanup.

### 4a. Security Posture Assessment

**Status: 🔵 In Progress** · Due May 17, 2026

Key findings from admin console access, manual assessment, and live Google Workspace data (as of May 28, 2026):

| Finding | Week 1 Baseline | Current (Week 3) | Risk |
|---|---|---|---|
| 2FA adoption | ~3% (7 of 219 enrolled) | **86% (160 of 187 in GWS)** | 🟡 Medium — 27 remaining |
| Super Admin accounts | 7 Super Admins (target: 3) | 7 — reduction in progress | 🔴 High |
| Security alerts | 20+ unreviewed in Admin Console | Under review | 🔴 High |
| Phishing/DLP policies | None configured | None configured | 🔴 High |
| SSO enforcement | No SSO enforced on any SaaS tool | Assessment in progress | 🔴 High |
| Legacy accounts | Personal Google accounts in active use | Under review | 🟡 Medium |
| Google Vault | Provisioned but not active | Not yet activated | 🟡 Medium |
| BAA with Google | Not formally executed on file | Not yet executed | ⚠️ At Risk |

### 4b. BAA Verification

**Status: ⚠️ At Risk** · Was due May 14, 2026

Verification of Business Associate Agreement with Google Workspace is overdue. Google provides a BAA under the Data Processing Amendment — this needs formal execution and confirmation on file given BrightPath's status as a HIPAA-covered entity. Escalation required: Jeremy Garrigan or Brandon Spears to initiate with Google.

### 4c. MFA Rollout

**Status: 🔵 In Progress across multiple tracks**

| Task | Due | Status |
|---|---|---|
| Google Authenticator installation guide | May 15 | 🔵 In Progress |
| MFA enforcement & recovery flow documentation | May 22 | 🔵 In Progress |
| OU structure design & user migration | May 22 | 🔵 In Progress |
| GWS MFA rollout — Admin staff | May 15 | ⬜ Not Started |
| GWS MFA rollout — Direct Care / all staff | May 29 | ⬜ Not Started |
| MFA rollout — Other systems (JazzHR, When I Work, etc.) | Jun 5 | ⬜ Not Started |

**Current 2FA enrollment (live as of May 28, 2026):**

| Metric | Count |
|---|---|
| Roster Staff (HRIS) | 196 |
| In Google Workspace | 187 |
| 2FA Enrolled | **160** |
| Still Need 2FA | **27** |
| Overall Coverage | **86%** |
| Manager Groups tracked | 17 |

This is a significant improvement from the Week 1 baseline of ~3%. 27 users remain non-compliant ahead of the **May 29 all-staff enforcement deadline**.

**Enforcement deadline:** All-staff 2FA enforcement target is **May 29, 2026** — 27 users must enroll or be blocked at login.

### 4d. SSO Strategy

**Status: 🔵 In Progress**

| Task | Due | Status |
|---|---|---|
| Vendor follow-up — SSO assessment across all systems | May 15 | 🔵 In Progress |
| SSO rollout proposal — deliver to Brandon | May 20 | 🔵 In Progress |
| SSO / identity tooling selection | Jun 5 | 🔵 In Progress |
| SSO rollout to all applicable users | May 29 | ⬜ Not Started |

**Systems in scope for SSO evaluation (19 tools):** QuickBooks Online, Zoho CRM, Centrally HR, Therap EHR, Star Services LMS, JazzHR, When I Work, DocuSign, Adobe Acrobat, Bill.com, Alerus, Netstudy 2.0, Zizzl, Calendly, Indeed, LinkedIn Recruiter, Canva, Squarespace, Google Ads.

**Architecture direction:** Google Workspace as central Identity Provider (IdP) via SAML 2.0 — this avoids additional tooling cost and leverages the existing GWS footprint. Evaluation of BetterCloud and Okta underway as alternatives. Password manager assessment (1Password or Bitwarden) in parallel.

**Highest-risk system:** Therap EHR — SSO not supported. Alternative access control strategy required.

### 4e. Access Management — Onboarding & Offboarding SOPs

**Status: 🔵 In Progress** · Due May 20–26, 2026

Both the Onboarding and Offboarding IT SOPs have been authored by Jeremy Garrigan (May 18, 2026). S360 has completed a full security assessment of both documents, identifying **14 total gaps** across the two processes:

| Risk Level | Count | Examples |
|---|---|---|
| 🔴 Critical | 1 | HR trigger reliability for offboarding notifications |
| 🔴 High | 3 | No offboarding SLA, system inventory gaps, Google Vault inactive |
| 🟡 Medium | 5 | Final account disposition undefined, admin onboarding variability, no CHR integration |
| 🟢 Low | 5 | License over-provisioning, no-show handling, contractor offboarding path |

Proposed improvements cover: 15-minute offboarding SLA, RBAC-based access provisioning, automated triggers, Google Vault activation, and role-based system access matrix. Sign-off from Brandon required by May 21.

### 4f. Role-Based Access Control (RBAC)

**Status: 🔵 In Progress / ⬜ Pending Review**

| Task | Due | Status |
|---|---|---|
| Reduce Super Admin count from 7 to 3 | May 22 | 🔵 In Progress |
| Review Jeremy's current RBAC proposal | May 15 | ⬜ Not Started |
| RBAC proposal tweaks | May 18 | ⬜ Not Started |
| Final RBAC alignment & rollout plan | May 28 | ⬜ Not Started |

Current Super Admins (7): Brandon Spears, Rick Joslin, Nicole Buechler, Secellia Riley, Stephanie Noll, Jeremy Garrigan, Michael Sevilla. Target is 3. Awaiting Jeremy and Brandon alignment on final roster.

### 4g. Security Cleanup

**Status: 🔵 In Progress**

Quick wins being addressed: (1) 2FA on all Super Admin accounts, (2) disable legacy app passwords, (3) enable login audit alerts, (4) review and remove inactive user accounts (30+ day dormant). Items 3–4 in progress. Full cleanup review scheduled for June 1.

---

## 5. MOS Rollout Workstream — Detail

**Status: ⬜ Not Started (Scheduled — on track)**  
MOS work begins in Week 3 (May 25–31) and runs through Week 13.

| Task | Due | Status |
|---|---|---|
| Business-priority brief workshop | May 27 | ⬜ Not Started |
| Systems & data-flow map (QBO, Zoho, CHR, Therap, LMS) | May 29 | ⬜ Not Started |
| MOS wireframes — initial set | May 31 | ⬜ Not Started |
| Phase 1 integration plan | Jun 5 | ⬜ Not Started |
| MOS platform selection (Vercel or equivalent) | Jun 5 | ⬜ Not Started |
| **MOS shell ready for leadership review** *(Milestone)* | **Jun 5** | ⬜ Not Started |
| Connect Phase 1 systems (QBO + Zoho first) | Jun 21 | ⬜ Not Started |
| Augmented EOS dashboards — KPIs auto-flowing | Jun 28 | ⬜ Not Started |
| Targets / commentary / to-dos / rock status inputs | Jul 3 | ⬜ Not Started |
| **Leadership operating in MOS** *(Milestone)* | **Jul 3** | ⬜ Not Started |
| Connect remaining systems (CHR, Therap, Star LMS) | Jul 17 | ⬜ Not Started |
| Custom-build roadmap (prioritized) | Jul 24 | ⬜ Not Started |
| Replacement business case (cost, friction, ROI) | Jul 31 | ⬜ Not Started |
| Pilot scope: first custom module | Aug 7 | ⬜ Not Started |
| **Retire Google Trackers (cutover)** *(Milestone)* | **Aug 7** | ⬜ Not Started |

> **What MOS delivers:** A unified operating surface replacing the disconnected Google Trackers and spreadsheets currently used by leadership. Phase 1 connects QuickBooks Online and Zoho CRM as the first data flows. Phase 2 adds Centrally HR, Therap EHR, and Star LMS. The final deliverable is a custom-built management platform operating as BrightPath's primary leadership interface by Week 13.

---

## 6. Claude AI Workstream — Detail

**Status: 🔵 In Progress (super user designation)**  
Claude Enterprise purchase and setup begins Weeks 4–5, company-wide kickoff in Week 6.

| Task | Due | Status |
|---|---|---|
| Designate 3–5 Claude super users | May 22 | 🔵 In Progress |
| Purchase Claude Enterprise (20 seats) | May 28 | ⬜ Not Started |
| **Claude Enterprise enabled** *(Milestone)* | **Jun 1** | ⬜ Not Started |
| Configure org settings, security, token budgets | Jun 5 | ⬜ Not Started |
| Onboard 3–5 super users | Jun 12 | ⬜ Not Started |
| Early-adopter usage review & feedback | Jun 14 | ⬜ Not Started |
| **Company-wide kickoff session (20 seats)** *(Milestone)* | **Jun 15** | ⬜ Not Started |
| Homebase: best practices, prompt templates, training | Jun 17 | ⬜ Not Started |
| Office hours — Week 1 | Jun 19 | ⬜ Not Started |
| Office hours — Week 2 | Jun 26 | ⬜ Not Started |
| Office hours — Week 3 | Jul 3 | ⬜ Not Started |
| Office hours — Week 4 | Jul 10 | ⬜ Not Started |

> **Estimated cost:** Claude Enterprise at $20/seat/month + usage (~$20–40/seat). Estimated total: $800–$1,200/month for 20 seats. Purchase decision needed from Brandon/Lisa Carton by May 28.

---

## 7. What Was Built — Engagement Tracker

As part of this engagement, Summit 360 built and deployed a **custom web-based Engagement Tracker** at [https://brightpath-engagement.vercel.app](https://brightpath-engagement.vercel.app). This tool is the operational hub for managing and reporting on all three workstreams.

### 7a. Platform Summary

| Attribute | Detail |
|---|---|
| **URL** | https://brightpath-engagement.vercel.app |
| **Hosting** | Vercel (Summit 360 team account) |
| **Auth** | Google OAuth — BrightPath domain restricted |
| **Stack** | React 18 + Babel CDN, Supabase (shared persistence) |
| **Real-time sync** | All status changes and comments persist to Supabase and sync across all users |

### 7b. Features Built & Operational

#### 📊 Project Roadmap (Gantt)
- Visual 13-week Gantt chart with workstream bars, milestones, and progress tracking
- Today-marker and phase overlays (Month 1/2/3)
- Workstream summary cards with completion percentages, overdue counts, and health indicators

#### 📋 Workplan
- Full task list across all three workstreams (61 tasks)
- Per-task status updates (Not Started / In Progress / At Risk / Blocked / Done)
- Priority levels (High / Medium / Low)
- S360 and BrightPath owner assignments per task
- Comments with threaded replies — all persisted and shared across users
- Filter by workstream, owner, status, or due date
- Add/delete custom tasks
- Hide completed tasks toggle

#### 📅 Weekly Progress Reports
- Auto-generates "What we completed this week" from tasks moved to Done during that week
- "On deck for next week" from upcoming due dates
- "Key risks & roadblocks" from at-risk/blocked/overdue tasks
- Manual narrative fields per section for context and client commentary
- Export as Markdown (for Slack/email distribution)
- Print / PDF export
- 13-week navigator with current-week auto-detection

#### 🔒 Security Hub — Google Workspace
- **MFA Heatmap:** Live pull from Google Workspace Admin Directory API — shows 2FA enrollment status for all 218+ active accounts, sorted by risk, filterable by owner
- **Team 2FA (Manager Accountability View):** Cross-references the HRIS roster (202 employees) with live GWS 2FA data — grouped by manager, showing each team's compliance percentage
  - Shows multiple 2FA methods per user (Passkey + Authenticator App simultaneously)
  - Manager-level accountability: each group shows enrolled vs. total, with drill-down to individual members
- **SSO Strategy:** System-by-system SSO compatibility matrix across all 19+ SaaS tools — includes MFA support level, SSO protocol, plan tier requirements, and action notes per system
- **Access Management (RBAC + Cleanup):** Tracks super admin count, shared account cleanup, and role-based access control progress
- **MFA + SSO Implementation Plan:** Full 8-week implementation roadmap visualized with mini Gantt, phase cards, 3-stage rollout sequence, enforcement timeline, and success metrics
- **Onboarding & Offboarding SOP Review:** Side-by-side current vs. proposed comparison for both IT SOPs — visualized with step-flow diagrams, gap cards by risk level, and action roadmap

#### 👥 Employee Roster & 2FA Compliance
- HRIS roster loaded from CentrallyHR CBIZ export (202 employees as of May 27, 2026)
- Supervisor/manager hierarchy parsed from HRIS data
- Cross-referenced with live Google Workspace to surface 2FA status, method type, and account health per employee
- Roster updated with 8 new hires added and 6 terminated employees removed on May 27, 2026

### 7c. Live Data Integrations

| Integration | Status | Notes |
|---|---|---|
| Google Workspace Admin Directory API | ✅ Live | User list, 2FA enrollment, account status |
| Google Workspace Reports API | ✅ Live | Login activity, 2FA method detection (Passkey, Authenticator App, etc.) |
| Supabase (shared DB) | ✅ Live | Task overlays, comments, weekly snapshots, GWS cache |
| HRIS (CentrallyHR / CBIZ) | ✅ Manual export | Roster loaded from CSV; updated May 27 |

---

## 8. Open Items & Decisions Required from Brandon

The following items require BrightPath decision or action to maintain the project timeline:

| # | Item | Owner | By |
|---|---|---|---|
| 1 | **BAA with Google** — initiate formal execution of Data Processing Amendment | Brandon / Jeremy | ASAP — overdue |
| 2 | **Claude Enterprise purchase** — approve 20-seat purchase at ~$800–$1,200/mo | Brandon / Lisa | May 28 |
| 3 | **Claude super users** — confirm 3–5 names from leadership for early-adopter cohort | Brandon | May 28 |
| 4 | **Onboarding SOP sign-off** — review proposed improvements and approve | Brandon | May 21 |
| 5 | **Offboarding SOP sign-off** — review proposed improvements and approve | Brandon | May 21 |
| 6 | **Super Admin reduction** — confirm final 3-admin roster from {Brandon, Rick, Jeremy} | Brandon / Jeremy | May 22 |
| 7 | **MOS business-priority workshop** — 60-min session with Brandon and Stephanie Noll | Brandon / Stephanie | Week 3 (May 27) |
| 8 | **RBAC final alignment** — review Jeremy's proposal, confirm group structure | Brandon / Jeremy | May 28 |

---

## 9. Risks & Flags

| Risk | Level | Status |
|---|---|---|
| BAA with Google not executed — HIPAA exposure | 🔴 High | Overdue — escalation needed |
| 2FA adoption at 86% — 27 users remain, enforcement deadline May 29 | 🟡 Medium | 27 users must enroll before May 29 or will be blocked |
| IT single point of failure — Jeremy is sole IT staff | 🟡 Medium | Documented in SOP review |
| HR offboarding trigger unreliable — IT sometimes not notified | 🟡 Medium | Fix proposed, sign-off pending |
| Therap EHR has no SSO support | 🟡 Medium | Alternative strategy in design |
| Claude Enterprise purchase decision pending | 🟡 Medium | Needed by May 28 for Jun 1 milestone |
| Google Vault provisioned but inactive — no litigation hold capability | 🟡 Medium | Activation in access mgmt plan |

---

## 10. Schedule — 13-Week Plan

| Week | Dates | Focus | Status |
|---|---|---|---|
| **W1** | May 11–17 | Kickoff, GWS access, posture assessment begin | ✅ Complete |
| **W2** | May 18–24 | MFA/OU config, SSO proposal, security roadmap | ✅ Complete |
| **W3** | May 25–31 | MFA enforcement, access mgmt SOPs, MOS workshop begins | 🔵 Current |
| **W4** | Jun 1–7 | MOS wireframes + shell, Claude Enterprise live, SSO cleanup | ⬜ Upcoming |
| **W5** | Jun 8–14 | MOS Phase 1 integration starts, Claude super user onboarding | ⬜ Upcoming |
| **W6** | Jun 15–21 | Company-wide Claude kickoff, MOS leadership access | ⬜ Upcoming |
| **W7** | Jun 22–28 | Claude office hours, MOS KPI dashboards | ⬜ Upcoming |
| **W8** | Jun 29–Jul 5 | Leadership operating in MOS (milestone), Claude office hours | ⬜ Upcoming |
| **W9** | Jul 6–12 | Claude office hours wrap, MOS refinement | ⬜ Upcoming |
| **W10** | Jul 13–19 | Connect Centrally HR, Therap, LMS to MOS | ⬜ Upcoming |
| **W11** | Jul 20–26 | MOS custom-build roadmap, replacement business case | ⬜ Upcoming |
| **W12** | Jul 27–Aug 2 | Pilot first custom MOS module | ⬜ Upcoming |
| **W13** | Aug 3–9 | Retire Google Trackers, MOS as primary surface | ⬜ Upcoming |

---

## 11. Summary Assessment

We are **3 weeks into the 13-week engagement** and operating on schedule across all three workstreams.

**IT Security** is the immediate focus and is tracking well. The foundational work (GWS access, posture assessment, MFA tooling) is underway. Key items needing executive attention are the BAA execution and the offboarding/onboarding SOP sign-offs, both of which are blocking downstream implementation tasks.

**MOS and Claude AI** are both scheduled to begin active delivery in Weeks 3–4 and remain on track. The Claude Enterprise purchase decision is time-sensitive given the June 1 milestone.

**The Engagement Tracker** itself is fully live and operational, giving BrightPath real-time visibility into task status, team 2FA compliance, and the full security posture of the Google Workspace environment.

---

*Report generated: May 28, 2026*  
*Next update: End of Week 4 — June 5, 2026*  
*Contact: Rey Dumasig — Summit 360 Solutions*
