// sop-review.jsx — BrightPath IT Onboarding & Offboarding SOP Review
// Current state vs. proposed improvements — rendered as a sub-tab inside Security Hub

// ── Data ──────────────────────────────────────────────────────────────────────

const SOP_GAPS = [
  // Onboarding gaps
  { id: 'ob1', domain: 'onboarding', risk: 'high',
    title: 'Single Point of Failure — IT Capacity',
    current: 'All IT onboarding tasks depend solely on Jeremy Garrigan. No backup, no documented continuity plan. A single absence delays every new hire.',
    proposed: 'Document all IT procedures into runbooks. Identify backup IT resource or cross-train an admin. Define coverage protocol for planned and unplanned absences.',
    owner: 'IT / Leadership', effort: 'Medium' },
  { id: 'ob2', domain: 'onboarding', risk: 'high',
    title: '2FA Enrollment — Training-Led with No IT Enforcement',
    current: 'Google Authenticator enrollment is facilitated by Training during Day 1 orientation — not enforced by IT policy. Compliance depends on Training staff following through.',
    proposed: 'Shift 2FA enforcement to Google Admin Console policy. IT sets mandatory enrollment deadline (May 29 target). Training keeps a support role but enrollment is policy-enforced, not manual.',
    owner: 'IT', effort: 'Low' },
  { id: 'ob3', domain: 'onboarding', risk: 'medium',
    title: 'No CentrallyHR Integration — Manual HRIS Entry',
    current: 'HR manually enters new hire data into CentrallyHR from the JazzHR bundle. No integrations exist. Manual entry creates risk of delay, error, and inconsistent data.',
    proposed: 'Evaluate CentrallyHR API or import capability. At minimum, build a standardized data entry template. Long-term: automate HR data flow from JazzHR → CentrallyHR via integration or Zapier-style workflow.',
    owner: 'HR / IT', effort: 'High' },
  { id: 'ob4', domain: 'onboarding', risk: 'medium',
    title: 'Admin Onboarding Variability — No Standard Checklist',
    current: 'Path B (Admin/Leadership) is "variable by role and leadership level." Each onboarding is improvised in coordination with the hiring manager — no standard checklist or sign-off process.',
    proposed: 'Create a standardized Admin Onboarding Checklist with role-specific tracks (HR, Finance, Operations, etc.). Implement IT sign-off confirmation to HR/manager when setup is complete.',
    owner: 'IT', effort: 'Low' },
  { id: 'ob5', domain: 'onboarding', risk: 'medium',
    title: 'Training File Sharing — No IT Visibility or Revocation Tracking',
    current: 'Training shares role-specific files with new hires. IT has no visibility into which files are shared, at what permission level, or whether access is revoked at offboarding.',
    proposed: 'Move all role-specific onboarding files to dedicated Google Shared Drives with controlled membership. IT or Training lead maintains access list. Offboarding checklist explicitly includes file access revocation step.',
    owner: 'Training / IT', effort: 'Medium' },
  { id: 'ob6', domain: 'onboarding', risk: 'low',
    title: 'License Over-Provisioning — Frontline Staff on Business Standard',
    current: 'Direct Care hires (BT and IHS) receive Google Workspace Business Standard licenses. Planned migration to Frontline Starter is in scope but not yet executed.',
    proposed: 'Migrate all Direct Care staff to Frontline Starter. Automate license assignment via Google Group membership — Frontline group → Frontline Starter, Admin group → Business Standard.',
    owner: 'IT', effort: 'Low' },
  { id: 'ob7', domain: 'onboarding', risk: 'low',
    title: 'No-Show Handling — IT Notification Gaps',
    current: 'If a new hire does not attend orientation, IT must delete the auto-created GWS account. Gaps exist in how and when IT is notified of no-shows.',
    proposed: 'Establish a same-day notification protocol: Training or HR notifies IT within 2 hours of a no-show. Add a no-show checkbox to the HR orientation tracker. IT deletes the account immediately upon notification.',
    owner: 'HR / Training / IT', effort: 'Low' },

  // Offboarding gaps
  { id: 'off1', domain: 'offboarding', risk: 'critical',
    title: 'HR Trigger Reliability — Termination Tracker Inconsistency',
    current: 'The Termination Tracker checkbox is the intended IT trigger, but compliance is inconsistently used. IT is sometimes notified late or not at all. IT currently acts on direct manager messages as a workaround.',
    proposed: 'Implement a reliable, redundant notification system: (1) Termination Tracker checkbox triggers automatic email to IT distribution list, (2) HRIS webhook to IT ticketing system, (3) Manager-to-IT direct message as secondary backup. Target: IT receives notification within 30 minutes of HR action.',
    owner: 'HR / IT', effort: 'Medium' },
  { id: 'off2', domain: 'offboarding', risk: 'high',
    title: 'No Defined Offboarding SLA — Account Suspension Timeline',
    current: 'No formal SLA exists for how quickly accounts must be suspended. IT acts "same day" for Path B Phase 1, but this is informal. A terminated employee could retain access for hours.',
    proposed: 'Define and document an offboarding SLA: (1) Account suspension within 15 minutes of confirmed termination for all paths, (2) Session revocation within 15 minutes, (3) Path A account deletion within 4 hours. Measure and report SLA compliance monthly.',
    owner: 'IT', effort: 'Low' },
  { id: 'off3', domain: 'offboarding', risk: 'high',
    title: 'System Inventory Gaps — No Complete Access Revocation Checklist',
    current: 'A complete map of which systems each role has access to is "being developed separately." Non-GWS system revocation is listed as "NOT IT" but no formal checklist or accountability exists.',
    proposed: 'Build a role-based system access matrix (RBAC model). Each role maps to a defined set of systems. At offboarding, generate a per-role revocation checklist automatically. Assign a named owner per system for revocation accountability.',
    owner: 'IT / Dept Heads', effort: 'High' },
  { id: 'off4', domain: 'offboarding', risk: 'high',
    title: 'Google Vault — Provisioned but Not Active',
    current: 'Google Vault is provisioned but not in active use. Litigation holds cannot be reliably executed. Retention policies are not configured. This is an open work item.',
    proposed: 'Activate Google Vault immediately. Configure default retention policies for email and Drive. Define a litigation hold procedure: IT activates hold within 24 hours of legal notification. Test quarterly.',
    owner: 'IT / Legal', effort: 'Medium' },
  { id: 'off5', domain: 'offboarding', risk: 'medium',
    title: 'Final Account Disposition — Path B End State Undefined',
    current: 'Whether GWS accounts are deleted or kept suspended after the 30-day Path B transition window is not defined. This creates ambiguity and potential orphaned suspended accounts indefinitely.',
    proposed: 'Define a clear disposition policy: (1) After 30-day transition window, migrate Drive → BrightPath Archive, (2) Suspend for 90 additional days as safety buffer, (3) Delete after 120 days total from termination date. Log all closures with date, owner, and confirmation.',
    owner: 'IT', effort: 'Low' },
  { id: 'off6', domain: 'offboarding', risk: 'medium',
    title: 'Training File Access — Not Revoked at Offboarding',
    current: 'Whether Training revokes access to shared onboarding files at offboarding is unclear — the same gap noted in the Onboarding SOP. No offboarding checklist item covers this.',
    proposed: 'Add "Revoke Training file access" as an explicit offboarding checklist item. Assign to Training lead. If files are in Shared Drives, membership removal handles this automatically — drive-level access is preferred over individual file sharing.',
    owner: 'Training / IT', effort: 'Low' },
  { id: 'off7', domain: 'offboarding', risk: 'medium',
    title: 'Contractor Offboarding — No Distinct Process',
    current: 'Contractor end-of-engagement is handled as "Path B for most" — an informal rule of thumb. No defined process for contractors who may have different access scopes or no equipment to recover.',
    proposed: 'Add a Contractor Offboarding path to the SOP. Key differences: no equipment recovery, shorter transition window (7 days vs 30), immediate GWS suspension, explicit vendor portal access revocation step.',
    owner: 'IT / HR', effort: 'Low' },
];

const PROPOSED_ONBOARDING_A = [
  { step: 1, owner: 'JazzHR → HRIS', action: 'Automated trigger: "Hired" status in JazzHR notifies IT and HR simultaneously via integrated workflow', badge: 'Automated', color: '#059669' },
  { step: 2, owner: 'IT (automated)', action: 'GWS account auto-created by provisioning script on start date morning — Frontline Starter license assigned via group membership', badge: 'Automated', color: '#059669' },
  { step: 3, owner: 'Training / IT', action: 'RBAC applied to relevant systems: Training or hiring manager selects Frontline role type in onboarding tracker. Required systems auto-populated (Therap EHR, When I Work, Star LMS). System admins confirm access granted per system before Day 1.', badge: 'RBAC', color: '#6366f1' },
  { step: 4, owner: 'HR', action: 'I-9 verification at orientation. CentrallyHR record created via standardized template or integration', badge: 'Process', color: '#0284c7' },
  { step: 5, owner: 'IT (policy)', action: 'Google Admin Console enforces 2FA enrollment prompt at first login — cannot be dismissed', badge: 'Policy-Enforced', color: '#7c3aed' },
  { step: 6, owner: 'Training', action: 'Provides setup guide and support for Authenticator enrollment. Shares files via Shared Drive membership (not individual share)', badge: 'Support', color: '#d97706' },
  { step: 7, owner: 'IT', action: 'IT confirms account setup complete — sends confirmation to HR and hiring manager', badge: 'Sign-off', color: '#475569' },
];

const PROPOSED_ONBOARDING_B = [
  { step: 1, owner: 'Hiring Manager + IT', action: 'Role-based checklist generated from Admin Onboarding SOP template — specific to role track (HR, Finance, Operations, etc.)', badge: 'Standardized', color: '#0284c7' },
  { step: 2, owner: 'IT', action: 'Laptop ordered and imaged per standard stack. Equipment added to asset tracking. Delivery confirmed before start date.', badge: 'Process', color: '#0284c7' },
  { step: 3, owner: 'IT (automated)', action: 'GWS account created with Business Standard license. Added to RBAC group (BP_HR, BP_Finance, etc.) — apps provisioned automatically via group membership', badge: 'Automated', color: '#059669' },
  { step: 4, owner: 'IT', action: 'Google Voice, shared drives, bookmarks, email signature configured per role template. Secondary systems provisioned per RBAC checklist.', badge: 'Process', color: '#0284c7' },
  { step: 5, owner: 'IT (policy)', action: 'Google Admin enforces 2FA enrollment at first login. Hardware key provisioned for admin/leadership tier.', badge: 'Policy-Enforced', color: '#7c3aed' },
  { step: 6, owner: 'IT', action: 'IT sends setup confirmation to HR and hiring manager with checklist sign-off. Ticket closed.', badge: 'Sign-off', color: '#475569' },
];

const PROPOSED_OFFBOARDING_A = [
  { step: 1, owner: 'HR → IT (auto)', action: 'Termination Tracker checkbox triggers automated IT notification (email + ticket) within 5 minutes', badge: 'Automated', color: '#059669' },
  { step: 2, owner: 'IT', action: 'Legal hold check — confirm with HR/Legal within 15 minutes. If no hold: proceed. If hold: switch to Path B retention.', badge: 'SLA: 15 min', color: '#dc2626' },
  { step: 3, owner: 'IT', action: 'GWS account deleted. Confirmation logged on Termination Tracker with timestamp.', badge: 'SLA: 4 hrs', color: '#dc2626' },
  { step: 4, owner: 'Admin Asst + Scheduling', action: 'Therap and When I Work deactivated per role-based revocation checklist', badge: 'Checklist', color: '#d97706' },
];

const PROPOSED_OFFBOARDING_B_P1 = [
  { step: 1, owner: 'HR → IT (auto)', action: 'Termination Tracker triggers IT notification within 5 minutes. IT acknowledges and opens offboarding ticket.', badge: 'Automated', color: '#059669' },
  { step: 2, owner: 'IT', action: 'GWS account suspended. Password reset. Active sessions revoked. Mobile wipe initiated. All within 15-minute SLA.', badge: 'SLA: 15 min', color: '#dc2626' },
  { step: 3, owner: 'IT', action: 'Google Vault hold activated if litigation flag set by Legal. Drive access locked pending data transfer assignment.', badge: 'New Step', color: '#7c3aed' },
];

const PROPOSED_OFFBOARDING_B_P2 = [
  { step: 4, owner: 'IT + Supervisor', action: 'Data owner identified. Delegated email and Drive access granted to supervisor. Google Groups membership removed.', badge: 'Process', color: '#0284c7' },
  { step: 5, owner: 'IT + System Owners', action: 'Role-based revocation checklist executed: RBAC group membership removed from GWS → cascades to connected SSO apps. Non-SSO systems revoked by named system owners with confirmation.', badge: 'RBAC + Checklist', color: '#7c3aed' },
  { step: 6, owner: 'Manager / IT', action: 'Equipment recovery: laptop, badge, keys, Divvy card. IT removes device from asset tracking.', badge: 'Process', color: '#0284c7' },
];

const PROPOSED_OFFBOARDING_B_P3 = [
  { step: 7, owner: 'IT', action: 'Drive contents migrated to BrightPath Archive (archive@brightpath-mn.com). Migration confirmed.', badge: 'Process', color: '#0284c7' },
  { step: 8, owner: 'IT', action: 'Account suspended for 90-day safety buffer (120 days total from termination). Calendar invitation for final deletion set.', badge: 'New Policy', color: '#7c3aed' },
  { step: 9, owner: 'IT', action: 'Final deletion at Day 120. Closure logged on Termination Tracker with all timestamps. Ticket closed.', badge: 'Process', color: '#0284c7' },
];

const RISK_LEVELS = {
  critical: { label: 'Critical', color: '#dc2626', bg: '#fee2e2' },
  high:     { label: 'High',     color: '#d97706', bg: '#fef3c7' },
  medium:   { label: 'Medium',   color: '#0284c7', bg: '#dbeafe' },
  low:      { label: 'Low',      color: '#16a34a', bg: '#dcfce7' },
};

// ── Sub-components ────────────────────────────────────────────────────────────

const SRStepFlow = ({ steps, label }) => (
  <div className="sr-stepflow">
    {label && <div className="sr-stepflow-label">{label}</div>}
    {steps.map((s, i) => (
      <div key={s.step} className="sr-step">
        <div className="sr-step-left">
          <div className="sr-step-num" style={{ background: s.color }}>{s.step}</div>
          {i < steps.length - 1 && <div className="sr-step-line" />}
        </div>
        <div className="sr-step-body">
          <div className="sr-step-owner">{s.owner}</div>
          <div className="sr-step-action">{s.action}</div>
          <span className="sr-step-badge" style={{ color: s.color, background: `${s.color}18` }}>
            {s.badge}
          </span>
        </div>
      </div>
    ))}
  </div>
);

const SRPathCompare = ({ title, currentSteps, proposedSteps, currentLabel = 'Current State', proposedLabel = 'Proposed' }) => (
  <div className="sr-path-compare">
    <div className="sr-path-title">{title}</div>
    <div className="sr-compare-cols">
      <div className="sr-compare-col sr-compare-current">
        <div className="sr-compare-col-head">
          <span className="sr-compare-badge sr-badge-current">Current</span>
          {currentLabel}
        </div>
        <div className="sr-compare-steps">
          {currentSteps.map((s, i) => (
            <div key={i} className="sr-cur-step">
              <div className="sr-cur-num">{s.num}</div>
              <div className="sr-cur-body">
                <div className="sr-cur-owner">{s.owner}</div>
                <div className="sr-cur-action">{s.action}</div>
                {s.gap && <div className="sr-cur-gap">⚠ {s.gap}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="sr-compare-arrow">→</div>
      <div className="sr-compare-col sr-compare-proposed">
        <div className="sr-compare-col-head">
          <span className="sr-compare-badge sr-badge-proposed">Proposed</span>
          {proposedLabel}
        </div>
        <SRStepFlow steps={proposedSteps} />
      </div>
    </div>
  </div>
);

const SRGapCard = ({ gap }) => {
  const r = RISK_LEVELS[gap.risk] || RISK_LEVELS.medium;
  return (
    <div className="sr-gap-card">
      <div className="sr-gap-head">
        <span className="sr-gap-badge" style={{ color: r.color, background: r.bg }}>{r.label}</span>
        <span className="sr-gap-domain">{gap.domain === 'onboarding' ? '↑ Onboarding' : '↓ Offboarding'}</span>
        <span className="sr-gap-effort">Effort: {gap.effort}</span>
      </div>
      <div className="sr-gap-title">{gap.title}</div>
      <div className="sr-gap-cols">
        <div className="sr-gap-col">
          <div className="sr-gap-col-label">Current State</div>
          <div className="sr-gap-col-text">{gap.current}</div>
        </div>
        <div className="sr-gap-col-arrow">→</div>
        <div className="sr-gap-col sr-gap-col-right">
          <div className="sr-gap-col-label">Proposed Fix</div>
          <div className="sr-gap-col-text">{gap.proposed}</div>
        </div>
      </div>
      <div className="sr-gap-owner">Owner: {gap.owner}</div>
    </div>
  );
};

// ── Main SopReview component ──────────────────────────────────────────────────
const SopReview = () => {
  const [activeTab, setActiveTab] = React.useState('overview');

  const tabs = [
    { id: 'overview',    label: 'Overview' },
    { id: 'onboarding',  label: 'Onboarding' },
    { id: 'offboarding', label: 'Offboarding' },
    { id: 'gaps',        label: 'Gap Analysis' },
    { id: 'roadmap',     label: 'Action Roadmap' },
  ];

  const onboardingGaps = SOP_GAPS.filter(g => g.domain === 'onboarding');
  const offboardingGaps = SOP_GAPS.filter(g => g.domain === 'offboarding');
  const criticalCount = SOP_GAPS.filter(g => g.risk === 'critical').length;
  const highCount     = SOP_GAPS.filter(g => g.risk === 'high').length;

  return (
    <div className="sr-wrap">

      {/* ── Hero ── */}
      <div className="sr-hero">
        <div className="sr-hero-inner">
          <div className="sr-hero-eyebrow">SECURITY ASSESSMENT · PROCESS REVIEW</div>
          <h1 className="sr-hero-h1">IT Onboarding & Offboarding SOP Review</h1>
          <p className="sr-hero-p">Assessment of BrightPath's current IT onboarding and offboarding procedures against security best practices. Covers both Direct Care (Path A) and Admin/Leadership (Path B) workflows with current-state documentation, identified gaps, and proposed improvements.</p>
          <div className="sr-hero-meta">
            <span>📄 SOPs authored by Jeremy Garrigan, IT · May 18, 2026</span>
            <span className="sr-hero-meta-div" />
            <span>🔄 Replaces Oct 2025 GWS Offboarding Protocol</span>
          </div>
          <div className="sr-hero-stats">
            <div className="sr-hero-stat">
              <div className="sr-hero-stat-num">2</div>
              <div className="sr-hero-stat-label">SOP Documents</div>
            </div>
            <div className="sr-hero-stat-div" />
            <div className="sr-hero-stat">
              <div className="sr-hero-stat-num">2</div>
              <div className="sr-hero-stat-label">Role Paths Each</div>
            </div>
            <div className="sr-hero-stat-div" />
            <div className="sr-hero-stat">
              <div className="sr-hero-stat-num sr-stat-critical">{criticalCount}</div>
              <div className="sr-hero-stat-label">Critical Gaps</div>
            </div>
            <div className="sr-hero-stat-div" />
            <div className="sr-hero-stat">
              <div className="sr-hero-stat-num sr-stat-high">{highCount}</div>
              <div className="sr-hero-stat-label">High-Risk Gaps</div>
            </div>
            <div className="sr-hero-stat-div" />
            <div className="sr-hero-stat">
              <div className="sr-hero-stat-num">{SOP_GAPS.length}</div>
              <div className="sr-hero-stat-label">Total Findings</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab nav ── */}
      <div className="sr-tabnav">
        {tabs.map(t => (
          <button key={t.id}
            className={`sr-tab-btn ${activeTab === t.id ? 'sr-tab-active' : ''}`}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="sr-content">

        {/* ════ OVERVIEW ════ */}
        {activeTab === 'overview' && (
          <div className="sr-section">

            <div className="sr-section-intro">
              <h2 className="sr-section-h2">SOP Overview</h2>
              <p>BrightPath's first formal IT Onboarding SOP and updated Offboarding SOP were authored in May 2026. Both define two paths based on employee role. Several open gaps require remediation — particularly around HR trigger reliability, offboarding SLAs, system access revocation, and IT capacity.</p>
            </div>

            {/* Path Comparison Cards */}
            <div className="sr-card">
              <div className="sr-card-title">Process Paths — At a Glance</div>
              <div className="sr-path-cards">
                <div className="sr-path-card sr-path-a">
                  <div className="sr-path-card-head">
                    <span className="sr-path-pill sr-path-pill-a">Path A</span>
                    <span className="sr-path-card-name">Direct Care · BT & IHS</span>
                  </div>
                  <div className="sr-path-card-body">
                    <div className="sr-path-section">
                      <div className="sr-path-section-label">Onboarding</div>
                      <ul>
                        <li>GWS account auto-created by script on start date</li>
                        <li>Standard Business license (→ Frontline Starter pending)</li>
                        <li>2FA setup via Training during Day 1 orientation</li>
                        <li>Therap + When I Work provisioned by Training / Scheduling</li>
                      </ul>
                    </div>
                    <div className="sr-path-section">
                      <div className="sr-path-section-label">Offboarding</div>
                      <ul>
                        <li>GWS account deleted same day</li>
                        <li>Therap + When I Work deactivated</li>
                        <li>No equipment recovery</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="sr-path-card sr-path-b">
                  <div className="sr-path-card-head">
                    <span className="sr-path-pill sr-path-pill-b">Path B</span>
                    <span className="sr-path-card-name">Admin & Leadership</span>
                  </div>
                  <div className="sr-path-card-body">
                    <div className="sr-path-section">
                      <div className="sr-path-section-label">Onboarding</div>
                      <ul>
                        <li>Manual GWS account creation pre-start</li>
                        <li>Laptop ordered, imaged, asset-tracked</li>
                        <li>Role-specific systems provisioned (variable)</li>
                        <li>Business Standard license</li>
                      </ul>
                    </div>
                    <div className="sr-path-section">
                      <div className="sr-path-section-label">Offboarding (3 Phases)</div>
                      <ul>
                        <li>Phase 1 (same day): Suspend + reset + revoke sessions</li>
                        <li>Phase 2 (≤30 days): Data migration + system access removal</li>
                        <li>Phase 3 (~30 days): Archive Drive → delete account</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gap Summary by Risk */}
            <div className="sr-card">
              <div className="sr-card-title">Identified Gaps — Risk Summary</div>
              <div className="sr-risk-summary">
                {['critical','high','medium','low'].map(level => {
                  const items = SOP_GAPS.filter(g => g.risk === level);
                  const r = RISK_LEVELS[level];
                  return (
                    <div key={level} className="sr-risk-row" style={{ borderLeftColor: r.color }}>
                      <div className="sr-risk-row-level" style={{ color: r.color, background: r.bg }}>{r.label}</div>
                      <div className="sr-risk-row-items">
                        {items.map(g => (
                          <div key={g.id} className="sr-risk-item">
                            <span className="sr-risk-domain">{g.domain === 'onboarding' ? '↑' : '↓'}</span>
                            {g.title}
                          </div>
                        ))}
                        {items.length === 0 && <div className="sr-risk-item sr-risk-none">None identified</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Known Gaps from SOPs */}
            <div className="sr-card">
              <div className="sr-card-title">Open Work Items — From SOPs (as authored)</div>
              <p className="sr-card-sub">Gaps explicitly documented by Jeremy Garrigan in the May 2026 SOPs.</p>
              <div className="sr-open-items">
                {[
                  { sop: 'Offboarding', item: 'HR notification reliability — Termination Tracker checkbox is inconsistently used' },
                  { sop: 'Offboarding', item: 'Google Vault provisioned but not in active use — activation for retention and litigation hold is an open work item' },
                  { sop: 'Offboarding', item: 'Final account disposition (Path B) — whether GWS account is deleted or kept suspended after 30 days is to be confirmed' },
                  { sop: 'Offboarding', item: 'System inventory and revocation checklist — complete map of system access per role is being developed separately' },
                  { sop: 'Both',        item: 'Training file access — whether Training revokes access to shared files at offboarding is unclear' },
                  { sop: 'Onboarding',  item: 'License downgrade — BT/IHS hires on Business Standard; planned migration to Frontline Starter in scope but not executed' },
                  { sop: 'Onboarding',  item: '2FA enforcement deadline — all-staff enforcement target is May 29, 2026' },
                  { sop: 'Onboarding',  item: 'Admin onboarding standardization — variability in admin/leadership onboarding remains' },
                  { sop: 'Onboarding',  item: 'Single point of failure — onboarding is currently dependent on Jeremy as sole IT staff' },
                ].map((item, i) => (
                  <div key={i} className="sr-open-item">
                    <span className={`sr-open-sop ${item.sop === 'Offboarding' ? 'sr-sop-off' : item.sop === 'Onboarding' ? 'sr-sop-on' : 'sr-sop-both'}`}>
                      {item.sop}
                    </span>
                    <span className="sr-open-text">{item.item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ════ ONBOARDING ════ */}
        {activeTab === 'onboarding' && (
          <div className="sr-section">

            <div className="sr-section-intro">
              <h2 className="sr-section-h2">IT Onboarding SOP — Current vs. Proposed</h2>
              <p>BrightPath's first formal IT-side onboarding SOP was authored May 18, 2026. Two paths exist: automated script-based provisioning for Direct Care (Path A) and manual IT setup for Admin/Leadership (Path B).</p>
            </div>

            {/* Path A */}
            <div className="sr-card">
              <SRPathCompare
                title="Path A — Direct Care (BT, IHS)"
                currentLabel="Script-automated, Training-facilitated"
                proposedLabel="Policy-enforced, auto-provisioned"
                currentSteps={[
                  { num: 1, owner: 'IT (automated)', action: 'GWS account auto-created by S360 apps script morning of start date. Business Standard license applied.' },
                  { num: 2, owner: 'HR', action: 'Verifies I-9 in person. Manually enters new hire data into CentrallyHR from JazzHR bundle. No CHR integrations.', gap: 'Manual entry — error-prone, no integration' },
                  { num: 3, owner: 'Training', action: 'Facilitates 2FA/Google Authenticator enrollment with new hire during Day 1 orientation.', gap: 'Compliance depends on Training follow-through — not IT-enforced' },
                  { num: 4, owner: 'Training', action: 'Shares role-specific files with the new hire.', gap: 'IT has no visibility into which files are shared or at what level' },
                  { num: 5, owner: 'Training / Scheduling', action: 'Therap account created by Training. When I Work account created by Scheduling Coordinator.' },
                ]}
                proposedSteps={PROPOSED_ONBOARDING_A}
              />
            </div>

            {/* Path B */}
            <div className="sr-card">
              <SRPathCompare
                title="Path B — Admin / Leadership"
                currentLabel="Manual, variable per role"
                proposedLabel="Standardized checklist, RBAC-provisioned"
                currentSteps={[
                  { num: 1, owner: 'IT', action: 'Order laptop and role-specific equipment. Image with standard software stack. Add to asset tracking.' },
                  { num: 2, owner: 'IT', action: 'Manually create GWS account. Set up bookmarks, email signature, Google Voice.', gap: 'No standard checklist — varies per role and hiring manager preference' },
                  { num: 3, owner: 'IT / Brandon', action: 'Grant shared drive access based on role.', gap: 'Individual permission grants — not group-based, hard to audit' },
                  { num: 4, owner: 'HR', action: 'Verify I-9 in person. Manually enter new hire data into CentrallyHR.' },
                  { num: 5, owner: 'Training', action: 'Ensures 2FA/MFA enrollment on Day 1.', gap: 'Not IT-enforced — depends on Training follow-through' },
                  { num: 6, owner: 'IT/various', action: 'Role-specific systems provisioned: CHR admin (HR), JazzHR (TA), QuickBooks/Divvy (Finance), etc.', gap: 'No sign-off confirmation sent to HR or manager' },
                ]}
                proposedSteps={PROPOSED_ONBOARDING_B}
              />
            </div>

            {/* Onboarding Gap Cards */}
            <div className="sr-card">
              <div className="sr-card-title">Onboarding — Identified Gaps ({onboardingGaps.length})</div>
              <div className="sr-gaps-list">
                {onboardingGaps.map(g => <SRGapCard key={g.id} gap={g} />)}
              </div>
            </div>

          </div>
        )}

        {/* ════ OFFBOARDING ════ */}
        {activeTab === 'offboarding' && (
          <div className="sr-section">

            <div className="sr-section-intro">
              <h2 className="sr-section-h2">IT Offboarding SOP — Current vs. Proposed</h2>
              <p>The updated Offboarding SOP (May 18, 2026) replaces the Oct 2025 GWS Offboarding Protocol. Two paths exist based on role, with Path B split into three phases over approximately 30 days.</p>
            </div>

            {/* Path A */}
            <div className="sr-card">
              <SRPathCompare
                title="Path A — Direct Care (BT, IHS) · Same-Day Deletion"
                currentLabel="HR-triggered, same-day account deletion"
                proposedLabel="Auto-triggered, SLA-backed, checklist-driven"
                currentSteps={[
                  { num: 1, owner: 'HR', action: 'Checks termination box on Termination Tracker.', gap: 'Checkbox is inconsistently completed — IT sometimes not notified' },
                  { num: 2, owner: 'IT', action: 'Confirms no legal/litigation hold. If hold in place: halt and follow Path B retention.' },
                  { num: 3, owner: 'IT', action: 'Deletes GWS account and confirms on Termination Tracker.' },
                  { num: 4, owner: 'Admin Asst', action: 'Deactivates user in Therap.' },
                  { num: 5, owner: 'Scheduling', action: 'Deactivates user in When I Work.' },
                ]}
                proposedSteps={PROPOSED_OFFBOARDING_A}
              />
            </div>

            {/* Path B */}
            <div className="sr-card">
              <div className="sr-path-title">Path B — Admin / Leadership · 3-Phase Process</div>

              <div className="sr-phase-group">
                <div className="sr-phase-group-label" style={{ borderColor: '#dc2626', color: '#dc2626' }}>
                  Phase 1 · Same Day
                </div>
                <div className="sr-compare-cols">
                  <div className="sr-compare-col sr-compare-current">
                    <div className="sr-compare-col-head">
                      <span className="sr-compare-badge sr-badge-current">Current</span>
                    </div>
                    <div className="sr-compare-steps">
                      {[
                        { num: 1, owner: 'HR', action: 'Checks termination box on Termination Tracker.', gap: 'Inconsistently used — IT sometimes learns via manager DM' },
                        { num: 2, owner: 'IT', action: 'Suspends GWS account.' },
                        { num: 3, owner: 'IT', action: 'Resets password.' },
                        { num: 4, owner: 'IT', action: 'Revokes active sessions and connected third-party apps.' },
                        { num: 5, owner: 'IT', action: 'Wipes mobile device sessions (account-only for BYOD).', gap: 'No defined SLA — "same day" is informal' },
                      ].map(s => (
                        <div key={s.num} className="sr-cur-step">
                          <div className="sr-cur-num">{s.num}</div>
                          <div className="sr-cur-body">
                            <div className="sr-cur-owner">{s.owner}</div>
                            <div className="sr-cur-action">{s.action}</div>
                            {s.gap && <div className="sr-cur-gap">⚠ {s.gap}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sr-compare-arrow">→</div>
                  <div className="sr-compare-col sr-compare-proposed">
                    <div className="sr-compare-col-head">
                      <span className="sr-compare-badge sr-badge-proposed">Proposed</span>
                    </div>
                    <SRStepFlow steps={PROPOSED_OFFBOARDING_B_P1} />
                  </div>
                </div>
              </div>

              <div className="sr-phase-group">
                <div className="sr-phase-group-label" style={{ borderColor: '#d97706', color: '#d97706' }}>
                  Phase 2 · Transition Window (≤30 Days)
                </div>
                <div className="sr-compare-cols">
                  <div className="sr-compare-col sr-compare-current">
                    <div className="sr-compare-col-head">
                      <span className="sr-compare-badge sr-badge-current">Current</span>
                    </div>
                    <div className="sr-compare-steps">
                      {[
                        { num: 6, owner: 'IT + Supervisor', action: 'Identify data owner. Grant delegated email/Drive access.' },
                        { num: 7, owner: 'IT', action: 'Remove user from all Google Groups.' },
                        { num: 8, owner: 'Various system owners', action: 'Remove access from non-GWS systems: Therap, CentrallyHR, When I Work, Divvy, QuickBooks, JazzHR, Dropbox Sign, Adobe, etc.', gap: 'No formal checklist — system ownership unclear, accountability gaps' },
                        { num: 9, owner: 'Manager', action: 'Recovers company equipment.', gap: 'No IT confirmation step — equipment recovery not tracked by IT' },
                      ].map(s => (
                        <div key={s.num} className="sr-cur-step">
                          <div className="sr-cur-num">{s.num}</div>
                          <div className="sr-cur-body">
                            <div className="sr-cur-owner">{s.owner}</div>
                            <div className="sr-cur-action">{s.action}</div>
                            {s.gap && <div className="sr-cur-gap">⚠ {s.gap}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sr-compare-arrow">→</div>
                  <div className="sr-compare-col sr-compare-proposed">
                    <div className="sr-compare-col-head">
                      <span className="sr-compare-badge sr-badge-proposed">Proposed</span>
                    </div>
                    <SRStepFlow steps={PROPOSED_OFFBOARDING_B_P2} />
                  </div>
                </div>
              </div>

              <div className="sr-phase-group">
                <div className="sr-phase-group-label" style={{ borderColor: '#059669', color: '#059669' }}>
                  Phase 3 · Account Closure (~30 Days)
                </div>
                <div className="sr-compare-cols">
                  <div className="sr-compare-col sr-compare-current">
                    <div className="sr-compare-col-head">
                      <span className="sr-compare-badge sr-badge-current">Current</span>
                    </div>
                    <div className="sr-compare-steps">
                      {[
                        { num: 10, owner: 'IT', action: 'Migrate Drive contents to BrightPath Archive (archive@brightpath-mn.com).' },
                        { num: 11, owner: 'IT', action: 'Delete account.', gap: 'End state undefined — delete vs. keep suspended not formally decided' },
                        { num: 12, owner: 'IT', action: 'Log closure on Termination Tracker.' },
                      ].map(s => (
                        <div key={s.num} className="sr-cur-step">
                          <div className="sr-cur-num">{s.num}</div>
                          <div className="sr-cur-body">
                            <div className="sr-cur-owner">{s.owner}</div>
                            <div className="sr-cur-action">{s.action}</div>
                            {s.gap && <div className="sr-cur-gap">⚠ {s.gap}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sr-compare-arrow">→</div>
                  <div className="sr-compare-col sr-compare-proposed">
                    <div className="sr-compare-col-head">
                      <span className="sr-compare-badge sr-badge-proposed">Proposed</span>
                    </div>
                    <SRStepFlow steps={PROPOSED_OFFBOARDING_B_P3} />
                  </div>
                </div>
              </div>
            </div>

            {/* Offboarding Gap Cards */}
            <div className="sr-card">
              <div className="sr-card-title">Offboarding — Identified Gaps ({offboardingGaps.length})</div>
              <div className="sr-gaps-list">
                {offboardingGaps.map(g => <SRGapCard key={g.id} gap={g} />)}
              </div>
            </div>

          </div>
        )}

        {/* ════ GAP ANALYSIS ════ */}
        {activeTab === 'gaps' && (
          <div className="sr-section">

            <div className="sr-section-intro">
              <h2 className="sr-section-h2">Gap Analysis — All Findings</h2>
              <p>All {SOP_GAPS.length} identified gaps across both SOPs, ordered by risk level. Each entry includes current state, proposed resolution, assigned owner, and implementation effort.</p>
            </div>

            {['critical','high','medium','low'].map(level => {
              const items = SOP_GAPS.filter(g => g.risk === level);
              if (!items.length) return null;
              const r = RISK_LEVELS[level];
              return (
                <div key={level} className="sr-gap-group">
                  <div className="sr-gap-group-label" style={{ color: r.color }}>
                    <span className="sr-gap-group-badge" style={{ background: r.bg, color: r.color }}>{r.label}</span>
                    {items.length} finding{items.length > 1 ? 's' : ''}
                  </div>
                  <div className="sr-gaps-list">
                    {items.map(g => <SRGapCard key={g.id} gap={g} />)}
                  </div>
                </div>
              );
            })}

          </div>
        )}

        {/* ════ ACTION ROADMAP ════ */}
        {activeTab === 'roadmap' && (
          <div className="sr-section">

            <div className="sr-section-intro">
              <h2 className="sr-section-h2">Action Roadmap</h2>
              <p>Prioritized recommendations for remediating all identified gaps. Quick wins (low effort, high impact) should be addressed immediately. Larger initiatives align with the MFA + SSO Implementation Plan.</p>
            </div>

            {/* Quick Wins */}
            <div className="sr-card">
              <div className="sr-card-title">⚡ Quick Wins — Low Effort, High Impact</div>
              <p className="sr-card-sub">These items require minimal technical work and can be completed within 1–2 weeks.</p>
              <div className="sr-actions">
                {[
                  { p: 1, color: '#dc2626', title: 'Enforce 2FA via Google Admin Console',
                    desc: 'Remove dependency on Training for 2FA enrollment. Set mandatory enforcement in GWS Admin → Security → 2-Step Verification. Target: May 29 deadline already set.',
                    domain: 'Onboarding', effort: 'Hours' },
                  { p: 1, color: '#dc2626', title: 'Define 15-Minute Offboarding SLA',
                    desc: 'Formally document and announce: IT must suspend accounts within 15 minutes of confirmed termination. Track and report monthly.',
                    domain: 'Offboarding', effort: '1 day' },
                  { p: 1, color: '#dc2626', title: 'Activate Google Vault',
                    desc: 'Enable Google Vault for default retention and litigation hold capability. Configure retention policies for email (3 years) and Drive. Test a hold within 1 week.',
                    domain: 'Offboarding', effort: '1–2 days' },
                  { p: 2, color: '#d97706', title: 'Define Final Account Disposition Policy (Path B)',
                    desc: 'Decide and document: suspend → archive at Day 30 → delete at Day 120. Update Termination Tracker template with disposition timeline.',
                    domain: 'Offboarding', effort: '1 day' },
                  { p: 2, color: '#d97706', title: 'Create Admin Onboarding Checklist',
                    desc: 'Build role-specific onboarding checklist templates (HR track, Finance track, Operations track). Include IT sign-off step. Store in shared IT drive.',
                    domain: 'Onboarding', effort: '2–3 days' },
                  { p: 2, color: '#d97706', title: 'Standardize No-Show Handling',
                    desc: 'Establish protocol: Training or HR notifies IT within 2 hours of no-show. IT deletes GWS account. Add no-show field to HR orientation tracker.',
                    domain: 'Onboarding', effort: '1 day' },
                ].map(a => (
                  <div key={a.title} className="sr-action-card">
                    <div className="sr-action-head">
                      <div className="sr-action-priority" style={{ background: a.color }}>P{a.p}</div>
                      <div className="sr-action-meta">
                        <span className={`sr-action-domain ${a.domain === 'Onboarding' ? 'sr-action-on' : 'sr-action-off'}`}>{a.domain}</span>
                        <span className="sr-action-effort">⏱ {a.effort}</span>
                      </div>
                    </div>
                    <div className="sr-action-title">{a.title}</div>
                    <div className="sr-action-desc">{a.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medium-term */}
            <div className="sr-card">
              <div className="sr-card-title">🔧 Medium-Term — 2–6 Weeks</div>
              <p className="sr-card-sub">These require more planning or coordination but are critical for access control maturity.</p>
              <div className="sr-actions">
                {[
                  { p: 1, color: '#dc2626', title: 'Build Role-Based System Access Matrix',
                    desc: 'For every role, document which systems are provisioned at onboarding and which must be revoked at offboarding. Assign a named system owner per platform. Generate role-based revocation checklists at termination.',
                    domain: 'Both', effort: '2–3 weeks' },
                  { p: 2, color: '#d97706', title: 'Improve HR Trigger Reliability',
                    desc: 'Termination Tracker checkbox → auto-email to IT distribution list. Define SLA: IT acknowledges within 15 minutes. Consider redundant channel (Slack alert or ticketing system webhook).',
                    domain: 'Offboarding', effort: '1–2 weeks' },
                  { p: 2, color: '#d97706', title: 'Move Onboarding Files to Shared Drives',
                    desc: 'Replace individual Training file shares with Shared Drive membership-based access. New hires added to Shared Drive at onboarding. Removed at offboarding automatically via group revocation.',
                    domain: 'Both', effort: '1–2 weeks' },
                  { p: 3, color: '#0284c7', title: 'Document IT Runbooks for Coverage',
                    desc: 'Address the single-point-of-failure risk. Document all provisioning and deprovisioning procedures as step-by-step runbooks. Identify backup IT resource or admin who can cover critical tasks.',
                    domain: 'Both', effort: '3–4 weeks' },
                ].map(a => (
                  <div key={a.title} className="sr-action-card">
                    <div className="sr-action-head">
                      <div className="sr-action-priority" style={{ background: a.color }}>P{a.p}</div>
                      <div className="sr-action-meta">
                        <span className={`sr-action-domain ${a.domain === 'Onboarding' ? 'sr-action-on' : a.domain === 'Offboarding' ? 'sr-action-off' : 'sr-action-both'}`}>{a.domain}</span>
                        <span className="sr-action-effort">⏱ {a.effort}</span>
                      </div>
                    </div>
                    <div className="sr-action-title">{a.title}</div>
                    <div className="sr-action-desc">{a.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Long-term / SSO aligned */}
            <div className="sr-card">
              <div className="sr-card-title">🚀 Strategic — Aligned with MFA + SSO Rollout</div>
              <p className="sr-card-sub">These improvements tie directly to the MFA + SSO Implementation Plan and will be unlocked as that program progresses.</p>
              <div className="sr-actions">
                {[
                  { phase: 'MFA Phase 2–3', color: '#7c3aed', title: 'RBAC Group-Based Access Provisioning',
                    desc: 'Once Google Groups RBAC model is live (BP_HR, BP_Finance, etc.), onboarding reduces to: create GWS account → add to group → all apps provisioned automatically. Offboarding: remove from group → all access revoked.',
                    domain: 'Both' },
                  { phase: 'SSO Phase 5–6', color: '#059669', title: 'SCIM Auto-Provisioning + Deprovisioning',
                    desc: 'When SSO integrations are live for JazzHR, CentrallyHR, Slack, When I Work, etc., account creation and suspension cascades automatically. New hire created in JazzHR → accounts created in all systems. Termination suspended in GWS → suspended everywhere within minutes.',
                    domain: 'Both' },
                  { phase: 'SSO Phase 4', color: '#d97706', title: 'JazzHR → IT Notification Automation',
                    desc: 'Once JazzHR is connected to SSO, "Hired" status change can trigger automated IT provisioning workflow. Eliminates dependency on manual HR triggers and reduces time-to-access for new hires.',
                    domain: 'Onboarding' },
                  { phase: 'SSO Phase 6', color: '#0284c7', title: 'License Automation via Google Groups',
                    desc: 'Automate license assignment: Frontline group → Frontline Starter license, Admin group → Business Standard. New hires auto-licensed by group membership. Reduces manual license management overhead.',
                    domain: 'Onboarding' },
                ].map(a => (
                  <div key={a.title} className="sr-action-card sr-action-strategic">
                    <div className="sr-action-head">
                      <div className="sr-action-phase" style={{ color: a.color, background: `${a.color}18` }}>{a.phase}</div>
                      <div className="sr-action-meta">
                        <span className={`sr-action-domain ${a.domain === 'Onboarding' ? 'sr-action-on' : a.domain === 'Offboarding' ? 'sr-action-off' : 'sr-action-both'}`}>{a.domain}</span>
                      </div>
                    </div>
                    <div className="sr-action-title">{a.title}</div>
                    <div className="sr-action-desc">{a.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success metrics */}
            <div className="sr-card">
              <div className="sr-card-title">Success Metrics — Post-Remediation</div>
              <div className="sr-metrics">
                {[
                  { val: '15 min', label: 'Offboarding SLA target', color: '#dc2626' },
                  { val: '100%',   label: '2FA enforcement at login', color: '#7c3aed' },
                  { val: '0',      label: 'Orphaned accounts after 120 days', color: '#dc2626' },
                  { val: '✓',      label: 'Google Vault active with retention policies', color: '#059669' },
                  { val: '✓',      label: 'Role-based access matrix documented', color: '#0284c7' },
                  { val: '✓',      label: 'Admin onboarding checklist in use', color: '#0284c7' },
                  { val: '↓',      label: 'Manual provisioning steps', color: '#059669' },
                  { val: '✓',      label: 'IT runbooks documented for coverage', color: '#059669' },
                ].map(m => (
                  <div key={m.label} className="sr-metric">
                    <div className="sr-metric-val" style={{ color: m.color }}>{m.val}</div>
                    <div className="sr-metric-label">{m.label}</div>
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

window.SopReview = SopReview;
