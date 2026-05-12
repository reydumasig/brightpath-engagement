// security.jsx — Security Hub: MFA Heatmap, SSO Strategy, Access Management

// ── Data ────────────────────────────────────────────────────────────────────

const MFA_ST = {
  full:    { label: 'Full Support',     bg: '#dcfce7', fg: '#15803d', dot: '#16a34a', icon: '✓' },
  partial: { label: 'Partial',          bg: '#fef9c3', fg: '#854d0e', dot: '#ca8a04', icon: '◐' },
  none:    { label: 'Not Supported',    bg: '#fee2e2', fg: '#b91c1c', dot: '#dc2626', icon: '✗' },
  unknown: { label: 'Needs Validation', bg: '#f1f5f9', fg: '#475569', dot: '#94a3b8', icon: '?' },
};

const RISK_ST = {
  critical: { label: 'Critical', bg: '#fee2e2', fg: '#b91c1c' },
  high:     { label: 'High',     bg: '#fef3c7', fg: '#92400e' },
  medium:   { label: 'Medium',   bg: '#ecfdf5', fg: '#065f46' },
  low:      { label: 'Low',      bg: '#f0fdf4', fg: '#15803d' },
};

const ROLLOUT_ST = {
  phase1:   { label: 'Phase 1 · May 15', bg: '#ede9fe', fg: '#5b21b6' },
  phase2:   { label: 'Phase 2 · May 27', bg: '#dbeafe', fg: '#1d4ed8' },
  validate: { label: 'Validate First',   bg: '#f1f5f9', fg: '#64748b' },
};

const SEC_SYSTEMS = [
  {
    name: 'Google Workspace', category: 'Identity / Productivity',
    mfa: 'full', sso: 'full', risk: 'critical', priority: 1, rollout: 'phase1',
    mfaNotes: 'Native Google Authenticator TOTP. Hardware passkey support. Policy enforcement via Admin Console — set enforcement deadline directly.',
    ssoNotes: 'Google IS the IdP. All Google apps natively use Google auth.',
    action: 'Enforce 2FA via Admin Console → Security → 2-Step Verification. Set enforcement date: May 15.',
  },
  {
    name: 'Slack', category: 'Communication',
    mfa: 'full', sso: 'full', risk: 'high', priority: 1, rollout: 'phase1',
    mfaNotes: 'TOTP authenticator app MFA natively supported. Org-wide enforcement available.',
    ssoNotes: 'Google SAML SSO fully supported on Slack Pro or Business+ plan.',
    action: 'Enable org-wide MFA in Slack Admin → Authentication. Confirm plan tier supports Google SSO.',
  },
  {
    name: 'Zoho CRM', category: 'CRM / Sales',
    mfa: 'full', sso: 'full', risk: 'high', priority: 1, rollout: 'phase1',
    mfaNotes: 'Google Authenticator TOTP fully supported. Admin can enforce org-wide.',
    ssoNotes: 'Google SAML SSO fully supported via Zoho Directory.',
    action: 'Enable MFA enforcement in Zoho Admin. Configure Google SAML under Zoho Directory → SSO.',
  },
  {
    name: 'QuickBooks Online', category: 'Finance / Accounting',
    mfa: 'full', sso: 'partial', risk: 'critical', priority: 1, rollout: 'phase1',
    mfaNotes: 'Intuit + Google Authenticator TOTP both supported. MFA can be enforced per account.',
    ssoNotes: 'Intuit does NOT support Google SAML SSO. Intuit SSO only. Workaround: enforce 2FA + dedicated QBO credentials for all users.',
    action: 'Enable 2FA on all QBO accounts now. Use dedicated QBO passwords — do not share. Document credentials in password manager.',
  },
  {
    name: 'DocuSign', category: 'Legal / eSignature',
    mfa: 'full', sso: 'full', risk: 'critical', priority: 1, rollout: 'phase1',
    mfaNotes: 'Google Authenticator TOTP supported. Admin can enforce MFA org-wide via DocuSign Admin → Authentication.',
    ssoNotes: 'Google SAML SSO fully supported. Configure via DocuSign Admin → Identity Providers.',
    action: 'PRIORITY: Enable MFA enforcement for all senders and admins immediately. DocuSign holds executed contracts and may contain PHI/PII. Set up Google SAML SSO.',
  },
  {
    name: 'Notion', category: 'Documentation / Wiki',
    mfa: 'full', sso: 'partial', risk: 'high', priority: 2, rollout: 'phase1',
    mfaNotes: 'TOTP authenticator app supported on all Notion plans.',
    ssoNotes: 'SAML SSO requires Business plan ($15/user/mo). If on Free or Plus, an upgrade is needed to enable Google SSO.',
    action: 'Enable MFA for all users immediately. Check current plan — if not on Business tier, evaluate upgrade for SSO.',
  },
  {
    name: 'JazzHR (ATS)', category: 'HR / Recruiting',
    mfa: 'partial', sso: 'partial', risk: 'high', priority: 2, rollout: 'phase1',
    mfaNotes: 'MFA availability is plan-dependent. Current plan may not include 2FA — needs confirmation.',
    ssoNotes: 'SSO available on higher-tier plans. Confirm with JazzHR support.',
    action: 'Contact JazzHR support to confirm: (1) Does current plan include MFA? (2) Is SAML SSO available? Escalate if MFA is not included.',
  },
  {
    name: 'When I Work', category: 'Scheduling / Workforce',
    mfa: 'full', sso: 'partial', risk: 'high', priority: 2, rollout: 'phase2',
    mfaNotes: 'TOTP authenticator app MFA supported natively.',
    ssoNotes: 'SSO may require enterprise tier. Validate current plan with vendor.',
    action: 'Enable MFA for all manager and admin accounts in Phase 1. Validate SSO plan tier before Phase 2.',
  },
  {
    name: 'Calendly', category: 'Scheduling / Productivity',
    mfa: 'full', sso: 'partial', risk: 'medium', priority: 3, rollout: 'phase2',
    mfaNotes: 'Google Authenticator TOTP supported. Users can also sign in via Google OAuth (acts as an implicit 2FA layer if Google 2FA is enforced).',
    ssoNotes: 'Google OAuth login available on all plans. SAML SSO requires Enterprise plan. Enforcing Google 2FA at the IdP level effectively secures Calendly logins.',
    action: 'Ensure all users log in via Google OAuth (not email/password). Once Google 2FA is enforced org-wide, Calendly is covered by default.',
  },
  {
    name: 'Centrally HR', category: 'HR / Payroll',
    mfa: 'unknown', sso: 'unknown', risk: 'high', priority: 2, rollout: 'validate',
    mfaNotes: 'MFA support not confirmed. Direct vendor validation required this week.',
    ssoNotes: 'SSO capability unknown. Contact vendor.',
    action: 'Contact Centrally HR support this week: (1) Is TOTP MFA available? (2) Is SAML SSO supported? (3) What plan tier is required? Report back before Phase 2.',
  },
  {
    name: 'Therap EHR', category: 'Healthcare / EHR',
    mfa: 'partial', sso: 'unknown', risk: 'critical', priority: 1, rollout: 'validate',
    mfaNotes: 'Therap has internal MFA but Google Authenticator TOTP compatibility is unconfirmed. Contains PHI — HIPAA implications.',
    ssoNotes: 'No confirmed Google SAML SSO. Therap manages authentication internally. Validation is a priority.',
    action: 'PRIORITY: Contact Therap support immediately. PHI system — HIPAA-regulated. Confirm: (1) MFA method supported (2) Audit logging active (3) Access review cadence.',
  },
  {
    name: 'BGS (Background Check)', category: 'HR / Compliance',
    mfa: 'unknown', sso: 'unknown', risk: 'critical', priority: 1, rollout: 'validate',
    mfaNotes: 'Vendor not yet confirmed (possibly Sterling Backcheck, Checkr, or similar). MFA availability varies by provider and plan. This system handles SSNs, criminal records, and sensitive PII.',
    ssoNotes: 'Unknown — depends on vendor. Some background check vendors support SAML SSO; others do not.',
    action: 'PRIORITY: (1) Confirm exact vendor name. (2) Audit who currently has admin/portal access — limit to HR only. (3) Confirm MFA is enabled on all accounts. (4) Verify data retention and deletion policy. Contains highest-sensitivity PII in the stack.',
  },
  {
    name: 'E-Verify / I-9 Platform', category: 'HR / Compliance',
    mfa: 'partial', sso: 'none', risk: 'critical', priority: 1, rollout: 'validate',
    mfaNotes: 'USCIS E-Verify portal has built-in MFA (SMS or email code). If using a third-party I-9 system (e.g. HireRight, I-9 Advantage, Equifax I-9), MFA availability depends on that vendor.',
    ssoNotes: 'USCIS E-Verify is a federal government system — no Google SSO available. Third-party I-9 platforms may offer SSO; confirm with vendor.',
    action: '(1) Confirm whether BrightPath uses USCIS E-Verify directly or through a third-party I-9 platform. (2) Ensure MFA is active on all employer accounts. (3) Audit user list — federal compliance requires restricted access. (4) If third-party platform: request security documentation.',
  },
  {
    name: 'Star Services LMS', category: 'Learning / Training',
    mfa: 'unknown', sso: 'unknown', risk: 'high', priority: 3, rollout: 'validate',
    mfaNotes: 'Authentication architecture unknown. Vendor review required.',
    ssoNotes: 'Unknown. Vendor review required.',
    action: 'Contact Star Services for authentication and security documentation.',
  },
  {
    name: 'OSMOR', category: 'Operations',
    mfa: 'unknown', sso: 'unknown', risk: 'high', priority: 3, rollout: 'validate',
    mfaNotes: 'Vendor validation required.',
    ssoNotes: 'Unknown.',
    action: 'Contact OSMOR vendor for security documentation before Phase 2.',
  },
];

const SSO_PROVIDERS = [
  {
    name: 'Google Workspace', recommended: true,
    cost: 'Already paying (~$12–18/user/mo)',
    pros: ['Already in use at BrightPath', 'Supports SAML 2.0 + OAuth', 'Admin Console policy enforcement', 'No extra cost', 'Works with Slack, Zoho, Notion, and more'],
    cons: ['Not all vendors support Google SAML (e.g. QBO, Therap)', 'Requires Business Starter or higher'],
    verdict: 'Start here. Google is already your identity anchor — enforce SSO on every system that supports it before evaluating other tools.',
  },
  {
    name: 'Okta', recommended: false,
    cost: '~$6–8/user/mo (add-on)',
    pros: ['Best-in-class SSO breadth (7,000+ app integrations)', 'Advanced lifecycle management', 'Strong SCIM provisioning', 'Works even when vendors lack SAML'],
    cons: ['Additional monthly cost on top of GWS', 'Overkill for current scale', 'Requires dedicated IT admin to maintain'],
    verdict: 'Consider at 100+ users or if you expand to more complex SaaS tooling. Not needed now.',
  },
  {
    name: 'Microsoft Entra (Azure AD)', recommended: false,
    cost: '~$6/user/mo (P1 plan)',
    pros: ['Enterprise-grade lifecycle management', 'Strong conditional access policies', 'Works well if Microsoft 365 is in use'],
    cons: ['BrightPath is Google-first — switching IdP creates friction', 'Additional cost', 'Redundant with Google Workspace'],
    verdict: 'Not recommended. BrightPath is a Google-native shop. Adding Microsoft IdP creates dual-IdP complexity.',
  },
];

const SSO_COMPAT = [
  { name: 'Google Workspace',  sso: 'native',  protocol: 'Native',       notes: 'Google is the IdP — native auth.'                                          },
  { name: 'Slack',             sso: 'yes',     protocol: 'SAML 2.0',     notes: 'Pro or Business+ plan required.'                                           },
  { name: 'Zoho CRM',          sso: 'yes',     protocol: 'SAML 2.0',     notes: 'Configure via Zoho Directory. No extra cost.'                              },
  { name: 'Notion',            sso: 'upgrade', protocol: 'SAML 2.0',     notes: 'Business plan required ($15/user/mo).'                                     },
  { name: 'JazzHR',            sso: 'upgrade', protocol: 'SAML 2.0',     notes: 'Plan upgrade likely required. Confirm with vendor.'                        },
  { name: 'When I Work',       sso: 'upgrade', protocol: 'SAML 2.0',     notes: 'Enterprise tier may be required. Validate.'                                },
  { name: 'DocuSign',          sso: 'yes',     protocol: 'SAML 2.0',     notes: 'Google SAML SSO supported. Configure via DocuSign Admin → Identity Providers.' },
  { name: 'Calendly',          sso: 'partial', protocol: 'OAuth / SAML', notes: 'Google OAuth on all plans. SAML SSO requires Enterprise plan upgrade.'       },
  { name: 'QuickBooks Online', sso: 'no',      protocol: 'Intuit only',  notes: 'No Google SAML. Intuit SSO only. Enforce 2FA + dedicated credentials.'     },
  { name: 'Centrally HR',      sso: 'unknown', protocol: '?',            notes: 'Vendor validation required.'                                               },
  { name: 'Therap EHR',        sso: 'unknown', protocol: '?',            notes: 'No confirmed SAML. Vendor-managed auth. Priority validation.'              },
  { name: 'Star Services LMS',        sso: 'unknown', protocol: '?',        notes: 'Vendor review required.'                                                   },
  { name: 'OSMOR',                    sso: 'unknown', protocol: '?',        notes: 'Vendor review required.'                                                   },
  { name: 'BGS (Background Check)',   sso: 'unknown', protocol: '?',        notes: 'Vendor not confirmed. Review required — contains highly sensitive PII.'    },
  { name: 'E-Verify / I-9 Platform',  sso: 'no',      protocol: 'Gov only', notes: 'USCIS federal system — no Google SSO. Third-party I-9 platform SSO TBD.' },
];

const SSO_ST = {
  native:  { label: 'Native',           bg: '#dbeafe', fg: '#1e40af' },
  yes:     { label: 'Supported',        bg: '#dcfce7', fg: '#15803d' },
  upgrade: { label: 'Upgrade Required', bg: '#fef9c3', fg: '#854d0e' },
  no:      { label: 'Not Available',    bg: '#fee2e2', fg: '#b91c1c' },
  unknown: { label: 'Needs Validation', bg: '#f1f5f9', fg: '#64748b' },
};

const ONBOARDING_STEPS = [
  { step: 1, title: 'Create Google Workspace account',     owner: 'IT/Admin', detail: 'Admin Console → Users → Add User. Assign to correct OU (Leadership / Corporate / Direct Care / Contractor). Set temp password with forced reset on first login.' },
  { step: 2, title: 'Enroll in 2FA immediately',           owner: 'Employee', detail: 'Employee downloads Google Authenticator. Admin can enforce 2FA enrollment period (7 days) before access is granted.' },
  { step: 3, title: 'Provision SaaS app access via SSO',   owner: 'IT/Admin', detail: 'For Google SSO-enabled apps (Slack, Zoho, Notion): no separate account creation needed — employee signs in with Google. For non-SSO apps (QBO, Therap): create dedicated account and store in password manager.' },
  { step: 4, title: 'Assign role-based permissions',       owner: 'Manager + IT', detail: 'Confirm correct OU in Google Admin (controls app restrictions and policy). Assign CRM role in Zoho. Assign schedule in When I Work. Assign LMS courses in Star LMS.' },
  { step: 5, title: 'Send credential brief to employee',   owner: 'IT/Admin', detail: 'Share password manager vault entry (if applicable) via secure channel — NOT email. Provide Google account login link and 2FA setup guide.' },
  { step: 6, title: 'Log onboarding in access registry',   owner: 'IT/Admin', detail: 'Record: employee name, date, OU, apps provisioned, 2FA enrolled (Y/N), approving manager. Retain for audit purposes.' },
];

const OFFBOARDING_STEPS = [
  { step: 1, title: 'Suspend Google Workspace account',    owner: 'IT/Admin', time: 'Same day', urgent: true,  detail: 'Admin Console → Users → Suspend (do NOT delete immediately). Suspending revokes all Google SSO sessions across all connected apps instantly.' },
  { step: 2, title: 'Revoke non-SSO app access',           owner: 'IT/Admin', time: 'Same day', urgent: true,  detail: 'Manually revoke access in: QBO, Therap EHR, Centrally HR, JazzHR, any apps not using Google SSO. Check shared account use.' },
  { step: 3, title: 'Transfer owned files and data',       owner: 'Manager',  time: '24–48 hrs', urgent: false, detail: 'Google Admin → Data Transfer. Transfer Google Drive ownership to manager or shared drive. Archive Google Calendar.' },
  { step: 4, title: 'Rotate any shared credentials',       owner: 'IT/Admin', time: '24 hrs',   urgent: true,  detail: 'If employee had access to any shared logins (vendor portals, admin accounts), rotate those passwords immediately.' },
  { step: 5, title: 'Remove from Slack, Notion, When I Work', owner: 'IT/Admin', time: '24 hrs', urgent: false, detail: 'Deactivate in each SaaS tool. For SSO-enabled tools, Google suspension handles session revocation — but confirm app-level deactivation for compliance.' },
  { step: 6, title: 'Delete Google account after 30 days', owner: 'IT/Admin', time: '30 days',  urgent: false, detail: 'After data transfer is confirmed: Admin Console → Users → Delete. Document deletion date for audit log.' },
];

const RBAC_ROLES = [
  { role: 'Super Admin',      count: '3 (target)',  google: 'Super Admin OU',        apps: 'All systems, all settings',       example: 'Brandon Spears, Jeremy Garrigan, + 1 designated IT lead' },
  { role: 'IT / Admin',       count: '2–3',         google: 'Corporate OU',          apps: 'Admin Console (delegated), Slack admin, Zoho admin',  example: 'S360 team members during engagement' },
  { role: 'Leadership',       count: '~8–10',       google: 'Leadership OU',         apps: 'All SaaS read + write, QBO view, Therap admin',       example: 'Brandon, Stephanie, Lisa, Rick J., Nicole, Secellia' },
  { role: 'Operations / HR',  count: '~15–20',      google: 'Corporate OU',          apps: 'Zoho CRM, Centrally HR, JazzHR, When I Work',         example: 'Operations managers, HR staff' },
  { role: 'Direct Care Staff',count: '~150+',       google: 'Direct Care OU',        apps: 'Therap EHR, Star LMS, When I Work, Gmail only',       example: 'DSPs, program staff' },
  { role: 'Contractor',       count: 'Variable',    google: 'Contractors OU',        apps: 'Scoped access only — no CRM, no HR systems',          example: 'Vendors, temp staff' },
];

const CLEANUP_ITEMS = [
  { item: 'Reduce Super Admins from 7 to 3', risk: 'critical', why: 'Each Super Admin is a full breach surface. A compromised Super Admin account gives total control over all 219 users, all data, all connected systems.', fix: 'Demote Rick Joslin, Nicole Buechler, Secellia Riley, Stephanie Noll to delegated admin or standard roles. Keep: Brandon Spears, Jeremy Garrigan, + 1 designated IT lead.' },
  { item: 'Vendor shared admin credentials', risk: 'critical', why: 'Shared usernames/passwords for vendor portals (e.g. insurance systems, payroll) mean no individual accountability and cannot be revoked selectively when someone leaves.', fix: 'Audit all vendor portals. Create individual accounts where possible. Where shared accounts are unavoidable, store in a team password manager (1Password Teams) with one-click rotation.' },
  { item: 'Personal Google accounts in active use', risk: 'high', why: 'Any BrightPath data accessed or stored in a personal @gmail.com account is outside BrightPath\'s security perimeter, cannot be audited, and may not be recoverable if that person leaves.', fix: 'Identify users accessing BrightPath systems with personal accounts. Migrate to @brightpathddso.org accounts. Set up Workspace data loss prevention (DLP) alerts.' },
  { item: '2FA at 3% (7/219 users)',          risk: 'critical', why: 'Without 2FA, a single stolen password gives full account access. 212 of 219 accounts are one phishing email away from compromise.', fix: 'Phase A (May 15): enforce 2FA on all Super Admin + Leadership accounts. Phase B (May 27): enforce org-wide. See rollout timeline.' },
  { item: 'No phishing or DLP policies',      risk: 'high',    why: 'Without phishing-resistant email policies, staff receive malicious emails that impersonate Google, vendors, or leadership. No alert if someone forwards sensitive data externally.', fix: 'Enable Google Workspace Spam/Phishing filters (Advanced Phishing and Malware Protection). Set up DLP rules in Admin Console to flag external forwarding of sensitive content.' },
  { item: 'Inactive user accounts',           risk: 'medium',  why: 'Dormant accounts that haven\'t logged in for 30+ days are a persistent access risk — former staff or contractors may retain active credentials.', fix: 'Run Admin Console → Reports → User Activity. Suspend accounts inactive 30+ days. Confirm with manager before deletion.' },
];

// ── MFA Installation Guide ───────────────────────────────────────────────────
const MFA_GUIDE_STEPS = [
  { step: 1, title: 'Download Google Authenticator', body: 'On your phone, go to the App Store (iPhone) or Google Play Store (Android). Search "Google Authenticator" and install the official app by Google.' },
  { step: 2, title: 'Go to your Google Account security settings', body: 'On a computer, go to myaccount.google.com → Security → 2-Step Verification → Get Started. Sign in if prompted.' },
  { step: 3, title: 'Choose "Authenticator app"', body: 'Select "Authenticator app" as your 2-Step Verification method. Google will show you a QR code on screen.' },
  { step: 4, title: 'Scan the QR code', body: 'Open Google Authenticator on your phone. Tap the "+" button → "Scan a QR code." Point your camera at the QR code on your computer screen.' },
  { step: 5, title: 'Enter the 6-digit code to verify', body: 'Google Authenticator will display a 6-digit code that changes every 30 seconds. Enter this code on your computer to confirm setup.' },
  { step: 6, title: 'Save your backup codes', body: 'Google will offer backup codes. Download and store these somewhere safe (not in your email). These are your emergency access if you lose your phone.' },
  { step: 7, title: 'You\'re set up', body: 'From now on, after entering your password you\'ll be asked for the 6-digit code from the app. The code refreshes every 30 seconds — enter it before it expires.' },
];

// ── Components ───────────────────────────────────────────────────────────────

const SecBadge = ({ status, config }) => {
  const st = config[status] || config['unknown'];
  return (
    <span className="sec-badge" style={{ background: st.bg, color: st.fg }}>
      {st.icon && <span className="sec-badge-icon">{st.icon}</span>}
      {st.label}
    </span>
  );
};

const SecCard = ({ title, value, sub, accent, children }) => (
  <div className="sec-stat" style={{ '--sec-accent': accent }}>
    <div className="sec-stat-value">{value}</div>
    <div className="sec-stat-label">{title}</div>
    {sub && <div className="sec-stat-sub">{sub}</div>}
    {children}
  </div>
);

// ── MFA Heatmap Section ──────────────────────────────────────────────────────
const MFAHeatmap = () => {
  const [expanded, setExpanded] = React.useState(null);
  const [guideOpen, setGuideOpen] = React.useState(false);

  const full = SEC_SYSTEMS.filter((s) => s.mfa === 'full').length;
  const partial = SEC_SYSTEMS.filter((s) => s.mfa === 'partial').length;
  const unknown = SEC_SYSTEMS.filter((s) => s.mfa === 'unknown').length;
  const critical = SEC_SYSTEMS.filter((s) => s.risk === 'critical').length;

  return (
    <div className="sec-section">
      {/* Summary cards */}
      <div className="sec-stats-row">
        <SecCard title="Systems Reviewed" value={SEC_SYSTEMS.length} sub="Full inventory" accent="#6366f1" />
        <SecCard title="Full MFA Support" value={full} sub="Ready to enforce" accent="#10b981" />
        <SecCard title="Needs Validation" value={unknown} sub="Vendor contact required" accent="#94a3b8" />
        <SecCard title="Critical Risk" value={critical} sub="Immediate action needed" accent="#ef4444" />
      </div>

      {/* Heatmap */}
      <div className="sec-block">
        <div className="sec-block-head">
          <div>
            <div className="sec-block-eyebrow">GOOGLE AUTHENTICATOR COMPATIBILITY</div>
            <h3 className="sec-block-title">MFA Compatibility Heatmap</h3>
          </div>
          <button className="sec-guide-btn" onClick={() => setGuideOpen(!guideOpen)}>
            {guideOpen ? '✕ Close' : '📱 Installation Guide'}
          </button>
        </div>

        {guideOpen && (
          <div className="sec-guide">
            <div className="sec-guide-head">How to Set Up Google Authenticator — Step by Step</div>
            <div className="sec-guide-steps">
              {MFA_GUIDE_STEPS.map((g) => (
                <div key={g.step} className="sec-guide-step">
                  <div className="sec-guide-num">{g.step}</div>
                  <div>
                    <div className="sec-guide-title">{g.title}</div>
                    <div className="sec-guide-body">{g.body}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="sec-guide-note">
              💡 Having trouble? Contact Jeremy Garrigan or the S360 team — we'll walk you through it.
            </div>
          </div>
        )}

        <div className="sec-heatmap-wrap">
          <table className="sec-heatmap">
            <thead>
              <tr>
                <th className="sec-hm-system">System</th>
                <th className="sec-hm-cat">Category</th>
                <th className="sec-hm-cell">MFA Support</th>
                <th className="sec-hm-cell">SSO Support</th>
                <th className="sec-hm-cell">Risk Level</th>
                <th className="sec-hm-cell">Rollout Phase</th>
                <th className="sec-hm-action"></th>
              </tr>
            </thead>
            <tbody>
              {SEC_SYSTEMS.map((s) => (
                <React.Fragment key={s.name}>
                  <tr
                    className={`sec-hm-row ${expanded === s.name ? 'sec-hm-row-open' : ''}`}
                    onClick={() => setExpanded(expanded === s.name ? null : s.name)}>
                    <td className="sec-hm-system-cell">
                      <span className="sec-hm-name">{s.name}</span>
                    </td>
                    <td className="sec-hm-cat-cell">{s.category}</td>
                    <td className="sec-hm-cell-val">
                      <span className="sec-hm-dot" style={{ background: MFA_ST[s.mfa]?.dot }} />
                      <span className="sec-hm-label" style={{ color: MFA_ST[s.mfa]?.fg }}>{MFA_ST[s.mfa]?.label}</span>
                    </td>
                    <td className="sec-hm-cell-val">
                      <span className="sec-hm-dot" style={{ background: MFA_ST[s.sso]?.dot }} />
                      <span className="sec-hm-label" style={{ color: MFA_ST[s.sso]?.fg }}>{MFA_ST[s.sso]?.label}</span>
                    </td>
                    <td className="sec-hm-cell-val">
                      <span className="sec-badge sec-badge-sm" style={{ background: RISK_ST[s.risk]?.bg, color: RISK_ST[s.risk]?.fg }}>
                        {RISK_ST[s.risk]?.label}
                      </span>
                    </td>
                    <td className="sec-hm-cell-val">
                      <span className="sec-badge sec-badge-sm" style={{ background: ROLLOUT_ST[s.rollout]?.bg, color: ROLLOUT_ST[s.rollout]?.fg }}>
                        {ROLLOUT_ST[s.rollout]?.label}
                      </span>
                    </td>
                    <td className="sec-hm-chevron">{expanded === s.name ? '▲' : '▼'}</td>
                  </tr>
                  {expanded === s.name && (
                    <tr className="sec-hm-detail-row">
                      <td colSpan={7}>
                        <div className="sec-hm-detail">
                          <div className="sec-hm-detail-grid">
                            <div className="sec-hm-detail-item">
                              <div className="sec-hm-detail-label">MFA Notes</div>
                              <div className="sec-hm-detail-body">{s.mfaNotes}</div>
                            </div>
                            <div className="sec-hm-detail-item">
                              <div className="sec-hm-detail-label">SSO Notes</div>
                              <div className="sec-hm-detail-body">{s.ssoNotes}</div>
                            </div>
                            <div className="sec-hm-detail-item sec-hm-action-item">
                              <div className="sec-hm-detail-label">Recommended Action</div>
                              <div className="sec-hm-detail-body sec-hm-action-body">{s.action}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rollout Timeline */}
      <div className="sec-block">
        <div className="sec-block-head">
          <div>
            <div className="sec-block-eyebrow">PHASED ENFORCEMENT</div>
            <h3 className="sec-block-title">2FA Rollout Timeline</h3>
          </div>
        </div>
        <div className="sec-timeline">
          <div className="sec-tl-item sec-tl-now">
            <div className="sec-tl-marker">
              <div className="sec-tl-dot sec-tl-dot-active" />
              <div className="sec-tl-line" />
            </div>
            <div className="sec-tl-content">
              <div className="sec-tl-phase">Phase A — Admin &amp; Leadership</div>
              <div className="sec-tl-date">May 15, 2026 · This Friday</div>
              <div className="sec-tl-desc">Enforce 2FA on all 7 Super Admin accounts and all Leadership/Corporate users (~40 accounts). Google Admin Console enforcement deadline set to May 15. After this date, accounts without 2FA enrolled are blocked from signing in.</div>
              <div className="sec-tl-targets">
                <span className="sec-tl-tag">Google Workspace</span>
                <span className="sec-tl-tag">Slack</span>
                <span className="sec-tl-tag">Zoho CRM</span>
                <span className="sec-tl-tag">QuickBooks Online</span>
                <span className="sec-tl-tag">JazzHR</span>
                <span className="sec-tl-tag">Notion</span>
              </div>
              <div className="sec-tl-users">
                <strong>Target users:</strong> Leadership, HR, Operations, IT/Admin accounts (all 7 current Super Admins included)
              </div>
            </div>
          </div>

          <div className="sec-tl-item">
            <div className="sec-tl-marker">
              <div className="sec-tl-dot" />
              <div className="sec-tl-line" />
            </div>
            <div className="sec-tl-content">
              <div className="sec-tl-phase">Phase B — All Corporate Staff</div>
              <div className="sec-tl-date">May 26, 2026 · Two weeks out</div>
              <div className="sec-tl-desc">Enforce 2FA on all remaining corporate staff not covered in Phase A. Includes all non-direct-care employees. Requires OU structure to be in place so enforcement can be scoped by role.</div>
              <div className="sec-tl-targets">
                <span className="sec-tl-tag">When I Work</span>
                <span className="sec-tl-tag">Centrally HR</span>
                <span className="sec-tl-tag">All remaining GWS users (Corporate OU)</span>
              </div>
              <div className="sec-tl-users">
                <strong>Target users:</strong> All Corporate Staff (~40 users, excluding Direct Care)
              </div>
            </div>
          </div>

          <div className="sec-tl-item">
            <div className="sec-tl-marker">
              <div className="sec-tl-dot sec-tl-dot-future" />
              <div className="sec-tl-line sec-tl-line-last" />
            </div>
            <div className="sec-tl-content">
              <div className="sec-tl-phase">Phase C — Direct Care Frontline Staff</div>
              <div className="sec-tl-date">May 27 (or earlier) — June 9, 2026</div>
              <div className="sec-tl-desc">Full org enforcement. ~150+ direct care staff. Highest volume and highest change-management complexity. Requires: device readiness check (personal vs. org device), exception process for shared-device scenarios, help-desk runbook, and leadership comms at least 2 weeks prior.</div>
              <div className="sec-tl-targets">
                <span className="sec-tl-tag">Therap EHR</span>
                <span className="sec-tl-tag">Star Services LMS</span>
                <span className="sec-tl-tag">Google Workspace (Direct Care OU)</span>
              </div>
              <div className="sec-tl-users">
                <strong>Target users:</strong> Direct Care / DSP staff (~150+ users)
              </div>
            </div>
          </div>

          <div className="sec-tl-item">
            <div className="sec-tl-marker">
              <div className="sec-tl-dot sec-tl-dot-validate" />
            </div>
            <div className="sec-tl-content">
              <div className="sec-tl-phase">Vendor Validation — Parallel Track</div>
              <div className="sec-tl-date">Ongoing through May 31</div>
              <div className="sec-tl-desc">Contact Centrally HR, Therap EHR, Star LMS, and OSMOR to confirm MFA and SSO capabilities. Results determine final rollout scope and whether any systems need compensating controls.</div>
              <div className="sec-tl-targets">
                <span className="sec-tl-tag sec-tl-tag-gray">Centrally HR</span>
                <span className="sec-tl-tag sec-tl-tag-gray">Therap EHR</span>
                <span className="sec-tl-tag sec-tl-tag-gray">Star LMS</span>
                <span className="sec-tl-tag sec-tl-tag-gray">OSMOR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── SSO Strategy Section ─────────────────────────────────────────────────────
const SSOStrategy = () => {
  return (
    <div className="sec-section">
      <div className="sec-block">
        <div className="sec-block-head">
          <div>
            <div className="sec-block-eyebrow">IDENTITY PROVIDER COMPARISON</div>
            <h3 className="sec-block-title">SSO Provider Options</h3>
          </div>
        </div>
        <p className="sec-explainer">
          Single Sign-On (SSO) means employees log into one central account — your Identity Provider (IdP) — and that grants access to all connected apps. No separate passwords per system. When someone leaves, you suspend one account and access is revoked everywhere.
        </p>
        <div className="sec-provider-grid">
          {SSO_PROVIDERS.map((p) => (
            <div key={p.name} className={`sec-provider-card ${p.recommended ? 'sec-provider-recommended' : ''}`}>
              {p.recommended && <div className="sec-provider-rec-badge">✓ Recommended for BrightPath</div>}
              <div className="sec-provider-name">{p.name}</div>
              <div className="sec-provider-cost">{p.cost}</div>
              <div className="sec-provider-cols">
                <div>
                  <div className="sec-provider-col-label">Pros</div>
                  <ul className="sec-provider-list sec-provider-pros">
                    {p.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="sec-provider-col-label">Cons</div>
                  <ul className="sec-provider-list sec-provider-cons">
                    {p.cons.map((con, i) => <li key={i}>{con}</li>)}
                  </ul>
                </div>
              </div>
              <div className="sec-provider-verdict">{p.verdict}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sec-block">
        <div className="sec-block-head">
          <div>
            <div className="sec-block-eyebrow">CURRENT TECH STACK</div>
            <h3 className="sec-block-title">Google SSO Compatibility by System</h3>
          </div>
        </div>
        <p className="sec-explainer">
          Using Google Workspace as your IdP, here's exactly what works, what needs an upgrade, and what won't work with Google SSO.
        </p>
        <div className="sec-heatmap-wrap">
          <table className="sec-heatmap">
            <thead>
              <tr>
                <th className="sec-hm-system">System</th>
                <th className="sec-hm-cell">Google SSO Status</th>
                <th className="sec-hm-cell">Protocol</th>
                <th>Notes &amp; Action</th>
              </tr>
            </thead>
            <tbody>
              {SSO_COMPAT.map((s) => {
                const st = SSO_ST[s.sso];
                return (
                  <tr key={s.name} className="sec-hm-row">
                    <td className="sec-hm-system-cell"><span className="sec-hm-name">{s.name}</span></td>
                    <td className="sec-hm-cell-val">
                      <span className="sec-badge sec-badge-sm" style={{ background: st.bg, color: st.fg }}>{st.label}</span>
                    </td>
                    <td className="sec-hm-cell-val">
                      <span className="sec-protocol">{s.protocol}</span>
                    </td>
                    <td className="sec-hm-notes">{s.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="sec-sso-note">
          <strong>For systems that can't do Google SSO</strong> (QBO, Therap, and those needing validation): the fallback is strong unique passwords stored in a team password manager (1Password Teams or Bitwarden) combined with mandatory 2FA where available. This provides comparable protection without requiring SSO integration.
        </div>
      </div>
    </div>
  );
};

// ── Access Management Section ────────────────────────────────────────────────
const AccessMgmt = () => {
  const [openItem, setOpenItem] = React.useState(null);

  return (
    <div className="sec-section">
      {/* Onboarding */}
      <div className="sec-block">
        <div className="sec-block-head">
          <div>
            <div className="sec-block-eyebrow">STANDARD OPERATING PROCEDURE</div>
            <h3 className="sec-block-title">Employee Onboarding Process</h3>
          </div>
        </div>
        <div className="sec-process-steps">
          {ONBOARDING_STEPS.map((s) => (
            <div key={s.step} className="sec-process-step">
              <div className="sec-process-num">{s.step}</div>
              <div className="sec-process-content">
                <div className="sec-process-title">{s.title}</div>
                <div className="sec-process-owner">Owner: <strong>{s.owner}</strong></div>
                <div className="sec-process-detail">{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Offboarding */}
      <div className="sec-block">
        <div className="sec-block-head">
          <div>
            <div className="sec-block-eyebrow">STANDARD OPERATING PROCEDURE</div>
            <h3 className="sec-block-title">Employee Offboarding Process</h3>
          </div>
          <div className="sec-offboard-note">
            <span className="sec-urgent-tag">Time-sensitive</span> Steps 1–4 must happen the same day as separation.
          </div>
        </div>
        <div className="sec-process-steps">
          {OFFBOARDING_STEPS.map((s) => (
            <div key={s.step} className={`sec-process-step ${s.urgent ? 'sec-process-urgent' : ''}`}>
              <div className="sec-process-num">{s.step}</div>
              <div className="sec-process-content">
                <div className="sec-process-title">
                  {s.title}
                  {s.urgent && <span className="sec-process-time sec-process-time-urgent">{s.time}</span>}
                  {!s.urgent && <span className="sec-process-time">{s.time}</span>}
                </div>
                <div className="sec-process-owner">Owner: <strong>{s.owner}</strong></div>
                <div className="sec-process-detail">{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RBAC */}
      <div className="sec-block">
        <div className="sec-block-head">
          <div>
            <div className="sec-block-eyebrow">IDENTITY &amp; PERMISSIONS</div>
            <h3 className="sec-block-title">Role-Based Access Control (RBAC)</h3>
          </div>
        </div>
        <p className="sec-explainer">
          Organizing users into roles ensures people only access systems they need. In Google Workspace, this maps directly to Organizational Units (OUs) — which control policy enforcement, app restrictions, and 2FA requirements per group.
        </p>
        <div className="sec-heatmap-wrap">
          <table className="sec-heatmap">
            <thead>
              <tr>
                <th>Role</th>
                <th>Headcount</th>
                <th>Google OU</th>
                <th>App Access</th>
                <th>Examples</th>
              </tr>
            </thead>
            <tbody>
              {RBAC_ROLES.map((r) => (
                <tr key={r.role} className="sec-hm-row">
                  <td><strong>{r.role}</strong></td>
                  <td className="sec-hm-cat-cell">{r.count}</td>
                  <td className="sec-hm-cat-cell">{r.google}</td>
                  <td className="sec-hm-notes">{r.apps}</td>
                  <td className="sec-hm-notes" style={{ color: 'var(--text-3)', fontSize: '12px' }}>{r.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cleanup items */}
      <div className="sec-block">
        <div className="sec-block-head">
          <div>
            <div className="sec-block-eyebrow">IMMEDIATE PRIORITIES</div>
            <h3 className="sec-block-title">High-Priority Security Cleanup</h3>
          </div>
        </div>
        <p className="sec-explainer">
          These are active security gaps that exist today — not hypothetical future risks. Each item includes the specific risk it creates and the recommended fix.
        </p>
        <div className="sec-cleanup-list">
          {CLEANUP_ITEMS.map((c, i) => (
            <div key={i} className={`sec-cleanup-item sec-cleanup-${c.risk}`}>
              <div className="sec-cleanup-head" onClick={() => setOpenItem(openItem === i ? null : i)}>
                <div className="sec-cleanup-left">
                  <span className="sec-badge sec-badge-sm" style={{ background: RISK_ST[c.risk]?.bg, color: RISK_ST[c.risk]?.fg }}>{RISK_ST[c.risk]?.label}</span>
                  <span className="sec-cleanup-title">{c.item}</span>
                </div>
                <span className="sec-cleanup-chevron">{openItem === i ? '▲' : '▼'}</span>
              </div>
              {openItem === i && (
                <div className="sec-cleanup-body">
                  <div className="sec-cleanup-section">
                    <div className="sec-cleanup-section-label">Why this matters</div>
                    <div className="sec-cleanup-section-text">{c.why}</div>
                  </div>
                  <div className="sec-cleanup-section">
                    <div className="sec-cleanup-section-label">Recommended fix</div>
                    <div className="sec-cleanup-section-text sec-cleanup-fix">{c.fix}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── SecurityHub ──────────────────────────────────────────────────────────────
const SecurityHub = () => {
  const [section, setSection] = React.useState('mfa');

  const SECTIONS = [
    { id: 'mfa',    label: 'MFA',            sub: 'Heatmap + Rollout' },
    { id: 'sso',    label: 'SSO Strategy',   sub: 'Provider options' },
    { id: 'access', label: 'Access Mgmt',    sub: 'On/off + RBAC + Cleanup' },
  ];

  return (
    <div className="sec-hub">
      <div className="sec-hub-head">
        <div className="sec-hub-eyebrow">IT SECURITY · GOOGLE WORKSPACE</div>
        <h2 className="sec-hub-title">Security Hub</h2>
        <p className="sec-hub-sub">MFA enforcement, SSO strategy, and access management for BrightPath's 219-user Google Workspace environment.</p>
      </div>

      <nav className="sec-subnav">
        {SECTIONS.map((s) => (
          <button key={s.id} className={`sec-subnav-btn ${section === s.id ? 'sec-subnav-active' : ''}`}
                  onClick={() => setSection(s.id)}>
            <span className="sec-subnav-label">{s.label}</span>
            <span className="sec-subnav-sub">{s.sub}</span>
          </button>
        ))}
      </nav>

      {section === 'mfa'    && <MFAHeatmap />}
      {section === 'sso'    && <SSOStrategy />}
      {section === 'access' && <AccessMgmt />}
    </div>
  );
};

window.SecurityHub = SecurityHub;
