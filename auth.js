// auth.js — Google OAuth session guard + helpers
// Loaded before React on every protected page.

(function () {
  const AUTH_KEY = 'brightpath-auth-v1';

  // ── Session helpers ─────────────────────────────────────────────────────────
  function loadSession() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch (e) { return null; }
  }
  function saveSession(data) {
    try { localStorage.setItem(AUTH_KEY, JSON.stringify(data)); } catch (e) {}
  }
  function clearSession() {
    try { localStorage.removeItem(AUTH_KEY); } catch (e) {}
  }
  function isSessionValid(session) {
    if (!session || !session.email || !session.expiresAt) return false;
    return Date.now() < session.expiresAt;
  }

  // ── JWT decode (client-side, no signature verification) ─────────────────────
  function decodeJwt(token) {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch (e) { return null; }
  }

  // ── Whitelist check ─────────────────────────────────────────────────────────
  function isAllowed(email) {
    const cfg = window.AUTH_CONFIG;
    if (!cfg) return false;
    const domain = email.split('@')[1] || '';
    if (cfg.allowedDomains && cfg.allowedDomains.includes(domain)) return true;
    if (cfg.allowedEmails && cfg.allowedEmails.includes(email)) return true;
    return false;
  }

  // ── Sign-in callback (called from login.html after Google responds) ──────────
  function handleCredential(response) {
    const payload = decodeJwt(response.credential);
    if (!payload) return { ok: false, reason: 'invalid_token' };

    const email = payload.email;
    if (!isAllowed(email)) return { ok: false, reason: 'not_allowed', email };

    const cfg = window.AUTH_CONFIG;
    const hours = (cfg && cfg.sessionHours) || 8;
    const personId = (cfg && cfg.emailToPersonId && cfg.emailToPersonId[email]) || null;

    const session = {
      email,
      name: payload.name || '',
      picture: payload.picture || '',
      personId,
      expiresAt: Date.now() + hours * 60 * 60 * 1000,
    };
    saveSession(session);
    return { ok: true, session };
  }

  // ── Sign-out ────────────────────────────────────────────────────────────────
  function signOut(redirectTo) {
    clearSession();
    // Revoke the Google token (best-effort)
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    window.location.href = redirectTo || '/login.html';
  }

  // ── Auth guard — call at top of each protected page ─────────────────────────
  // Redirects to login.html if no valid session found.
  function authGuard() {
    const session = loadSession();
    if (!isSessionValid(session)) {
      clearSession();
      const here = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.replace('/login.html?next=' + here);
      return null;
    }
    return session;
  }

  // ── Expose on window ────────────────────────────────────────────────────────
  window.BPAuth = {
    loadSession,
    saveSession,
    clearSession,
    isSessionValid,
    isAllowed,
    handleCredential,
    signOut,
    authGuard,
    decodeJwt,
  };
})();
