// security.jsx — Security Hub: MFA Heatmap, SSO Strategy, Access Management

// ── Google Workspace live stats ───────────────────────────────────────────────
// HYBRID: hardcoded now — replace with fetch() from Apps Script URL when CORS is open.
// Source: https://script.google.com/a/macros/brightpath-mn.com/s/AKfycbwUK1-hgH5VCAhGVLvdyw_p7a--T2NmZtfonZtmtDTkKc4J6GBaCXnx3Tehmb0HK6cr/exec
const GW_STATS = {
  activeAccounts: 220,
  twoFAEnabled:   41,
  noTwoFA:        179,
  coverage:       19,      // percent
  lastUpdated:    'May 18, 2026',
};

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
  inactive: { label: 'Not Active',       bg: '#f8fafc', fg: '#94a3b8' },
};

const SEC_SYSTEMS = [
  // ── Critical · Phase 1 ────────────────────────────────────────────────────
  {
    name: 'Google Workspace', category: 'Identity / Productivity',
    logo: 'workspace.google.com',
    mfa: 'full', sso: 'full', risk: 'critical', priority: 1, rollout: 'phase1',
    mfaNotes: '✅ Google Authenticator TOTP fully supported (any RFC 6238-compatible app). Also supports: Google Prompt (push), hardware security keys (FIDO2/passkeys), SMS/voice, and backup codes. Admins can enforce org-wide with a scheduled date, restrict methods (e.g., ban SMS to force app-only), and set grace periods for new users. All plans — no upgrade needed.',
    ssoNotes: 'Google IS the IdP. All Google apps (Gmail, Drive, Docs, Meet, Ads, Calendar) are natively covered. Any connected SAML/OAuth app inherits enforcement.',
    action: 'Admin Console → Security → Authentication → 2-Step Verification → set Enforcement to "On" or schedule a date. Choose "Any except verification codes via text, phone call" to force authenticator app or hardware key. Set enforcement date to May 15.',
  },
  {
    name: 'QuickBooks Online', category: 'Finance / Accounting',
    logo: 'quickbooks.intuit.com',
    mfa: 'partial', sso: 'none', risk: 'critical', priority: 1, rollout: 'phase1',
    mfaNotes: '⚠️ Google Authenticator TOTP supported (also Authy). Setup: Profile icon → Account Management → Sign In & Security → Two-step verification → toggle On → choose "Authenticator app" → scan QR code. CRITICAL GAP: Intuit does NOT allow admins to enforce MFA org-wide — it is per-user opt-in only. Users can disable it after setup. No admin toggle exists.',
    ssoNotes: 'Intuit does NOT support Google SAML SSO — Intuit has its own SSO only. No workaround available. Dedicated QBO credentials required for all users.',
    action: 'Send written policy to all QBO users requiring MFA enrollment. Each user: click profile icon → Account Management → Sign In & Security → Two-step verification → enable Google Authenticator. Document who is enrolled. Flag to cyber insurance provider if required. Consider IP allowlisting via your firewall as compensating control.',
  },
  {
    name: 'Bill.com', category: 'Finance / AP-AR',
    logo: 'bill.com',
    mfa: 'full', sso: 'partial', risk: 'critical', priority: 1, rollout: 'phase1',
    mfaNotes: '✅ Google Authenticator TOTP supported (also Authy, Okta Authenticator, Duo, YubiKey). MFA is PLATFORM-MANDATORY — all users must register at least one MFA method to access Bill.com at all. No opt-out. If a user is locked out, admin can reset: Settings → Users → [user] → Reset MFA.',
    ssoNotes: 'SSO available on Business and Enterprise plans via SAML 2.0. Confirm current plan — if on Essentials, upgrade needed for SSO.',
    action: 'MFA is already enforced by the platform — no admin action needed. Verify all active users have completed MFA enrollment. Admin: Settings → Users → check each user\'s MFA status. Reset any locked accounts via Settings → Users → [user] → Reset MFA. Audit access — restrict to finance team only.',
  },
  {
    name: 'DocuSign', category: 'Legal / eSignature',
    logo: 'docusign.com',
    mfa: 'partial', sso: 'full', risk: 'critical', priority: 1, rollout: 'phase1',
    mfaNotes: '✅ Google Authenticator TOTP supported (also Microsoft Authenticator). Options: SMS, phone call, authenticator app. Org-wide enforcement (Domain TSV) is available — but requires domain verification and is likely tied to Business Pro plan or higher. Per-user 2SV is available on all plans immediately.',
    ssoNotes: 'Google SAML SSO fully supported on Business Pro+ plans. Configure via DocuSign Admin → Identity Providers → add Google as SAML IdP.',
    action: 'Step 1 (immediate): DocuSign Admin → Users → enable Two-Step Verification for each sender and admin. Step 2 (recommended): DocuSign Admin → Domains → verify your domain → enable Domain-Enforced TSV for org-wide enforcement. Step 3: Configure Google SAML SSO (Admin → Identity Providers) — this covers all Federated ID users via Google MFA.',
  },
  // ── Critical · Validate First ─────────────────────────────────────────────
  {
    name: 'Therap EHR', category: 'Healthcare / EHR',
    logo: 'therapservices.net',
    mfa: 'partial', sso: 'unknown', risk: 'critical', priority: 1, rollout: 'validate',
    mfaNotes: '⚠️ SMS-based OTP confirmed as of 2024 — Therap sends a one-time code to user\'s phone. TOTP authenticator app (Google Authenticator) not confirmed. Admin CAN enforce org-wide: Provider Administration → Provider Preference → Two Factor Authentication → Enable. Enabling "Disable Two Factor Trust Device" forces OTP at every login. Activation requires submitting a request to Therap via their Issue Tracking system.',
    ssoNotes: 'No confirmed Google SAML SSO. Therap uses vendor-managed authentication. Contact Therap to ask about SAML support.',
    action: 'PRIORITY — PHI/HIPAA system. (1) Submit a request to Therap Issue Tracking to enable 2FA for your organization. (2) Confirm whether TOTP apps (Google Authenticator) are supported or only SMS. (3) Enable "Disable Two Factor Trust Device" to prevent login bypass. (4) Request audit logs showing login activity. (5) Conduct access review — only direct care managers should have login access.',
  },
  {
    name: 'Netstudy 2.0', category: 'HR / Background Checks',
    logo: 'mn.gov',
    mfa: 'unknown', sso: 'unknown', risk: 'critical', priority: 1, rollout: 'validate',
    mfaNotes: '❓ Minnesota DHS-operated government platform (netstudy2.dhs.state.mn.us). No public MFA documentation exists. Authentication settings are controlled by DHS, not individual provider organizations. Individual agency admins likely have no MFA configuration access.',
    ssoNotes: 'Government system — SSO not applicable. Access is via DHS-issued credentials.',
    action: 'PRIORITY — processes SSNs and criminal history (highest-sensitivity PII). (1) Contact MN DHS NETStudy 2.0 support to confirm current authentication requirements and whether MFA is available. (2) Audit who at BrightPath has a NETStudy 2.0 login — restrict to HR-authorized personnel only. (3) Confirm DHS data retention and deletion policies. (4) Document as a compensating-control gap until DHS confirms MFA availability.',
  },
  // ── High · Phase 1 ───────────────────────────────────────────────────────
  {
    name: 'Zoho CRM', category: 'CRM / Sales',
    logo: 'zoho.com',
    mfa: 'full', sso: 'full', risk: 'high', priority: 1, rollout: 'phase1',
    mfaNotes: '✅ Google Authenticator TOTP fully supported. Also supports Zoho OneAuth (push notification, biometric, passwordless QR), SMS OTP, and YubiKey. Org-wide enforcement via Zoho Directory: Zoho Directory → Security → Security Policies → [Policy] → Multi-Factor Authentication → Setup → select methods → Update Policy.',
    ssoNotes: 'Google SAML SSO fully supported via Zoho Directory. Zoho Directory → Settings → SAML → configure Google as IdP. Once enabled, all Zoho apps (CRM, Mail, etc.) authenticate through Google.',
    action: 'Step 1: Zoho Directory → Security → Security Policies → enable MFA enforcement. Step 2: configure Google SAML SSO via Zoho Directory → Settings → SAML → add Google Workspace as IdP. Once SSO is live, MFA is handled by Google Workspace admin policy — no per-app config needed.',
  },
  {
    name: 'JazzHR (ATS)', category: 'HR / Recruiting',
    logo: 'jazzhr.com',
    mfa: 'partial', sso: 'partial', risk: 'high', priority: 2, rollout: 'phase1',
    mfaNotes: '⚠️ JazzHR has a 2FA help article but details are behind authentication. Native TOTP (Google Authenticator) support is not publicly confirmed. Best available path: configure Google Workspace SAML SSO — this delegates authentication (and MFA enforcement) to Google, bypassing any JazzHR-native 2FA gaps entirely.',
    ssoNotes: 'Google Workspace SAML SSO supported on JazzHR Pro and higher plans. Configure via JazzHR Admin → Settings → Single Sign-On → SAML setup with Google Workspace.',
    action: 'Step 1: Check JazzHR Admin → Settings for a Two-Factor Authentication or Security section — if present, enable it. Step 2 (recommended): Configure Google Workspace SAML SSO via JazzHR Admin → Settings → Single Sign-On. This enforces Google MFA for all JazzHR logins. Contact JazzHR support to confirm plan eligibility for SSO.',
  },
  {
    name: 'Adobe Acrobat', category: 'Productivity / Documents',
    logo: 'adobe.com',
    mfa: 'partial', sso: 'full', risk: 'high', priority: 2, rollout: 'phase1',
    mfaNotes: '⚠️ TOTP authenticator apps fully supported for Adobe ID accounts. HOWEVER: admin org-wide MFA enforcement (Admin Console → Settings → Privacy & Security → Authentication Settings) is available on Enterprise plan ONLY — not available on Teams plan. Teams plan admins cannot force MFA for all users.',
    ssoNotes: 'Google SAML SSO (Federated Identity) available on Teams and Enterprise plans. Configure via Adobe Admin Console → Settings → Identity → Add Google as Federated IdP. Federated ID users authenticate through Google — inheriting Google\'s MFA enforcement.',
    action: 'Best path for Teams plan: Adobe Admin Console → Settings → Identity → set up Google Workspace Federated Identity (SAML). Once configured, all Federated ID users log in through Google, and Google\'s MFA policy applies automatically. This is more effective than per-user MFA in Adobe. If on Enterprise, also enable: Admin Console → Settings → Privacy & Security → Authentication Settings → enforce 2-step verification.',
  },
  {
    name: 'Google Ads', category: 'Marketing / Advertising',
    logo: 'ads.google.com',
    mfa: 'full', sso: 'native', risk: 'high', priority: 1, rollout: 'phase1',
    mfaNotes: '✅ Uses Google Account authentication — Google Authenticator, passkeys, hardware keys, Google Prompt all supported. Automatically covered when GWS 2FA is enforced org-wide. IMPORTANT UPDATE: As of April 21, 2026, Google Ads API requires 2SV for all users generating new OAuth 2.0 tokens — this affects Ads scripts and API integrations.',
    ssoNotes: 'Native Google auth — covered by GWS identity enforcement. No separate SSO configuration needed.',
    action: 'Covered by GWS 2FA enforcement (already done). Additional steps: (1) Google Ads → Admin → Access & Security — audit who has Manager/Admin/Standard access. Remove former employees immediately. (2) Check any API/script integrations that generate OAuth tokens — they must be owned by 2SV-enrolled accounts per April 2026 requirement.',
  },
  // ── High · Phase 2 ────────────────────────────────────────────────────────
  {
    name: 'LinkedIn Recruiter', category: 'HR / Recruiting',
    logo: 'linkedin.com',
    mfa: 'full', sso: 'partial', risk: 'high', priority: 2, rollout: 'phase2',
    mfaNotes: '✅ TOTP authenticator app supported — LinkedIn recommends it as the preferred method. Also supports SMS. PLATFORM-MANDATORY for all Recruiter license holders — users cannot access LinkedIn Recruiter without completing 2FA enrollment. No admin toggle needed.',
    ssoNotes: 'SSO available: LinkedIn Recruiter Admin → Account Settings → Single Sign-On. Organizations using Google Workspace SSO are automatically exempt from LinkedIn\'s 2FA requirement (SSO treated as equivalent security layer).',
    action: 'MFA is already platform-enforced — no admin action required. Users set up via: LinkedIn.com → Me → Settings & Privacy → Sign-in & Security → Two-step verification → enable Authenticator app. For centralized management, configure Google Workspace SSO via LinkedIn Recruiter Admin → Account Settings → Single Sign-On.',
  },
  {
    name: 'When I Work', category: 'Scheduling / Workforce',
    logo: 'wheniwork.com',
    mfa: 'partial', sso: 'partial', risk: 'high', priority: 2, rollout: 'phase2',
    mfaNotes: '⚠️ TOTP authenticator app supported — Google Authenticator, Authy, and LastPass Authenticator explicitly recommended. Also supports SMS for users without smartphones. LIMITATION: No admin org-wide enforcement toggle found. Per-user opt-in only. Once enabled by a user, 2SV triggers at every login and is also required when updating email or accessing payroll data.',
    ssoNotes: 'SSO may require enterprise tier. Contact When I Work to confirm whether Google Workspace SAML SSO is available on your current plan.',
    action: '(1) Send written policy to all manager and admin accounts requiring 2SV enrollment. (2) User path: Account → Settings → Security → Two-Step Verification → Enable → choose Authenticator app → scan QR code. (3) Contact When I Work support to confirm Google Workspace SSO availability — if available, configure it to enforce MFA via Google. (4) Limit admin account access to essential staff only.',
  },
  // ── High · Validate ────────────────────────────────────────────────────────
  {
    name: 'Centrally HR', category: 'HR / Payroll',
    logo: 'cbiz.com',
    mfa: 'unknown', sso: 'unknown', risk: 'high', priority: 2, rollout: 'validate',
    mfaNotes: '❓ CBIZ\'s related payroll product (Payentry) has documented 2FA, but Centrally HR-specific MFA documentation is not publicly available. No confirmation of TOTP/Google Authenticator support. Admin enforcement capability unknown. Login is at mycentrallyhr.cbiz.com.',
    ssoNotes: 'SSO capability unknown. Contact CBIZ HCM support at service.centrallyhr.com.',
    action: 'Contact CBIZ HCM support (service.centrallyhr.com): (1) Is TOTP/authenticator app MFA available? (2) Can admins enforce MFA org-wide? (3) Is SAML SSO supported with Google Workspace? (4) What plan tier is required for each? Also: log into your Centrally HR Admin console and look for Security Settings. Confirm E-Verify module status. Report back before Phase 2.',
  },
  {
    name: 'Zizzl', category: 'HR / Benefits',
    logo: 'zizzlhealth.com',
    mfa: 'unknown', sso: 'unknown', risk: 'high', priority: 2, rollout: 'validate',
    mfaNotes: '❓ No public MFA documentation found for Zizzl\'s benefits enrollment platform. Newer/smaller vendor — security documentation is not publicly indexed. Platform handles employee benefits PII.',
    ssoNotes: 'SSO support unknown. Vendor review required.',
    action: 'Contact Zizzl directly: (1) Is MFA supported? (2) What methods — TOTP/authenticator app? (3) Can admins enforce MFA for all users? (4) Is SAML SSO supported with Google Workspace? Request their security overview doc or SOC 2 report if available. Report back before Phase 2 rollout.',
  },
  {
    name: 'Star Services LMS', category: 'Learning / Training',
    logo: 'starsvcs.com',
    mfa: 'unknown', sso: 'unknown', risk: 'high', priority: 3, rollout: 'validate',
    mfaNotes: '❓ STAR Services uses a third-party LMS for training delivery but the specific LMS platform is not disclosed publicly. Most major LMS platforms (TalentLMS, Absorb, Docebo, etc.) support TOTP and admin enforcement — but this cannot be confirmed without identifying the underlying platform.',
    ssoNotes: 'Unknown — depends on which LMS platform STAR Services uses.',
    action: 'Contact STAR Services: (1) Which LMS platform do they use? (2) Does it support MFA — specifically TOTP/Google Authenticator? (3) Can MFA be enforced for all users? (4) Is Google Workspace SAML SSO supported? Once the LMS platform is identified, look up its specific MFA documentation.',
  },
  // ── Medium · Phase 2 ──────────────────────────────────────────────────────
  {
    name: 'Indeed', category: 'HR / Recruiting',
    logo: 'indeed.com',
    mfa: 'partial', sso: 'partial', risk: 'medium', priority: 3, rollout: 'phase2',
    mfaNotes: '⚠️ SMS-based 2FA is PLATFORM-MANDATORY for all employer accounts (rolled out as mandatory since Aug 2022) — no admin toggle needed. TOTP authenticator app support is unconfirmed from public sources; SMS appears to be the primary enforced method. Admins cannot choose the method or selectively apply it — Indeed controls enforcement at the platform level.',
    ssoNotes: 'Indeed supports Google Sign-In (OAuth) on employer accounts — not full SAML SSO. Best option: require all users to log in via Google Sign-In rather than email/password.',
    action: 'MFA (SMS) is already platform-enforced — no admin setup needed. Additional steps: (1) Require all users to connect their Google account to Indeed (Sign in with Google) to leverage Google\'s stronger authentication. (2) Account → Settings → Account Security to verify 2FA is active. (3) Audit who has access to your Indeed employer account — remove former employees.',
  },
  {
    name: 'Squarespace', category: 'Marketing / Website',
    logo: 'squarespace.com',
    mfa: 'partial', sso: 'partial', risk: 'medium', priority: 3, rollout: 'phase2',
    mfaNotes: '⚠️ TOTP authenticator app fully supported (Google Authenticator compatible). Also supports passkeys (Face ID, Touch ID, YubiKey — up to 5) and SMS (US, CA, AU, IE, UK), plus 8 backup codes. LIMITATION: Account owners cannot force contributors to enable 2FA — it is per-user opt-in only.',
    ssoNotes: 'Google account sign-in available (OAuth). No SAML SSO. Contributors can sign in with Google which inherits Google 2FA if enforced.',
    action: '(1) Enable 2FA on your Squarespace admin account: Account → Account Settings → Sign In → Two-Factor Authentication → Authenticator app → scan QR code. (2) Require all contributors to do the same by policy. User path is identical. (3) Require all contributors to use Google account sign-in (inherits Google MFA). (4) Audit contributors — remove anyone who no longer needs access. Limit to minimum necessary.',
  },
  {
    name: 'Canva', category: 'Design / Marketing',
    logo: 'canva.com',
    mfa: 'partial', sso: 'full', risk: 'low', priority: 3, rollout: 'phase2',
    mfaNotes: '⚠️ TOTP authenticator app supported for individual accounts — 6-digit code required at each login. Also supports SMS MFA. LIMITATION: Canva Teams plan has no admin toggle to enforce MFA for all team members. Canva Enterprise supports SSO/SAML with IdP-managed MFA enforcement.',
    ssoNotes: 'Google SAML SSO available on Teams plan. Configure via Canva Admin → Settings → Single Sign-On → SAML with Google Workspace. Once SSO is active, Canva MFA is disabled for SSO users — authentication (including MFA) handled by Google Workspace.',
    action: 'Best path: Canva Admin → Settings → Single Sign-On → configure SAML with Google Workspace as IdP. Once live, all team members log in through Google and Google\'s MFA policy applies automatically. For accounts not yet on SSO: Settings → Login → Multi-Factor Authentication → Authenticator app → Enable → scan QR code.',
  },
];

const SSO_PROVIDERS = [
  {
    name: 'Google Workspace', recommended: true,
    cost: 'Already paying (~$12–18/user/mo)',
    pros: ['Already in use at BrightPath', 'Supports SAML 2.0 + OAuth', 'Admin Console policy enforcement', 'No extra cost', 'Works with Zoho, DocuSign, Adobe, Canva, and more'],
    cons: ['Not all vendors support Google SAML (e.g. QBO, LinkedIn, Therap)', 'Requires Business Starter or higher'],
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
  // ── Native / Covered by Google ──────────────────────────────────────────
  { name: 'Google Workspace',  sso: 'native',  protocol: 'Native',        notes: 'Google is the IdP — Gmail, Drive, Docs, Meet, Ads all covered by GWS auth.' },
  { name: 'Google Ads',        sso: 'native',  protocol: 'Native',        notes: 'Google Account — covered by GWS 2FA enforcement. No extra config needed.'    },
  // ── Full SAML SSO Supported ────────────────────────────────────────────
  { name: 'Zoho CRM',          sso: 'yes',     protocol: 'SAML 2.0',      notes: 'Configure via Zoho Directory. No extra cost.'                               },
  { name: 'DocuSign',          sso: 'yes',     protocol: 'SAML 2.0',      notes: 'Google SAML SSO supported. Configure via DocuSign Admin → Identity Providers.' },
  { name: 'Adobe Acrobat',     sso: 'yes',     protocol: 'SAML 2.0',      notes: 'Google SAML via Adobe Admin Console. Teams or Enterprise plan required.'    },
  { name: 'Canva',             sso: 'yes',     protocol: 'OAuth / SAML',   notes: 'Google OAuth on all plans. SAML SSO on Teams/Enterprise plans.'             },
  // ── Upgrade Required ──────────────────────────────────────────────────
  { name: 'JazzHR',            sso: 'upgrade', protocol: 'SAML 2.0',      notes: 'Plan upgrade likely required. Confirm with vendor.'                         },
  { name: 'When I Work',       sso: 'upgrade', protocol: 'SAML 2.0',      notes: 'Enterprise tier may be required. Validate.'                                 },
  { name: 'Indeed',            sso: 'upgrade', protocol: 'OAuth',          notes: 'Google Sign-In available. Full SAML SSO not supported — OAuth is best available option.' },
  { name: 'Squarespace',       sso: 'upgrade', protocol: 'OAuth',          notes: 'Google account sign-in available. No SAML SSO support.'                    },
  { name: 'Bill.com',          sso: 'upgrade', protocol: 'SAML 2.0',       notes: 'SSO on Business/Enterprise plans. Confirm current plan tier.'              },
  // ── Not Available (Dedicated Credentials Required) ────────────────────
  { name: 'QuickBooks Online', sso: 'no',      protocol: 'Intuit only',    notes: 'No Google SAML. Intuit SSO only. Enforce 2FA + dedicated credentials.'     },
  { name: 'LinkedIn Recruiter',sso: 'no',      protocol: 'LinkedIn only',  notes: 'LinkedIn manages own auth. No Google SAML SSO. Enforce 2FA + work email.' },
  // ── Needs Validation ──────────────────────────────────────────────────
  { name: 'Centrally HR',      sso: 'unknown', protocol: '?',              notes: 'Vendor validation required. E-Verify is embedded but not currently in use.' },
  { name: 'Therap EHR',        sso: 'unknown', protocol: '?',              notes: 'No confirmed SAML. Vendor-managed auth. Priority validation.'               },
  { name: 'Netstudy 2.0',      sso: 'unknown', protocol: '?',              notes: 'Vendor validation required — handles highest-sensitivity PII in the stack.' },
  { name: 'Zizzl',             sso: 'unknown', protocol: '?',              notes: 'Benefits platform — vendor validation required.'                            },
  { name: 'Star Services LMS', sso: 'unknown', protocol: '?',              notes: 'Vendor review required.'                                                    },
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
  { step: 3, title: 'Provision SaaS app access via SSO',   owner: 'IT/Admin', detail: 'For Google SSO-enabled apps (Zoho CRM, DocuSign, Adobe, Canva): no separate account creation needed — employee signs in with Google. For non-SSO apps (QBO, Therap, LinkedIn): create dedicated account and store in password manager.' },
  { step: 4, title: 'Assign role-based permissions',       owner: 'Manager + IT', detail: 'Confirm correct OU in Google Admin (controls app restrictions and policy). Assign CRM role in Zoho. Assign schedule in When I Work. Assign LMS courses in Star LMS. Provision Adobe Acrobat and DocuSign as needed by role.' },
  { step: 5, title: 'Send credential brief to employee',   owner: 'IT/Admin', detail: 'Share password manager vault entry (if applicable) via secure channel — NOT email. Provide Google account login link and 2FA setup guide.' },
  { step: 6, title: 'Log onboarding in access registry',   owner: 'IT/Admin', detail: 'Record: employee name, date, OU, apps provisioned, 2FA enrolled (Y/N), approving manager. Retain for audit purposes.' },
];

const OFFBOARDING_STEPS = [
  { step: 1, title: 'Suspend Google Workspace account',    owner: 'IT/Admin', time: 'Same day', urgent: true,  detail: 'Admin Console → Users → Suspend (do NOT delete immediately). Suspending revokes all Google SSO sessions across all connected apps instantly.' },
  { step: 2, title: 'Revoke non-SSO app access',           owner: 'IT/Admin', time: 'Same day', urgent: true,  detail: 'Manually revoke access in: QBO, Therap EHR, Centrally HR, JazzHR, any apps not using Google SSO. Check shared account use.' },
  { step: 3, title: 'Transfer owned files and data',       owner: 'Manager',  time: '24–48 hrs', urgent: false, detail: 'Google Admin → Data Transfer. Transfer Google Drive ownership to manager or shared drive. Archive Google Calendar.' },
  { step: 4, title: 'Rotate any shared credentials',       owner: 'IT/Admin', time: '24 hrs',   urgent: true,  detail: 'If employee had access to any shared logins (vendor portals, admin accounts), rotate those passwords immediately.' },
  { step: 5, title: 'Deactivate in SaaS tools',            owner: 'IT/Admin', time: '24 hrs', urgent: false, detail: 'Deactivate in: When I Work, LinkedIn Recruiter, JazzHR, Indeed, Canva, DocuSign, Adobe Acrobat, Bill.com, and any other role-specific tools. For Google SSO-enabled tools, GWS suspension handles session revocation — but confirm app-level deactivation for compliance and audit.' },
  { step: 6, title: 'Delete Google account after 30 days', owner: 'IT/Admin', time: '30 days',  urgent: false, detail: 'After data transfer is confirmed: Admin Console → Users → Delete. Document deletion date for audit log.' },
];

const RBAC_ROLES = [
  { role: 'Super Admin',      count: '3 (target)',  google: 'Super Admin OU',        apps: 'All systems, all settings',       example: 'Brandon Spears, Jeremy Garrigan, + 1 designated IT lead' },
  { role: 'IT / Admin',       count: '2–3',         google: 'Corporate OU',          apps: 'Admin Console (delegated), Zoho admin, Adobe admin',  example: 'S360 team members during engagement' },
  { role: 'Leadership',       count: '~8–10',       google: 'Leadership OU',         apps: 'All SaaS read + write, QBO view, Therap admin',       example: 'Brandon, Stephanie, Lisa, Rick J., Nicole, Secellia' },
  { role: 'Operations / HR',  count: '~15–20',      google: 'Corporate OU',          apps: 'Zoho CRM, Centrally HR, JazzHR, When I Work',         example: 'Operations managers, HR staff' },
  { role: 'Direct Care Staff',count: '~150+',       google: 'Direct Care OU',        apps: 'Therap EHR, Star LMS, When I Work, Gmail only',       example: 'DSPs, program staff' },
  { role: 'Contractor',       count: 'Variable',    google: 'Contractors OU',        apps: 'Scoped access only — no CRM, no HR systems',          example: 'Vendors, temp staff' },
];

const CLEANUP_ITEMS = [
  { item: 'Reduce Super Admins from 7 to 3', risk: 'critical', why: 'Each Super Admin is a full breach surface. A compromised Super Admin account gives total control over all 219 users, all data, all connected systems.', fix: 'Demote Rick Joslin, Nicole Buechler, Secellia Riley, Stephanie Noll to delegated admin or standard roles. Keep: Brandon Spears, Jeremy Garrigan, + 1 designated IT lead.' },
  { item: 'Vendor shared admin credentials', risk: 'critical', why: 'Shared usernames/passwords for vendor portals (e.g. insurance systems, payroll) mean no individual accountability and cannot be revoked selectively when someone leaves.', fix: 'Audit all vendor portals. Create individual accounts where possible. Where shared accounts are unavoidable, store in a team password manager (1Password Teams) with one-click rotation.' },
  { item: 'Personal Google accounts in active use', risk: 'high', why: 'Any BrightPath data accessed or stored in a personal @gmail.com account is outside BrightPath\'s security perimeter, cannot be audited, and may not be recoverable if that person leaves.', fix: 'Identify users accessing BrightPath systems with personal accounts. Migrate to @brightpath-mn.com accounts. Set up Workspace data loss prevention (DLP) alerts.' },
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

// ── Generic inline picker (MFA / SSO / Risk) ────────────────────────────────
const SecPicker = ({ value, options, config, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const cur = config[value] || config['unknown'] || Object.values(config)[0];
  return (
    <div className="sec-picker" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button className="sec-picker-trigger" onClick={() => setOpen(!open)}
              style={{ background: cur.bg, color: cur.fg }}>
        {cur.dot && <span className="sec-picker-dot" style={{ background: cur.dot }} />}
        <span>{cur.label}</span>
        <span className="sec-picker-arrow">▾</span>
      </button>
      {open && (
        <div className="sec-picker-menu">
          {options.map((opt) => {
            const st = config[opt];
            if (!st) return null;
            return (
              <button key={opt}
                className={`sec-picker-item ${value === opt ? 'sec-picker-item-on' : ''}`}
                onClick={() => { onChange(opt); setOpen(false); }}>
                {st.dot && <span className="sec-picker-dot" style={{ background: st.dot }} />}
                <span>{st.label}</span>
                {value === opt && <span className="sec-picker-check">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SecAvatar = ({ pid, size = 22 }) => {
  const p = window.PEOPLE[pid];
  if (!p) return null;
  const bg = p.org === 's360' ? '#0f172a' : '#7c2d12';
  return (
    <span className="avatar" title={`${p.name} · ${p.role}`}
          style={{ width: size, height: size, fontSize: size * 0.4, background: bg }}>
      {p.initials}
    </span>
  );
};

const SecAvatarStack = ({ ids, size = 22 }) => {
  if (!ids || !ids.length) return <span className="avatar-empty">—</span>;
  return (
    <div className="avatar-stack">
      {ids.map((pid) => <SecAvatar key={pid} pid={pid} size={size} />)}
    </div>
  );
};

const SecOwnerPicker = ({ owners, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const selected = owners || [];
  const toggle = (pid) => {
    const next = selected.includes(pid) ? selected.filter((x) => x !== pid) : [...selected, pid];
    onChange(next);
  };

  return (
    <div className="owner-picker-wrap sec-owner-picker" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button className="owner-picker-trigger" onClick={() => setOpen(!open)}>
        {selected.length > 0
          ? <SecAvatarStack ids={selected} size={22} />
          : <span className="avatar-empty owner-picker-add">+ Add</span>}
      </button>
      {open && (
        <div className="owner-picker-menu">
          <div className="owner-picker-group-label">S360</div>
          {window.PEOPLE_LIST.filter((p) => p.org === 's360').map((p) => {
            const checked = selected.includes(p.id);
            return (
              <button key={p.id} className={`owner-picker-item ${checked ? 'owner-picker-item-on' : ''}`}
                      onClick={() => toggle(p.id)}>
                <span className="avatar" style={{ width: 22, height: 22, fontSize: 8.8, background: '#0f172a' }}>{p.initials}</span>
                <span className="owner-picker-name">{p.name}</span>
                {checked && <span className="owner-picker-check">✓</span>}
              </button>
            );
          })}
          <div className="owner-picker-group-label" style={{ marginTop: 4 }}>BrightPath</div>
          {window.PEOPLE_LIST.filter((p) => p.org === 'brightpath').map((p) => {
            const checked = selected.includes(p.id);
            return (
              <button key={p.id} className={`owner-picker-item ${checked ? 'owner-picker-item-on' : ''}`}
                      onClick={() => toggle(p.id)}>
                <span className="avatar" style={{ width: 22, height: 22, fontSize: 8.8, background: '#7c2d12' }}>{p.initials}</span>
                <span className="owner-picker-name">{p.name}</span>
                {checked && <span className="owner-picker-check">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SecBadge = ({ status, config }) => {
  const st = config[status] || config['unknown'];
  return (
    <span className="sec-badge" style={{ background: st.bg, color: st.fg }}>
      {st.icon && <span className="sec-badge-icon">{st.icon}</span>}
      {st.label}
    </span>
  );
};

const SecCard = ({ title, value, sub, accent, children, onClick }) => (
  <div className={`sec-stat${onClick ? ' sec-stat-clickable' : ''}`}
       style={{ '--sec-accent': accent }}
       onClick={onClick}
       title={onClick ? `Click to view ${title}` : undefined}>
    <div className="sec-stat-value">{value}</div>
    <div className="sec-stat-label">{title}</div>
    {sub && <div className="sec-stat-sub">{sub}</div>}
    {children}
    {onClick && <div className="sec-stat-click-hint">View list →</div>}
  </div>
);

// ── Google Workspace User Modal ───────────────────────────────────────────────
// null = "not a 2FA method" → show as "—" in the method column
// Exported as window.GW_METHOD_LABELS so team-compliance.jsx can share it
const GW_METHOD_LABELS = {
  // ── Actual values returned by login_challenge_method ──────────────────────
  device_prompt:             { label: 'Phone Prompt',      icon: '🔔', cls: 'gw-method-prompt' },
  idv_preregistered_phone:   { label: 'Phone Prompt',      icon: '🔔', cls: 'gw-method-prompt' },
  idv_totp:                  { label: 'Authenticator App', icon: '📱', cls: 'gw-method-app' },
  idv_backup_code:           { label: 'Backup Code',       icon: '🗝',  cls: 'gw-method-backup' },
  internal_two_factor:       { label: 'Google Prompt',     icon: '🔔', cls: 'gw-method-prompt' },
  security_key:              { label: 'Security Key',      icon: '🔑', cls: 'gw-method-key' },
  passkey:                   { label: 'Passkey',           icon: '🔐', cls: 'gw-method-key' },
  // ── Legacy / 2sv_enroll event values ──────────────────────────────────────
  google_authenticator:      { label: 'Authenticator App', icon: '📱', cls: 'gw-method-app' },
  authenticator_app:         { label: 'Authenticator App', icon: '📱', cls: 'gw-method-app' },
  totp:                      { label: 'Authenticator App', icon: '📱', cls: 'gw-method-app' },
  sms:                       { label: 'SMS / Text',        icon: '💬', cls: 'gw-method-sms' },
  phone:                     { label: 'Phone Call',        icon: '📞', cls: 'gw-method-sms' },
  google_prompt:             { label: 'Google Prompt',     icon: '🔔', cls: 'gw-method-prompt' },
  android_device:            { label: 'Phone Prompt',      icon: '🔔', cls: 'gw-method-prompt' },
  ios_device:                { label: 'Phone Prompt',      icon: '🔔', cls: 'gw-method-prompt' },
  backup_code:               { label: 'Backup Code',       icon: '🗝',  cls: 'gw-method-backup' },
  // ── Not 2FA methods — hide them (null = show as —) ────────────────────────
  password:                  null,  // password-only login, not a 2FA challenge
  none:                      null,  // no challenge presented
  reauth:                    null,  // re-authentication (re-enter password), not 2FA
  google_password:           null,  // password challenge (first factor only)
  'google password':         null,  // same, space-separated variant from API
  reauthentication:          null,  // variant spelling
};

const GWUserModal = ({ users, filter, search, onSearchChange, onClose, methodMap = {}, methodsStatus = 'idle', onReconnect }) => {
  let shown = filter === 'enabled' ? users.filter(u => u.isEnrolledIn2Sv)
            : filter === 'no2fa'   ? users.filter(u => !u.isEnrolledIn2Sv)
            : users;

  if (search) {
    const q = search.toLowerCase();
    shown = shown.filter(u =>
      (u.name?.fullName || '').toLowerCase().includes(q) ||
      (u.primaryEmail   || '').toLowerCase().includes(q) ||
      (u.orgUnitPath    || '').toLowerCase().includes(q)
    );
  }

  // For 'all' / 'coverage': sort no-2FA users to the top
  if (filter === 'all' || filter === 'coverage') {
    shown = [...shown].sort((a, b) => {
      if (a.isEnrolledIn2Sv !== b.isEnrolledIn2Sv) return a.isEnrolledIn2Sv ? 1 : -1;
      return (a.name?.fullName || '').localeCompare(b.name?.fullName || '');
    });
  }

  const fmtDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    if (dt.getFullYear() < 2000) return 'Never';
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  const titles = {
    all:      'All Active Accounts',
    enabled:  '2FA Enabled Users',
    no2fa:    'Users Without 2FA',
    coverage: '2FA Coverage — All Users',
  };

  return (
    <div className="gw-modal-backdrop" onClick={onClose}>
      <div className="gw-modal" onClick={e => e.stopPropagation()}>
        <div className="gw-modal-head">
          <div className="gw-modal-head-left">
            <div className="gw-modal-eyebrow">GOOGLE WORKSPACE · BRIGHTPATH-MN.COM</div>
            <h3 className="gw-modal-title">{titles[filter] || 'Users'}</h3>
            <div className="gw-modal-count">
              {shown.length} user{shown.length !== 1 ? 's' : ''}
              {search && <span className="gw-modal-count-search"> matching "{search}"</span>}
            </div>
          </div>
          <button className="gw-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="gw-modal-search-wrap">
          <span className="gw-modal-search-icon">⌕</span>
          <input
            className="gw-modal-search"
            placeholder="Search by name, email, or org unit…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            autoFocus
          />
          {search && (
            <button className="gw-modal-search-clear" onClick={() => onSearchChange('')}>✕</button>
          )}
        </div>

        <div className="gw-modal-table-wrap">
          {shown.length === 0 ? (
            <div className="gw-modal-empty">No users match your search.</div>
          ) : (
            <table className="gw-modal-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Org Unit</th>
                  <th>Last Login</th>
                  <th>2FA Status</th>
                  <th>2FA Method</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {shown.map(u => {
                  // Collect all detected methods for this user (new: array; old cache: string)
                  const rawMethods = Array.isArray(methodMap[u.primaryEmail])
                    ? methodMap[u.primaryEmail]
                    : methodMap[u.primaryEmail] ? [methodMap[u.primaryEmail]] : [];
                  // Resolve labels, drop null entries (non-2FA values like 'password')
                  const methodInfos = rawMethods
                    .map(raw => {
                      const lk = GW_METHOD_LABELS[raw.toLowerCase()];
                      if (lk === null) return null;
                      return lk !== undefined ? lk : { label: raw, icon: '❓', cls: 'gw-method-other' };
                    })
                    .filter(Boolean);
                  return (
                  <tr key={u.id || u.primaryEmail} className={!u.isEnrolledIn2Sv ? 'gw-row-no2fa' : ''}>
                    <td className="gw-user-name">{u.name?.fullName || '—'}</td>
                    <td className="gw-user-email">{u.primaryEmail}</td>
                    <td className="gw-user-ou">{(u.orgUnitPath || '/').replace(/^\//, '') || 'Root'}</td>
                    <td className="gw-user-login">{fmtDate(u.lastLoginTime)}</td>
                    <td>
                      {u.isEnrolledIn2Sv
                        ? <span className="gw-2fa-on">✓ Enabled</span>
                        : <span className="gw-2fa-off">⚠ Not set</span>}
                    </td>
                    <td>
                      {u.isEnrolledIn2Sv ? (
                        methodInfos.length > 0
                          ? <div className="gw-method-badges">
                              {methodInfos.map((mi, i) => (
                                <span key={i} className={`gw-method-badge ${mi.cls}`}>{mi.icon} {mi.label}</span>
                              ))}
                            </div>
                          : methodsStatus === 'loading'
                            ? <span className="gw-method-loading">Loading…</span>
                            : <span className="gw-method-badge gw-method-other" title="2FA enabled but method not detected in recent login events">❓ Unknown</span>
                      ) : (
                        <span className="gw-method-na" style={{ color: '#94a3b8', fontSize: 12 }}>Not enrolled</span>
                      )}
                    </td>
                    <td>
                      {u.isAdmin
                        ? <span className="gw-role-badge gw-role-admin">Super Admin</span>
                        : u.isDelegatedAdmin
                        ? <span className="gw-role-badge gw-role-delegated">Delegated</span>
                        : <span className="gw-role-user">User</span>}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="gw-modal-foot">
          <div className="gw-modal-foot-left">
            <span className="gw-modal-foot-note">
              Live data · Google Workspace Admin · {users.length} total active account{users.length !== 1 ? 's' : ''}
            </span>
            {methodsStatus === 'scope_denied' && (
              <span className="gw-methods-notice gw-methods-notice-warn">
                ⚠️ 2FA method data needs the Admin Reports scope.
                <button className="gw-methods-reconnect" onClick={onReconnect}>Reconnect to enable →</button>
              </span>
            )}
            {methodsStatus === 'no_data' && (
              <span className="gw-methods-notice">
                ℹ️ No recent 2FA login activity found — users may not have logged in within the last 30 days, or the Reports API data hasn't populated yet. Try reconnecting.
                <button className="gw-methods-reconnect" onClick={onReconnect}>Reconnect →</button>
              </span>
            )}
            {methodsStatus === 'error' && (
              <span className="gw-methods-notice gw-methods-notice-warn">
                ⚠️ Could not load method data.
                <button className="gw-methods-reconnect" onClick={onReconnect}>Retry →</button>
              </span>
            )}
            {methodsStatus === 'loading' && (
              <span className="gw-methods-notice">⟳ Loading 2FA method data…</span>
            )}
            {methodsStatus === 'loaded' && (
              <span className="gw-methods-notice gw-methods-notice-ok">✓ 2FA method data loaded</span>
            )}
          </div>
          <button className="gw-modal-foot-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ── MFA Heatmap Section ──────────────────────────────────────────────────────
const MFAHeatmap = ({ secOwners, onSecOwnerChange, secOverrides, onSecOverrideChange, filterOwner, userSecSystems, onAddUserSystem, onDeleteUserSystem }) => {
  const [expanded, setExpanded] = React.useState(null);
  const [guideOpen, setGuideOpen] = React.useState(false);
  const [editingRow, setEditingRow] = React.useState(null);
  const [editDraft, setEditDraft] = React.useState({});
  const [addingMFA, setAddingMFA] = React.useState(false);
  const [addDraft,  setAddDraft]  = React.useState({ name: '', category: '', mfa: 'unknown', sso: 'unknown', risk: 'medium', rollout: 'validate' });

  // Merge hardcoded + user-added systems
  const allMFASystems = [
    ...SEC_SYSTEMS,
    ...(userSecSystems || []).filter(s => s.system_type === 'mfa').map(s => ({
      name: s.name, category: s.category || '', mfa: s.mfa_status || 'unknown',
      sso: s.sso_status || 'unknown', risk: s.risk_level || 'medium',
      rollout: s.rollout || 'validate', mfaNotes: s.mfa_notes || '',
      ssoNotes: s.sso_notes || '', action: s.action_text || '',
      priority: 99, _userAdded: true, _id: s.id,
    })),
  ];

  const saveMFASystem = () => {
    if (!addDraft.name.trim()) return;
    const row = {
      id: 'usr-' + Date.now(), system_type: 'mfa',
      name: addDraft.name.trim(), category: addDraft.category.trim(),
      mfa_status: addDraft.mfa, sso_status: addDraft.sso,
      risk_level: addDraft.risk, rollout: addDraft.rollout,
      mfa_notes: '', sso_notes: '', action_text: '',
    };
    onAddUserSystem(row);
    setAddingMFA(false);
    setAddDraft({ name: '', category: '', mfa: 'unknown', sso: 'unknown', risk: 'medium', rollout: 'validate' });
  };

  // ── Google Admin OAuth ─────────────────────────────────────────────────────
  const GW_CLIENT_ID = '1011406832233-gg1o0slnva79dem8m8ukei0ovi2f2tsi.apps.googleusercontent.com';
  const [gwToken,   setGwToken]   = React.useState(null);
  const [gwUsers,   setGwUsers]   = React.useState([]);
  const [gwLoading, setGwLoading] = React.useState(false);
  const [gwModal,   setGwModal]   = React.useState(null); // null | 'all' | 'enabled' | 'no2fa' | 'coverage'
  const [gwError,   setGwError]   = React.useState(null);
  const [gwSearch,  setGwSearch]  = React.useState('');
  const [methodMap,     setMethodMap]     = React.useState({});   // email → raw method string
  const [methodsStatus, setMethodsStatus] = React.useState('idle'); // idle|loading|loaded|scope_denied|no_data|error
  const [cacheInfo,     setCacheInfo]     = React.useState(null);  // { at, by } — last Supabase sync
  const [cacheLoadErr,  setCacheLoadErr]  = React.useState(null);  // visible load error
  const gwUsersRef    = React.useRef([]);   // captures fetched users for cache save
  const methodMapRef  = React.useRef({});   // captures fetched methods for cache save

  // Load cached GW data on mount — visible to ALL users without Google login
  React.useEffect(() => {
    setCacheLoadErr(null);
    window.SupabaseDB.loadGWCache()
      .then((cache) => {
        if (!cache) {
          // Table exists but no row yet — admin hasn't synced
          return;
        }
        const { users, methodMap: mm } = cache.data || {};
        if (users?.length) {
          setGwUsers(users);
          setCacheInfo({ at: cache.updated_at, by: cache.updated_by });
        }
        if (mm && Object.keys(mm).length) {
          // Normalize: old cache stored strings; new format stores string[]. Upgrade in place.
          const normalized = {};
          for (const [k, v] of Object.entries(mm)) normalized[k] = Array.isArray(v) ? v : [v];
          setMethodMap(normalized);
          setMethodsStatus('loaded');
        } else {
          // Cache loaded but no method data — admin needs to re-sync
          setMethodsStatus('no_data');
        }
      })
      .catch((err) => {
        console.error('[GW Cache load]', err);
        setCacheLoadErr(err.message || 'Could not load cached data from Supabase.');
      });
  }, []);

  const connectGoogle = () => {
    if (!window.google?.accounts?.oauth2) {
      setGwError('Google Identity Services not loaded yet — please refresh the page and try again.');
      return;
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GW_CLIENT_ID,
      scope: [
        'https://www.googleapis.com/auth/admin.directory.user.readonly',
        'https://www.googleapis.com/auth/admin.reports.usage.readonly',
        'https://www.googleapis.com/auth/admin.reports.audit.readonly',
      ].join(' '),
      callback: async (resp) => {
        if (resp.error) { setGwError(`Authentication error: ${resp.error}`); return; }
        setGwToken(resp.access_token);
        await Promise.all([fetchGWUsers(resp.access_token), fetchGWMethods(resp.access_token)]);
        // Save slim user list + method map to Supabase — all other viewers see this immediately
        const users = gwUsersRef.current;
        if (users.length > 0) {
          const slim = users.map(u => ({
            id: u.id, primaryEmail: u.primaryEmail,
            name: { fullName: u.name?.fullName },
            orgUnitPath: u.orgUnitPath, lastLoginTime: u.lastLoginTime,
            isEnrolledIn2Sv: u.isEnrolledIn2Sv, isEnforced2Sv: u.isEnforced2Sv,
            isAdmin: u.isAdmin, isDelegatedAdmin: u.isDelegatedAdmin, suspended: u.suspended,
          }));
          const syncedBy = resp.email || 'Admin';
          window.SupabaseDB.saveGWCache(slim, methodMapRef.current, syncedBy).catch(console.error);
          setCacheInfo({ at: new Date().toISOString(), by: syncedBy });
        }
      },
    });
    client.requestAccessToken();
  };

  const fetchGWUsers = async (token) => {
    setGwLoading(true);
    setGwError(null);
    try {
      let allUsers = [];
      let pageToken = null;
      do {
        const params = new URLSearchParams({
          domain: 'brightpath-mn.com',
          maxResults: '500',
          orderBy: 'email',
          ...(pageToken && { pageToken }),
        });
        const res = await fetch(
          `https://admin.googleapis.com/admin/directory/v1/users?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          const e = await res.json();
          throw new Error(e.error?.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        allUsers = [...allUsers, ...(data.users || [])];
        pageToken = data.nextPageToken || null;
      } while (pageToken);
      setGwUsers(allUsers);
      gwUsersRef.current = allUsers;
    } catch (e) {
      setGwError(e.message);
    } finally {
      setGwLoading(false);
    }
  };

  const fetchGWMethods = async (token) => {
    setMethodsStatus('loading');

    // ── Core fetch: query login audit events, return items array ─────────────
    const fetchLoginItems = async (extraParams, cap = 5000) => {
      let allItems = [];
      let pageToken = null;
      do {
        const params = new URLSearchParams({
          maxResults: '1000',
          ...extraParams,
          ...(pageToken && { pageToken }),
        });
        const res = await fetch(
          `https://admin.googleapis.com/admin/reports/v1/activity/users/all/applications/login?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 403) return { scopeDenied: true, items: [] };
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.warn('[GW Methods] HTTP', res.status, txt.slice(0, 200));
          return { items: allItems };
        }
        const data = await res.json();
        allItems = [...allItems, ...(data.items || [])];
        pageToken = data.nextPageToken || null;
        if (allItems.length >= cap) break;
      } while (pageToken);
      return { items: allItems };
    };

    // ── Extract email→methods map: collect ALL unique 2FA methods seen per user ─
    const SKIP_VALUES = new Set(['password', 'none', '']);
    const buildMap = (items, paramNames) => {
      const sets = {};  // email → Set<string> of all unique method values
      for (const item of items) {
        const email = item.actor?.email;
        if (!email) continue;
        for (const event of (item.events || [])) {
          for (const pName of paramNames) {
            const mp = (event.parameters || []).find(p => p.name === pName);
            const val = mp?.value || mp?.stringValue || mp?.multiValue?.[0];
            if (val && !SKIP_VALUES.has(val.toLowerCase())) {
              if (!sets[email]) sets[email] = new Set();
              sets[email].add(val.toLowerCase());
            }
          }
        }
      }
      // Convert Sets → arrays
      const map = {};
      for (const [email, set] of Object.entries(sets)) map[email] = [...set];
      return map;
    };

    // ── Diagnostic: log all unique event/param names seen in a batch ─────────
    const diagnose = (label, items) => {
      const eventNames  = [...new Set(items.flatMap(i => (i.events || []).map(e => e.name)))];
      const paramNames  = [...new Set(items.flatMap(i =>
        (i.events || []).flatMap(e => (e.parameters || []).map(p => p.name))
      ))];
      console.log(`[GW Methods] ${label} — ${items.length} items | events: [${eventNames.join(', ')}] | params: [${paramNames.join(', ')}]`);
    };

    try {
      const sevenDaysAgo  = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixMonthsAgo  = new Date(); sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

      // ── Step 1: Broad scan — ALL login events last 7 days (no eventName filter)
      // This shows us exactly what event names + param names Google sends for this org.
      console.log('[GW Methods] Step 1: broad scan, all login events (last 7d)');
      const broad = await fetchLoginItems({ startTime: sevenDaysAgo.toISOString() });
      if (broad.scopeDenied) { setMethodsStatus('scope_denied'); return; }
      diagnose('broad-7d', broad.items);

      // Try every known 2FA method param name from the broad scan
      const knownMethodParams = [
        'login_challenge_method', 'challenge_method', 'second_factor_method',
        'two_sv_method', '2sv_method', 'method', 'two_step_method',
        'login_type',   // sometimes encodes 2FA type
      ];
      if (broad.items.length > 0) {
        const m = buildMap(broad.items, knownMethodParams);
        if (Object.keys(m).length > 0) {
          console.log('[GW Methods] Step 1 succeeded:', Object.keys(m).length, 'users mapped');
          setMethodMap(m); methodMapRef.current = m; setMethodsStatus('loaded'); return;
        }
      }

      // ── Step 2: login_challenge — last 30 days (dedicated event type)
      console.log('[GW Methods] Step 2: login_challenge events (last 30d)');
      const r2 = await fetchLoginItems({ eventName: 'login_challenge', startTime: thirtyDaysAgo.toISOString() });
      if (r2.scopeDenied) { setMethodsStatus('scope_denied'); return; }
      diagnose('login_challenge-30d', r2.items);
      if (r2.items.length > 0) {
        const m = buildMap(r2.items, knownMethodParams);
        if (Object.keys(m).length > 0) {
          console.log('[GW Methods] Step 2 succeeded:', Object.keys(m).length, 'users mapped');
          setMethodMap(m); methodMapRef.current = m; setMethodsStatus('loaded'); return;
        }
      }

      // ── Step 3: 2sv_enroll — last 180 days
      console.log('[GW Methods] Step 3: 2sv_enroll events (last 180d)');
      const r3 = await fetchLoginItems({ eventName: '2sv_enroll', startTime: sixMonthsAgo.toISOString() });
      if (r3.scopeDenied) { setMethodsStatus('scope_denied'); return; }
      diagnose('2sv_enroll-180d', r3.items);
      if (r3.items.length > 0) {
        const m = buildMap(r3.items, knownMethodParams);
        if (Object.keys(m).length > 0) {
          console.log('[GW Methods] Step 3 succeeded:', Object.keys(m).length, 'users mapped');
          setMethodMap(m); methodMapRef.current = m; setMethodsStatus('loaded'); return;
        }
      }

      // ── Step 4: Usage Report fallback
      console.log('[GW Methods] Step 4: Usage Report fallback');
      await fetchGWMethodsFromUsage(token);
    } catch (e) {
      console.error('[GW Methods] Error:', e);
      await fetchGWMethodsFromUsage(token);
    }
  };

  const fetchGWMethodsFromUsage = async (token) => {
    // Fallback: Usage Report (delayed 24-48hrs, less detail but available without audit scope)
    try {
      for (let daysBack = 1; daysBack <= 5; daysBack++) {
        const d = new Date();
        d.setDate(d.getDate() - daysBack);
        const dateStr = d.toISOString().split('T')[0];
        let allReports = [];
        let pageToken = null;
        do {
          const params = new URLSearchParams({
            parameters: 'accounts:is_2sv_enrolled,accounts:two_sv_method,accounts:two_step_verification_method',
            maxResults: '500',
            ...(pageToken && { pageToken }),
          });
          const res = await fetch(
            `https://admin.googleapis.com/admin/reports/v1/usage/users/all/dates/${dateStr}?${params}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) break;
          const data = await res.json();
          allReports = [...allReports, ...(data.usageReports || [])];
          pageToken = data.nextPageToken || null;
        } while (pageToken);

        if (allReports.length > 0) {
          const map = {};
          for (const r of allReports) {
            const email = r.entity?.userEmail;
            if (!email) continue;
            const mp = (r.parameters || []).find(p =>
              p.name === 'accounts:two_sv_method' || p.name === 'accounts:two_step_verification_method'
            );
            if (mp?.stringValue) map[email] = [mp.stringValue.toLowerCase()];
          }
          if (Object.keys(map).length > 0) {
            setMethodMap(map);
            methodMapRef.current = map;
            setMethodsStatus('loaded');
            return;
          }
          setMethodsStatus('no_data');
          return;
        }
      }
      setMethodsStatus('no_data');
    } catch (e) {
      console.warn('[GW Methods usage]', e.message);
      setMethodsStatus('no_data');
    }
  };

  const activeGWUsers = gwUsers.filter(u => !u.suspended);
  const liveStats = activeGWUsers.length > 0 ? {
    activeAccounts: activeGWUsers.length,
    twoFAEnabled:   activeGWUsers.filter(u => u.isEnrolledIn2Sv).length,
    noTwoFA:        activeGWUsers.filter(u => !u.isEnrolledIn2Sv).length,
    coverage:       Math.round(activeGWUsers.filter(u => u.isEnrolledIn2Sv).length / activeGWUsers.length * 100),
    lastUpdated:    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  } : null;
  const stats = liveStats || GW_STATS;

  const startEdit = (s) => {
    const ov = secOverrides[s.name] || {};
    setEditDraft({
      mfaNotes: ov.mfaNotes != null ? ov.mfaNotes : s.mfaNotes,
      ssoNotes: ov.ssoNotes != null ? ov.ssoNotes : s.ssoNotes,
      action:   ov.action   != null ? ov.action   : s.action,
    });
    setEditingRow(s.name);
  };
  const saveEdit = () => {
    onSecOverrideChange(editingRow, editDraft);
    setEditingRow(null);
  };
  const cancelEdit = () => setEditingRow(null);
  const deleteRow = (s) => {
    const label = typeof s === 'string' ? s : s.name;
    const msg   = s._userAdded ? `Remove "${label}"?` : `Remove "${label}" from the MFA list? This can be undone by your admin.`;
    if (confirm(msg)) {
      onSecOverrideChange(label, { deleted: true });
      if (s._userAdded && onDeleteUserSystem) onDeleteUserSystem(s._id);
      if (expanded === label) setExpanded(null);
    }
  };

  const active = allMFASystems.filter((s) => !s.inactive && !secOverrides[s.name]?.deleted);
  const full = active.filter((s) => (secOverrides[s.name]?.mfaStatus ?? s.mfa) === 'full').length;
  const unknown = active.filter((s) => (secOverrides[s.name]?.mfaStatus ?? s.mfa) === 'unknown').length;
  const critical = active.filter((s) => (secOverrides[s.name]?.riskLevel ?? s.risk) === 'critical').length;

  return (
    <div className="sec-section">

      {/* ── GW Account 2FA Enrollment ── */}
      <div className="sec-block sec-gw-block">
        <div className="sec-block-head">
          <div>
            <div className="sec-block-eyebrow">GOOGLE WORKSPACE · BRIGHTPATH-MN.COM</div>
            <h3 className="sec-block-title">2FA Enrollment Status</h3>
          </div>
          <div className="gw-connect-area">
            {gwToken ? (
              <React.Fragment>
                <span className="gw-connected-badge">
                  {gwLoading ? '⟳ Refreshing…' : '🔗 Live · Connected'}
                </span>
                <button className="gw-refresh-btn" onClick={() => Promise.all([fetchGWUsers(gwToken), fetchGWMethods(gwToken)])} disabled={gwLoading}>
                  ↻ Refresh
                </button>
              </React.Fragment>
            ) : cacheInfo ? (
              <React.Fragment>
                <span className="gw-cache-badge">
                  📋 Synced {new Date(cacheInfo.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  {cacheInfo.by ? ` · ${cacheInfo.by}` : ''}
                </span>
                <button className="gw-sync-btn" onClick={connectGoogle} disabled={gwLoading} title="Requires a BrightPath Google Admin account (brightpath-mn.com)">
                  {gwLoading ? '⟳ Syncing…' : '↻ Sync (Admin only)'}
                </button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <span className="sec-gw-updated">Last updated: {stats.lastUpdated}</span>
                <button className="gw-connect-btn" onClick={connectGoogle} disabled={gwLoading}>
                  {gwLoading ? '⟳ Loading…' : '🔑 Connect Google Admin'}
                </button>
              </React.Fragment>
            )}
          </div>
        </div>

        {gwError && (
          <div className="gw-error-bar">
            ⚠️ {gwError}
            <button className="gw-error-dismiss" onClick={() => setGwError(null)}>✕</button>
          </div>
        )}
        {cacheLoadErr && (
          <div className="gw-error-bar">
            ⚠️ Cache load error: {cacheLoadErr}
            <button className="gw-error-dismiss" onClick={() => setCacheLoadErr(null)}>✕</button>
          </div>
        )}

        {!gwToken && !cacheInfo && (
          <div className="gw-connect-hint">
            💡 Connect your Google Admin account to get live user data — then click any card to see the full user list. Data is shared with all viewers automatically.
          </div>
        )}

        {/* Derive local consts for card interactivity */}
        {(() => {
          const hasUserData = activeGWUsers.length > 0;
          const cardSub = gwToken ? 'brightpath-mn.com · Live ✅' : cacheInfo ? 'brightpath-mn.com · Cached ✅' : 'BrightPath domain ✅';
          return (
            <div className="sec-stats-row sec-gw-stats-row">
              <SecCard
                title="Active Accounts"
                value={stats.activeAccounts}
                sub={cardSub}
                accent="#6366f1"
                onClick={hasUserData ? () => { setGwSearch(''); setGwModal('all'); } : undefined}
              />
              <SecCard
                title="2FA Enabled"
                value={stats.twoFAEnabled}
                sub={`of ${stats.activeAccounts} accounts`}
                accent="#10b981"
                onClick={hasUserData ? () => { setGwSearch(''); setGwModal('enabled'); } : undefined}
              >
                <div className="sec-gw-bar-wrap">
                  <div className="sec-gw-bar" style={{ width: `${stats.coverage}%`, background: '#10b981' }} />
                </div>
              </SecCard>
              <SecCard
                title="No 2FA"
                value={stats.noTwoFA}
                sub="require action ⚠️"
                accent="#ef4444"
                onClick={hasUserData ? () => { setGwSearch(''); setGwModal('no2fa'); } : undefined}
              >
                <div className="sec-gw-bar-wrap">
                  <div className="sec-gw-bar" style={{ width: `${100 - stats.coverage}%`, background: '#ef4444' }} />
                </div>
              </SecCard>
              <SecCard
                title="2FA Coverage"
                value={`${stats.coverage}%`}
                sub="of all active accounts"
                accent="#f59e0b"
                onClick={hasUserData ? () => { setGwSearch(''); setGwModal('coverage'); } : undefined}
              >
                <div className="sec-gw-bar-wrap">
                  <div className="sec-gw-bar" style={{ width: `${stats.coverage}%`, background: '#f59e0b' }} />
                </div>
              </SecCard>
            </div>
          );
        })()}
      </div>

      {/* Summary cards — system-level */}
      <div className="sec-stats-row">
        <SecCard title="Systems Reviewed" value={active.length} sub="Active systems" accent="#6366f1" />
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
                <th className="sec-hm-owner">Owner</th>
                <th className="sec-hm-action"></th>
              </tr>
            </thead>
            <tbody>
              {allMFASystems
                .filter((s) => !secOverrides[s.name]?.deleted)
                .filter((s) => !filterOwner || !filterOwner.length || filterOwner.some((id) => (secOwners[s.name] || []).includes(id)))
                .map((s) => {
                  const ov = secOverrides[s.name] || {};
                  const mfaNotes = ov.mfaNotes != null ? ov.mfaNotes : s.mfaNotes;
                  const ssoNotes = ov.ssoNotes != null ? ov.ssoNotes : s.ssoNotes;
                  const action   = ov.action   != null ? ov.action   : s.action;
                  const isEditing = editingRow === s.name;
                  return (
                    <React.Fragment key={s.name}>
                      <tr
                        className={`sec-hm-row ${expanded === s.name ? 'sec-hm-row-open' : ''} ${s.inactive ? 'sec-hm-row-inactive' : ''}`}
                        onClick={() => { if (!isEditing) setExpanded(expanded === s.name ? null : s.name); }}>
                        <td className="sec-hm-system-cell">
                          {s.logo && (
                            <img
                              src={`https://logo.clearbit.com/${s.logo}`}
                              className="sec-sys-logo"
                              alt=""
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <span className="sec-hm-name">{s.name}</span>
                        </td>
                        <td className="sec-hm-cat-cell">{s.category}</td>
                        <td className="sec-hm-cell-val">
                          <SecPicker
                            value={ov.mfaStatus ?? s.mfa}
                            options={['full', 'partial', 'none', 'unknown']}
                            config={MFA_ST}
                            onChange={(v) => onSecOverrideChange(s.name, { mfaStatus: v })} />
                        </td>
                        <td className="sec-hm-cell-val">
                          <SecPicker
                            value={ov.ssoStatus ?? s.sso}
                            options={['full', 'partial', 'none', 'unknown']}
                            config={MFA_ST}
                            onChange={(v) => onSecOverrideChange(s.name, { ssoStatus: v })} />
                        </td>
                        <td className="sec-hm-cell-val">
                          <SecPicker
                            value={ov.riskLevel ?? s.risk}
                            options={['critical', 'high', 'medium', 'low']}
                            config={RISK_ST}
                            onChange={(v) => onSecOverrideChange(s.name, { riskLevel: v })} />
                        </td>
                        <td className="sec-hm-cell-val">
                          <span className="sec-badge sec-badge-sm" style={{ background: ROLLOUT_ST[s.rollout]?.bg, color: ROLLOUT_ST[s.rollout]?.fg }}>
                            {ROLLOUT_ST[s.rollout]?.label}
                          </span>
                        </td>
                        <td className="sec-hm-owner-cell">
                          <SecOwnerPicker
                            owners={secOwners[s.name] || []}
                            onChange={(ids) => onSecOwnerChange(s.name, ids)} />
                        </td>
                        <td className="sec-hm-chevron">{expanded === s.name ? '▲' : '▼'}</td>
                      </tr>
                      {expanded === s.name && (
                        <tr className="sec-hm-detail-row">
                          <td colSpan={8}>
                            {isEditing ? (
                              <div className="sec-hm-detail sec-hm-detail-editing">
                                <div className="sec-hm-detail-grid">
                                  <div className="sec-hm-detail-item">
                                    <div className="sec-hm-detail-label">MFA Notes</div>
                                    <textarea className="sec-edit-textarea" value={editDraft.mfaNotes}
                                      onChange={(e) => setEditDraft((d) => ({ ...d, mfaNotes: e.target.value }))}
                                      onClick={(e) => e.stopPropagation()} />
                                  </div>
                                  <div className="sec-hm-detail-item">
                                    <div className="sec-hm-detail-label">SSO Notes</div>
                                    <textarea className="sec-edit-textarea" value={editDraft.ssoNotes}
                                      onChange={(e) => setEditDraft((d) => ({ ...d, ssoNotes: e.target.value }))}
                                      onClick={(e) => e.stopPropagation()} />
                                  </div>
                                  <div className="sec-hm-detail-item sec-hm-action-item">
                                    <div className="sec-hm-detail-label">Recommended Action</div>
                                    <textarea className="sec-edit-textarea" value={editDraft.action}
                                      onChange={(e) => setEditDraft((d) => ({ ...d, action: e.target.value }))}
                                      onClick={(e) => e.stopPropagation()} />
                                  </div>
                                </div>
                                <div className="sec-detail-actions" onClick={(e) => e.stopPropagation()}>
                                  <button className="sec-btn-save" onClick={saveEdit}>Save</button>
                                  <button className="sec-btn-cancel" onClick={cancelEdit}>Cancel</button>
                                  <button className="sec-btn-delete" onClick={() => deleteRow(s)}>🗑 Remove system</button>
                                </div>
                              </div>
                            ) : (
                              <div className="sec-hm-detail">
                                <div className="sec-hm-detail-grid">
                                  <div className="sec-hm-detail-item">
                                    <div className="sec-hm-detail-label">MFA Notes</div>
                                    <div className="sec-hm-detail-body">{mfaNotes}</div>
                                  </div>
                                  <div className="sec-hm-detail-item">
                                    <div className="sec-hm-detail-label">SSO Notes</div>
                                    <div className="sec-hm-detail-body">{ssoNotes}</div>
                                  </div>
                                  <div className="sec-hm-detail-item sec-hm-action-item">
                                    <div className="sec-hm-detail-label">Recommended Action</div>
                                    <div className="sec-hm-detail-body sec-hm-action-body">{action}</div>
                                  </div>
                                </div>
                                <div className="sec-detail-actions" onClick={(e) => e.stopPropagation()}>
                                  <button className="sec-btn-edit" onClick={() => startEdit(s)}>✎ Edit notes</button>
                                  <button className="sec-btn-delete" onClick={() => deleteRow(s)}>🗑 Remove system</button>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              {addingMFA && (
                <tr className="sec-hm-add-row" onClick={e => e.stopPropagation()}>
                  <td className="sec-hm-system-cell">
                    <input className="sec-add-input" placeholder="System name *"
                      value={addDraft.name} onChange={e => setAddDraft(d => ({...d, name: e.target.value}))}
                      autoFocus onKeyDown={e => e.key === 'Enter' && saveMFASystem()} />
                  </td>
                  <td>
                    <input className="sec-add-input" placeholder="Category (e.g. Finance / HR)"
                      value={addDraft.category} onChange={e => setAddDraft(d => ({...d, category: e.target.value}))} />
                  </td>
                  <td className="sec-hm-cell-val">
                    <SecPicker value={addDraft.mfa} options={['full','partial','none','unknown']} config={MFA_ST} onChange={v => setAddDraft(d => ({...d, mfa: v}))} />
                  </td>
                  <td className="sec-hm-cell-val">
                    <SecPicker value={addDraft.sso} options={['full','partial','none','unknown']} config={MFA_ST} onChange={v => setAddDraft(d => ({...d, sso: v}))} />
                  </td>
                  <td className="sec-hm-cell-val">
                    <SecPicker value={addDraft.risk} options={['critical','high','medium','low']} config={RISK_ST} onChange={v => setAddDraft(d => ({...d, risk: v}))} />
                  </td>
                  <td className="sec-hm-cell-val">
                    <select className="sec-add-select" value={addDraft.rollout} onChange={e => setAddDraft(d => ({...d, rollout: e.target.value}))}>
                      {Object.entries(ROLLOUT_ST).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                  <td></td>
                  <td className="sec-hm-add-actions">
                    <button className="sec-btn-save" onClick={saveMFASystem} disabled={!addDraft.name.trim()}>Add</button>
                    <button className="sec-btn-cancel" onClick={() => setAddingMFA(false)}>✕</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="sec-add-system-bar">
          <button className="sec-add-system-btn" onClick={() => { setAddingMFA(!addingMFA); setAddDraft({ name: '', category: '', mfa: 'unknown', sso: 'unknown', risk: 'medium', rollout: 'validate' }); }}>
            {addingMFA ? '✕ Cancel' : '+ Add system'}
          </button>
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
                <span className="sec-tl-tag">Zoho CRM</span>
                <span className="sec-tl-tag">QuickBooks Online</span>
                <span className="sec-tl-tag">Bill.com</span>
                <span className="sec-tl-tag">DocuSign</span>
                <span className="sec-tl-tag">Adobe Acrobat</span>
                <span className="sec-tl-tag">JazzHR</span>
                <span className="sec-tl-tag">Google Ads</span>
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
              <div className="sec-tl-desc">Contact Centrally HR, Therap EHR, Star LMS, Netstudy 2.0, and Zizzl to confirm MFA and SSO capabilities. Results determine final rollout scope and whether any systems need compensating controls.</div>
              <div className="sec-tl-targets">
                <span className="sec-tl-tag sec-tl-tag-gray">Centrally HR</span>
                <span className="sec-tl-tag sec-tl-tag-gray">Therap EHR</span>
                <span className="sec-tl-tag sec-tl-tag-gray">Star LMS</span>
                <span className="sec-tl-tag sec-tl-tag-gray">Netstudy 2.0</span>
                <span className="sec-tl-tag sec-tl-tag-gray">Zizzl</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── GW User Modal ── */}
      {gwModal && activeGWUsers.length > 0 && (
        <GWUserModal
          users={activeGWUsers}
          filter={gwModal}
          search={gwSearch}
          onSearchChange={setGwSearch}
          methodMap={methodMap}
          methodsStatus={methodsStatus}
          onReconnect={connectGoogle}
          onClose={() => { setGwModal(null); setGwSearch(''); }}
        />
      )}
    </div>
  );
};

// ── SSO Strategy Section ─────────────────────────────────────────────────────
const SSOStrategy = ({ secOwners, onSecOwnerChange, secOverrides, onSecOverrideChange, filterOwner, userSecSystems, onAddUserSystem, onDeleteUserSystem }) => {
  const [editSSORow, setEditSSORow] = React.useState(null);
  const [editSSODraft, setEditSSODraft] = React.useState('');
  const [addingSSO, setAddingSSO] = React.useState(false);
  const [addSSODraft, setAddSSODraft] = React.useState({ name: '', sso: 'unknown', protocol: '', notes: '' });

  // Merge hardcoded + user-added SSO systems
  // Note: for sso_compat rows, `category` stores the protocol and `mfa_notes` stores the notes
  const allSSOCompat = [
    ...SSO_COMPAT,
    ...(userSecSystems || []).filter(s => s.system_type === 'sso_compat').map(s => ({
      name:     s.name,
      sso:      s.sso_status || 'unknown',
      protocol: s.category   || '?',
      notes:    s.mfa_notes  || '',
      _userAdded: true, _id: s.id,
    })),
  ];

  const saveSSOSystem = () => {
    if (!addSSODraft.name.trim()) return;
    const row = {
      id: 'usr-' + Date.now(), system_type: 'sso_compat',
      name:       addSSODraft.name.trim(),
      sso_status: addSSODraft.sso,
      category:   addSSODraft.protocol.trim() || '?',   // reuse 'category' column for protocol
      mfa_notes:  addSSODraft.notes.trim(),              // reuse 'mfa_notes' column for notes
    };
    onAddUserSystem(row);
    setAddingSSO(false);
    setAddSSODraft({ name: '', sso: 'unknown', protocol: '', notes: '' });
  };

  const startSSOEdit = (s) => {
    const ov = secOverrides[s.name] || {};
    setEditSSODraft(ov.notes != null ? ov.notes : s.notes);
    setEditSSORow(s.name);
  };
  const saveSSOEdit = () => {
    onSecOverrideChange(editSSORow, { notes: editSSODraft });
    setEditSSORow(null);
  };
  const deleteSSORow = (s) => {
    const label = typeof s === 'string' ? s : s.name;
    const msg   = s._userAdded ? `Remove "${label}"?` : `Remove "${label}" from the SSO compatibility list?`;
    if (confirm(msg)) {
      onSecOverrideChange(label, { deleted: true });
      if (s._userAdded && onDeleteUserSystem) onDeleteUserSystem(s._id);
      if (editSSORow === label) setEditSSORow(null);
    }
  };
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
                <th className="sec-hm-owner">Owner</th>
                <th>Notes &amp; Action</th>
              </tr>
            </thead>
            <tbody>
              {allSSOCompat
                .filter((s) => !secOverrides[s.name]?.deleted)
                .filter((s) => !filterOwner || !filterOwner.length || filterOwner.some((id) => (secOwners[s.name] || []).includes(id)))
                .map((s) => {
                  const ov = secOverrides[s.name] || {};
                  const notes = ov.notes != null ? ov.notes : s.notes;
                  const isEditing = editSSORow === s.name;
                  return (
                    <tr key={s.name} className="sec-hm-row">
                      <td className="sec-hm-system-cell"><span className="sec-hm-name">{s.name}</span></td>
                      <td className="sec-hm-cell-val">
                        <SecPicker
                          value={ov.ssoCompatStatus ?? s.sso}
                          options={['native', 'yes', 'upgrade', 'no', 'unknown']}
                          config={SSO_ST}
                          onChange={(v) => onSecOverrideChange(s.name, { ssoCompatStatus: v })} />
                      </td>
                      <td className="sec-hm-cell-val">
                        <span className="sec-protocol">{s.protocol}</span>
                      </td>
                      <td className="sec-hm-owner-cell">
                        <SecOwnerPicker
                          owners={secOwners[s.name] || []}
                          onChange={(ids) => onSecOwnerChange(s.name, ids)} />
                      </td>
                      <td className="sec-hm-notes">
                        {isEditing ? (
                          <div className="sec-inline-edit" onClick={(e) => e.stopPropagation()}>
                            <textarea className="sec-edit-textarea" value={editSSODraft}
                              onChange={(e) => setEditSSODraft(e.target.value)} />
                            <div className="sec-inline-edit-actions">
                              <button className="sec-btn-save" onClick={saveSSOEdit}>Save</button>
                              <button className="sec-btn-cancel" onClick={() => setEditSSORow(null)}>Cancel</button>
                              <button className="sec-btn-delete" onClick={() => deleteSSORow(s)}>🗑 Remove</button>
                            </div>
                          </div>
                        ) : (
                          <div className="sec-notes-view">
                            <span className="sec-notes-text">{notes}</span>
                            <span className="sec-notes-actions">
                              <button className="sec-btn-icon" title="Edit notes" onClick={(e) => { e.stopPropagation(); startSSOEdit(s); }}>✎</button>
                              <button className="sec-btn-icon sec-btn-icon-del" title="Remove row" onClick={(e) => { e.stopPropagation(); deleteSSORow(s); }}>🗑</button>
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              {addingSSO && (
                <tr className="sec-hm-add-row" onClick={e => e.stopPropagation()}>
                  <td className="sec-hm-system-cell">
                    <input className="sec-add-input" placeholder="System name *"
                      value={addSSODraft.name} onChange={e => setAddSSODraft(d => ({...d, name: e.target.value}))}
                      autoFocus onKeyDown={e => e.key === 'Enter' && saveSSOSystem()} />
                  </td>
                  <td className="sec-hm-cell-val">
                    <SecPicker value={addSSODraft.sso} options={['native','yes','upgrade','no','unknown']} config={SSO_ST} onChange={v => setAddSSODraft(d => ({...d, sso: v}))} />
                  </td>
                  <td className="sec-hm-cell-val">
                    <input className="sec-add-input" placeholder="Protocol (e.g. SAML 2.0)"
                      value={addSSODraft.protocol} onChange={e => setAddSSODraft(d => ({...d, protocol: e.target.value}))} />
                  </td>
                  <td></td>
                  <td>
                    <div className="sec-hm-add-actions">
                      <input className="sec-add-input sec-add-input-wide" placeholder="Notes / action (optional)"
                        value={addSSODraft.notes} onChange={e => setAddSSODraft(d => ({...d, notes: e.target.value}))} />
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <button className="sec-btn-save" onClick={saveSSOSystem} disabled={!addSSODraft.name.trim()}>Add</button>
                        <button className="sec-btn-cancel" onClick={() => setAddingSSO(false)}>✕</button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="sec-add-system-bar">
          <button className="sec-add-system-btn" onClick={() => { setAddingSSO(!addingSSO); setAddSSODraft({ name: '', sso: 'unknown', protocol: '', notes: '' }); }}>
            {addingSSO ? '✕ Cancel' : '+ Add system'}
          </button>
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
const SecurityHub = ({ OwnerFilter }) => {
  const [section, setSection] = React.useState('mfa');
  const [secOwners, setSecOwners] = React.useState({});
  const [secOverrides, setSecOverrides] = React.useState({});
  const [filterOwner, setFilterOwner] = React.useState([]);
  const [userSecSystems, setUserSecSystems] = React.useState([]);

  React.useEffect(() => {
    window.SupabaseDB.loadSecOwners().then(setSecOwners).catch(console.error);
    window.SupabaseDB.loadSecOverrides().then(setSecOverrides).catch(console.error);
    window.SupabaseDB.loadUserSecSystems().then(setUserSecSystems).catch(console.error);
  }, []);

  const onSecOwnerChange = (systemName, ids) => {
    setSecOwners((prev) => ({ ...prev, [systemName]: ids }));
    window.SupabaseDB.upsertSecOwner(systemName, ids);
  };

  const onSecOverrideChange = (systemName, patch) => {
    setSecOverrides((prev) => ({ ...prev, [systemName]: { ...(prev[systemName] || {}), ...patch } }));
    window.SupabaseDB.upsertSecOverride(systemName, patch);
  };

  const onAddUserSystem = (row) => {
    window.SupabaseDB.insertUserSecSystem(row).catch(console.error);
    setUserSecSystems((prev) => [...prev, row]);
  };

  const onDeleteUserSystem = (id) => {
    window.SupabaseDB.deleteUserSecSystem(id).catch(console.error);
    setUserSecSystems((prev) => prev.filter((s) => s.id !== id));
  };

  const SECTIONS = [
    { id: 'mfa',    label: 'MFA',            sub: 'Heatmap + Rollout' },
    { id: 'sso',    label: 'SSO Strategy',   sub: 'Provider options' },
    { id: 'access', label: 'Access Mgmt',    sub: 'On/off + RBAC + Cleanup' },
    { id: 'team',   label: 'Team 2FA',       sub: 'Manager accountability' },
    { id: 'plan',   label: 'Impl. Plan',     sub: 'MFA + SSO roadmap' },
    { id: 'sop',    label: 'SOP Review',     sub: 'Onboarding & offboarding' },
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

      {(section === 'mfa' || section === 'sso') && OwnerFilter && (
        <OwnerFilter selected={filterOwner} onChange={setFilterOwner} />
      )}

      {section === 'mfa'    && <MFAHeatmap    secOwners={secOwners} onSecOwnerChange={onSecOwnerChange} secOverrides={secOverrides} onSecOverrideChange={onSecOverrideChange} filterOwner={filterOwner} userSecSystems={userSecSystems} onAddUserSystem={onAddUserSystem} onDeleteUserSystem={onDeleteUserSystem} />}
      {section === 'sso'    && <SSOStrategy   secOwners={secOwners} onSecOwnerChange={onSecOwnerChange} secOverrides={secOverrides} onSecOverrideChange={onSecOverrideChange} filterOwner={filterOwner} userSecSystems={userSecSystems} onAddUserSystem={onAddUserSystem} onDeleteUserSystem={onDeleteUserSystem} />}
      {section === 'access' && <AccessMgmt />}
      {section === 'team'   && <window.TeamCompliance />}
      {section === 'plan'   && <window.SecurityPlan />}
      {section === 'sop'    && <window.SopReview />}
    </div>
  );
};

window.GW_METHOD_LABELS = GW_METHOD_LABELS;
window.SEC_SYSTEMS     = SEC_SYSTEMS;      // exported for SecurityPlan
window.SecurityHub     = SecurityHub;
