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
  // IT Security — front-loaded, with lighter tail through W3-4 finalization
  { ws: 'sec',    label: 'Posture assessment',         d0: w(1),     d1: w(1) + 5  },
  { ws: 'sec',    label: 'SSO + MFA + playbook',       d0: w(1) + 2, d1: e(2)      },
  { ws: 'sec',    label: 'Roadmap delivered',          d0: w(2) + 3, d1: e(2)      },
  { ws: 'sec',    label: 'Quick-wins + finalization',  d0: w(2) + 4, d1: w(4) + 2, faded: true },

  // MOS — kicks W3, runs through W13
  { ws: 'mos',    label: 'Wireframe + scoping',        d0: w(3),     d1: e(4)      },
  { ws: 'mos',    label: 'Phase 1 integration',        d0: w(4) + 2, d1: w(7) + 2  },
  { ws: 'mos',    label: 'Active use by leadership',   d0: w(6),     d1: e(8)      },
  { ws: 'mos',    label: 'Refine + custom roadmap',    d0: w(9),     d1: e(13)     },

  // Claude — Month 2, Jun 1 → mid Jul
  { ws: 'claude', label: 'Setup + super users',        d0: w(4),     d1: w(5) + 6  }, // Jun 1–14
  { ws: 'claude', label: 'Company-wide kickoff',       d0: w(6),     d1: w(6) + 1  }, // Jun 15
  { ws: 'claude', label: 'Office hours (4 wks)',       d0: w(6) + 2, d1: w(9) + 4  },
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
});

const TASKS = [
  // ── Engagement / Admin ────────────────────────────────────────────────────
  T('eng-1', 'admin', 'SOW countersignature & engagement kickoff',
    '2026-05-11', ['LE'], ['BS'], 'high',
    { status: 'in_progress',
      comments: [
        { who: 'LE', when: '2026-05-07T16:30', text: 'Brandon countersigning Monday AM. Calendar invite for kickoff at 10am CT is out.' },
        { who: 'BS', when: '2026-05-08T09:12', text: 'Confirmed. Will loop in Stephanie + Jeremy.' },
      ] }),
  T('eng-2', 'admin', 'Weekly ED 1:1 (recurring, Mondays)',
    null, ['LE'], ['BS'], 'med',
    { recurring: 'Mondays · 30 min', notes: '13 occurrences across engagement' }),
  T('eng-3', 'admin', 'Weekly Steer Co (ED, Dir of Services, QA/Training, IT)',
    null, ['LE'], ['BS', 'SN', 'LC', 'JPM', 'JE'], 'med',
    { recurring: 'Thursdays · 60 min' }),
  T('eng-4', 'admin', 'Invoice 1 sent ($4,833.33 — due Aug 11)',
    '2026-05-29', ['LE'], ['BS'], 'low'),
  T('eng-5', 'admin', 'Invoice 2 sent ($4,833.33 — due Sep 11)',
    '2026-06-30', ['LE'], ['BS'], 'low'),
  T('eng-6', 'admin', 'Invoice 3 sent ($4,833.34 — due Oct 11)',
    '2026-07-31', ['LE'], ['BS'], 'low'),

  // ── IT Security ───────────────────────────────────────────────────────────
  T('sec-1', 'sec', 'Provision Google Workspace super-admin access for S360',
    '2026-05-12', ['RD'], ['JE'], 'high',
    { notes: 'Current Super Admins: Brandon Spears, Rick Joslin, Nicole Buechler, Secellia Riley, Stephanie Noll, Jeremy Garrigan, Michael Sevilla. Jeremy to grant S360 access via Admin Console → Users.',
      comments: [
      { who: 'JE', when: '2026-05-08T11:02', text: 'Will create a delegated admin account scoped to audit + identity. Need Rey\'s S360 email.' },
    ] }),
  T('sec-2', 'sec', 'Security posture assessment (current state)',
    '2026-05-17', ['RD', 'MS'], ['JE', 'LC'], 'high'),
  T('sec-3', 'sec', 'SSO standardization plan across SaaS',
    '2026-05-22', ['RD'], ['LC', 'JE'], 'high',
    { notes: 'Inventory: QBO, Zoho, Centrally HR, Therap EHR, Star Services LMS, JazzHR (ATS), When I Work (WIW), OSMOR, Slack, Notion' }),
  T('sec-4', 'sec', 'MFA enforcement & recovery flow documentation',
    '2026-05-22', ['MS'], ['LC'], 'high'),
  T('sec-5', 'sec', 'Onboarding / offboarding access playbook',
    '2026-05-24', ['RD'], ['LC', 'SN'], 'med'),
  T('sec-6', 'sec', 'Prioritized security roadmap delivered',
    '2026-05-22', ['LE', 'RD'], ['BS'], 'high', { milestone: true }),
  T('sec-7', 'sec', 'Quick-win controls implemented',
    '2026-05-31', ['MS'], ['JE'], 'high'),
  T('sec-8', 'sec', 'SSO / identity tooling selection (review options)',
    '2026-06-05', ['LE'], ['BS', 'JE'], 'med'),

  // ── MOS ───────────────────────────────────────────────────────────────────
  T('mos-1', 'mos', 'Business-priority brief workshop',
    '2026-05-27', ['LE'], ['BS', 'SN'], 'high',
    { comments: [
      { who: 'LE', when: '2026-05-08T14:20', text: 'Holding 90 min on May 27. Want full leadership team — please confirm Stephanie + Lisa.' },
    ] }),
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
    '2026-06-28', ['LE', 'RD'], ['BS', 'SN'], 'high'),
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
    { status: 'in_progress',
      comments: [
        { who: 'BS', when: '2026-05-06T10:45', text: 'Thinking Stephanie, JP, Nicole + 1–2 program leads. Will confirm by Friday.' },
        { who: 'LE', when: '2026-05-07T08:15', text: 'Sounds great — need final list by May 22 so we can pre-provision.' },
      ] }),
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

Object.assign(window, {
  ENGAGEMENT_START, ENGAGEMENT_END, totalDays, ONE_DAY,
  addDays, fmtMon, fmtFull, fmtMD, fmtDow, dayOfEngagement,
  WEEKS, PHASES, PEOPLE, PEOPLE_LIST, WORKSTREAMS, WS_LIST,
  GANTT_BARS, MILESTONES, TASKS, STATUS, STATUS_ORDER, PRIORITY,
  ENGAGEMENT,
});
