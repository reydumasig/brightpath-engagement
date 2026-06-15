// rbac-review.jsx — RBAC Review & Recommendations presentation
// 12-slide executive deck rendered as scrollable cards

function RBACReview() {

  // ── Maturity scores ──────────────────────────────────────────────────────
  const MATURITY = [
    { area: 'Organizational Structure', score: 8.5, max: 10, color: '#16a34a' },
    { area: 'Access Design',            score: 8.0, max: 10, color: '#16a34a' },
    { area: 'Security Governance',      score: 6.0, max: 10, color: '#d97706' },
    { area: 'Full RBAC Program',        score: 5.0, max: 10, color: '#d97706' },
  ];

  // ── Shared accounts ──────────────────────────────────────────────────────
  const SHARED = [
    { system: 'DocuSign',      count: 5, risk: 'critical' },
    { system: 'Netstudy 2.0', count: 1, risk: 'high' },
    { system: 'Zoho CRM',     count: 1, risk: 'high' },
    { system: 'Adobe Acrobat',count: 1, risk: 'medium' },
  ];

  // ── Phase 2 deliverables ─────────────────────────────────────────────────
  const PHASE2 = [
    'Role Catalog (granular job-function roles)',
    'Provisioning Standards (role → system access map)',
    'Offboarding Standards (verified deprovisioning checklist)',
    'Shared Account Register (owner, justification, review date)',
    'Separation of Duties Matrix (finance & HR controls)',
    'Quarterly Access Review Process',
    'Google Workspace Governance Model',
    'SSO Group Mapping (role → Google Group → SAML apps)',
  ];

  // ── Success outcomes ─────────────────────────────────────────────────────
  const SUCCESS = [
    'Least Privilege Access',
    'Audit Readiness',
    'SSO Foundation',
    'MFA Enforcement',
    'Automated Onboarding / Offboarding',
    'Enterprise RBAC Governance',
  ];

  // ── Privilege tiers ──────────────────────────────────────────────────────
  const TIERS = [
    { tier: 0, label: 'Tier 0', name: 'Identity Owners',        color: '#b91c1c', bg: '#fee2e2', systems: ['Google Workspace', 'MFA Policy', 'SSO / IdP'],     people: 'Brandon, Jeremy' },
    { tier: 1, label: 'Tier 1', name: 'Business System Admins', color: '#c2410c', bg: '#ffedd5', systems: ['Therap EHR', 'Centrally HR', 'JazzHR', 'Bill.com'], people: 'Designated leads' },
    { tier: 2, label: 'Tier 2', name: 'Managers',               color: '#ca8a04', bg: '#fef9c3', systems: ['Reporting views', 'Team scheduling', 'LMS admin'],   people: 'Department managers' },
    { tier: 3, label: 'Tier 3', name: 'Employees',              color: '#15803d', bg: '#dcfce7', systems: ['Day-to-day tools', 'Read-only access'],              people: 'All staff' },
  ];

  return (
    <div className="rb-deck">

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SLIDE 1 — Title                                                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rb-slide rb-slide-hero">
        <div className="rb-slide-num">01</div>
        <div className="rb-hero-body">
          <div className="rb-hero-eyebrow">SECURITY HUB · RBAC REVIEW</div>
          <h1 className="rb-hero-title">BrightPath RBAC Review<br />&amp; Recommendations</h1>
          <div className="rb-hero-sub">Access Matrix Review and Next Steps Toward Enterprise RBAC</div>
          <div className="rb-hero-divider" />
          <div className="rb-hero-prepared">
            <div className="rb-prepared-label">Prepared By</div>
            <div className="rb-prepared-name">Rey Dumasig</div>
            <div className="rb-prepared-role">Director, AI &amp; Automation · Summit 360 Solutions</div>
          </div>
        </div>
        <div className="rb-hero-badge">
          <div className="rb-hero-badge-main">RBAC Foundation v1.0</div>
          <div className="rb-hero-badge-sub">Pending Approval</div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SLIDE 2 — Executive Summary                                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rb-slide">
        <div className="rb-slide-num">02</div>
        <div className="rb-slide-header">
          <div className="rb-slide-eyebrow">Executive Summary</div>
          <h2 className="rb-slide-title">Overall Assessment</h2>
        </div>
        <div className="rb-slide-body rb-three-col">

          {/* What Jeremy delivered */}
          <div className="rb-card">
            <div className="rb-card-head rb-card-head-green">✓ What Jeremy Delivered</div>
            <ul className="rb-checklist">
              {['Organizational hierarchy', 'System access matrix', 'Initial least-privilege design', 'Reduced Super Admin count', 'Foundation for SSO'].map((item) => (
                <li key={item}><span className="rb-check">✅</span>{item}</li>
              ))}
            </ul>
          </div>

          {/* Maturity scores */}
          <div className="rb-card">
            <div className="rb-card-head">Current Maturity</div>
            <div className="rb-maturity-list">
              {MATURITY.map((m) => (
                <div key={m.area} className="rb-maturity-row">
                  <div className="rb-maturity-area">{m.area}</div>
                  <div className="rb-maturity-bar-wrap">
                    <div className="rb-maturity-bar">
                      <div className="rb-maturity-fill" style={{ width: `${(m.score / m.max) * 100}%`, background: m.color }} />
                    </div>
                    <div className="rb-maturity-score" style={{ color: m.color }}>{m.score}/{m.max}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="rb-card rb-card-recommend">
            <div className="rb-card-head">Recommendation</div>
            <div className="rb-recommend-approve">
              <div className="rb-rec-label">Approve as:</div>
              <div className="rb-rec-badge rb-rec-badge-green">RBAC Foundation v1.0</div>
            </div>
            <div className="rb-recommend-not">
              <div className="rb-rec-label rb-rec-label-muted">Not yet:</div>
              <div className="rb-rec-badge rb-rec-badge-gray">RBAC Complete</div>
            </div>
            <div className="rb-rec-note">Jeremy has built a strong foundation. Phase 2 closes the remaining gaps.</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SLIDE 3 — What Was Accomplished                                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rb-slide">
        <div className="rb-slide-num">03</div>
        <div className="rb-slide-header">
          <div className="rb-slide-eyebrow">What Was Accomplished</div>
          <h2 className="rb-slide-title">Major Improvements</h2>
        </div>
        <div className="rb-slide-body rb-two-col-wide">
          <div className="rb-before-after-card rb-before">
            <div className="rb-ba-label rb-ba-label-before">Before</div>
            <div className="rb-ba-text">Employee gets access because:</div>
            <div className="rb-quote">"Brandon told me"</div>
            <div className="rb-ba-or">or</div>
            <div className="rb-quote">"Jeremy gave me access"</div>
          </div>
          <div className="rb-arrow-col">→</div>
          <div className="rb-before-after-card rb-after">
            <div className="rb-ba-label rb-ba-label-after">After</div>
            <div className="rb-flow-simple">
              <div className="rb-flow-node rb-flow-node-dark">Role</div>
              <div className="rb-flow-arrow">↓</div>
              <div className="rb-flow-node">Department</div>
              <div className="rb-flow-arrow">↓</div>
              <div className="rb-flow-node rb-flow-node-green">Approved System Access</div>
            </div>
          </div>
        </div>
        <div className="rb-benefits-strip">
          {['More consistency', 'Easier onboarding', 'Easier offboarding', 'Supports SSO'].map((b) => (
            <div key={b} className="rb-benefit-chip"><span className="rb-benefit-dot" />{ b}</div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SLIDE 4 — Access Matrix vs RBAC                                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rb-slide">
        <div className="rb-slide-num">04</div>
        <div className="rb-slide-header">
          <div className="rb-slide-eyebrow">What RBAC Actually Means</div>
          <h2 className="rb-slide-title">Access Matrix vs RBAC</h2>
        </div>
        <div className="rb-slide-body rb-two-col-eq">
          <div className="rb-model-card rb-model-current">
            <div className="rb-model-label rb-model-label-amber">What We Have Today</div>
            <div className="rb-model-flow">
              <div className="rb-model-node">HR Department</div>
              <div className="rb-flow-arrow">↓</div>
              <div className="rb-model-node">Centrally HR Admin</div>
              <div className="rb-flow-arrow">↓</div>
              <div className="rb-model-node">LMS Learner</div>
              <div className="rb-flow-arrow">↓</div>
              <div className="rb-model-node">DocuSign Admin</div>
            </div>
            <div className="rb-model-badge rb-model-badge-amber">Access Matrix</div>
          </div>

          <div className="rb-model-card rb-model-future">
            <div className="rb-model-label rb-model-label-green">What RBAC Looks Like</div>
            <div className="rb-model-role-box">
              <div className="rb-role-title">HR Generalist Role</div>
              <div className="rb-role-items">
                <div className="rb-role-item"><span className="rb-role-sys">Google Workspace</span><span className="rb-role-acc">User</span></div>
                <div className="rb-role-item"><span className="rb-role-sys">Centrally HR</span><span className="rb-role-acc">HR Admin</span></div>
                <div className="rb-role-item"><span className="rb-role-sys">DocuSign</span><span className="rb-role-acc">Sender</span></div>
                <div className="rb-role-item"><span className="rb-role-sys">LMS</span><span className="rb-role-acc">Learner</span></div>
              </div>
            </div>
            <div className="rb-model-badge rb-model-badge-green">True RBAC</div>
          </div>
        </div>
        <div className="rb-insight-bar">
          <span className="rb-insight-icon">💡</span>
          <span>When someone changes positions, their access automatically changes with their role — no manual IT tickets required.</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SLIDE 5 — Missing Piece #1: Role Catalog                           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rb-slide">
        <div className="rb-slide-num">05</div>
        <div className="rb-slide-header">
          <div className="rb-slide-eyebrow">Missing Piece #1</div>
          <h2 className="rb-slide-title">Role Catalog</h2>
        </div>
        <div className="rb-slide-body rb-two-col-eq">
          <div className="rb-gap-card">
            <div className="rb-gap-label rb-gap-label-amber">Current: Department-Level Only</div>
            <div className="rb-role-tag-list">
              {['HR', 'Finance', 'IT', 'Training'].map((r) => (
                <span key={r} className="rb-role-tag rb-role-tag-gray">{r}</span>
              ))}
            </div>
          </div>
          <div className="rb-gap-card">
            <div className="rb-gap-label rb-gap-label-green">Needed: Granular Job Roles</div>
            <div className="rb-role-tag-list">
              {['HR Generalist', 'HR Director', 'Recruiter', 'Training Coordinator', 'Designated Manager', 'Residential Director', 'Executive Director'].map((r) => (
                <span key={r} className="rb-role-tag rb-role-tag-blue">{r}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="rb-example-table-wrap">
          <div className="rb-example-label">Why it matters — two HR employees, different needs:</div>
          <table className="rb-table">
            <thead><tr><th>Role</th><th>Access Needed</th><th>Access NOT Needed</th></tr></thead>
            <tbody>
              <tr><td><span className="rb-role-tag rb-role-tag-blue">Recruiter</span></td><td>JazzHR, LinkedIn Recruiter, Indeed</td><td>Centrally HR admin, Bill.com</td></tr>
              <tr><td><span className="rb-role-tag rb-role-tag-blue">Benefits Admin</span></td><td>Centrally HR, Zizzl</td><td>JazzHR, LinkedIn Recruiter</td></tr>
            </tbody>
          </table>
          <div className="rb-table-note">Today both inherit the same "HR" access. That may be excessive.</div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SLIDE 6 — Missing Piece #2: On/Off Automation                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rb-slide">
        <div className="rb-slide-num">06</div>
        <div className="rb-slide-header">
          <div className="rb-slide-eyebrow">Missing Piece #2</div>
          <h2 className="rb-slide-title">Onboarding &amp; Offboarding Automation</h2>
        </div>
        <div className="rb-slide-body rb-two-col-eq">
          {/* Onboarding */}
          <div className="rb-flow-card">
            <div className="rb-flow-card-head">Onboarding</div>
            <div className="rb-flow-compare">
              <div className="rb-flow-col">
                <div className="rb-flow-col-label rb-fc-amber">Today</div>
                <div className="rb-flow-node-sm">Employee hired</div>
                <div className="rb-flow-arrow">↓</div>
                <div className="rb-flow-node-sm rb-fn-risk">Someone remembers to request access</div>
                <div className="rb-fn-risk-note">⚠ Manual, error-prone</div>
              </div>
              <div className="rb-flow-col">
                <div className="rb-flow-col-label rb-fc-green">Future State</div>
                <div className="rb-flow-node-sm">Employee hired</div>
                <div className="rb-flow-arrow">↓</div>
                <div className="rb-flow-node-sm">Role selected</div>
                <div className="rb-flow-arrow">↓</div>
                <div className="rb-flow-node-sm rb-fn-good">Systems automatically assigned</div>
              </div>
            </div>
          </div>
          {/* Offboarding */}
          <div className="rb-flow-card">
            <div className="rb-flow-card-head">Offboarding</div>
            <div className="rb-flow-compare">
              <div className="rb-flow-col">
                <div className="rb-flow-col-label rb-fc-red">Current Risk</div>
                <div className="rb-flow-node-sm">Employee terminated</div>
                <div className="rb-flow-arrow">↓</div>
                <div className="rb-flow-node-sm rb-fn-done">Google disabled</div>
                <div className="rb-flow-arrow">↓</div>
                <div className="rb-flow-node-sm rb-fn-risk">Therap still active</div>
                <div className="rb-flow-arrow">↓</div>
                <div className="rb-flow-node-sm rb-fn-risk">Bill.com still active</div>
                <div className="rb-fn-risk-note">🔴 Security gap</div>
              </div>
              <div className="rb-flow-col">
                <div className="rb-flow-col-label rb-fc-green">Target State</div>
                <div className="rb-flow-node-sm">Termination</div>
                {['Disable Google', 'Disable Therap', 'Disable Centrally HR', 'Disable LMS', 'Audit Complete'].map((s) => (
                  <React.Fragment key={s}><div className="rb-flow-arrow">↓</div><div className="rb-flow-node-sm rb-fn-done">{s}</div></React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SLIDE 7 — Missing Piece #3: Shared Accounts                        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rb-slide">
        <div className="rb-slide-num">07</div>
        <div className="rb-slide-header">
          <div className="rb-slide-eyebrow">Missing Piece #3</div>
          <h2 className="rb-slide-title">Shared Account Governance</h2>
        </div>
        <div className="rb-slide-body rb-two-col-eq">
          <div>
            <div className="rb-section-label">Current Findings</div>
            <table className="rb-table">
              <thead><tr><th>System</th><th>Shared Accounts</th><th>Risk</th></tr></thead>
              <tbody>
                {SHARED.map((s) => (
                  <tr key={s.system}>
                    <td><strong>{s.system}</strong></td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{s.count}</td>
                    <td>
                      <span className="rb-risk-badge" style={{
                        background: s.risk === 'critical' ? '#fee2e2' : s.risk === 'high' ? '#fef3c7' : '#fef9c3',
                        color: s.risk === 'critical' ? '#b91c1c' : s.risk === 'high' ? '#92400e' : '#854d0e'
                      }}>{s.risk.charAt(0).toUpperCase() + s.risk.slice(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <div className="rb-shared-problem">
              <div className="rb-problem-icon">⚠️</div>
              <div className="rb-problem-scenario">
                <div className="rb-problem-label">Example: Shared DocuSign Login</div>
                <div className="rb-problem-q">"Who approved this document?"</div>
                <div className="rb-problem-a">Unknown.</div>
              </div>
            </div>
            <div className="rb-rec-box">
              <div className="rb-rec-box-head">Every shared account must have:</div>
              <ul className="rb-rec-list">
                <li>✦ Business justification</li>
                <li>✦ Named owner</li>
                <li>✦ MFA enabled</li>
                <li>✦ Quarterly review date</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SLIDE 8 — Missing Piece #4: Separation of Duties                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rb-slide">
        <div className="rb-slide-num">08</div>
        <div className="rb-slide-header">
          <div className="rb-slide-eyebrow">Missing Piece #4</div>
          <h2 className="rb-slide-title">Separation of Duties <span className="rb-title-note">(Finance Example)</span></h2>
        </div>
        <div className="rb-slide-body rb-two-col-eq">
          <div className="rb-sod-risk">
            <div className="rb-section-label rb-section-label-red">Current Risk — One person may:</div>
            <div className="rb-sod-chain">
              {['Create Vendor', 'Approve Vendor', 'Release Payment'].map((s, i) => (
                <React.Fragment key={s}>
                  <div className="rb-sod-step rb-sod-step-risk">{s}</div>
                  {i < 2 && <div className="rb-sod-arrow">↓</div>}
                </React.Fragment>
              ))}
            </div>
            <div className="rb-sod-scenario">
              <div className="rb-scenario-label">Real scenario:</div>
              <div className="rb-scenario-flow">
                Employee creates <strong>ABC Consulting</strong> → approves invoice → releases payment → money leaves company
              </div>
            </div>
          </div>
          <div className="rb-sod-fix">
            <div className="rb-section-label rb-section-label-green">Recommended Control</div>
            <table className="rb-table">
              <thead><tr><th>Function</th><th>Required Role</th></tr></thead>
              <tbody>
                <tr><td>Create Vendor</td><td><span className="rb-role-tag rb-role-tag-blue">Finance</span></td></tr>
                <tr><td>Approve Vendor</td><td><span className="rb-role-tag rb-role-tag-blue">Director</span></td></tr>
                <tr><td>Release Payment</td><td><span className="rb-role-tag rb-role-tag-blue">Executive</span></td></tr>
              </tbody>
            </table>
            <div className="rb-audit-note-box">Standard audit practice — required for SOC 2 and most financial audits.</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SLIDE 9 — Missing Piece #5: Privileged Access Tiers                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rb-slide">
        <div className="rb-slide-num">09</div>
        <div className="rb-slide-header">
          <div className="rb-slide-eyebrow">Missing Piece #5</div>
          <h2 className="rb-slide-title">Privileged Access Tiers</h2>
          <div className="rb-slide-titleNote">Not all admins are equal.</div>
        </div>
        <div className="rb-slide-body">
          <div className="rb-tier-stack">
            {TIERS.map((t) => (
              <div key={t.tier} className="rb-tier" style={{ '--tier-color': t.color, '--tier-bg': t.bg }}>
                <div className="rb-tier-left">
                  <div className="rb-tier-badge" style={{ background: t.color, color: 'white' }}>{t.label}</div>
                  <div className="rb-tier-name" style={{ color: t.color }}>{t.name}</div>
                  <div className="rb-tier-people">{t.people}</div>
                </div>
                <div className="rb-tier-systems">
                  {t.systems.map((s) => <span key={s} className="rb-tier-sys-tag" style={{ background: t.bg, color: t.color }}>{s}</span>)}
                </div>
              </div>
            ))}
          </div>
          <div className="rb-insight-bar">
            <span className="rb-insight-icon">🔒</span>
            <span>Tiering limits blast radius from a compromised account. A Tier 2 compromise cannot touch identity systems. A Tier 0 compromise is catastrophic — those accounts need the strongest MFA controls.</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SLIDE 10 — Missing Piece #6: Quarterly Access Review               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rb-slide">
        <div className="rb-slide-num">10</div>
        <div className="rb-slide-header">
          <div className="rb-slide-eyebrow">Missing Piece #6</div>
          <h2 className="rb-slide-title">Quarterly Access Review</h2>
        </div>
        <div className="rb-slide-body rb-two-col-eq">
          <div>
            <div className="rb-question-block">
              <span className="rb-q-icon">?</span>
              <span>How do we know access is still appropriate?</span>
            </div>
            <div className="rb-review-example">
              <div className="rb-review-head">Manager reviews: <strong>John Smith</strong></div>
              <div className="rb-review-systems">
                {['Google Workspace', 'Therap EHR', 'When I Work', 'Centrally HR'].map((sys) => (
                  <div key={sys} className="rb-review-sys-row">
                    <span className="rb-review-sys-name">{sys}</span>
                    <div className="rb-review-choices">
                      <label className="rb-review-choice rb-choice-keep"><input type="radio" name={sys} readOnly defaultChecked /> Keep</label>
                      <label className="rb-review-choice"><input type="radio" name={sys} readOnly /> Remove</label>
                      <label className="rb-review-choice"><input type="radio" name={sys} readOnly /> Modify</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rb-freq-card">
            <div className="rb-freq-icon">📅</div>
            <div className="rb-freq-label">Recommended Frequency</div>
            <div className="rb-freq-value">Quarterly</div>
            <div className="rb-freq-note">Each department manager reviews their direct reports' access. IT confirms changes are applied within 5 business days.</div>
            <div className="rb-freq-benefits">
              <div className="rb-freq-ben">Catches stale access before audits</div>
              <div className="rb-freq-ben">Reduces insider threat risk</div>
              <div className="rb-freq-ben">Required for SOC 2 compliance</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SLIDE 11 — Future State Vision                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rb-slide">
        <div className="rb-slide-num">11</div>
        <div className="rb-slide-header">
          <div className="rb-slide-eyebrow">Future State Vision</div>
          <h2 className="rb-slide-title">BrightPath Identity Governance Model</h2>
        </div>
        <div className="rb-slide-body">
          <div className="rb-lifecycle">
            {[
              { node: 'Employee Hired',          type: 'event',   color: '#2563eb' },
              { node: 'Assigned Role',            type: 'action',  color: '#0f172a' },
              { node: 'Google Group Membership',  type: 'action',  color: '#0f172a' },
              { node: 'SSO Provisioning',         type: 'action',  color: '#0f172a' },
              { node: 'System Access Granted',    type: 'outcome', color: '#16a34a' },
              { node: 'Quarterly Review',         type: 'review',  color: '#d97706' },
              { node: 'Role Change',              type: 'event',   color: '#7c3aed' },
              { node: 'Access Updated',           type: 'action',  color: '#0f172a' },
              { node: 'Termination',              type: 'event',   color: '#dc2626' },
              { node: 'Automatic Deprovisioning', type: 'outcome', color: '#15803d' },
            ].map((n, i, arr) => (
              <React.Fragment key={n.node}>
                <div className="rb-lc-node" style={{ '--nc': n.color }}>
                  <div className="rb-lc-dot" style={{ background: n.color }} />
                  <div className="rb-lc-label" style={{ color: n.color }}>{n.node}</div>
                </div>
                {i < arr.length - 1 && <div className="rb-lc-arrow" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SLIDE 12 — Recommendation                                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rb-slide rb-slide-closing">
        <div className="rb-slide-num">12</div>
        <div className="rb-slide-header">
          <div className="rb-slide-eyebrow">Recommendation</div>
          <h2 className="rb-slide-title">Proposed Decision</h2>
        </div>
        <div className="rb-slide-body rb-three-col">

          <div className="rb-card rb-card-decision">
            <div className="rb-card-head rb-card-head-green">Approve Jeremy's Work</div>
            <div className="rb-decision-badge">RBAC Foundation v1.0</div>
            <div className="rb-decision-note">Strong foundation. Build on it — don't replace it.</div>
          </div>

          <div className="rb-card">
            <div className="rb-card-head">Phase 2 Deliverables</div>
            <ol className="rb-phase2-list">
              {PHASE2.map((d, i) => (
                <li key={i}><span className="rb-p2-num">{i + 1}</span>{d}</li>
              ))}
            </ol>
          </div>

          <div className="rb-card rb-card-success">
            <div className="rb-card-head rb-card-head-dark">By End of Phase 2</div>
            <div className="rb-success-list">
              {SUCCESS.map((s) => (
                <div key={s} className="rb-success-item"><span className="rb-check-green">✅</span>{s}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="rb-closing-quote">
          <div className="rb-quote-mark">"</div>
          <blockquote>Jeremy has done the hard part of organizing BrightPath's systems and access structure. Our recommendation is not to replace this work, but to build on it. This access matrix becomes the foundation for a complete RBAC, SSO, and Identity Governance program that can scale as BrightPath grows.</blockquote>
          <div className="rb-quote-attr">— Rey Dumasig, Director AI &amp; Automation, Summit 360</div>
        </div>
      </div>

    </div>
  );
}

window.RBACReview = RBACReview;
