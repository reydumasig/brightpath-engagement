// data.js — Engagement model: people, workstreams, gantt bars, milestones, tasks.
// All exported via Object.assign(window, ...) at the bottom for cross-script access.

// ── Date helpers ────────────────────────────────────────────────────────────
const ENGAGEMENT_START = new Date(2026, 4, 11); // Mon May 11, 2026 — Week 1 starts
const ENGAGEMENT_END   = new Date(2026, 7, 9);  // Sun Aug 9, 2026 — end of Week 13

const ONE_DAY = 86400000;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmtMon  = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fmtFull = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtMD   = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
const fmtDow  = (d) => d.toLocaleDateString('en-US', { weekday: 'short' });

// "days into engagement" — clamp so today before kickoff returns 0, after end returns total days.
const dayOfEngagement = (d) => Math.floor((new Date(d) - ENGAGEMENT_START) / ONE_DAY);
const totalDays = Math.floor((ENGAGEMENT_END - ENGAGEMENT_START) / ONE_DAY) + 1; // 91

// 13 weekly buckets. Each starts on a Monday.
const WEEKS = Array.from({ length: 13 }, (_, i) => {
  const start = addDays(ENGAGEMENT_START, i * 7);
  const end = addDays(ENGAGEMENT_START, i * 7 + 6);
  return { idx: i, num: i + 1, start, end, label: `W${i + 1}`, range: `${fmtMD(start)}–${fmtMD(end)}` };
});

// Three monthly bands. Aligned to weeks (4/4/5) per SOW phase boundaries, not strict calendar months.
const PHASES = [
  { id: 'm1', label: 'Month 1', sub: 'May 11 – Jun 7',  weekStart: 0, weekEnd: 3,  theme: 'May' },
  { id: 'm2', label: 'Month 2', sub: 'Jun 8 – Jul 5',   weekStart: 4, weekEnd: 7,  theme: 'June' },
  { id: 'm3', label: 'Month 3', sub: 'Jul 6 – Aug 9',   weekStart: 8, weekEnd: 12, theme: 'Jul–Aug' },
];

// ── People ──────────────────────────────────────────────────────────────────
const PEOPLE = {
  // S360
  LE:  { id: 'LE',  name: 'Lane Elmer',       first: 'Lane',     org: 's360',        role: 'Success Manager', initials: 'LE' },
  RD:  { id: 'RD',  name: 'Rey Dumasig',      first: 'Rey',      org: 's360',        role: 'Engineering',     initials: 'RD' },
  MS:  { id: 'MS',  name: 'Michael Sevilla',  first: 'Michael',  org: 's360',        role: 'Security / IT',   initials: 'MS' },
  // BrightPath
  BS:  { id: 'BS',  name: 'Brandon Spears',   first: 'Brandon',  org: 'brightpath',  role: 'Executive Director', initials: 'BS' },
  LC:  { id: 'LC',  name: 'Lisa Carton',      first: 'Lisa',     org: 'brightpath',  role: 'Operations',      initials: 'LC' },
  NI:  { id: 'NI',  name: 'Nicole Buechler',  first: 'Nicole',   org: 'brightpath',  role: 'Programs',        initials: 'NB' },
  SN:  { id: 'SN',  name: 'Stephanie Noll',   first: 'Stephanie',org: 'brightpath',  role: 'Director of Services', initials: 'SN' },
  JPM: { id: 'JPM', name: 'John Paul Miller', first: 'JP',       org: 'brightpath',  role: 'QA / Training',   initials: 'JM' },
  JE:  { id: 'JE',  name: 'Jeremy Garrigan',  first: 'Jeremy',   org: 'brightpath',  role: 'IT',              initials: 'JG' },
  RJ:  { id: 'RJ',  name: 'Rick Joslin',      first: 'Rick',     org: 'brightpath',  role: 'Super Admin',     initials: 'RJ' },
  SR:  { id: 'SR',  name: 'Secellia Riley',   first: 'Secellia', org: 'brightpath',  role: 'Super Admin',     initials: 'SR' },
};
const PEOPLE_LIST = Object.values(PEOPLE);

// ── Workstreams ─────────────────────────────────────────────────────────────
const WORKSTREAMS = {
  sec:    { id: 'sec',    name: 'IT Security',  short: 'Security',
            color: '#0284c7', tint: '#e0f2fe', deep: '#075985',
            tagline: 'Harden access, identity, and lifecycle on Google Workspace.' },
  mos:    { id: 'mos',    name: 'MOS Rollout',  short: 'MOS',
            color: '#4f46e5', tint: '#e0e7ff', deep: '#3730a3',
            tagline: 'Replace trackers with a unified operating surface.' },
  claude: { id: 'claude', name: 'Claude AI',    short: 'Claude',
            color: '#c2410c', tint: '#ffedd5', deep: '#9a3412',
            tagline: 'Stand up Claude Enterprise and drive adoption.' },
};
const WS_LIST = Object.values(WORKSTREAMS);

// ── Gantt sub-bars (visual roadmap) ─────────────────────────────────────────
// Coordinates use day-of-engagement (0 = May 11). 7 days/week.
// w(n) means start of week n (1-indexed). e(n) means end of week n.
const w = (n) => (n - 1) * 7;
const e = (n) => n * 7 - 1; // end-of-week is inclusive last day

const GANTT_BARS = [
  // IT Security — parallel sub-tracks
  { ws: 'sec',    label: 'Posture assessment',        d0: w(1),     d1: w(1) + 5,  taskIds: ['sec-baa', 'sec-1', 'sec-2', 'sec-mfa-ga'] },
  { ws: 'sec',    label: 'Google Workspace MFA',                      d0: w(1) + 1, d1: w(4) + 4,  taskIds: ['sec-4', 'sec-ou', 'sec-mfa-admin', 'sec-mfa-dc', 'sec-mfa-other'] },
  { ws: 'sec',    label: 'Google Workspace SSO/Non Google SSO',       d0: w(2),     d1: w(6),      taskIds: ['sec-sso-assess', 'sec-3', 'sec-sso-rollout', 'sec-8'] },
  { ws: 'sec',    label: 'Access Mgmt / Security',    d0: w(1) + 3, d1: e(3),      taskIds: ['sec-onboard-sop', 'sec-offboard-sop', 'sec-onboard-decide', 'sec-offboard-decide', 'sec-onboard-comms', 'sec-offboard-comms', 'sec-onboard-impl', 'sec-offboard-impl', 'sec-superadmin', 'sec-rbac-review', 'sec-rbac-tweaks', 'sec-rbac-next', 'sec-cleanup-review', 'sec-cleanup-tweaks', 'sec-cleanup-next', 'sec-5', 'sec-7'] },
  { ws: 'sec',    label: 'Roadmap delivered',         d0: w(2) + 3, d1: e(2),      taskIds: ['sec-6'] },

  // MOS — kicks W3, runs through W13
  { ws: 'mos',    label: 'Wireframe + scoping',        d0: w(3),     d1: e(4),      taskIds: ['mos-1', 'mos-2', 'mos-3', 'mos-4', 'mos-5', 'mos-6'] },
  { ws: 'mos',    label: 'Phase 1 integration',        d0: w(4) + 2, d1: w(7) + 2,  taskIds: ['mos-7', 'mos-8', 'mos-9', 'mos-10'] },
  { ws: 'mos',    label: 'Active use by leadership',   d0: w(6),     d1: e(8),      taskIds: ['mos-10', 'mos-11'] },
  { ws: 'mos',    label: 'Refine + custom roadmap',    d0: w(9),     d1: e(13),     taskIds: ['mos-12', 'mos-13', 'mos-14', 'mos-15'] },

  // Claude — Month 2, Jun 1 → mid Jul
  { ws: 'claude', label: 'Setup + super users',        d0: w(4),     d1: w(5) + 6,  taskIds: ['cl-1', 'cl-2', 'cl-3', 'cl-4', 'cl-5', 'cl-6'] }, // Jun 1–14
  { ws: 'claude', label: 'Company-wide kickoff',       d0: w(6),     d1: w(6) + 1,  taskIds: ['cl-7', 'cl-8'] }, // Jun 15
  { ws: 'claude', label: 'Office hours (4 wks)',       d0: w(6) + 2, d1: w(9) + 4,  taskIds: ['cl-9', 'cl-10', 'cl-11', 'cl-12'] },
];

// ── Milestones (gantt diamonds) ─────────────────────────────────────────────
const MILESTONES = [
  { id: 'ms-sec-1',    ws: 'sec',    label: 'Security roadmap delivered',     day: w(2) + 4 }, // Fri W2 — May 22
  { id: 'ms-claude-1', ws: 'claude', label: 'Claude Enterprise live',         day: w(4) + 0 }, // Mon W4 — Jun 1
  { id: 'ms-mos-1',    ws: 'mos',    label: 'MOS shell ready for review',     day: w(4) + 4 }, // Fri W4 — Jun 5
  { id: 'ms-claude-2', ws: 'claude', label: 'Company-wide Claude kickoff',    day: w(6) + 0 }, // Mon W6 — Jun 15
  { id: 'ms-mos-2',    ws: 'mos',    label: 'Leadership operating in MOS',    day: w(8) + 4 }, // Fri W8 — Jul 3
  { id: 'ms-mos-3',    ws: 'mos',    label: 'MOS as primary surface',         day: w(13) + 4 }, // Fri W13 — Aug 7
];

// ── Tasks (the workplan) ────────────────────────────────────────────────────
// Each task: id, ws, title, owner_s360 (array), owner_client (array),
// due (Date or null for recurring), priority, status default, comments.
const T = (id, ws, title, due, s360, client, priority, opts = {}) => ({
  id, ws, title,
  due: due ? new Date(due) : null,
  recurring: opts.recurring || null,
  owner_s360: s360 || [],
  owner_client: client || [],
  priority: priority || 'med',
  status: opts.status || 'not_started',
  isMilestone: !!opts.milestone,
  notes: opts.notes || '',
  comments: opts.comments || [],
  subgroup: opts.subgroup || null,
});

const TASKS = [
  // ── Engagement / Admin ────────────────────────────────────────────────────
  T('eng-1', 'admin', 'SOW countersignature & engagement kickoff',
    '2026-05-11', ['LE'], ['BS'], 'high',
    { status: 'done' }),
  T('eng-2', 'admin', 'Weekly ED 1:1 (recurring, Mondays)',
    null, ['LE'], ['BS'], 'med',
    { recurring: 'Mondays · 30 min', notes: '13 occurrences across engagement' }),
  T('eng-3', 'admin', 'Weekly Steer Co (ED, Dir of Services, QA/Training, IT)',
    null, ['LE'], ['BS', 'SN', 'LC', 'JPM', 'JE'], 'med',
    { recurring: 'Thursdays · 60 min' }),

  // ── IT Security — General ─────────────────────────────────────────────────
  T('sec-baa', 'sec', 'BAA verification with Google Workspace',
    '2026-04-14', ['RD'], ['JE', 'BS'], 'high',
    { status: 'at_risk',
      notes: 'Week 1 deliverable — overdue. Verify BAA coverage under Google Workspace for Business Plus as HIPAA-covered entity. Google does provide a BAA under the Data Processing Amendment; needs formal execution and confirmation on file.' }),
  T('sec-1', 'sec', 'Provision Google Workspace super-admin access for S360',
    '2026-05-12', ['RD'], ['JE'], 'high',
    { status: 'done',
      notes: 'Admin Console access granted Apr 21. S360 delegated admin account active. Current Super Admins (7): Brandon Spears, Rick Joslin, Nicole Buechler, Secellia Riley, Stephanie Noll, Jeremy Garrigan, Michael Sevilla. Reduction to 3 is a separate tracked task.' }),
  T('sec-6', 'sec', 'Prioritized security roadmap delivered',
    '2026-05-22', ['LE', 'RD'], ['BS'], 'high',
    { status: 'in_progress', milestone: true,
      notes: 'Day 30 deliverable. Will include: ranked risk findings, 60/90-day remediation roadmap, SSO/MFA rollout plan, quick-win status, open items. Target delivery to Brandon by May 22.' }),

  // ── IT Security — MFA ─────────────────────────────────────────────────────
  T('sec-2', 'sec', 'Security posture assessment (current state)',
    '2026-05-17', ['RD', 'MS'], ['JE', 'LC'], 'high',
    { status: 'in_progress', subgroup: 'mfa',
      notes: 'Assessment underway. Key findings to date: 2FA adoption at ~3% (7 of 219 users enrolled); 20+ security alerts in Admin Console; no phishing/DLP policies configured; 7 Super Admins (target: 3); no SSO enforced on any SaaS tool; legacy personal Google accounts in active use. Full report targeting May 17.' }),
  T('sec-mfa-ga', 'sec', 'Google Authenticator installation guide — distribute to all users',
    '2026-05-15', ['MS', 'RD'], ['JE'], 'high',
    { status: 'in_progress', subgroup: 'mfa',
      notes: 'Full picture of where Google Authenticator MFA will support across BrightPath\'s tech stack. Develop alternative strategies for systems that may not allow TOTP (govt portals, legacy HR systems, etc.).' }),
  T('sec-4', 'sec', 'MFA enforcement & recovery flow documentation',
    '2026-05-22', ['MS'], ['LC'], 'high',
    { status: 'in_progress', subgroup: 'mfa',
      notes: 'Phased rollout plan in progress. Phase A (Week 2–3): enforce 2FA on all 7 Super Admin accounts — in progress. Recovery flow doc being drafted alongside enforcement policy.' }),
  T('sec-ou', 'sec', 'OU structure design & user migration',
    '2026-05-22', ['MS'], ['JE', 'LC'], 'high',
    { status: 'in_progress', subgroup: 'mfa',
      notes: 'Design organizational units (OUs) in Google Admin to reflect BrightPath org chart. Enables targeted policy enforcement (2FA, app restrictions, etc.) by role/department. Draft structure: Leadership, Corporate Staff, Direct Care, Contractors. Migration of ~219 users to appropriate OUs underway.' }),
  T('sec-mfa-admin', 'sec', 'GWS — Rollout to all Admin staff',
    '2026-05-15', ['MS', 'RD'], ['JE'], 'high',
    { status: 'not_started', subgroup: 'mfa' }),
  T('sec-mfa-dc', 'sec', 'GWS — Rollout to all Direct Care / company',
    '2026-05-29', ['MS', 'RD'], ['JE'], 'high',
    { status: 'not_started', subgroup: 'mfa',
      notes: 'Will accelerate timeline if Brandon requests earlier rollout.' }),
  T('sec-mfa-other', 'sec', 'Majority of other systems — MFA rollout',
    '2026-06-05', ['MS', 'RD'], ['JE'], 'high',
    { status: 'not_started', subgroup: 'mfa',
      notes: 'For applicable systems. Covers JazzHR, When I Work, Zoho, QBO, DocuSign, Adobe Acrobat, Bill.com, Calendly, Indeed, LinkedIn Recruiter, Canva, Squarespace, and others confirmed to support TOTP MFA.' }),

  // ── IT Security — SSO ─────────────────────────────────────────────────────
  T('sec-sso-assess', 'sec', 'Vendor follow-up — SSO assessment across systems',
    '2026-05-15', ['MS'], ['JE'], 'high',
    { status: 'in_progress', subgroup: 'sso',
      notes: 'May need Jeremy to follow up with vendors as necessary (where Michael doesn\'t have authority).' }),
  T('sec-3', 'sec', 'SSO rollout proposal — deliver to Brandon',
    '2026-05-20', ['RD'], ['LC', 'JE'], 'high',
    { status: 'in_progress', subgroup: 'sso',
      notes: 'SaaS inventory complete. Active tools in scope: QBO, Zoho CRM, Centrally HR, Therap EHR, Star Services LMS, JazzHR (ATS), When I Work, DocuSign, Adobe Acrobat, Bill.com, Alerus, Netstudy 2.0, Zizzl, Calendly, Indeed, LinkedIn Recruiter, Canva, Squarespace, Google Ads. Evaluating Google as IdP for SAML/SSO on each. Therap EHR highest risk — no SSO. Not in scope: AUZMOR (inactive), E-Verify (within Centrally HR, not in use).' }),
  T('sec-sso-rollout', 'sec', 'SSO rollout to all applicable users',
    '2026-05-29', ['MS', 'RD'], ['JE'], 'high',
    { status: 'not_started', subgroup: 'sso',
      notes: 'Prioritization of rollout still to be determined.' }),
  T('sec-8', 'sec', 'SSO / identity tooling selection',
    '2026-06-05', ['LE'], ['BS', 'JE'], 'med',
    { status: 'in_progress', subgroup: 'sso',
      notes: 'Evaluating: Google Workspace as IdP (SAML), BetterCloud, Okta. Leaning toward GWS-native given existing footprint and cost. Will include password manager assessment — 1Password or Bitwarden for credential hygiene across ~219 users.' }),

  // ── IT Security — Access Mgmt: Onboarding ─────────────────────────────────
  T('sec-onboard-sop', 'sec', 'Onboarding — SOP visualization & open items',
    '2026-05-20', ['RD'], [], 'med',
    { status: 'in_progress', subgroup: 'access-onboard',
      notes: 'Will require some coordination with Michael and Jeremy.' }),
  T('sec-onboard-decide', 'sec', 'Onboarding — Sign-off from John Paul',
    '2026-05-21', [], ['JPM'], 'med',
    { status: 'not_started', subgroup: 'access-onboard' }),
  T('sec-onboard-comms', 'sec', 'Onboarding — Communicate changes to affected parties',
    '2026-05-22', ['RD'], ['JE'], 'med',
    { status: 'not_started', subgroup: 'access-onboard' }),
  T('sec-onboard-impl', 'sec', 'Onboarding — Implementation of changes',
    '2026-05-26', ['RD', 'MS'], ['JE'], 'med',
    { status: 'not_started', subgroup: 'access-onboard' }),
  T('sec-5', 'sec', 'Onboarding / offboarding access playbook (deliverable)',
    '2026-05-26', ['RD'], ['LC', 'SN'], 'med',
    { status: 'in_progress', subgroup: 'access-onboard',
      notes: 'Playbook covering GWS account provisioning, SaaS app access, offboarding revocation checklist. Coordinating with Stephanie Noll (HR) on Centrally HR triggers.' }),

  // ── IT Security — Access Mgmt: Offboarding ────────────────────────────────
  T('sec-offboard-sop', 'sec', 'Offboarding — SOP visualization & open items',
    '2026-05-20', ['RD'], [], 'med',
    { status: 'in_progress', subgroup: 'access-offboard',
      notes: 'Will require some coordination with Michael and Jeremy.' }),
  T('sec-offboard-decide', 'sec', 'Offboarding — Sign-off from John Paul',
    '2026-05-21', [], ['JPM'], 'med',
    { status: 'not_started', subgroup: 'access-offboard' }),
  T('sec-offboard-comms', 'sec', 'Offboarding — Communicate changes to affected parties',
    '2026-05-22', ['RD'], ['JE'], 'med',
    { status: 'not_started', subgroup: 'access-offboard' }),
  T('sec-offboard-impl', 'sec', 'Offboarding — Implementation of changes',
    '2026-05-26', ['RD', 'MS'], ['JE'], 'med',
    { status: 'not_started', subgroup: 'access-offboard' }),

  // ── IT Security — Access Mgmt: Role Based Access Control ─────────────────
  T('sec-superadmin', 'sec', 'Reduce Super Admin count from 7 to 3',
    '2026-05-22', ['MS'], ['JE', 'BS'], 'high',
    { status: 'in_progress', subgroup: 'access-rbac',
      notes: 'Current Super Admins: Brandon Spears, Rick Joslin, Nicole Buechler, Secellia Riley, Stephanie Noll, Jeremy Garrigan, Michael Sevilla (7 total). Target: 3 Super Admins. Remaining users to be downgraded to scoped delegated-admin or standard roles. Brandon + Jeremy to approve final roster.' }),
  T('sec-rbac-review', 'sec', 'RBAC — Review of Jeremy\'s current proposal',
    '2026-05-15', ['RD'], ['JE'], 'med',
    { status: 'not_started', subgroup: 'access-rbac' }),
  T('sec-rbac-tweaks', 'sec', 'RBAC — Proposal of any tweaks',
    '2026-05-18', ['RD'], [], 'med',
    { status: 'not_started', subgroup: 'access-rbac' }),
  T('sec-rbac-next', 'sec', 'RBAC — Final alignment & rollout plan (Jeremy, Brandon, Rey)',
    '2026-05-28', ['RD'], ['JE', 'BS'], 'med',
    { status: 'not_started', subgroup: 'access-rbac' }),

  // ── IT Security — Security Cleanup ───────────────────────────────────────
  T('sec-7', 'sec', 'Quick-win controls implemented',
    '2026-05-31', ['MS'], ['JE'], 'high',
    { status: 'in_progress', subgroup: 'cleanup',
      notes: 'Quick wins identified: (1) 2FA on all Super Admin accounts, (2) disable legacy app passwords, (3) enable login audit alerts, (4) review and remove inactive user accounts (30+ day dormant). Items 3–4 in progress.' }),
  T('sec-cleanup-review', 'sec', 'Cleanup — Review of Jeremy\'s current proposal',
    '2026-06-01', ['RD'], ['JE'], 'med',
    { status: 'not_started', subgroup: 'cleanup',
      notes: 'Deferred — revisit within two weeks of completing Week 2 priorities. Review access to systems, folders, shared drives, and vendor admin credentials.' }),
  T('sec-cleanup-tweaks', 'sec', 'Cleanup — Proposal of any tweaks',
    '2026-06-03', ['RD'], [], 'med',
    { status: 'not_started', subgroup: 'cleanup',
      notes: 'Deferred — follows cleanup review.' }),
  T('sec-cleanup-next', 'sec', 'Cleanup — Determine next steps & rollout',
    '2026-06-05', ['RD'], ['JE'], 'med',
    { status: 'not_started', subgroup: 'cleanup' }),

  // ── MOS ───────────────────────────────────────────────────────────────────
  T('mos-1', 'mos', 'Business-priority brief workshop',
    '2026-05-27', ['LE'], ['BS', 'SN'], 'high'),
  T('mos-2', 'mos', 'Systems & data-flow map (QBO, Zoho, Centrally HR, Therap EHR, Star LMS)',
    '2026-05-29', ['LE', 'RD'], ['SN', 'JPM'], 'high'),
  T('mos-3', 'mos', 'MOS wireframes — initial set (reviewed weekly)',
    '2026-05-31', ['LE'], ['BS'], 'high'),
  T('mos-4', 'mos', 'Phase 1 integration plan',
    '2026-06-05', ['RD'], ['SN', 'JPM'], 'high'),
  T('mos-5', 'mos', 'MOS platform selection (Vercel or equivalent)',
    '2026-06-05', ['LE'], ['BS'], 'med'),
  T('mos-6', 'mos', 'MOS shell ready for leadership review',
    '2026-06-05', ['LE', 'RD'], ['BS'], 'high', { milestone: true }),
  T('mos-7', 'mos', 'Connect Phase 1 systems (QBO + Zoho first)',
    '2026-06-21', ['RD', 'MS'], ['JPM'], 'high'),
  T('mos-8', 'mos', 'Augmented EOS dashboards — KPIs auto-flowing',
    '2026-06-28', ['LE', 'RD'], ['BS', 'SN'], 'high',
    { status: 'in_progress',
      notes: `SCORECARD INFRASTRUCTURE\n• Add Metric Row — Admin/exec/dept heads can now add new metric rows directly inside any scorecard tab via a modal (name, owner, goal). No more SQL required.\n• Archive Metric — Each metric row has an archive button. Archived metrics collapse to a "Restore" section, keeping scorecards clean without permanent deletion.\n• Real Supervisor Names — Replaced all dummy placeholder names in the Owner dropdowns with the 18 actual BrightPath supervisors from the employee roster.\n\nLIVE DATA INTEGRATIONS\n• Zoho CRM → DAM Scorecard — Full OAuth 2.0 connection. Auto-populates: New Referrals Received, Qualified Referrals, Active Referrals in Pipeline, UBS & Res Decision-to-Admission avg days.\n• JazzHR → HR Scorecard — API key connection. Auto-populates: # Open Positions, # Open Direct Care, # Open BT, # Open IHS, # New Applications This Week, # Hires This Week.\n• Therap → Residential / UBS / QAT — Documented 4 exact CSV exports needed (GER Status, T-Log Completion, EVV Summary, Compliance/ISP) and the upload flow built in Admin.\n• Internal Trackers → HR & QAT — Operations trackers (Onboarding, Training, Termination, UBS Staffing) now auto-push aggregated counts into HR and QAT scorecards on every sync.\n\nVISIBILITY\n• Systems & Data Flow Map — New page under Admin showing every data source, connection type (Live API / CSV / Internal Sync / Manual), which scorecard departments each feeds, and a filterable metric-by-metric source table.` }),
  T('mos-8a', 'mos', 'Scorecard infrastructure + live integrations — completed',
    '2026-06-15', ['RD'], ['BS', 'SN'], 'high',
    { status: 'done', subgroup: 'mos8-delivered',
      notes: `SCORECARD INFRASTRUCTURE\n• Add Metric Row — Admin/exec/dept heads can now add new metric rows directly inside any scorecard tab via a modal (name, owner, goal). No more SQL required.\n• Archive Metric — Each metric row has an archive button. Archived metrics collapse to a "Restore" section, keeping scorecards clean without permanent deletion.\n• Real Supervisor Names — Replaced all dummy placeholder names in the Owner dropdowns with the 18 actual BrightPath supervisors from the employee roster.\n\nLIVE DATA INTEGRATIONS\n• Zoho CRM → DAM Scorecard — Full OAuth 2.0 connection. Auto-populates: New Referrals Received, Qualified Referrals, Active Referrals in Pipeline, UBS & Res Decision-to-Admission avg days.\n• JazzHR → HR Scorecard — API key connection. Auto-populates: # Open Positions, # Open Direct Care, # Open BT, # Open IHS, # New Applications This Week, # Hires This Week.\n• Therap → Residential / UBS / QAT — Documented 4 exact CSV exports needed (GER Status, T-Log Completion, EVV Summary, Compliance/ISP) and the upload flow built in Admin.\n• Internal Trackers → HR & QAT — Operations trackers (Onboarding, Training, Termination, UBS Staffing) now auto-push aggregated counts into HR and QAT scorecards on every sync.\n\nVISIBILITY\n• Systems & Data Flow Map — New page under Admin showing every data source, connection type (Live API / CSV / Internal Sync / Manual), which scorecard departments each feeds, and a filterable metric-by-metric source table.` }),
  T('mos-9', 'mos', 'Targets / commentary / to-dos / rock status inputs',
    '2026-07-03', ['LE'], ['BS', 'SN'], 'med'),
  T('mos-10', 'mos', 'Leadership operating in MOS (milestone)',
    '2026-07-03', ['LE'], ['BS'], 'high', { milestone: true }),
  T('mos-11', 'mos', 'Connect remaining systems (Centrally HR, Therap, Star LMS)',
    '2026-07-17', ['RD', 'MS'], ['LC', 'JPM'], 'high'),
  T('mos-12', 'mos', 'Custom-build roadmap (prioritized)',
    '2026-07-24', ['LE'], ['BS'], 'high'),
  T('mos-13', 'mos', 'Replacement business case (cost, friction, ROI)',
    '2026-07-31', ['LE'], ['BS'], 'high'),
  T('mos-14', 'mos', 'Pilot scope: first custom module',
    '2026-08-07', ['LE', 'RD'], ['BS'], 'med'),
  T('mos-15', 'mos', 'Retire Google Trackers (cutover)',
    '2026-08-07', ['LE'], ['BS', 'NI', 'SN'], 'med'),

  // ── Claude ────────────────────────────────────────────────────────────────
  T('cl-1', 'claude', 'Designate 3–5 Claude super users',
    '2026-05-22', ['LE'], ['BS'], 'high',
    { status: 'in_progress' }),
  T('cl-2', 'claude', 'Purchase Claude Enterprise (20 seats, direct via Anthropic)',
    '2026-05-28', ['LE'], ['BS', 'LC'], 'high',
    { notes: '$20/seat/mo + ~$20–40/seat usage. Est. $800–$1,200/mo total.' }),
  T('cl-3', 'claude', 'Claude Enterprise enabled (20 seats)',
    '2026-06-01', ['LE'], ['JE'], 'high', { milestone: true }),
  T('cl-4', 'claude', 'Configure org settings, security, token budgets',
    '2026-06-05', ['LE', 'MS'], ['JE'], 'high'),
  T('cl-5', 'claude', 'Onboard 3–5 super users',
    '2026-06-12', ['LE'], ['SN', 'JPM', 'NI'], 'high'),
  T('cl-6', 'claude', 'Early-adopter usage review & feedback',
    '2026-06-14', ['LE'], ['SN', 'JPM'], 'med'),
  T('cl-7', 'claude', 'Company-wide kickoff session (20 seats)',
    '2026-06-15', ['LE'], ['BS'], 'high', { milestone: true }),
  T('cl-8', 'claude', 'Homebase: best practices, prompt templates, training',
    '2026-06-17', ['LE'], ['SN'], 'med'),
  T('cl-9', 'claude', 'Office hours — Week 1',
    '2026-06-19', ['LE'], [], 'low'),
  T('cl-10', 'claude', 'Office hours — Week 2',
    '2026-06-26', ['LE'], [], 'low'),
  T('cl-11', 'claude', 'Office hours — Week 3',
    '2026-07-03', ['LE'], [], 'low'),
  T('cl-12', 'claude', 'Office hours — Week 4',
    '2026-07-10', ['LE'], [], 'low'),
];

// ── Status / priority enums ─────────────────────────────────────────────────
const STATUS = {
  not_started: { id: 'not_started', label: 'Not Started', bg: '#e2e8f0', fg: '#475569', dot: '#94a3b8' },
  in_progress: { id: 'in_progress', label: 'In Progress', bg: '#3b82f6', fg: '#ffffff', dot: '#3b82f6' },
  at_risk:     { id: 'at_risk',     label: 'At Risk',     bg: '#f59e0b', fg: '#ffffff', dot: '#f59e0b' },
  blocked:     { id: 'blocked',     label: 'Blocked',     bg: '#ef4444', fg: '#ffffff', dot: '#ef4444' },
  done:        { id: 'done',        label: 'Done',        bg: '#10b981', fg: '#ffffff', dot: '#10b981' },
};
const STATUS_ORDER = ['not_started', 'in_progress', 'at_risk', 'blocked', 'done'];

const PRIORITY = {
  high: { id: 'high', label: 'High', bg: '#fee2e2', fg: '#b91c1c', dot: '#dc2626' },
  med:  { id: 'med',  label: 'Med',  bg: '#fef3c7', fg: '#92400e', dot: '#d97706' },
  low:  { id: 'low',  label: 'Low',  bg: '#f1f5f9', fg: '#64748b', dot: '#94a3b8' },
};

// ── Engagement metadata ─────────────────────────────────────────────────────
const ENGAGEMENT = {
  client: 'BrightPath, LLC',
  provider: 'S360 (Summit 360 Solutions)',
  successManager: 'LE',
  start: ENGAGEMENT_START,
  end: ENGAGEMENT_END,
  fee: 14500,
  type: 'Project-based consulting · 90 days',
};

// Apply admin overrides (from /admin panel) at load time
try {
  const _ao = JSON.parse(localStorage.getItem('brightpath-admin-v1') || '{}');
  if (_ao.peopleOverrides) {
    Object.entries(_ao.peopleOverrides).forEach(([id, patch]) => {
      if (PEOPLE[id]) Object.assign(PEOPLE[id], patch);
    });
  }
  if (_ao.engagementOverrides) {
    Object.assign(ENGAGEMENT, _ao.engagementOverrides);
  }
} catch(e) {}

// Sub-group structure for IT Security workstream (rendered as nested headers)
const SEC_SUBGROUPS = [
  { id: 'mfa',             label: 'MFA',                        parent: null },
  { id: 'sso',             label: 'SSO',                        parent: null },
  { id: 'access-onboard',  label: 'Onboarding',                 parent: 'Access Mgmt / Security' },
  { id: 'access-offboard', label: 'Offboarding',                parent: 'Access Mgmt / Security' },
  { id: 'access-rbac',     label: 'Role Based Access Control',   parent: 'Access Mgmt / Security' },
  { id: 'cleanup',         label: 'Security Cleanup',            parent: null },
];

Object.assign(window, {
  ENGAGEMENT_START, ENGAGEMENT_END, totalDays, ONE_DAY,
  addDays, fmtMon, fmtFull, fmtMD, fmtDow, dayOfEngagement,
  WEEKS, PHASES, PEOPLE, PEOPLE_LIST, WORKSTREAMS, WS_LIST,
  GANTT_BARS, MILESTONES, TASKS, STATUS, STATUS_ORDER, PRIORITY,
  ENGAGEMENT, SEC_SUBGROUPS,
});
