// team-compliance.jsx — 2FA Accountability by Manager
// Cross-references BP_ROSTER (HRIS) with live Google Workspace data from Supabase cache

const TeamCompliance = () => {
  const [gwCache,   setGwCache]   = React.useState(null);
  const [loading,   setLoading]   = React.useState(true);
  const [search,    setSearch]    = React.useState('');
  const [expanded,  setExpanded]  = React.useState(null);
  const [sort,      setSort]      = React.useState('worst');   // worst|best|alpha|size
  const [memberFilter, setMemberFilter] = React.useState('all'); // all|no2fa|enrolled

  React.useEffect(() => {
    window.SupabaseDB.loadGWCache()
      .then(cache => setGwCache(cache))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const gwUsers   = React.useMemo(() => (gwCache?.data?.users  || []).filter(u => !u.suspended), [gwCache]);
  const methodMap = React.useMemo(() => (gwCache?.data?.methodMap || {}), [gwCache]);

  // GW lookup by lowercase email
  const gwByEmail = React.useMemo(() => {
    const m = {};
    for (const u of gwUsers) { if (u.primaryEmail) m[u.primaryEmail.toLowerCase()] = u; }
    return m;
  }, [gwUsers]);

  const getGW = (email) => email ? gwByEmail[email.toLowerCase()] : null;

  // Returns array of resolved method info objects for a user (handles both old string + new array cache format)
  const getMethodInfos = (email) => {
    if (!email) return [];
    const raw = methodMap[email.toLowerCase()];
    if (!raw) return [];
    const labels = window.GW_METHOD_LABELS || {};
    const raws = Array.isArray(raw) ? raw : [raw];
    return raws
      .map(r => {
        const lookup = labels[r.toLowerCase()];
        if (lookup === null) return null;   // known non-2FA (password/none) — skip
        return lookup || { label: r, icon: '❓', cls: 'gw-method-other' };
      })
      .filter(Boolean);
  };

  // ── Build manager groups from roster ─────────────────────────────────────────
  const groups = React.useMemo(() => {
    const roster   = (window.BP_ROSTER        || []).filter(e => e.status === 'Active' && e.id && e.email && e.email.includes('@'));
    const rosterById = window.BP_ROSTER_BY_ID || {};
    const parseSupId = window.BP_PARSE_SUP_ID || (() => null);

    const map = {};

    for (const emp of roster) {
      const supId  = parseSupId(emp.supervisorRaw);
      const supEmp = supId ? rosterById[supId] : null;

      let key, managerName, managerEmail, managerTitle, managerEmpId;

      if (supEmp && supEmp.email && supEmp.email.includes('@')) {
        key          = supEmp.email.toLowerCase();
        managerName  = `${supEmp.firstName} ${supEmp.lastName}`;
        managerEmail = supEmp.email.toLowerCase();
        managerTitle = supEmp.title || '';
        managerEmpId = supEmp.id;
      } else if (emp.supervisorRaw) {
        const rawName = emp.supervisorRaw.replace(/\s*\(\d+\)\s*$/, '').trim();
        key          = `raw:${emp.supervisorRaw}`;
        managerName  = rawName;
        managerEmail = null;
        managerTitle = '';
        managerEmpId = supId;
      } else {
        key          = '__no_manager__';
        managerName  = 'No Manager Assigned';
        managerEmail = null;
        managerTitle = '';
        managerEmpId = null;
      }

      if (!map[key]) {
        map[key] = { key, managerName, managerEmail, managerTitle, managerEmpId, reports: [] };
      }
      map[key].reports.push(emp);
    }

    // Compute stats
    return Object.values(map).map(g => {
      const total    = g.reports.length;
      const inGW     = g.reports.filter(r => !!getGW(r.email)).length;
      const enrolled = g.reports.filter(r => getGW(r.email)?.isEnrolledIn2Sv).length;
      const pct      = inGW > 0 ? Math.round(enrolled / inGW * 100) : 0;
      const managerGW = g.managerEmail ? getGW(g.managerEmail) : null;
      return { ...g, total, inGW, enrolled, pct, managerGW };
    });
  }, [gwByEmail]);

  // ── Overall stats ─────────────────────────────────────────────────────────────
  const totalStaff = React.useMemo(() =>
    (window.BP_ROSTER || []).filter(e => e.status === 'Active' && e.id && e.email?.includes('@')).length,
  []);
  const totalInGW     = groups.reduce((s, g) => s + g.inGW, 0);
  const totalEnrolled = groups.reduce((s, g) => s + g.enrolled, 0);
  const totalManagers = groups.filter(g => g.key !== '__no_manager__').length;
  const overallPct    = totalInGW > 0 ? Math.round(totalEnrolled / totalInGW * 100) : 0;

  // ── Filter + sort ─────────────────────────────────────────────────────────────
  const filtered = groups.filter(g =>
    !search || g.managerName.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'worst') return a.pct - b.pct;
    if (sort === 'best')  return b.pct - a.pct;
    if (sort === 'alpha') return a.managerName.localeCompare(b.managerName);
    if (sort === 'size')  return b.total - a.total;
    return 0;
  });

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const pctColor = (pct) => pct >= 80 ? '#15803d' : pct >= 40 ? '#ca8a04' : '#dc2626';
  const pctBg    = (pct) => pct >= 80 ? '#dcfce7' : pct >= 40 ? '#fef9c3' : '#fee2e2';

  // ── Render states ─────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="tc-empty">
      <div className="tc-empty-icon">⟳</div>
      <div className="tc-empty-title">Loading team data…</div>
    </div>
  );

  if (!gwCache || gwUsers.length === 0) return (
    <div className="tc-empty">
      <div className="tc-empty-icon">📋</div>
      <div className="tc-empty-title">Google Workspace data not synced yet</div>
      <div className="tc-empty-sub">
        Go to the <strong>MFA</strong> tab → click <strong>"Connect Google Admin"</strong> to sync user data.
        This view populates automatically from the same cache — no extra login needed.
      </div>
    </div>
  );

  return (
    <div className="tc-wrap">

      {/* ── Overall summary bar ── */}
      <div className="tc-summary">
        <div className="tc-stat">
          <div className="tc-stat-val">{totalStaff}</div>
          <div className="tc-stat-label">Roster staff</div>
        </div>
        <div className="tc-stat">
          <div className="tc-stat-val">{totalInGW}</div>
          <div className="tc-stat-label">In Workspace</div>
        </div>
        <div className="tc-stat">
          <div className="tc-stat-val" style={{ color: pctColor(overallPct) }}>{totalEnrolled}</div>
          <div className="tc-stat-label">2FA enrolled</div>
        </div>
        <div className="tc-stat">
          <div className="tc-stat-val" style={{ color: '#dc2626' }}>{totalInGW - totalEnrolled}</div>
          <div className="tc-stat-label">Need 2FA</div>
        </div>
        <div className="tc-stat tc-stat-pct">
          <div className="tc-stat-val" style={{ color: pctColor(overallPct) }}>{overallPct}%</div>
          <div className="tc-stat-label">Overall coverage</div>
          <div className="tc-overall-bar">
            <div className="tc-overall-bar-fill" style={{ width: `${overallPct}%`, background: pctColor(overallPct) }} />
          </div>
        </div>
        <div className="tc-stat">
          <div className="tc-stat-val">{totalManagers}</div>
          <div className="tc-stat-label">Managers</div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="tc-controls">
        <div className="tc-search-wrap">
          <span className="tc-search-icon">⌕</span>
          <input className="tc-search" placeholder="Search by manager name…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="tc-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="tc-sort-wrap">
          <span className="tc-sort-label">Sort:</span>
          {[['worst','Worst first'],['best','Best first'],['alpha','A–Z'],['size','Team size']].map(([v, l]) => (
            <button key={v} className={`tc-sort-btn ${sort === v ? 'tc-sort-active' : ''}`}
              onClick={() => setSort(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── Manager groups ── */}
      <div className="tc-groups">
        {sorted.map(g => {
          const isOpen   = expanded === g.key;
          const pc       = pctColor(g.pct);
          const pb       = pctBg(g.pct);
          const mgGW     = g.managerGW;
          const noManager = g.key === '__no_manager__';

          // Filter members for expanded view
          let shownReports = g.reports;
          if (memberFilter === 'no2fa')   shownReports = g.reports.filter(r => !getGW(r.email)?.isEnrolledIn2Sv);
          if (memberFilter === 'enrolled') shownReports = g.reports.filter(r => getGW(r.email)?.isEnrolledIn2Sv);

          return (
            <div key={g.key} className={`tc-group ${isOpen ? 'tc-group-open' : ''} ${noManager ? 'tc-group-noManager' : ''}`}>

              {/* Group header — always visible */}
              <div className="tc-group-head" onClick={() => setExpanded(isOpen ? null : g.key)}>
                <div className="tc-group-left">
                  <div className="tc-group-top-row">
                    <span className="tc-manager-name">{g.managerName}</span>
                    {g.managerTitle && <span className="tc-manager-title">{g.managerTitle}</span>}
                    {mgGW ? (
                      mgGW.isEnrolledIn2Sv
                        ? <span className="tc-mgr-badge tc-mgr-2fa-on">✓ 2FA</span>
                        : <span className="tc-mgr-badge tc-mgr-2fa-off">⚠ No 2FA</span>
                    ) : g.managerEmail ? (
                      <span className="tc-mgr-badge tc-mgr-nogw" title="Manager email not found in Google Workspace">⚠ Not in GW</span>
                    ) : null}
                  </div>
                  <div className="tc-group-bar-row">
                    <div className="tc-bar-track">
                      <div className="tc-bar-fill" style={{ width: `${g.pct}%`, background: pc }} />
                    </div>
                    <span className="tc-bar-label" style={{ color: pc, background: pb }}>
                      {g.enrolled}/{g.inGW} enrolled · {g.pct}%
                    </span>
                    {g.inGW < g.total && (
                      <span className="tc-not-gw-count">{g.total - g.inGW} not in Workspace</span>
                    )}
                  </div>
                </div>
                <div className="tc-group-right">
                  <span className="tc-team-count">{g.total} staff</span>
                  <span className="tc-chevron">{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded member list */}
              {isOpen && (
                <div className="tc-group-body">
                  <div className="tc-member-controls">
                    <span className="tc-member-filter-label">Show:</span>
                    {[['all','All'],['no2fa','No 2FA only'],['enrolled','Enrolled only']].map(([v, l]) => (
                      <button key={v}
                        className={`tc-mf-btn ${memberFilter === v ? 'tc-mf-active' : ''}`}
                        onClick={e => { e.stopPropagation(); setMemberFilter(v); }}>
                        {l}
                      </button>
                    ))}
                    <span className="tc-member-count">
                      {shownReports.length} of {g.total}
                    </span>
                  </div>

                  <table className="tc-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Job Title</th>
                        <th>Email</th>
                        <th>2FA Status</th>
                        <th>2FA Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shownReports.length === 0 ? (
                        <tr><td colSpan={5} className="tc-table-empty">No members match this filter.</td></tr>
                      ) : shownReports.map(r => {
                        const gw          = getGW(r.email);
                        const methodInfos = gw?.isEnrolledIn2Sv ? getMethodInfos(r.email) : [];
                        return (
                          <tr key={r.id || r.email}
                              className={gw && !gw.isEnrolledIn2Sv ? 'tc-row-no2fa' : gw?.isEnrolledIn2Sv ? 'tc-row-ok' : 'tc-row-nogw'}>
                            <td className="tc-col-name">{r.firstName} {r.lastName}</td>
                            <td className="tc-col-title">{r.title || <span className="tc-na">—</span>}</td>
                            <td className="tc-col-email">{r.email}</td>
                            <td className="tc-col-status">
                              {!gw ? (
                                <span className="tc-badge-nogw">Not in Workspace</span>
                              ) : gw.isEnrolledIn2Sv ? (
                                <span className="gw-2fa-on">✓ Enabled</span>
                              ) : (
                                <span className="gw-2fa-off">⚠ Not set</span>
                              )}
                            </td>
                            <td className="tc-col-method">
                              {!gw ? (
                                <span className="gw-method-na">—</span>
                              ) : gw.isEnrolledIn2Sv ? (
                                methodInfos.length > 0
                                  ? <div className="gw-method-badges">
                                      {methodInfos.map((mi, i) => (
                                        <span key={i} className={`gw-method-badge ${mi.cls}`}>{mi.icon} {mi.label}</span>
                                      ))}
                                    </div>
                                  : <span className="gw-method-badge gw-method-other" title="2FA enabled but method not in recent login events">❓ Unknown</span>
                              ) : (
                                <span className="gw-method-na">Not enrolled</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Quick action footer */}
                  {g.enrolled < g.inGW && (
                    <div className="tc-action-footer">
                      <span className="tc-action-text">
                        ⚠ <strong>{g.inGW - g.enrolled} team member{g.inGW - g.enrolled !== 1 ? 's' : ''}</strong> in this group still need{g.inGW - g.enrolled === 1 ? 's' : ''} to set up 2FA.
                        Manager <strong>{g.managerName}</strong> should follow up.
                      </span>
                    </div>
                  )}
                  {g.enrolled === g.inGW && g.inGW > 0 && (
                    <div className="tc-action-footer tc-action-done">
                      ✓ All Workspace members in this team have 2FA enabled.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="tc-legend">
        <span className="tc-legend-item"><span className="tc-legend-dot" style={{background:'#dc2626'}}/>0–39% — Action required</span>
        <span className="tc-legend-item"><span className="tc-legend-dot" style={{background:'#ca8a04'}}/>40–79% — In progress</span>
        <span className="tc-legend-item"><span className="tc-legend-dot" style={{background:'#15803d'}}/>80–100% — On track</span>
        <span className="tc-legend-sep" />
        <span className="tc-legend-note">Source of truth: Google Workspace · Roster: HRIS export {new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
      </div>

    </div>
  );
};

window.TeamCompliance = TeamCompliance;
