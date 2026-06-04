// security-plan.jsx — BrightPath MFA + SSO Implementation Plan
// Dedicated plan page rendered as a sub-tab inside Security Hub

// ── Plan data ─────────────────────────────────────────────────────────────────
const PLAN_PHASES = [
  {
    num: 1, key: 'phase1',
    label: 'Discovery & Assessment',
    week: 'Week 1', weekStart: 0, weekWidth: 1,
    color: '#475569', tint: '#f8fafc', border: '#cbd5e1',
    icon: '🔍', track: 0,
    summary: 'Inventory all systems, validate MFA and SSO capabilities per platform, and establish org-wide enforcement policy.',
    objectives: ['Inventory every business system and account type', 'Validate MFA and SSO capabilities per system', 'Identify unsupported or high-risk platforms', 'Establish enforcement policy and timelines'],
    deliverables: ['Master Systems Inventory', 'Access Matrix', 'Admin Account Registry', 'MFA Heatmap', 'SSO Readiness Report'],
    actions: [
      { id: '1.1', title: 'System Inventory Validation', owner: 'Rey / IT Team / Dept Heads',
        items: ['Identify every platform currently in use', 'Catalog admin, super-admin, shared, vendor, contractor, and service accounts'] },
      { id: '1.2', title: 'MFA Compatibility Assessment', owner: 'IT Security Team',
        items: ['TOTP support', 'Google Authenticator compatibility', 'Backup code availability', 'SMS fallback risks', 'Conditional access options'] },
      { id: '1.3', title: 'SSO Capability Assessment', owner: 'IT + Vendors',
        items: ['SAML 2.0 / OAuth 2.0 support per vendor', 'SCIM provisioning support', 'Google Workspace compatibility', 'Pricing implications for SSO tiers'] },
    ],
  },
  {
    num: 2, key: 'phase2',
    label: 'Google Workspace Hardening',
    week: 'Week 2', weekStart: 1, weekWidth: 1,
    color: '#0284c7', tint: '#eff6ff', border: '#bfdbfe',
    icon: '🛡️', track: 0,
    summary: 'Prepare Google Workspace as the central identity layer, lock down admin access, and configure MFA enforcement policies.',
    objectives: ['Designate Google Workspace as central identity layer', 'Harden all admin access controls', 'Configure MFA enforcement by group with deadlines'],
    deliverables: ['MFA enforcement config', 'Enrollment monitoring dashboard', 'Break-glass emergency accounts', 'Weekly security scorecard template'],
    actions: [
      { id: '2.1', title: 'Admin Security Lockdown', owner: 'IT Admin — Immediate Priority',
        items: ['Require MFA for all admin accounts', 'Remove all shared admin accounts', 'Create break-glass emergency accounts (2)', 'Reduce super admins to maximum 2 accounts'] },
      { id: '2.2', title: 'Configure MFA Enforcement Policies', owner: 'Google Workspace Admin',
        items: ['IT/Admin group: enforce Day 1', 'HR/Leadership: enforce Day 3', 'Recruiters/Operations: enforce Day 5', 'Frontline Staff: enforce Day 10'] },
      { id: '2.3', title: 'Enrollment Monitoring Dashboard', owner: 'IT',
        items: ['Build MFA dashboard grouped by team, manager, and department', 'Create compliance tracking spreadsheet', 'Set up weekly security scorecard for leadership'] },
    ],
  },
  {
    num: 3, key: 'phase3',
    label: 'Google Authenticator Rollout',
    week: 'Weeks 2–3', weekStart: 1, weekWidth: 2,
    color: '#7c3aed', tint: '#f5f3ff', border: '#c4b5fd',
    icon: '📱', track: 1,
    summary: 'Three-stage org-wide rollout from IT pilot through full employee enrollment, targeting 95%+ adoption within 10 days.',
    objectives: ['Protect all employee accounts with MFA', 'Eliminate password-only authentication', 'Reduce phishing and credential theft risk'],
    deliverables: ['Pilot group completed', 'Critical team enrollment confirmed', 'Org-wide enrollment at 95%+ target'],
    actions: [
      { id: '3.1', title: 'Stage 1 — Pilot Group', owner: 'IT, Leadership, Ops Managers · Days 1–3',
        items: ['Test the rollout process end-to-end', 'Identify friction points and common issues', 'Validate setup instructions and documentation'] },
      { id: '3.2', title: 'Stage 2 — Admin & Critical Teams', owner: 'HR, Finance, Recruiting, Operations · Days 4–6',
        items: ['Force MFA enrollment for these groups', 'Verify backup codes are set up by each user', 'Validate account recovery process works'] },
      { id: '3.3', title: 'Stage 3 — Org-Wide Rollout', owner: 'All remaining staff · Days 7–10',
        items: ['Organization-wide enrollment prompts at login', 'Daily Slack reminders with enrollment guide link', 'Manager escalation tracking for non-compliant users'] },
    ],
  },
  {
    num: 4, key: 'phase4',
    label: 'SSO Architecture Design',
    week: 'Week 3', weekStart: 2, weekWidth: 1,
    color: '#d97706', tint: '#fffbeb', border: '#fcd34d',
    icon: '🏗️', track: 0,
    summary: 'Design centralized identity architecture using Google Workspace as the IdP, with SAML 2.0 flows mapped for each connected system.',
    objectives: ['Finalize Google Workspace as central Identity Provider', 'Design SAML/OAuth flows for each priority system', 'Plan SCIM auto-provisioning and deprovisioning'],
    deliverables: ['SSO Architecture Diagram', 'Identity Design Document', 'System connection priority list with protocols'],
    actions: [
      { id: '4.1', title: 'Identity Architecture Design', owner: 'IT Security + S360',
        items: ['Map SAML 2.0 and OAuth 2.0 flows per connected system', 'Design SCIM provisioning and deprovisioning model', 'Define Joiner / Mover / Leaver automation rules'] },
    ],
  },
  {
    num: 5, key: 'phase5',
    label: 'SSO Pilot Implementation',
    week: 'Week 4', weekStart: 3, weekWidth: 1,
    color: '#059669', tint: '#ecfdf5', border: '#6ee7b7',
    icon: '🧪', track: 0,
    summary: 'Pilot SSO with highest-priority systems (Slack, JazzHR) before org-wide rollout.',
    objectives: ['Validate SSO configuration end-to-end', 'Test user provisioning and deprovisioning', 'Confirm lifecycle management works correctly'],
    deliverables: ['Pilot SSO integrations live', 'SCIM provisioning configured', 'Lifecycle test report'],
    actions: [
      { id: '5.1', title: 'Configure SAML Integration', owner: 'IT + Vendors',
        items: ['Exchange SAML metadata with each vendor', 'Configure and sign certificates', 'Test full login flows end-to-end with test users'] },
      { id: '5.2', title: 'Configure User Provisioning', owner: 'IT Admin',
        items: ['Auto-create users in connected apps on new hire', 'Auto-suspend accounts immediately upon termination'] },
      { id: '5.3', title: 'Test Lifecycle Management', owner: 'IT + HR',
        items: ['Simulate new hire creation flow', 'Test role change / permission update scenario', 'Verify offboarding suspension propagates to all apps'] },
    ],
  },
  {
    num: 6, key: 'phase6',
    label: 'Full SSO Rollout',
    week: 'Weeks 5–6', weekStart: 4, weekWidth: 2,
    color: '#0891b2', tint: '#ecfeff', border: '#67e8f9',
    icon: '🚀', track: 0,
    summary: 'Connect all remaining systems to Google Workspace SSO and activate full centralized access governance.',
    objectives: ['Connect all systems to SSO', 'Eliminate standalone credentials org-wide', 'Enable centralized access governance and audit'],
    deliverables: ['All systems on SSO', 'Full JML automation active', 'Access governance report for leadership'],
    actions: [
      { id: '6.1', title: 'Week 5 — HR & Operations Systems', owner: 'IT + Dept Heads',
        items: ['JazzHR ATS', 'Centrally HR (HRIS)', 'LMS platform'] },
      { id: '6.2', title: 'Week 6 — Remaining Platforms', owner: 'IT + Vendors',
        items: ['Scheduling systems (When I Work)', 'Vendor-managed tools', 'Internal apps and shared drives'] },
    ],
  },
];

const ENFORCEMENT_GROUPS = [
  { group: 'IT / Admins',              deadline: 'Day 1',  color: '#dc2626', bg: '#fee2e2', pct: 12 },
  { group: 'HR / Leadership',          deadline: 'Day 3',  color: '#d97706', bg: '#fef3c7', pct: 37 },
  { group: 'Recruiters / Operations',  deadline: 'Day 5',  color: '#ca8a04', bg: '#fef9c3', pct: 62 },
  { group: 'Frontline Staff',          deadline: 'Day 10', color: '#16a34a', bg: '#dcfce7', pct: 100 },
];

const JML_TABLE = [
  { event: 'New Hire',    icon: '➕', action: 'Create Google account + auto-assign apps via group membership',        badge: 'Automated' },
  { event: 'Promotion',   icon: '⬆️', action: 'Update group permissions to reflect new role and department',          badge: 'Automated' },
  { event: 'Termination', icon: '🔒', action: 'Suspend all access within 15 minutes of HR termination notice',        badge: 'SLA: 15 min' },
];

const RISKS = [
  { risk: 'User resistance to MFA enrollment',       mitigation: 'Phased rollout, training resources, manager-led escalation, help desk support',  level: 'medium' },
  { risk: 'Lost phones / account lockouts',           mitigation: 'Backup codes provisioned at enrollment; break-glass admin accounts established',  level: 'medium' },
  { risk: 'Legacy systems without SSO support',       mitigation: 'VPN gateway or password vault per unsupported system; upgrade path documented',   level: 'high' },
  { risk: 'Vendor SSO pricing or capability limits',  mitigation: 'Plan upgrade path or use compatible alternative auth method per vendor',          level: 'medium' },
  { risk: 'Admin account lockout during rollout',     mitigation: 'Break-glass accounts established in Phase 2 before enforcement begins',           level: 'low' },
];

const RBAC_GROUPS = [
  { name: 'BP_Admins',      desc: 'Super admins, IT — full console access',    color: '#dc2626' },
  { name: 'BP_HR',          desc: 'HR team — HRIS, ATS, payroll access',       color: '#d97706' },
  { name: 'BP_Recruiters',  desc: 'Recruiting — JazzHR, job boards, comms',    color: '#0891b2' },
  { name: 'BP_Operations',  desc: 'Ops/Finance — scheduling, billing tools',   color: '#7c3aed' },
  { name: 'BP_Frontline',   desc: 'Direct care staff — scheduling, LMS',       color: '#059669' },
];

const TIMELINE_WEEKS = [
  { week: 'Week 1',    phases: [1],    initiative: 'Discovery & Assessment',   deliverables: 'Systems Inventory, MFA/SSO Heatmap, Access Matrix' },
  { week: 'Week 2',    phases: [2, 3], initiative: 'Hardening + MFA Kickoff',  deliverables: 'MFA Policies Live, Monitoring Dashboard, Pilot Group Enrolled' },
  { week: 'Week 3',    phases: [3, 4], initiative: 'MFA Finish + SSO Design',  deliverables: 'Full MFA Enrollment (95%+), SSO Architecture Diagram' },
  { week: 'Week 4',    phases: [5],    initiative: 'SSO Pilot',                deliverables: 'Pilot Systems Live — Slack, JazzHR' },
  { week: 'Week 5',    phases: [6],    initiative: 'SSO Rollout — Wave 1',     deliverables: 'Centrally HR, LMS, HR systems on SSO' },
  { week: 'Week 6',    phases: [6],    initiative: 'SSO Rollout — Wave 2',     deliverables: 'Scheduling, vendor tools, internal apps on SSO' },
  { week: 'Week 7',    phases: [7],    initiative: 'Governance & Audit',       deliverables: 'RBAC Groups, Offboarding SOP, Full Access Audit' },
  { week: 'Week 8',    phases: [7],    initiative: 'Optimization',             deliverables: 'Reporting, Cleanup, Long-Term Roadmap' },
];

const PHASE_COLORS = { 1:'#475569', 2:'#0284c7', 3:'#7c3aed', 4:'#d97706', 5:'#059669', 6:'#0891b2', 7:'#9333ea' };

// ── PhaseCard ─────────────────────────────────────────────────────────────────
const SPPhaseCard = ({ phase, expanded, onToggle }) => (
  <div className="sp-phase-card" style={{ '--spc': phase.color, '--spt': phase.tint, '--spb': phase.border }}>
    <button className="sp-phase-head" onClick={onToggle}>
      <div className="sp-phase-head-left">
        <span className="sp-phase-badge" style={{ background: phase.color }}>
          {phase.icon} Phase {phase.num}
        </span>
        <div className="sp-phase-title-block">
          <span className="sp-phase-name">{phase.label}</span>
          <span className="sp-phase-week-tag">{phase.week}</span>
        </div>
      </div>
      <span className="sp-phase-chev">{expanded ? '▲' : '▼'}</span>
    </button>
    <p className="sp-phase-summary">{phase.summary}</p>
    {expanded && (
      <div className="sp-phase-body">
        <div className="sp-phase-cols">
          <div className="sp-phase-col">
            <div className="sp-col-label">Objectives</div>
            <ul className="sp-col-list">
              {phase.objectives.map(o => <li key={o}>{o}</li>)}
            </ul>
          </div>
          <div className="sp-phase-col">
            <div className="sp-col-label">Deliverables</div>
            <ul className="sp-col-list sp-deliverables-list">
              {phase.deliverables.map(d => <li key={d}>{d}</li>)}
            </ul>
          </div>
        </div>
        <div className="sp-actions-wrap">
          <div className="sp-col-label">Action Items</div>
          <div className="sp-actions-grid">
            {phase.actions.map(a => (
              <div key={a.id} className="sp-action">
                <div className="sp-action-head">
                  <span className="sp-action-id" style={{ background: phase.color }}>{a.id}</span>
                  <span className="sp-action-title">{a.title}</span>
                </div>
                <div className="sp-action-owner">{a.owner}</div>
                <ul className="sp-action-list">
                  {a.items.map(i => <li key={i}>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

// ── Main SecurityPlan component ───────────────────────────────────────────────
const SecurityPlan = () => {
  const [activeTab, setActiveTab]     = React.useState('overview');
  const [expandedPhase, setExpanded]  = React.useState(null);

  const togglePhase = (key) => setExpanded(prev => prev === key ? null : key);

  const systems = window.SEC_SYSTEMS || [];

  const tabs = [
    { id: 'overview',    label: 'Overview' },
    { id: 'mfa',         label: 'MFA Rollout' },
    { id: 'sso',         label: 'SSO Strategy' },
    { id: 'governance',  label: 'Risk & Governance' },
    { id: 'timeline',    label: 'Timeline & Metrics' },
  ];

  return (
    <div className="sp-wrap">

      {/* ── Hero ── */}
      <div className="sp-hero">
        <div className="sp-hero-inner">
          <div className="sp-hero-eyebrow">SECURITY MODERNIZATION PROGRAM</div>
          <h1 className="sp-hero-h1">MFA + SSO Implementation Plan</h1>
          <p className="sp-hero-p">A structured 8-week program to enforce multi-factor authentication across all critical systems and centralize authentication using Google Workspace as the Identity Provider.</p>
          <div className="sp-hero-stats">
            <div className="sp-hero-stat">
              <div className="sp-hero-stat-num">2</div>
              <div className="sp-hero-stat-label">Major Initiatives</div>
            </div>
            <div className="sp-hero-stat-div" />
            <div className="sp-hero-stat">
              <div className="sp-hero-stat-num">6</div>
              <div className="sp-hero-stat-label">Implementation Phases</div>
            </div>
            <div className="sp-hero-stat-div" />
            <div className="sp-hero-stat">
              <div className="sp-hero-stat-num">8</div>
              <div className="sp-hero-stat-label">Weeks to Full Rollout</div>
            </div>
            <div className="sp-hero-stat-div" />
            <div className="sp-hero-stat">
              <div className="sp-hero-stat-num">100%</div>
              <div className="sp-hero-stat-label">Admin MFA Target</div>
            </div>
            <div className="sp-hero-stat-div" />
            <div className="sp-hero-stat">
              <div className="sp-hero-stat-num">95%</div>
              <div className="sp-hero-stat-label">Org MFA Target</div>
            </div>
          </div>
          <div className="sp-hero-initiatives">
            <div className="sp-init-card">
              <div className="sp-init-icon">📱</div>
              <div className="sp-init-body">
                <div className="sp-init-title">MFA / Google Authenticator Rollout</div>
                <ul>
                  <li>Enforce MFA across all critical systems</li>
                  <li>Reduce account takeover and phishing risk</li>
                  <li>Improve HIPAA/security readiness</li>
                  <li>Standardize login security org-wide</li>
                </ul>
              </div>
            </div>
            <div className="sp-init-card">
              <div className="sp-init-icon">🔑</div>
              <div className="sp-init-body">
                <div className="sp-init-title">Single Sign-On (SSO) Implementation</div>
                <ul>
                  <li>Centralize authentication via Google Workspace</li>
                  <li>Reduce password fatigue and credential sprawl</li>
                  <li>Simplify onboarding and offboarding</li>
                  <li>Improve auditability and access governance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab nav ── */}
      <div className="sp-tabnav">
        {tabs.map(t => (
          <button key={t.id}
            className={`sp-tab-btn ${activeTab === t.id ? 'sp-tab-active' : ''}`}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="sp-content">

        {/* ════ OVERVIEW ════ */}
        {activeTab === 'overview' && (
          <div className="sp-section">

            {/* 8-Week Phase Timeline Gantt */}
            <div className="sp-card">
              <div className="sp-card-title">8-Week Implementation Timeline</div>
              <div className="sp-gantt-wrap">
                <div className="sp-gantt-head">
                  <div className="sp-gantt-label-col" />
                  <div className="sp-gantt-bars-col">
                    <div className="sp-gantt-weeks">
                      {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className="sp-gantt-week">W{i + 1}</div>
                      ))}
                    </div>
                  </div>
                </div>
                {[...PLAN_PHASES, {
                  num: 7, key: 'gov', label: 'Governance & Audit',
                  week: 'Weeks 7–8', weekStart: 6, weekWidth: 2,
                  color: '#9333ea', icon: '📋',
                }].map(ph => (
                  <div key={ph.key} className="sp-gantt-row">
                    <div className="sp-gantt-label-col">
                      <span className="sp-gantt-ph" style={{ background: ph.color }}>
                        {ph.num <= 6 ? `Ph${ph.num}` : 'Gov'}
                      </span>
                      <span className="sp-gantt-name">{ph.label}</span>
                    </div>
                    <div className="sp-gantt-bars-col">
                      <div className="sp-gantt-grid">
                        {Array.from({ length: 8 }, (_, i) => <div key={i} className="sp-gantt-cell" />)}
                      </div>
                      <div className="sp-gantt-bar" style={{
                        left:       `${(ph.weekStart / 8) * 100}%`,
                        width:      `${(ph.weekWidth / 8) * 100}%`,
                        background: ph.color,
                      }}>
                        {ph.week}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Systems Security Status */}
            {systems.length > 0 && (
              <div className="sp-card sp-card-systems">
                <div className="sp-card-title">Current Systems — Security Readiness</div>
                <p className="sp-card-sub">All business systems assessed for MFA support and SSO compatibility. Source: Security Hub.</p>
                <div className="sp-sys-grid">
                  {systems.slice(0, 24).map(s => {
                    const MFA_C = { full: ['#15803d','#dcfce7','Full MFA'], partial: ['#ca8a04','#fef9c3','Partial'], none: ['#dc2626','#fee2e2','No MFA'], unknown: ['#64748b','#f1f5f9','Unknown'] };
                    const SSO_C = { full: ['#0284c7','#dbeafe','SSO Ready'], partial: ['#ca8a04','#fef9c3','Partial'], none: ['#dc2626','#fee2e2','No SSO'], unknown: ['#64748b','#f1f5f9','Unknown'] };
                    const RISK_C = { critical: '#dc2626', high: '#d97706', medium: '#059669', low: '#94a3b8' };
                    const [mc, mb, ml] = MFA_C[s.mfa] || MFA_C.unknown;
                    const [sc, sb, sl] = SSO_C[s.sso] || SSO_C.unknown;
                    return (
                      <div key={s.name} className="sp-sys-card">
                        <div className="sp-sys-top">
                          <div className="sp-sys-name">{s.name}</div>
                          <div className="sp-sys-risk" style={{ color: RISK_C[s.risk] || '#94a3b8' }}>
                            {(s.risk || '').toUpperCase()}
                          </div>
                        </div>
                        <div className="sp-sys-cat">{s.category}</div>
                        <div className="sp-sys-badges">
                          <span className="sp-sys-badge" style={{ color: mc, background: mb }}>{ml}</span>
                          <span className="sp-sys-badge" style={{ color: sc, background: sb }}>{sl}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ════ MFA ROLLOUT ════ */}
        {activeTab === 'mfa' && (
          <div className="sp-section">

            <div className="sp-section-intro">
              <h2 className="sp-section-h2">MFA / Google Authenticator Rollout</h2>
              <p>Phases 1–3 cover discovery through full org-wide enrollment over 10 days, targeting 100% admin and 95% employee MFA adoption.</p>
            </div>

            {/* Phase Cards 1-3 */}
            {PLAN_PHASES.filter(p => [1, 2, 3].includes(p.num)).map(ph => (
              <SPPhaseCard key={ph.key} phase={ph}
                expanded={expandedPhase === ph.key}
                onToggle={() => togglePhase(ph.key)} />
            ))}

            {/* 3-Stage Rollout Visual */}
            <div className="sp-card">
              <div className="sp-card-title">3-Stage Rollout Sequence</div>
              <div className="sp-stages">
                {[
                  { n: 1, label: 'Pilot Group',    days: 'Days 1–3',  teams: ['IT Team', 'Leadership', 'Operations Managers'], goal: 'Test & validate process' },
                  { n: 2, label: 'Critical Teams', days: 'Days 4–6',  teams: ['HR', 'Finance', 'Recruiting', 'Operations'],    goal: 'Force enrollment, verify backup methods' },
                  { n: 3, label: 'Org-Wide',       days: 'Days 7–10', teams: ['All remaining staff'],                          goal: '95%+ enrollment target' },
                ].map((stage, i, arr) => (
                  <React.Fragment key={stage.n}>
                    <div className="sp-stage">
                      <div className="sp-stage-num" style={{ background: '#7c3aed' }}>Stage {stage.n}</div>
                      <div className="sp-stage-label">{stage.label}</div>
                      <div className="sp-stage-days">{stage.days}</div>
                      <div className="sp-stage-teams">
                        {stage.teams.map(t => <div key={t} className="sp-stage-team">{t}</div>)}
                      </div>
                      <div className="sp-stage-goal">{stage.goal}</div>
                    </div>
                    {i < arr.length - 1 && <div className="sp-stage-arrow">→</div>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Enforcement Timeline */}
            <div className="sp-card">
              <div className="sp-card-title">Enforcement Policy — By Group</div>
              <div className="sp-enforce-track">
                <div className="sp-enforce-line" />
                {ENFORCEMENT_GROUPS.map((eg, i) => (
                  <div key={eg.group} className="sp-enforce-node">
                    <div className="sp-enforce-dot" style={{ background: eg.color, borderColor: eg.bg }} />
                    <div className="sp-enforce-box" style={{ borderColor: eg.color, background: eg.bg }}>
                      <div className="sp-enforce-deadline" style={{ color: eg.color }}>{eg.deadline}</div>
                      <div className="sp-enforce-group">{eg.group}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Communication Plan */}
            <div className="sp-card">
              <div className="sp-card-title">Employee Communication Plan</div>
              <div className="sp-comms">
                {[
                  { time: 'T–7 Days', icon: '📧', label: 'Announcement Email',     desc: 'Org-wide email announcing MFA requirement, timeline, and support resources.' },
                  { time: 'T–3 Days', icon: '🎥', label: 'Training + Setup Guide', desc: 'Training video and step-by-step Google Authenticator setup guide distributed.' },
                  { time: 'T–1 Day',  icon: '🔔', label: 'Reminder Notification',  desc: 'Final reminder notification with direct link to enrollment instructions.' },
                  { time: 'Day 0',    icon: '🔐', label: 'Mandatory Prompt',        desc: 'Enrollment prompt shown at next login — cannot be dismissed or bypassed.' },
                ].map((c, i, arr) => (
                  <React.Fragment key={c.time}>
                    <div className="sp-comms-node">
                      <div className="sp-comms-icon">{c.icon}</div>
                      <div className="sp-comms-time">{c.time}</div>
                      <div className="sp-comms-label">{c.label}</div>
                      <div className="sp-comms-desc">{c.desc}</div>
                    </div>
                    {i < arr.length - 1 && <div className="sp-comms-arrow">→</div>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* MFA Standards Table */}
            <div className="sp-card">
              <div className="sp-card-title">Recommended MFA Standards</div>
              <table className="sp-table">
                <thead><tr><th>Control</th><th>Recommendation</th></tr></thead>
                <tbody>
                  {[
                    ['Primary MFA',     'Google Authenticator (TOTP) — standardized across org'],
                    ['Backup MFA',      'Backup Codes — provisioned for every user at enrollment'],
                    ['SMS MFA',         'Avoid where possible — vulnerable to SIM swap attacks'],
                    ['Admin Accounts',  'MFA Mandatory — zero exceptions, enforced Day 1'],
                    ['Shared Accounts', 'Eliminate entirely — replace with individual accounts'],
                    ['Device Trust',    'Optional Phase 2 enhancement — conditional access policies'],
                  ].map(([ctrl, rec]) => (
                    <tr key={ctrl}><td><strong>{ctrl}</strong></td><td>{rec}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ════ SSO STRATEGY ════ */}
        {activeTab === 'sso' && (
          <div className="sp-section">

            <div className="sp-section-intro">
              <h2 className="sp-section-h2">SSO Strategy — Google Workspace as Identity Provider</h2>
              <p>Phases 4–6 design and deploy Google Workspace as the central IdP for all connected systems using SAML 2.0, OAuth 2.0, and SCIM auto-provisioning.</p>
            </div>

            {/* Architecture Diagram */}
            <div className="sp-card">
              <div className="sp-card-title">Proposed SSO Architecture</div>
              <div className="sp-arch">
                <div className="sp-arch-top">
                  <div className="sp-arch-node sp-arch-employee">
                    <div className="sp-arch-node-icon">👤</div>
                    <div className="sp-arch-node-name">Employee</div>
                    <div className="sp-arch-node-sub">Any device · Any location</div>
                  </div>
                </div>
                <div className="sp-arch-connector">
                  <div className="sp-arch-arrow-line" />
                  <div className="sp-arch-arrow-label">Login request</div>
                </div>
                <div className="sp-arch-idp">
                  <div className="sp-arch-node sp-arch-google">
                    <div className="sp-arch-g-logo">G</div>
                    <div className="sp-arch-node-name">Google Workspace</div>
                    <div className="sp-arch-node-sub">Identity Provider (IdP)</div>
                    <div className="sp-arch-protocols">
                      <span>SAML 2.0</span>
                      <span>OAuth 2.0</span>
                      <span>SCIM</span>
                      <span>MFA Enforced</span>
                    </div>
                  </div>
                </div>
                <div className="sp-arch-connector">
                  <div className="sp-arch-arrow-line" />
                  <div className="sp-arch-arrow-label">Authenticated token</div>
                </div>
                <div className="sp-arch-apps">
                  {[
                    { name: 'Slack',         icon: '💬', wave: 'Pilot',   color: '#7c3aed' },
                    { name: 'JazzHR',        icon: '📋', wave: 'Pilot',   color: '#7c3aed' },
                    { name: 'Centrally HR',  icon: '👥', wave: 'Wave 1',  color: '#0284c7' },
                    { name: 'LMS',           icon: '📚', wave: 'Wave 1',  color: '#0284c7' },
                    { name: 'When I Work',   icon: '📅', wave: 'Wave 2',  color: '#059669' },
                    { name: 'Other Apps',    icon: '⚙️',  wave: 'Wave 2',  color: '#059669' },
                  ].map(app => (
                    <div key={app.name} className="sp-arch-app">
                      <div className="sp-arch-app-icon">{app.icon}</div>
                      <div className="sp-arch-app-name">{app.name}</div>
                      <div className="sp-arch-app-wave" style={{ color: app.color, background: `${app.color}18` }}>
                        {app.wave}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phase Cards 4-6 */}
            {PLAN_PHASES.filter(p => [4, 5, 6].includes(p.num)).map(ph => (
              <SPPhaseCard key={ph.key} phase={ph}
                expanded={expandedPhase === ph.key}
                onToggle={() => togglePhase(ph.key)} />
            ))}

            {/* SSO Pilot Priorities */}
            <div className="sp-card">
              <div className="sp-card-title">SSO Pilot — System Priority Order</div>
              <table className="sp-table">
                <thead><tr><th>Priority</th><th>System</th><th>Reason</th></tr></thead>
                <tbody>
                  {[
                    { p: 1, sys: 'Slack',        reason: 'Daily communication hub — high user count, SAML well-supported' },
                    { p: 1, sys: 'JazzHR',        reason: 'ATS with candidate PII — critical access control requirement' },
                    { p: 2, sys: 'Centrally HR',  reason: 'Core HRIS — must integrate for full JML lifecycle automation' },
                    { p: 2, sys: 'LMS',           reason: 'Large user base, training records, high login frequency' },
                    { p: 3, sys: 'When I Work',   reason: 'Scheduling — operational tool, used daily by frontline staff' },
                    { p: 3, sys: 'Vendor Tools',  reason: 'Validate SSO support per vendor — varies by plan/provider' },
                  ].map(r => (
                    <tr key={r.sys}>
                      <td><span className={`sp-priority-badge sp-p${r.p}`}>P{r.p}</span></td>
                      <td><strong>{r.sys}</strong></td>
                      <td>{r.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* JML Cards */}
            <div className="sp-card">
              <div className="sp-card-title">Joiner / Mover / Leaver Automation</div>
              <p className="sp-card-sub">SCIM provisioning automates account lifecycle events, reducing manual IT work and eliminating orphaned accounts.</p>
              <div className="sp-jml">
                {JML_TABLE.map(j => (
                  <div key={j.event} className="sp-jml-card">
                    <div className="sp-jml-icon">{j.icon}</div>
                    <div className="sp-jml-event">{j.event}</div>
                    <div className="sp-jml-action">{j.action}</div>
                    <div className="sp-jml-badge">{j.badge}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ════ RISK & GOVERNANCE ════ */}
        {activeTab === 'governance' && (
          <div className="sp-section">

            <div className="sp-section-intro">
              <h2 className="sp-section-h2">Risk Management & Governance</h2>
              <p>Key risk mitigations, access control model, security monitoring requirements, and long-term recommendations.</p>
            </div>

            {/* Risk Register */}
            <div className="sp-card">
              <div className="sp-card-title">Risk Register</div>
              <table className="sp-table">
                <thead><tr><th>Risk</th><th>Level</th><th>Mitigation</th></tr></thead>
                <tbody>
                  {RISKS.map(r => {
                    const lvl = { high: ['#dc2626','#fee2e2'], medium: ['#d97706','#fef3c7'], low: ['#16a34a','#dcfce7'] };
                    const [c, bg] = lvl[r.level] || lvl.medium;
                    return (
                      <tr key={r.risk}>
                        <td><strong>{r.risk}</strong></td>
                        <td><span className="sp-risk-badge" style={{ color: c, background: bg }}>{r.level.toUpperCase()}</span></td>
                        <td>{r.mitigation}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* RBAC Groups */}
            <div className="sp-card">
              <div className="sp-card-title">Recommended RBAC Groups</div>
              <p className="sp-card-sub">Implement role-based access via Google Groups. Each group controls connected app access and permissions centrally — no individual permission grants.</p>
              <div className="sp-rbac">
                {RBAC_GROUPS.map(g => (
                  <div key={g.name} className="sp-rbac-card">
                    <div className="sp-rbac-dot" style={{ background: g.color }} />
                    <div className="sp-rbac-name" style={{ color: g.color }}>{g.name}</div>
                    <div className="sp-rbac-desc">{g.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Recommendations */}
            <div className="sp-card">
              <div className="sp-card-title">Critical Security Recommendations</div>
              <div className="sp-secrec">
                {[
                  { n: 1, icon: '🚫', title: 'Eliminate Shared Credentials',
                    body: 'Replace all shared@ accounts, generic logins, and manager credential sharing. Every user must have an individual, named account.',
                    items: ['shared@ and generic accounts', 'Manager credential sharing', 'Team login credentials'] },
                  { n: 2, icon: '⏱️', title: 'Enforce Offboarding SLA',
                    body: 'Disable accounts within 15 minutes of HR termination notice. No exceptions — every minute of delay is exposure.',
                    items: ['Email and Google Drive access', 'Slack and communication tools', 'ATS and HR systems', 'Scheduling apps', 'All shared drives'] },
                  { n: 3, icon: '👁️', title: 'Establish Security Monitoring',
                    body: 'Set up alerting for anomalous authentication activity via Google Admin and any connected SIEM.',
                    items: ['Failed login attempts', 'MFA bypass attempts', 'Impossible travel events', 'New device sign-ins', 'Admin privilege changes'] },
                  { n: 4, icon: '🔐', title: 'Implement Role-Based Access Control',
                    body: 'Assign permissions by group role, not by individual. Simplifies onboarding, offboarding, and access reviews.',
                    items: ['BP_Admins', 'BP_HR', 'BP_Recruiters', 'BP_Operations', 'BP_Frontline'] },
                ].map(rec => (
                  <div key={rec.n} className="sp-secrec-card">
                    <div className="sp-secrec-top">
                      <span className="sp-secrec-icon">{rec.icon}</span>
                      <div>
                        <div className="sp-secrec-num">Recommendation {rec.n}</div>
                        <div className="sp-secrec-title">{rec.title}</div>
                      </div>
                    </div>
                    <p className="sp-secrec-body">{rec.body}</p>
                    <div className="sp-secrec-items">
                      {rec.items.map(i => <span key={i} className="sp-secrec-item">{i}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 2 Enhancements */}
            <div className="sp-card">
              <div className="sp-card-title">Phase 2 — Long-Term Enhancements</div>
              <div className="sp-longterm">
                {[
                  { icon: '📋', label: 'Conditional Access Policies',     desc: 'Restrict access based on device compliance, location, or risk level' },
                  { icon: '💻', label: 'Device Compliance Checks',         desc: 'Require managed or compliant devices to access sensitive systems' },
                  { icon: '🔓', label: 'Passwordless Authentication',      desc: 'Passkey-based login — eliminates passwords entirely for supported apps' },
                  { icon: '🔑', label: 'Hardware Keys for Executives',     desc: 'YubiKey or Titan keys for super admins and leadership accounts' },
                  { icon: '⚙️', label: 'Automated SCIM Provisioning',      desc: 'Full SCIM automation for instant account creation and suspension' },
                  { icon: '📊', label: 'SIEM Integration',                 desc: 'Centralized security event monitoring and alerting' },
                ].map(lt => (
                  <div key={lt.label} className="sp-lt-card">
                    <div className="sp-lt-icon">{lt.icon}</div>
                    <div className="sp-lt-label">{lt.label}</div>
                    <div className="sp-lt-desc">{lt.desc}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ════ TIMELINE & METRICS ════ */}
        {activeTab === 'timeline' && (
          <div className="sp-section">

            <div className="sp-section-intro">
              <h2 className="sp-section-h2">Timeline & Success Metrics</h2>
              <p>Week-by-week delivery plan, measurable success criteria, and proposed deliverables across all workstreams.</p>
            </div>

            {/* 8-Week Table */}
            <div className="sp-card">
              <div className="sp-card-title">8-Week Delivery Plan</div>
              <table className="sp-table sp-timeline-table">
                <thead><tr><th>Week</th><th>Initiative</th><th>Major Deliverables</th><th>Phases</th></tr></thead>
                <tbody>
                  {TIMELINE_WEEKS.map(row => (
                    <tr key={row.week}>
                      <td><strong>{row.week}</strong></td>
                      <td>{row.initiative}</td>
                      <td className="sp-deliv-cell">{row.deliverables}</td>
                      <td>
                        <div className="sp-phase-chips">
                          {row.phases.map(p => (
                            <span key={p} className="sp-phase-chip" style={{ background: PHASE_COLORS[p] }}>
                              Ph{p}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Success Metrics */}
            <div className="sp-card">
              <div className="sp-card-title">Success Metrics</div>
              <div className="sp-metrics">
                <div className="sp-metrics-col">
                  <div className="sp-metrics-head" style={{ color: '#7c3aed' }}>📱 MFA Metrics</div>
                  {[
                    { val: '100%', label: 'Admin MFA enrollment',        color: '#7c3aed' },
                    { val: '95%',  label: 'Employee MFA adoption',        color: '#7c3aed' },
                    { val: '0',    label: 'Shared admin accounts',         color: '#dc2626' },
                    { val: '↓',    label: 'Login-related incidents',       color: '#16a34a' },
                  ].map(m => (
                    <div key={m.label} className="sp-metric">
                      <div className="sp-metric-val" style={{ color: m.color }}>{m.val}</div>
                      <div className="sp-metric-label">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="sp-metrics-divider" />
                <div className="sp-metrics-col">
                  <div className="sp-metrics-head" style={{ color: '#0284c7' }}>🔑 SSO Metrics</div>
                  {[
                    { val: '↓',       label: 'Password reset tickets',    color: '#0284c7' },
                    { val: '15 min',   label: 'Offboarding SLA target',    color: '#d97706' },
                    { val: '↑',        label: 'Onboarding speed',          color: '#0284c7' },
                    { val: '✓',        label: 'Centralized access mgmt',   color: '#16a34a' },
                  ].map(m => (
                    <div key={m.label} className="sp-metric">
                      <div className="sp-metric-val" style={{ color: m.color }}>{m.val}</div>
                      <div className="sp-metric-label">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Deliverables */}
            <div className="sp-card">
              <div className="sp-card-title">Proposed Deliverables</div>
              <div className="sp-deliverables">
                {[
                  { title: '📄 Security Documentation', items: ['MFA Rollout SOP', 'SSO Architecture Diagram', 'Access Management SOP', 'Emergency Access SOP', 'Offboarding SOP Updates'] },
                  { title: '⚙️ Technical Deliverables',  items: ['MFA Enrollment Dashboard', 'SSO Integrations (6+ systems)', 'Google Workspace Hardening', 'Group-Based Access Model'] },
                  { title: '📊 Executive Deliverables',  items: ['Weekly Security Progress Report', 'MFA Enrollment Heatmaps', 'Risk Register', 'Compliance Readiness Report'] },
                ].map(col => (
                  <div key={col.title} className="sp-deliv-col">
                    <div className="sp-deliv-head">{col.title}</div>
                    <ul className="sp-deliv-list">
                      {col.items.map(i => <li key={i}>{i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="sp-card">
              <div className="sp-card-title">Recommended Immediate Next Steps</div>
              <div className="sp-nextsteps">
                {[
                  { p: 1, title: 'Inventory all systems and owners',
                    desc: 'Build the master systems registry with all admin accounts catalogued by system' },
                  { p: 2, title: 'Enable mandatory MFA for IT, Leadership, and HR admins',
                    desc: 'Enforce via Google Admin Console immediately — no waiting for org-wide rollout' },
                  { p: 3, title: 'Validate SSO support with key vendors',
                    desc: 'Confirm SAML/OAuth support with JazzHR, Centrally HR, When I Work, and LMS vendors' },
                  { p: 4, title: 'Build MFA enrollment dashboard and governance tracker',
                    desc: 'Enrollment heatmap, access review process, security scorecard for leadership' },
                ].map(ns => (
                  <div key={ns.p} className="sp-nextstep">
                    <div className="sp-nextstep-p" style={{ background: ['#dc2626','#d97706','#0284c7','#7c3aed'][ns.p - 1] }}>
                      Priority {ns.p}
                    </div>
                    <div className="sp-nextstep-body">
                      <div className="sp-nextstep-title">{ns.title}</div>
                      <div className="sp-nextstep-desc">{ns.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

window.SecurityPlan = SecurityPlan;
