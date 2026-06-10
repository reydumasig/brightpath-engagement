// app.jsx — Header (exec summary cards) + main App orchestration.

const StatCard = ({ label, value, sub, accent, children }) => (
  <div className="stat" style={{ '--accent': accent || '#0f172a' }}>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    {sub && <div className="stat-sub">{sub}</div>}
    {children}
  </div>
);

const HealthDot = ({ level }) => {
  const colors = { green: '#10b981', yellow: '#f59e0b', red: '#ef4444', gray: '#94a3b8' };
  return <span className="health-dot" style={{ background: colors[level] }} />;
};

const WorkstreamCard = ({ ws, tasks, today, onClick, focused }) => {
  const wsTasks = tasks.filter((t) => t.ws === ws.id);
  const done = wsTasks.filter((t) => t.status === 'done').length;
  const blocked = wsTasks.filter((t) => t.status === 'blocked').length;
  const atRisk = wsTasks.filter((t) => t.status === 'at_risk').length;
  const overdue = wsTasks.filter((t) => t.due && t.due < today && t.status !== 'done').length;
  const pct = wsTasks.length ? Math.round((done / wsTasks.length) * 100) : 0;

  let health = 'green';
  if (blocked > 0) health = 'red';
  else if (atRisk > 0 || overdue > 0) health = 'yellow';
  if (today < window.ENGAGEMENT_START) health = 'gray';

  // Next milestone
  const nextMile = window.MILESTONES
    .filter((m) => m.ws === ws.id && window.addDays(window.ENGAGEMENT_START, m.day) >= today)
    .sort((a, b) => a.day - b.day)[0];

  return (
    <button className={`ws-card ${focused ? 'ws-card-focused' : ''}`}
            style={{ '--ws-color': ws.color, '--ws-tint': ws.tint, '--ws-deep': ws.deep }}
            onClick={onClick}>
      <div className="ws-card-head">
        <div className="ws-card-title">
          <span className="ws-card-dot" style={{ background: ws.color }} />
          <span>{ws.name}</span>
        </div>
        <HealthDot level={health} />
      </div>
      <div className="ws-card-tagline">{ws.tagline}</div>
      <div className="ws-card-progress">
        <div className="ws-card-progress-track">
          <div className="ws-card-progress-fill" style={{ width: `${pct}%`, background: ws.color }} />
        </div>
        <span className="ws-card-progress-pct">{pct}%</span>
      </div>
      <div className="ws-card-stats">
        <span>{done}/{wsTasks.length} <em>done</em></span>
        {overdue > 0 && <span className="ws-stat-warn">{overdue} <em>overdue</em></span>}
        {blocked > 0 && <span className="ws-stat-bad">{blocked} <em>blocked</em></span>}
        {atRisk > 0 && <span className="ws-stat-warn">{atRisk} <em>at risk</em></span>}
      </div>
      {nextMile && (
        <div className="ws-card-next">
          <span className="ws-card-next-label">NEXT MILESTONE</span>
          <span className="ws-card-next-text">◆ {nextMile.label}</span>
          <span className="ws-card-next-date">{window.fmtMon(window.addDays(window.ENGAGEMENT_START, nextMile.day))}</span>
        </div>
      )}
    </button>
  );
};

const UserPicker = ({ currentUser, setCurrentUser }) => {
  const [open, setOpen] = React.useState(!currentUser);
  const person = window.PEOPLE[currentUser];

  if (!open && person) {
    return (
      <button className="user-picker-btn" onClick={() => setOpen(true)} title="Change who you're posting as">
        <span className="user-picker-avatar" style={{ background: person.color || '#6366f1' }}>
          {person.initials}
        </span>
        <span className="user-picker-name">{person.name}</span>
        <span className="user-picker-caret">▾</span>
      </button>
    );
  }

  return (
    <div className="user-picker-modal">
      <div className="user-picker-modal-title">Who are you?</div>
      <div className="user-picker-modal-sub">Your name will appear on comments you post.</div>
      <div className="user-picker-list">
        {window.PEOPLE_LIST.map((p) => (
          <button key={p.id} className="user-picker-option" onClick={() => { setCurrentUser(p.id); setOpen(false); }}>
            <span className="user-picker-avatar" style={{ background: p.color || '#6366f1' }}>{p.initials}</span>
            <div>
              <div className="user-picker-opt-name">{p.name}</div>
              <div className="user-picker-opt-role">{p.role}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const SignOutButton = () => {
  const session = window.__authSession;
  if (!session) return null;
  return (
    <div className="signout-wrap">
      <span className="signout-email">{session.email}</span>
      <button className="signout-btn" onClick={() => window.BPAuth.signOut('/login.html')}
              title="Sign out">Sign out</button>
    </div>
  );
};

const Header = ({ tasks, today, focusWs, setFocusWs, currentUser, setCurrentUser }) => {
  const totalDays = window.totalDays;
  const dayIn = Math.max(0, Math.min(totalDays, window.dayOfEngagement(today)));
  const daysRemaining = Math.max(0, Math.ceil((window.ENGAGEMENT_END - today) / window.ONE_DAY));
  const overallPct = Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100);
  const beforeKickoff = today < window.ENGAGEMENT_START;

  return (
    <header className="hdr">
      <div className="hdr-top">
        <div className="hdr-brand">
          <div className="hdr-brand-mark">S360</div>
          <div className="hdr-brand-x">×</div>
          <div className="hdr-brand-client">BrightPath</div>
        </div>
        <div className="hdr-title-block">
          <div className="hdr-eyebrow">90-DAY ENGAGEMENT · MOS · IT SECURITY · CLAUDE</div>
          <h1 className="hdr-title">Engagement Tracker</h1>
          <div className="hdr-subtitle">
            {window.fmtFull(window.ENGAGEMENT_START)} → {window.fmtFull(window.ENGAGEMENT_END)} ·
            <span className="hdr-sm"> Success Manager: Lane Elmer</span>
          </div>
        </div>
        <div className="hdr-right">
          <SignOutButton />
          <UserPicker currentUser={currentUser} setCurrentUser={setCurrentUser} />
          <div className="hdr-stats">
          <StatCard label="Day"
                    value={beforeKickoff ? '—' : `${dayIn} / ${totalDays}`}
                    sub={beforeKickoff ? `Kickoff ${window.fmtMon(window.ENGAGEMENT_START)}` : `${daysRemaining} days remaining`} />
          <StatCard label="Progress" value={`${overallPct}%`} sub={`${tasks.filter((t) => t.status === 'done').length} / ${tasks.length} tasks done`}>
            <div className="stat-progress-track">
              <div className="stat-progress-fill" style={{ width: `${overallPct}%` }} />
            </div>
          </StatCard>
          </div>
        </div>
      </div>

      <div className="hdr-cards">
        {window.WS_LIST.map((ws) => (
          <WorkstreamCard key={ws.id} ws={ws} tasks={tasks} today={today}
                          focused={focusWs === ws.id}
                          onClick={() => setFocusWs(focusWs === ws.id ? null : ws.id)} />
        ))}
      </div>
    </header>
  );
};

// ── Persistence layer ───────────────────────────────────────────────────────
const STORAGE_KEY = 'brightpath-engagement-v1';
const ADMIN_KEY   = 'brightpath-admin-v1';
const USER_KEY    = 'brightpath-user-v1';

const loadCurrentUser = () => {
  // If a session mapped this email to a personId, use that
  const session = window.__authSession;
  if (session && session.personId) return session.personId;
  try { return localStorage.getItem(USER_KEY) || ''; } catch (e) { return ''; }
};
const saveCurrentUser = (id) => {
  try { localStorage.setItem(USER_KEY, id); } catch (e) {}
};

const loadOverlay = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) { return {}; }
};
const saveOverlay = (overlay) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(overlay)); } catch (e) {}
};

const loadAdminData = () => {
  try { return JSON.parse(localStorage.getItem(ADMIN_KEY) || '{}'); } catch (e) { return {}; }
};

// Merge admin overrides + user overlay into baseline TASKS
const applyOverlay = (overlay) => {
  const admin = loadAdminData();
  const taskOvr    = admin.taskOverrides || {};
  const deletedIds = new Set(admin.deletedIds || []);
  const newTasks   = (admin.newTasks || []).map((t) => ({
    ...t,
    due: t.due ? new Date(t.due) : null,
    comments: [],
    statusHistory: [],
  }));

  return [...window.TASKS, ...newTasks]
    .filter((t) => !deletedIds.has(t.id))
    .map((t) => {
      const ao = taskOvr[t.id] || {};
      const o  = overlay[t.id] || {};
      const dueRaw = o.due !== undefined ? o.due : (ao.due !== undefined ? ao.due : null);
      return {
        ...t,
        ...ao,
        due: dueRaw ? new Date(dueRaw) : (t.due ? new Date(t.due) : null),
        owner_s360:   o.owner_s360   || ao.owner_s360   || t.owner_s360,
        owner_client: o.owner_client || ao.owner_client || t.owner_client,
        priority:     o.priority     || ao.priority     || t.priority,
        status:       o.status       || ao.status       || t.status,
        comments:     [...(t.comments || []), ...(o.comments || [])],
        statusHistory: o.statusHistory || [],
      };
    });
};

const WEEKLY_KEY = 'brightpath-weekly-v1';
const loadWeekly = () => {
  try { const r = localStorage.getItem(WEEKLY_KEY); return r ? JSON.parse(r) : {}; } catch (e) { return {}; }
};
const saveWeekly = (s) => { try { localStorage.setItem(WEEKLY_KEY, JSON.stringify(s)); } catch (e) {} };

// ── Owner filter strip ───────────────────────────────────────────────────────
const OwnerFilter = ({ selected, onChange }) => (
  <div className="owner-filter-bar">
    <span className="owner-filter-label">Owner</span>
    <div className="owner-filter-chips">
      {window.PEOPLE_LIST.map((p) => {
        const active = selected.includes(p.id);
        const bg = p.org === 's360' ? '#0f172a' : '#7c2d12';
        return (
          <button key={p.id}
            className={`owner-filter-chip ${active ? 'owner-filter-chip-on' : ''}`}
            title={`${p.name} · ${p.role}`}
            onClick={() => onChange(active ? selected.filter((x) => x !== p.id) : [...selected, p.id])}>
            <span className="avatar" style={{ width: 26, height: 26, fontSize: 9.5,
              background: active ? bg : '#e2e8f0', color: active ? '#fff' : '#64748b' }}>
              {p.initials}
            </span>
          </button>
        );
      })}
      {selected.length > 0 && (
        <button className="owner-filter-clear" onClick={() => onChange([])}>× clear</button>
      )}
    </div>
  </div>
);
window.OwnerFilter = OwnerFilter;

// ── Main App ────────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "grouping": "workstream",
  "hideCompleted": false,
  "demoToday": 0,
  "showHelpHint": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [overlay, setOverlay] = React.useState(loadOverlay); // localStorage seed — replaced by Supabase on mount
  const [userTasks, setUserTasks] = React.useState([]);
  const [dbReady, setDbReady] = React.useState(false);
  const [weekly, setWeekly] = React.useState(loadWeekly);
  const [weeklyMeta, setWeeklyMeta] = React.useState({}); // { [weekIdx]: { updatedAt, updatedBy } }
  const [currentUser, setCurrentUser] = React.useState(loadCurrentUser);
  const [expandedIds, setExpandedIds] = React.useState(new Set());
  const [focusWs, setFocusWs] = React.useState(null);
  const [filterOwner, setFilterOwner] = React.useState([]);
  const [tab, setTab] = React.useState('roadmap'); // 'roadmap' | 'workplan' | 'weekly' | 'security'

  // Effective today: real today + tweakable demo offset
  const realToday = new Date(); // actual current date
  const today = window.addDays(realToday, t.demoToday || 0);
  const currentWeekIdx = Math.max(0, Math.min(12, Math.floor(window.dayOfEngagement(today) / 7)));
  const [weekIdx, setWeekIdx] = React.useState(currentWeekIdx);

  const tasks = React.useMemo(() => {
    const base = applyOverlay(overlay);
    const user = userTasks.map((t) => ({
      ...t,
      due:          t.due ? new Date(t.due) : null,
      comments:     (overlay[t.id] || {}).comments     || [],
      status:       (overlay[t.id] || {}).status       || t.status,
      priority:     (overlay[t.id] || {}).priority     || t.priority,
      owner_s360:   (overlay[t.id] || {}).owner_s360   || t.owner_s360,
      owner_client: (overlay[t.id] || {}).owner_client || t.owner_client,
      statusHistory: (overlay[t.id] || {}).statusHistory || [],
    }));
    return [...base, ...user];
  }, [overlay, userTasks]);

  // ── Load from Supabase on mount, then subscribe to real-time ──────────────
  React.useEffect(() => {
    Promise.all([
      window.SupabaseDB.loadOverlay(),
      window.SupabaseDB.loadUserTasks(),
      window.SupabaseDB.loadWeeklySnaps(),
    ]).then(([dbOverlay, dbUserTasks, { snaps: dbSnaps, meta: dbMeta }]) => {
        setOverlay(dbOverlay);
        saveOverlay(dbOverlay);
        setUserTasks(dbUserTasks);
        // Merge: Supabase wins over localStorage for any week that has been saved
        setWeekly((prev) => ({ ...prev, ...dbSnaps }));
        setWeeklyMeta(dbMeta);
        setDbReady(true);
      })
      .catch((err) => {
        console.warn('[Supabase] load failed, using local cache:', err.message);
        setDbReady(true);
      });
  }, []);

  React.useEffect(() => {
    if (!dbReady) return;
    window.SupabaseDB.subscribe(
      // another user changed a task field
      (row) => {
        setOverlay((prev) => ({
          ...prev,
          [row.task_id]: {
            ...(prev[row.task_id] || {}),
            ...(row.status   != null && { status:   row.status }),
            ...(row.priority != null && { priority: row.priority }),
            due:           row.due,
            owner_s360:    row.owner_s360    || [],
            owner_client:  row.owner_client  || [],
            statusHistory: row.status_history || [],
          },
        }));
      },
      // another user posted a comment
      (row) => {
        setOverlay((prev) => {
          const existing = (prev[row.task_id] || {}).comments || [];
          if (existing.some((c) => c.when === row.created_at && c.who === row.who)) return prev;
          return {
            ...prev,
            [row.task_id]: {
              ...(prev[row.task_id] || {}),
              comments: [...existing, { who: row.who, when: row.created_at, text: row.text }],
            },
          };
        });
      },
      // another user added a new task
      (row) => {
        setUserTasks((prev) => {
          if (prev.some((t) => t.id === row.id)) return prev;
          return [...prev, {
            id: row.id, ws: row.ws, title: row.title, subgroup: row.subgroup || null,
            status: row.status || 'not_started', priority: row.priority || 'med',
            due: null, owner_s360: row.owner_s360 || [], owner_client: row.owner_client || [],
            comments: [], isMilestone: false, recurring: null, notes: '',
          }];
        });
      },
      // another user edited a task
      (row) => {
        setUserTasks((prev) => prev.map((t) => t.id === row.id ? { ...t, title: row.title } : t));
      },
      // another user deleted a task
      (row) => {
        setUserTasks((prev) => prev.filter((t) => t.id !== row.id));
      },
      // another user saved a weekly snapshot
      (row) => {
        if (!row || row.week_idx == null) return;
        setWeekly((prev) => ({ ...prev, [row.week_idx]: row.snap_json || {} }));
        setWeeklyMeta((prev) => ({ ...prev, [row.week_idx]: { updatedAt: row.updated_at, updatedBy: row.updated_by } }));
      }
    );
  }, [dbReady]);

  React.useEffect(() => { saveOverlay(overlay); }, [overlay]);
  React.useEffect(() => { saveWeekly(weekly); }, [weekly]);
  React.useEffect(() => { saveCurrentUser(currentUser); }, [currentUser]);

  const onToggle = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const onUpdate = (id, patch) => {
    setOverlay((prev) => {
      const old = prev[id] || {};
      const merged = { ...old, ...patch };
      // Track status changes — used by the Weekly view to find tasks moved to Done
      if (patch.status) {
        const baseTask = window.TASKS.find((tk) => tk.id === id);
        const prevStatus = old.status || (baseTask ? baseTask.status : 'not_started');
        if (patch.status !== prevStatus) {
          merged.statusHistory = [
            ...(old.statusHistory || []),
            { status: patch.status, when: today.toISOString() },
          ];
        }
      }
      window.SupabaseDB.upsertTask(id, merged); // persist to Supabase for all users
      return { ...prev, [id]: merged };
    });
  };
  const onEditTask = (id, patch) => {
    setUserTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...patch } : t));
    window.SupabaseDB.updateUserTask(id, patch);
  };

  const onDeleteTask = (id) => {
    let removed;
    setUserTasks((prev) => {
      removed = prev.find((t) => t.id === id);
      return prev.filter((t) => t.id !== id);
    });
    window.SupabaseDB.deleteUserTask(id).then((ok) => {
      if (!ok && removed) {
        // Roll back — Supabase delete failed
        setUserTasks((prev) => [...prev, removed]);
        alert('Could not delete the task. Please run the SQL fix in Supabase and try again.');
      }
    });
  };

  const onAddTask = ({ ws, title, subgroup }) => {
    const id = `user-${Date.now()}`;
    const task = {
      id, ws, title, subgroup: subgroup || null,
      status: 'not_started', priority: 'med', due: null,
      owner_s360: [], owner_client: [], comments: [],
      isMilestone: false, recurring: null, notes: '',
    };
    setUserTasks((prev) => [...prev, task]);
    window.SupabaseDB.insertUserTask({ ...task, created_by: currentUser || null });
  };

  const onAddComment = (id, comment) => {
    window.SupabaseDB.insertComment(id, comment); // persist to Supabase for all users
    setOverlay((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        comments: [...((prev[id] || {}).comments || []), comment],
      },
    }));
  };
  const onResetAll = () => {
    if (confirm('Reset all status changes, comments, and weekly reports? This clears your local edits.')) {
      setOverlay({});
      setWeekly({});
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(WEEKLY_KEY);
    }
  };

  const demoLabel = (() => {
    if (t.demoToday === 0) return 'Live';
    const d = new Date(today);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  })();

  const TABS = [
    { id: 'roadmap',  label: 'Roadmap',         sub: '90-day Gantt' },
    { id: 'workplan', label: 'Workplan',        sub: `${tasks.length} tasks` },
    { id: 'weekly',   label: 'Weekly Progress', sub: `Week ${currentWeekIdx + 1} of 13` },
    { id: 'security', label: 'Security Hub',    sub: 'MFA · SSO · Access' },
    { id: 'claude',   label: 'Claude AI',       sub: 'Integrations · MCPs' },
  ];

  return (
    <div className="app">
      <Header tasks={tasks} today={today} focusWs={focusWs} setFocusWs={setFocusWs}
              currentUser={currentUser} setCurrentUser={setCurrentUser} />

      <nav className="tabs">
        {TABS.map((tb) => (
          <button key={tb.id} className={`tab ${tab === tb.id ? 'tab-active' : ''}`} onClick={() => setTab(tb.id)}>
            <span className="tab-label">{tb.label}</span>
            <span className="tab-sub">{tb.sub}</span>
          </button>
        ))}
      </nav>

      {tab === 'roadmap' && (
        <section className="section">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">EXECUTIVE SUMMARY</div>
              <h2 className="section-title">90-Day Roadmap</h2>
            </div>
            <div className="section-actions">
              <span className="legend">
                <span className="legend-item"><span className="legend-bar legend-sec" /> IT Security</span>
                <span className="legend-item"><span className="legend-bar legend-mos" /> MOS</span>
                <span className="legend-item"><span className="legend-bar legend-claude" /> Claude</span>
                <span className="legend-item"><span className="legend-diamond">◆</span> Milestone</span>
              </span>
            </div>
          </div>
          <window.GanttChart today={today} tasks={tasks} onBarClick={(wsId) => { setFocusWs(focusWs === wsId ? null : wsId); setTab('workplan'); }} />
        </section>
      )}

      {tab === 'workplan' && (
        <section className="section">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">ITEMIZED WORKPLAN</div>
              <h2 className="section-title">
                {focusWs ? `${window.WORKSTREAMS[focusWs].name} — focused` : 'All workstreams'}
                {focusWs && (
                  <button className="clear-focus" onClick={() => setFocusWs(null)}>clear focus ×</button>
                )}
              </h2>
            </div>
            <div className="section-actions">
              <div className="seg">
                <button className={t.grouping === 'workstream' ? 'on' : ''} onClick={() => setTweak('grouping', 'workstream')}>By Workstream</button>
                <button className={t.grouping === 'phase' ? 'on' : ''} onClick={() => setTweak('grouping', 'phase')}>By Phase</button>
                <button className={t.grouping === 'owner' ? 'on' : ''} onClick={() => setTweak('grouping', 'owner')}>By Owner</button>
              </div>
              <label className="check">
                <input type="checkbox" checked={t.hideCompleted} onChange={(e) => setTweak('hideCompleted', e.target.checked)} />
                Hide completed
              </label>
              <button className="btn-ghost" onClick={onResetAll} title="Reset local edits">Reset</button>
            </div>
          </div>
          <window.Workplan
            tasks={tasks}
            today={today}
            grouping={t.grouping}
            hideCompleted={t.hideCompleted}
            expandedIds={expandedIds}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onAddComment={onAddComment}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            focusWs={focusWs}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        </section>
      )}

      {tab === 'weekly' && (
        <section className="section">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">WEEKLY PROGRESS · CLIENT STATUS</div>
              <h2 className="section-title">Friday Update</h2>
            </div>
          </div>
          <OwnerFilter selected={filterOwner} onChange={setFilterOwner} />
          <window.WeeklyProgress
            tasks={filterOwner.length ? tasks.filter((t) => filterOwner.some((id) => [...(t.owner_s360 || []), ...(t.owner_client || [])].includes(id))) : tasks}
            today={today}
            weekIdx={weekIdx}
            setWeekIdx={setWeekIdx}
            currentWeekIdx={currentWeekIdx}
            snapshots={weekly}
            setSnapshots={setWeekly}
            weeklyMeta={weeklyMeta}
            currentUser={currentUser}
            onSaveSnap={async (snap) => {
              const ok = await window.SupabaseDB.upsertWeeklySnap(weekIdx, snap, currentUser);
              return ok;
            }}
          />
        </section>
      )}

      {tab === 'security' && (
        <section className="section">
          <window.SecurityHub OwnerFilter={OwnerFilter} />
        </section>
      )}

      {tab === 'claude' && (
        <section className="section">
          <window.ClaudeRollout />
        </section>
      )}

      <footer className="ftr">
        <div>
          <strong>BrightPath × S360 Engagement Tracker</strong> ·
          May 11 – Aug 9, 2026 · 90 days
        </div>
        <div className="ftr-meta">
          Status &amp; comments persist locally · Demo today: <strong>{demoLabel}</strong>
        </div>
      </footer>

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="View">
          <window.TweakRadio label="Group by" value={t.grouping}
                             options={[{ value: 'workstream', label: 'Stream' }, { value: 'phase', label: 'Phase' }, { value: 'owner', label: 'Owner' }]}
                             onChange={(v) => setTweak('grouping', v)} />
          <window.TweakToggle label="Hide completed" value={t.hideCompleted} onChange={(v) => setTweak('hideCompleted', v)} />
        </window.TweakSection>
        <window.TweakSection label="Demo">
          <window.TweakSlider label="Simulate today (offset days)" value={t.demoToday}
                              min={-3} max={94} step={1} unit="d"
                              onChange={(v) => setTweak('demoToday', v)} />
          <window.TweakButton label="Reset local edits" secondary onClick={onResetAll} />
        </window.TweakSection>
      </window.TweaksPanel>
    </div>
  );
}

window.App = App;
