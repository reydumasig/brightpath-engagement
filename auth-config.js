// ── BrightPath Engagement Tracker — Auth Config ─────────────────────────────
//
// SETUP INSTRUCTIONS:
// 1. Go to console.cloud.google.com → select your project
// 2. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
// 3. Application type: Web application
// 4. Authorized JavaScript origins:
//      https://brightpath-engagement.vercel.app
//      http://localhost:4321  (local dev)
// 5. Authorized redirect URIs: same as above
// 6. Copy the Client ID and paste it below
// 7. Also go to APIs & Services → OAuth consent screen:
//      - If your GCP project is linked to your Google Workspace org,
//        set User type to "Internal" → only @brightpath-mn.com emails can log in automatically
//      - If "External", add your Vercel domain as an authorized domain
//
// ─────────────────────────────────────────────────────────────────────────────

window.AUTH_CONFIG = {

  // ── Google OAuth 2.0 Client ID ───────────────────────────────────────────
  clientId: '1004669075037-e0g7bodcv49v7rhilu46o5q4g5bjg7hb.apps.googleusercontent.com',

  // ── Domain whitelist ─────────────────────────────────────────────────────
  // Any Google account with one of these domains is automatically allowed.
  allowedDomains: [
    'brightpath-mn.com',   // BrightPath Google Workspace domain
    's360team.com',        // Summit 360 domain
  ],

  // ── Individual email whitelist ────────────────────────────────────────────
  // Specific emails allowed (both domains above are already whitelisted,
  // but listed here as a reference for who has access).
  allowedEmails: [
    'lane.elmer@s360team.com',
    'rey.dumasig@s360team.com',
    'michael.sevilla@s360team.com',
    'brandon.spears@brightpath-mn.com',
    'lisa.carton@brightpath-mn.com',
    'nicole.buechler@brightpath-mn.com',
    'stephanie.noll@brightpath-mn.com',
    'jeremy.garrigan@brightpath-mn.com',
    'rick.joslin@brightpath-mn.com',
    'sechellia.riley@brightpath-mn.com',
  ],

  // ── Email → Dashboard person ID mapping ─────────────────────────────────
  // Maps a Google login email to a person ID in the dashboard.
  // This auto-sets the "Posting as" identity so users don't have to pick.
  emailToPersonId: {
    // BrightPath team
    'brandon.spears@brightpath-mn.com':   'BS',
    'jeremy.garrigan@brightpath-mn.com':  'JE',
    'stephanie.noll@brightpath-mn.com':   'SN',
    'lisa.carton@brightpath-mn.com':      'LC',
    'nicole.buechler@brightpath-mn.com':  'NI',
    // S360 team
    'lane.elmer@s360team.com':            'LE',
    'rey.dumasig@s360team.com':           'RD',
    'michael.sevilla@s360team.com':       'MS',
  },

  // ── Session duration ─────────────────────────────────────────────────────
  // How many hours before the user needs to sign in again.
  sessionHours: 8,

};
