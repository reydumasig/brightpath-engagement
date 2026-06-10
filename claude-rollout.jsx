// claude-rollout.jsx — Claude AI Integration Rollout Plan
// Connector map, custom API work, org vs user setup, access controls

// ── Connector status types ────────────────────────────────────────────────────
const CR_STATUS = {
  native:         { label: 'Built-in Connector', bg: '#dcfce7', fg: '#15803d', dot: '#16a34a', badge: '✓ Native' },
  mcp:            { label: 'MCP Available',       bg: '#dbeafe', fg: '#1d4ed8', dot: '#2563eb', badge: '⚡ MCP' },
  custom:         { label: 'Custom API Work',     bg: '#fef3c7', fg: '#92400e', dot: '#d97706', badge: '⚙ Custom' },
  limited:        { label: 'API Restricted',      bg: '#fce7f3', fg: '#9d174d', dot: '#db2777', badge: '⚠ Limited' },
  notrecommended: { label: 'Not Recommended',     bg: '#fee2e2', fg: '#b91c1c', dot: '#dc2626', badge: '✗ Skip' },
  unknown:        { label: 'Needs Investigation', bg: '#f1f5f9', fg: '#475569', dot: '#94a3b8', badge: '? TBD' },
};

const CR_EFFORT = {
  ready:       { label: 'Ready now',       bg: '#dcfce7', fg: '#15803d' },
  days:        { label: '1–3 days',        bg: '#ede9fe', fg: '#5b21b6' },
  weeks:       { label: '1–2 weeks',       bg: '#fef3c7', fg: '#92400e' },
  investigate: { label: 'Investigate',     bg: '#f1f5f9', fg: '#64748b' },
  skip:        { label: 'Not applicable',  bg: '#f8fafc', fg: '#94a3b8' },
};

// ── Full connector map ─────────────────────────────────────────────────────────
const CONNECTOR_MAP = [
  // ── Google Workspace — all native ──────────────────────────────────────────
  {
    system: 'Gmail', category: 'Google Workspace', logo: 'gmail.com',
    status: 'native', effort: 'ready',
    canDo: 'Draft replies, summarize threads, search inbox, triage by priority',
    notes: 'Enabled via Claude.ai → Integrations → Google Workspace. Each user authorizes their own Gmail — no cross-account access.',
    setupLevel: 'user',
  },
  {
    system: 'Google Drive', category: 'Google Workspace', logo: 'drive.google.com',
    status: 'native', effort: 'ready',
    canDo: 'Search documents, summarize files, extract data from Docs/Sheets, draft new docs',
    notes: 'User authorizes their own Drive. Claude can only read/write files the user has permission to access.',
    setupLevel: 'user',
  },
  {
    system: 'Google Docs', category: 'Google Workspace', logo: 'docs.google.com',
    status: 'native', effort: 'ready',
    canDo: 'Summarize, edit, reformat, translate, extract key points from any Doc',
    notes: 'Included in Google Drive connector. File-level permissions enforced — Claude cannot read docs the user cannot open.',
    setupLevel: 'user',
  },
  {
    system: 'Google Sheets', category: 'Google Workspace', logo: 'sheets.google.com',
    status: 'native', effort: 'ready',
    canDo: 'Analyze data, generate summaries, answer questions about spreadsheet content, spot trends',
    notes: 'Included in Google Drive connector. Sheet-level access matches the user\'s own Google permissions.',
    setupLevel: 'user',
  },
  {
    system: 'Google Calendar', category: 'Google Workspace', logo: 'calendar.google.com',
    status: 'native', effort: 'ready',
    canDo: 'Summarize upcoming meetings, draft agendas, find free times, prepare for scheduled calls',
    notes: 'User authorizes their own calendar. Claude can read events visible to that user only.',
    setupLevel: 'user',
  },
  {
    system: 'Google Ads', category: 'Marketing', logo: 'ads.google.com',
    status: 'native', effort: 'ready',
    canDo: 'Covered by Google Account auth. Write ad copy, analyze campaign results, draft reports',
    notes: 'Accessible via Google account. For deep campaign data analysis, use Google Sheets export + Drive connector.',
    setupLevel: 'user',
  },
  // ── Canva — MCP available ──────────────────────────────────────────────────
  {
    system: 'Canva', category: 'Design / Marketing', logo: 'canva.com',
    status: 'mcp', effort: 'days',
    canDo: 'Generate designs from prompts, create branded templates, resize assets, edit copy in designs',
    notes: 'Official Canva MCP server available. Requires Teams or Enterprise plan. Connect via Claude Desktop or Claude.ai MCP settings.',
    setupLevel: 'org',
  },
  // ── Custom API work — needs MCP build ──────────────────────────────────────
  {
    system: 'Zoho CRM', category: 'CRM / Sales', logo: 'zoho.com',
    status: 'custom', effort: 'weeks',
    canDo: 'Look up contacts/accounts, summarize deal history, draft follow-up emails, log call notes, query pipeline status',
    notes: 'Zoho REST API is robust and well-documented. Requires a custom MCP server exposing specific Zoho tools. See the "Custom API Deep-Dive" section below for the full build plan.',
    setupLevel: 'org',
  },
  {
    system: 'QuickBooks Online', category: 'Finance / Accounting', logo: 'quickbooks.intuit.com',
    status: 'custom', effort: 'weeks',
    canDo: 'Query invoice status, summarize expense reports, answer "how much did we spend on X" questions',
    notes: 'Intuit has a REST API (OAuth 2.0). Custom MCP would expose read-only tools: get_invoice, list_expenses, query_report. IMPORTANT: restrict to finance team only via role-based access.',
    setupLevel: 'org',
  },
  {
    system: 'DocuSign', category: 'Legal / eSignature', logo: 'docusign.com',
    status: 'custom', effort: 'weeks',
    canDo: 'Check envelope status, remind pending signers, summarize agreement content before signing',
    notes: 'DocuSign REST API available. Custom MCP would expose: get_envelope_status, list_pending_signatures. PHI/contract sensitivity — restrict to HR/Legal roles.',
    setupLevel: 'org',
  },
  {
    system: 'JazzHR (ATS)', category: 'HR / Recruiting', logo: 'jazzhr.com',
    status: 'custom', effort: 'weeks',
    canDo: 'Summarize candidate profiles, draft job postings, screen applications against requirements',
    notes: 'JazzHR API available on Pro+ plans. Custom MCP would expose: list_applicants, get_job, search_candidates. Useful for recruiters to get quick candidate summaries.',
    setupLevel: 'org',
  },
  {
    system: 'When I Work', category: 'Scheduling / Workforce', logo: 'wheniwork.com',
    status: 'custom', effort: 'weeks',
    canDo: 'Answer schedule questions, flag coverage gaps, draft shift-swap communications',
    notes: 'When I Work REST API available. Custom MCP for supervisors: get_schedule, list_shifts, find_coverage_gaps. Not recommended for direct care staff — manager-level only.',
    setupLevel: 'org',
  },
  {
    system: 'Centrally HR', category: 'HR / Payroll', logo: 'cbiz.com',
    status: 'custom', effort: 'investigate',
    canDo: 'Query org chart, look up employee info (non-sensitive fields), answer onboarding status questions',
    notes: 'CBIZ API availability needs confirmation. Payroll/benefits data — if connected, restrict to HR Admins only. Investigate API access with CBIZ before scoping build.',
    setupLevel: 'org',
  },
  {
    system: 'Bill.com', category: 'Finance / AP-AR', logo: 'bill.com',
    status: 'custom', effort: 'weeks',
    canDo: 'Check payment status, summarize AP/AR aging, alert on overdue invoices',
    notes: 'Bill.com Developer API available. High-sensitivity financial data — restrict MCP access to Finance Director only. Read-only tools: get_bill_status, list_unpaid_invoices.',
    setupLevel: 'org',
  },
  {
    system: 'Squarespace', category: 'Marketing / Website', logo: 'squarespace.com',
    status: 'custom', effort: 'days',
    canDo: 'Draft website copy, write blog posts, suggest SEO improvements, update page content',
    notes: 'Squarespace Content API available. Low risk — no sensitive data. Custom MCP could expose: create_page_draft, update_copy. Useful for marketing team.',
    setupLevel: 'org',
  },
  {
    system: 'Adobe Acrobat', category: 'Productivity / Documents', logo: 'adobe.com',
    status: 'custom', effort: 'days',
    canDo: 'Extract text from PDFs, summarize documents, compare versions',
    notes: 'Adobe PDF Services API available (free tier included with Enterprise). Can extract PDF content for Claude analysis. Most PDF workflows can be handled by uploading to Claude directly without an MCP.',
    setupLevel: 'user',
  },
  // ── Restricted APIs ────────────────────────────────────────────────────────
  {
    system: 'LinkedIn Recruiter', category: 'HR / Recruiting', logo: 'linkedin.com',
    status: 'limited', effort: 'investigate',
    canDo: 'Limited: LinkedIn API is heavily restricted. Candidate search and outreach workflows not available via API.',
    notes: 'LinkedIn Partner API requires approval and is very restricted — cold outreach, bulk scraping, and candidate search are not supported. Practical workaround: export candidate data to Google Sheets, then use the Drive connector.',
    setupLevel: 'org',
  },
  {
    system: 'Indeed', category: 'HR / Recruiting', logo: 'indeed.com',
    status: 'limited', effort: 'investigate',
    canDo: 'Limited: Indeed API is restricted. Job posting management available; candidate data is not accessible via API.',
    notes: 'Indeed Publisher API allows job posting management but candidate profile data is not available via API. Practical path: use Claude with Google Sheets exports of candidate data.',
    setupLevel: 'org',
  },
  // ── Not recommended — PHI/compliance ──────────────────────────────────────
  {
    system: 'Therap EHR', category: 'Healthcare / EHR', logo: 'therapservices.net',
    status: 'notrecommended', effort: 'skip',
    canDo: '—',
    notes: '🚫 NOT RECOMMENDED. Contains PHI — HIPAA-regulated. Connecting Therap to an AI system requires a Business Associate Agreement (BAA) with Anthropic and a formal HIPAA risk assessment. Do not connect without legal/compliance review.',
    setupLevel: 'org',
  },
  {
    system: 'Netstudy 2.0', category: 'HR / Background Checks', logo: 'mn.gov',
    status: 'notrecommended', effort: 'skip',
    canDo: '—',
    notes: '🚫 NOT RECOMMENDED. Minnesota DHS government system — SSNs, criminal history. No API access available to providers. Data should never pass through Claude. Access should remain isolated to authorized HR staff.',
    setupLevel: 'org',
  },
  // ── Unknown — investigate ──────────────────────────────────────────────────
  {
    system: 'Zizzl', category: 'HR / Benefits', logo: 'zizzlhealth.com',
    status: 'unknown', effort: 'investigate',
    canDo: 'Potentially: answer benefits questions, enrollment status lookups',
    notes: 'No public API documentation. Sensitive benefits PII — confirm API availability and data exposure before scoping. Low priority.',
    setupLevel: 'org',
  },
  {
    system: 'Star Services LMS', category: 'Learning / Training', logo: 'starsvcs.com',
    status: 'unknown', effort: 'investigate',
    canDo: 'Potentially: check training completion status, pull course content into Claude context',
    notes: 'LMS platform not confirmed. Most LMS platforms have APIs — identify the platform first, then evaluate.',
    setupLevel: 'org',
  },
];

// ── Setup level descriptions ──────────────────────────────────────────────────
const SETUP_LEVELS = [
  {
    level: 'org',
    icon: '🏢',
    title: 'Org-Level Setup',
    who: 'S360 IT / Admin (one-time)',
    description: 'Configured once by an administrator. Sets up the MCP server or enables the integration at the Claude workspace level. All eligible users inherit access automatically after org setup.',
    examples: ['Hosting the Zoho MCP server', 'Enabling Canva MCP in Claude workspace', 'Publishing a custom tool to the org\'s Claude environment'],
    controls: ['Admin decides which integrations are available', 'Access can be restricted to specific roles or users', 'Audit logs show which users are using each integration'],
  },
  {
    level: 'user',
    icon: '👤',
    title: 'User-Level Setup',
    who: 'Each BrightPath employee (self-serve)',
    description: 'Each user connects their own account. Google Drive, Gmail, and Google Calendar work this way — each person authorizes Claude to read their own data only. No admin can see another user\'s files.',
    examples: ['Employee connects their Google Drive', 'Employee connects their Gmail', 'Employee connects their Zoho CRM login (if org setup is done)'],
    controls: ['User sees only their own data', 'User can disconnect at any time', 'Each authorization is scoped to that specific user\'s account'],
  },
];

// ── Access control model ──────────────────────────────────────────────────────
const ACCESS_CONTROLS = [
  {
    layer: 'Claude Workspace Admin',
    icon: '🔑',
    color: '#0f172a',
    who: 'Brandon (or delegated IT admin)',
    controls: [
      'Choose which integrations/MCPs are available org-wide',
      'Enable or disable specific tools (e.g., turn off Bill.com MCP for all non-finance users)',
      'Set usage policies and data handling rules',
      'View audit logs: who used which tool, when',
      'Invite/remove users from the Claude Enterprise workspace',
    ],
  },
  {
    layer: 'MCP / Integration Server',
    icon: '⚙️',
    color: '#2563eb',
    who: 'S360 configures during build',
    controls: [
      'Each MCP tool exposes ONLY what it\'s programmed to expose — e.g., the Zoho MCP returns contact names and deal summaries, never raw database dumps',
      'Read-only vs read-write permissions set per tool (most tools should be read-only)',
      'Role-based access: finance MCP tools visible only to finance team users',
      'No tool can access data outside its defined scope, even if a user asks Claude to "try harder"',
    ],
  },
  {
    layer: 'Source System Permissions',
    icon: '🗄️',
    color: '#16a34a',
    who: 'Existing system admins',
    controls: [
      'Claude can only see what the connected user is already allowed to see in that system',
      'Example: if an employee can\'t see payroll data in QBO, Claude can\'t see it either',
      'Service accounts used for org-level MCPs should have minimum required permissions (principle of least privilege)',
      'OAuth scopes are specified during setup — e.g., "read contacts" not "admin access"',
    ],
  },
  {
    layer: 'Conversation Privacy',
    icon: '💬',
    color: '#7c3aed',
    who: 'Anthropic / Claude platform',
    controls: [
      'Claude Enterprise: conversations are NOT used to train Anthropic models (confirmed)',
      'Each user\'s conversation history is private to that user — managers cannot read employee chats',
      'Sensitive data retrieved via integrations stays in the conversation context and is not persistently stored by Claude',
      'Anthropic\'s SOC 2 Type II certification covers enterprise deployments',
    ],
  },
];

// ── Zoho MCP deep-dive steps ───────────────────────────────────────────────────
const ZOHO_STEPS = [
  {
    step: 1, phase: 'API Access',
    title: 'Create a Zoho API client',
    detail: 'Log into Zoho Developer Console → API Console → Add Client → Server-based Applications. Generate Client ID + Client Secret. This is the credential the MCP server uses to authenticate with Zoho on behalf of users.',
    effort: '1–2 hours',
    who: 'S360 Dev',
  },
  {
    step: 2, phase: 'Scope Definition',
    title: 'Define minimum-required OAuth scopes',
    detail: 'Only request the data Claude actually needs. Recommended scopes: ZohoCRM.modules.contacts.READ, ZohoCRM.modules.deals.READ, ZohoCRM.modules.accounts.READ. Do NOT request full admin or write access unless a specific tool requires it.',
    effort: '1 hour',
    who: 'S360 Dev + Brandon',
  },
  {
    step: 3, phase: 'MCP Server Build',
    title: 'Build the Zoho MCP server',
    detail: 'Write a small Node.js or Python server using the MCP SDK. Expose 4–6 tools: search_contact(name/email), get_deal(id), list_open_deals(owner), get_account(id), log_note(deal_id, text). Each tool calls the Zoho REST API and returns a clean, readable response to Claude.',
    effort: '3–5 days',
    who: 'S360 Dev',
  },
  {
    step: 4, phase: 'Hosting',
    title: 'Deploy the MCP server',
    detail: 'Host on a simple cloud server (Vercel Functions, AWS Lambda, or a small EC2/Render instance). The server needs a stable HTTPS URL that Claude can call. Store Zoho API credentials as environment variables — never in code.',
    effort: '0.5 days',
    who: 'S360 Dev / IT',
  },
  {
    step: 5, phase: 'Claude Configuration',
    title: 'Register the MCP server in Claude',
    detail: 'In Claude.ai workspace admin settings → MCP Servers → Add Server → paste the HTTPS URL. Assign it a name ("Zoho CRM") and an icon. Optionally restrict to specific user groups (e.g., only sales/ops team members).',
    effort: '30 minutes',
    who: 'S360 Admin',
  },
  {
    step: 6, phase: 'User Auth',
    title: 'Users connect their Zoho accounts',
    detail: 'Each user clicks "Connect Zoho CRM" in their Claude settings. They are redirected to Zoho\'s OAuth login page, authorize the scopes, and are redirected back. From that point, Claude can call Zoho tools on their behalf — reading only data they can already see in Zoho.',
    effort: '2 min per user',
    who: 'BrightPath employees',
  },
  {
    step: 7, phase: 'Testing',
    title: 'Pilot with 2–3 users',
    detail: 'Test with a small group: try "Who are our contacts at [account]?", "Summarize the status of deals owned by [person]", "Log a note on deal [X]". Verify Claude returns accurate data and cannot access records outside the test users\' Zoho permissions.',
    effort: '1 day',
    who: 'S360 + BrightPath pilot users',
  },
];

// ── Main component ─────────────────────────────────────────────────────────────
function ClaudeRollout() {
  const [activeSection, setActiveSection] = React.useState('map');
  const [expandedRow, setExpandedRow] = React.useState(null);
  const [filterStatus, setFilterStatus] = React.useState('all');

  const statusCounts = React.useMemo(() => {
    const counts = {};
    CONNECTOR_MAP.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return counts;
  }, []);

  const filtered = filterStatus === 'all' ? CONNECTOR_MAP : CONNECTOR_MAP.filter((s) => s.status === filterStatus);

  const SECTIONS = [
    { id: 'map',      label: 'Connector Map',      sub: `${CONNECTOR_MAP.length} systems` },
    { id: 'zoho',     label: 'Zoho MCP Example',   sub: 'Custom API deep-dive' },
    { id: 'setup',    label: 'Org vs User Setup',  sub: 'Who does what' },
    { id: 'controls', label: 'Access Controls',    sub: 'How permissions work' },
  ];

  return (
    <div className="cr-page">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="cr-header">
        <div className="cr-header-left">
          <div className="cr-header-eyebrow">CLAUDE ENTERPRISE · INTEGRATION PLAN</div>
          <h2 className="cr-header-title">Claude AI Rollout</h2>
          <div className="cr-header-sub">BrightPath IT stack × Claude connectors — what connects, what needs work, and how permissions stay safe</div>
        </div>
        <div className="cr-header-stats">
          {Object.entries(CR_STATUS).map(([key, st]) => (
            statusCounts[key] ? (
              <div key={key} className="cr-stat-chip" style={{ background: st.bg, color: st.fg }}
                onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
                style={{ background: st.bg, color: st.fg, cursor: 'pointer', opacity: filterStatus !== 'all' && filterStatus !== key ? 0.45 : 1 }}>
                <span className="cr-stat-dot" style={{ background: st.dot }} />
                <span className="cr-stat-num">{statusCounts[key]}</span>
                <span className="cr-stat-lbl">{st.label}</span>
              </div>
            ) : null
          ))}
        </div>
      </div>

      {/* ── Sub-nav ───────────────────────────────────────────────────────────── */}
      <div className="cr-subnav">
        {SECTIONS.map((s) => (
          <button key={s.id}
            className={`cr-subnav-btn ${activeSection === s.id ? 'cr-subnav-btn-active' : ''}`}
            onClick={() => setActiveSection(s.id)}>
            <span className="cr-subnav-label">{s.label}</span>
            <span className="cr-subnav-sub">{s.sub}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — Connector Map                                             */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'map' && (
        <div className="cr-section">
          <div className="cr-section-intro">
            <p>Every system in BrightPath's IT stack mapped against Claude's built-in connectors and available MCPs. Click any row for setup details and what Claude can do once connected.</p>
            <div className="cr-filter-bar">
              <span className="cr-filter-label">Filter:</span>
              {[['all', 'All systems', '#f1f5f9', '#475569'], ...Object.entries(CR_STATUS).map(([k, v]) => [k, v.label, v.bg, v.fg])].map(([key, label, bg, fg]) => (
                <button key={key}
                  className={`cr-filter-chip ${filterStatus === key ? 'cr-filter-chip-on' : ''}`}
                  style={filterStatus === key ? { background: bg, color: fg, borderColor: fg } : {}}
                  onClick={() => setFilterStatus(key)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <table className="cr-table">
            <thead>
              <tr>
                <th>System</th>
                <th>Category</th>
                <th>Claude Status</th>
                <th>Setup Effort</th>
                <th>What Claude can do</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const st = CR_STATUS[s.status];
                const ef = CR_EFFORT[s.effort];
                const isOpen = expandedRow === s.system;
                return (
                  <React.Fragment key={s.system}>
                    <tr className={`cr-row ${isOpen ? 'cr-row-open' : ''} ${s.status === 'notrecommended' ? 'cr-row-skip' : ''}`}
                      onClick={() => setExpandedRow(isOpen ? null : s.system)}>
                      <td className="cr-cell-system">
                        <img src={`https://logo.clearbit.com/${s.logo}`} className="cr-sys-logo" alt=""
                          onError={(e) => { e.target.style.display = 'none'; }} />
                        <span className="cr-sys-name">{s.system}</span>
                      </td>
                      <td className="cr-cell-cat">{s.category}</td>
                      <td className="cr-cell-status">
                        <span className="cr-status-badge" style={{ background: st.bg, color: st.fg }}>
                          <span className="cr-status-dot" style={{ background: st.dot }} />
                          {st.badge}
                        </span>
                      </td>
                      <td className="cr-cell-effort">
                        <span className="cr-effort-badge" style={{ background: ef.bg, color: ef.fg }}>{ef.label}</span>
                      </td>
                      <td className="cr-cell-cando">{s.canDo === '—' ? <span className="cr-na">Not applicable</span> : s.canDo}</td>
                      <td className="cr-cell-chevron">{isOpen ? '▲' : '▼'}</td>
                    </tr>
                    {isOpen && (
                      <tr className="cr-detail-row">
                        <td colSpan={6}>
                          <div className="cr-detail">
                            <div className="cr-detail-grid">
                              <div className="cr-detail-block">
                                <div className="cr-detail-label">Setup notes</div>
                                <div className="cr-detail-text">{s.notes}</div>
                              </div>
                              <div className="cr-detail-block">
                                <div className="cr-detail-label">Setup level</div>
                                <div className="cr-detail-text">
                                  {s.setupLevel === 'org'
                                    ? '🏢 Org-level — configured once by admin; all eligible users inherit access'
                                    : '👤 User-level — each employee connects their own account; data stays private to them'}
                                </div>
                              </div>
                            </div>
                            {s.status === 'custom' && s.system === 'Zoho CRM' && (
                              <button className="cr-detail-cta" onClick={() => setActiveSection('zoho')}>
                                See the full Zoho MCP build plan →
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — Zoho MCP Deep-Dive                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'zoho' && (
        <div className="cr-section">
          <div className="cr-section-intro">
            <div className="cr-zoho-hero">
              <img src="https://logo.clearbit.com/zoho.com" className="cr-zoho-logo" alt="Zoho" onError={(e) => e.target.style.display='none'} />
              <div>
                <h3 className="cr-section-title">Zoho CRM — Custom MCP Build Plan</h3>
                <p>This is the worked example for what "Custom API Work" means in practice. Every step from API credentials to users connecting their accounts — with time estimates and who does each part.</p>
              </div>
            </div>
          </div>

          <div className="cr-zoho-summary">
            <div className="cr-zoho-sum-item">
              <div className="cr-zoho-sum-num">7</div>
              <div className="cr-zoho-sum-lbl">Steps total</div>
            </div>
            <div className="cr-zoho-sum-item">
              <div className="cr-zoho-sum-num">~2</div>
              <div className="cr-zoho-sum-lbl">Weeks to ship</div>
            </div>
            <div className="cr-zoho-sum-item">
              <div className="cr-zoho-sum-num">4–6</div>
              <div className="cr-zoho-sum-lbl">Exposed tools</div>
            </div>
            <div className="cr-zoho-sum-item">
              <div className="cr-zoho-sum-num">Read</div>
              <div className="cr-zoho-sum-lbl">Access type</div>
            </div>
          </div>

          <div className="cr-steps">
            {ZOHO_STEPS.map((s) => (
              <div key={s.step} className="cr-step">
                <div className="cr-step-left">
                  <div className="cr-step-num">{s.step}</div>
                  <div className="cr-step-line" />
                </div>
                <div className="cr-step-body">
                  <div className="cr-step-phase">{s.phase}</div>
                  <div className="cr-step-title">{s.title}</div>
                  <div className="cr-step-detail">{s.detail}</div>
                  <div className="cr-step-meta">
                    <span className="cr-step-effort">⏱ {s.effort}</span>
                    <span className="cr-step-who">👤 {s.who}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cr-zoho-what">
            <h4 className="cr-sub-heading">What it looks like once built</h4>
            <div className="cr-demo-grid">
              <div className="cr-demo-card">
                <div className="cr-demo-q">💬 "Who are our contacts at Hennepin County?"</div>
                <div className="cr-demo-a">→ Claude calls <code>search_contact(account="Hennepin County")</code> and returns names, titles, and last contact date from Zoho — instantly, in plain English.</div>
              </div>
              <div className="cr-demo-card">
                <div className="cr-demo-q">💬 "Summarize the open deals owned by Sarah"</div>
                <div className="cr-demo-a">→ Claude calls <code>list_open_deals(owner="sarah@brightpath-mn.com")</code> and returns a structured summary: deal name, stage, value, last activity.</div>
              </div>
              <div className="cr-demo-card">
                <div className="cr-demo-q">💬 "Log a note on the Hennepin deal: 'Follow-up call scheduled for June 20'"</div>
                <div className="cr-demo-a">→ Claude calls <code>log_note(deal_id, text)</code> and the note appears in Zoho CRM immediately. No tab-switching required.</div>
              </div>
              <div className="cr-demo-card">
                <div className="cr-demo-q">💬 "Draft a follow-up email to the Ramsey County contact"</div>
                <div className="cr-demo-a">→ Claude retrieves the contact from Zoho, then uses that context to draft a personalized follow-up — ready to paste into Gmail.</div>
              </div>
            </div>
          </div>

          <div className="cr-zoho-security">
            <h4 className="cr-sub-heading">Security boundaries in the Zoho MCP</h4>
            <ul className="cr-security-list">
              <li><strong>Minimum scopes only:</strong> The MCP requests read access to Contacts, Deals, and Accounts. No admin access, no financial modules, no bulk export.</li>
              <li><strong>Per-user OAuth:</strong> Each user connects their own Zoho credentials. If a user can only see deals they own in Zoho, Claude can only see the same.</li>
              <li><strong>No write access by default:</strong> The <code>log_note</code> tool is the only write operation — and it can be omitted entirely if Brandon prefers read-only.</li>
              <li><strong>No data stored outside conversation:</strong> Claude fetches Zoho data on-demand per message. Nothing is cached or stored by the MCP server.</li>
              <li><strong>Revocable anytime:</strong> Users can disconnect their Zoho auth from Claude settings. Admin can remove the MCP server from the workspace entirely.</li>
            </ul>
          </div>

          <div className="cr-replicable">
            <div className="cr-replicable-icon">⚙️</div>
            <div>
              <strong>This same pattern applies to every "Custom API Work" system.</strong> QuickBooks, DocuSign, JazzHR, When I Work — all follow the same 7-step process with different API endpoints and scopes. Building Zoho first establishes the template and cuts the time for subsequent integrations roughly in half.
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — Org vs User Setup                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'setup' && (
        <div className="cr-section">
          <div className="cr-section-intro">
            <p>Two distinct setup levels apply to Claude integrations. Understanding which is which clarifies who does what — and why some things are instant and others take weeks.</p>
          </div>

          <div className="cr-setup-grid">
            {SETUP_LEVELS.map((sl) => (
              <div key={sl.level} className="cr-setup-card">
                <div className="cr-setup-icon">{sl.icon}</div>
                <div className="cr-setup-title">{sl.title}</div>
                <div className="cr-setup-who">Done by: <strong>{sl.who}</strong></div>
                <div className="cr-setup-desc">{sl.description}</div>
                <div className="cr-setup-examples">
                  <div className="cr-setup-ex-label">Examples</div>
                  <ul>
                    {sl.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                  </ul>
                </div>
                <div className="cr-setup-controls">
                  <div className="cr-setup-ex-label">Admin controls at this level</div>
                  <ul>
                    {sl.controls.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="cr-setup-flow">
            <h4 className="cr-sub-heading">How a rollout typically flows</h4>
            <div className="cr-flow-steps">
              {[
                { n: 1, title: 'S360 sets up Claude Enterprise workspace', detail: 'Org domain verified, billing set, admin seat assigned to Brandon + S360 admins.' },
                { n: 2, title: 'S360 enables native Google Workspace connector', detail: 'One-time org-level step. Connector made available to all BrightPath users in the Claude workspace.' },
                { n: 3, title: 'Employees connect their Google accounts', detail: 'Each user logs into Claude → Settings → Integrations → Connect Google. Takes 2 minutes. They now have Drive, Gmail, Calendar, and Docs in Claude.' },
                { n: 4, title: 'S360 builds and deploys Zoho MCP server', detail: 'Custom development (~2 weeks). Hosted on S360\'s infrastructure. Registered in Claude workspace admin.' },
                { n: 5, title: 'Designated employees connect Zoho', detail: 'Only users who need Zoho access connect their credentials. Others don\'t see the integration at all.' },
                { n: 6, title: 'Repeat for additional systems', detail: 'Each new integration follows the same pattern. Native connectors are instant; custom MCPs take 1–2 weeks each.' },
              ].map((s) => (
                <div key={s.n} className="cr-flow-step">
                  <div className="cr-flow-num">{s.n}</div>
                  <div className="cr-flow-body">
                    <div className="cr-flow-title">{s.title}</div>
                    <div className="cr-flow-detail">{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cr-system-table-wrap">
            <h4 className="cr-sub-heading">Systems by setup level</h4>
            <div className="cr-two-col">
              <div className="cr-col-card">
                <div className="cr-col-head">🏢 Org-level (admin sets up once)</div>
                <div className="cr-col-list">
                  {CONNECTOR_MAP.filter((s) => s.setupLevel === 'org' && s.status !== 'notrecommended').map((s) => (
                    <div key={s.system} className="cr-col-item">
                      <img src={`https://logo.clearbit.com/${s.logo}`} className="cr-col-logo" alt="" onError={(e) => e.target.style.display='none'} />
                      <span>{s.system}</span>
                      <span className="cr-col-badge" style={{ background: CR_STATUS[s.status].bg, color: CR_STATUS[s.status].fg }}>
                        {CR_STATUS[s.status].badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="cr-col-card">
                <div className="cr-col-head">👤 User-level (each employee connects their own)</div>
                <div className="cr-col-list">
                  {CONNECTOR_MAP.filter((s) => s.setupLevel === 'user').map((s) => (
                    <div key={s.system} className="cr-col-item">
                      <img src={`https://logo.clearbit.com/${s.logo}`} className="cr-col-logo" alt="" onError={(e) => e.target.style.display='none'} />
                      <span>{s.system}</span>
                      <span className="cr-col-badge" style={{ background: CR_STATUS[s.status].bg, color: CR_STATUS[s.status].fg }}>
                        {CR_STATUS[s.status].badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — Access Controls                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'controls' && (
        <div className="cr-section">
          <div className="cr-section-intro">
            <p>Four independent permission layers ensure employees can only see data they're already authorized to see — and admins have full visibility into what's being accessed.</p>
          </div>

          <div className="cr-controls-grid">
            {ACCESS_CONTROLS.map((ac) => (
              <div key={ac.layer} className="cr-control-card">
                <div className="cr-control-head" style={{ borderLeftColor: ac.color }}>
                  <span className="cr-control-icon">{ac.icon}</span>
                  <div>
                    <div className="cr-control-layer">{ac.layer}</div>
                    <div className="cr-control-who">Managed by: <strong>{ac.who}</strong></div>
                  </div>
                </div>
                <ul className="cr-control-list">
                  {ac.controls.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="cr-permissions-example">
            <h4 className="cr-sub-heading">Worked example: what a front-line employee can and can't see</h4>
            <div className="cr-perm-grid">
              <div className="cr-perm-card cr-perm-can">
                <div className="cr-perm-head">✅ A Direct Care employee CAN</div>
                <ul>
                  <li>Ask Claude to summarize their own Google Drive files</li>
                  <li>Have Claude draft emails from their own Gmail</li>
                  <li>Ask Claude to check their own Google Calendar</li>
                  <li>Use Claude for writing, summarizing, brainstorming — any general task</li>
                </ul>
              </div>
              <div className="cr-perm-card cr-perm-cannot">
                <div className="cr-perm-head">🚫 A Direct Care employee CANNOT</div>
                <ul>
                  <li>Access a colleague's Google Drive files (Google enforces this)</li>
                  <li>See Zoho CRM data (not in their job role — integration not assigned to them)</li>
                  <li>Access QuickBooks Online (finance tool — MCP restricted to Finance team)</li>
                  <li>Access Therap EHR or NETStudy via Claude (these integrations are blocked org-wide)</li>
                  <li>See another user's conversation history (Anthropic's privacy model)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="cr-brandon-note">
            <div className="cr-brandon-icon">💡</div>
            <div className="cr-brandon-text">
              <strong>Bottom line for Brandon:</strong> Claude doesn't create new access — it only surfaces data the user already has access to. If someone can't open a file in Drive today, Claude can't open it either. The MCP layer adds a second restriction: each tool is scoped to the minimum data needed, so even finance MCPs only expose what they're programmed to show. The result is that Claude makes authorized people faster, without expanding anyone's data access.
            </div>
          </div>

          <div className="cr-audit-note">
            <h4 className="cr-sub-heading">Audit & compliance visibility</h4>
            <div className="cr-audit-grid">
              {[
                { icon: '📋', title: 'Usage logs', detail: 'Claude Enterprise admin dashboard shows which integrations are being used, by whom, and how often. No conversation content — just tool-call metadata.' },
                { icon: '🔒', title: 'SOC 2 Type II', detail: 'Anthropic\'s Claude Enterprise is SOC 2 Type II certified. Conversations are not used for model training. Data processing agreements available.' },
                { icon: '🔌', title: 'Instant revoke', detail: 'Any integration can be disabled org-wide in seconds via the Claude admin panel. Individual users can also disconnect their own OAuth tokens at any time.' },
                { icon: '📜', title: 'BAA available', detail: 'A Business Associate Agreement (BAA) with Anthropic is available for Enterprise plans — required before connecting any PHI-containing system (e.g., if Therap EHR were ever considered).' },
              ].map((a) => (
                <div key={a.title} className="cr-audit-item">
                  <div className="cr-audit-icon">{a.icon}</div>
                  <div className="cr-audit-title">{a.title}</div>
                  <div className="cr-audit-detail">{a.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

window.ClaudeRollout = ClaudeRollout;
