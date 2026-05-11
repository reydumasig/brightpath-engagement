// weekly.jsx — Friday Update view. Auto-pulls from workplan, plus freeform narrative.

const fmtRange = (s, e) =>
  `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

const fmtDate = (d) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// Empty snapshot template
const emptySnap = () => ({
  narrative: { completed: '', onDeck: '', risks: '', wins: '', decisions: '' },
  excludeIds: {},   // task ids the user manually removed from auto sections
  extraIds:   {},   // task ids the user manually pinned into a section { taskId: 'completed'|'onDeck'|... }
  customRisks: [],  // [{ id, text, owner }]
  meetings: '',
});

function WeeklyProgress({ tasks, today, weekIdx, setWeekIdx, currentWeekIdx, snapshots, setSnapshots }) {
  const week = window.WEEKS[weekIdx];
  const weekStart = week.start;
  const weekEnd = week.end;
  const nextWeek = window.WEEKS[Math.min(12, weekIdx + 1)];
  const prevWeek = window.WEEKS[Math.max(0, weekIdx - 1)];

  // Get/init this week's snapshot
  const snap = snapshots[week.idx] || emptySnap();
  const updateSnap = (patch) => {
    setSnapshots((prev) => ({
      ...prev,
      [week.idx]: { ...emptySnap(), ...(prev[week.idx] || {}), ...patch },
    }));
  };
  const updateNarrative = (key, val) =>
    updateSnap({ narrative: { ...emptySnap().narrative, ...(snap.narrative || {}), [key]: val } });

  // ── Auto-pull logic ────────────────────────────────────────────────────────
  // Completed: tasks moved to Done DURING this week (via statusHistory) OR with due date in this week + status=done
  const inWeek = (d) => d && d >= weekStart && d <= new Date(weekEnd.getTime() + 86400000 - 1);

  const autoCompleted = tasks.filter((t) => {
    if (snap.excludeIds[t.id] === 'completed') return false;
    const movedToDoneThisWeek = (t.statusHistory || []).some(
      (h) => h.status === 'done' && inWeek(new Date(h.when))
    );
    const dueThisWeekAndDone = t.status === 'done' && inWeek(t.due);
    return movedToDoneThisWeek || dueThisWeekAndDone;
  });

  // On Deck: tasks due next week that aren't Done, plus anything in-progress crossing into next week
  const nextStart = nextWeek.start;
  const nextEnd = new Date(nextWeek.end.getTime() + 86400000 - 1);
  const autoOnDeck = tasks.filter((t) => {
    if (snap.excludeIds[t.id] === 'onDeck') return false;
    if (t.status === 'done') return false;
    if (t.due && t.due >= nextStart && t.due <= nextEnd) return true;
    return false;
  });

  // Risks: tasks with status=at_risk or blocked, plus anything past due not done
  const autoRisks = tasks.filter((t) => {
    if (snap.excludeIds[t.id] === 'risks') return false;
    if (t.status === 'at_risk' || t.status === 'blocked') return true;
    if (t.status !== 'done' && t.due && t.due < weekStart) return true;
    return false;
  });

  // Manually-pinned extras
  const extras = (sectionKey) =>
    tasks.filter((t) => snap.extraIds[t.id] === sectionKey);

  const completedItems = [...autoCompleted, ...extras('completed').filter(t => !autoCompleted.includes(t))];
  const onDeckItems    = [...autoOnDeck, ...extras('onDeck').filter(t => !autoOnDeck.includes(t))];
  const riskItems      = [...autoRisks, ...extras('risks').filter(t => !autoRisks.includes(t))];

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const atRiskTasks = tasks.filter((t) => t.status === 'at_risk' || t.status === 'blocked').length;

  // Per-workstream progress this week
  const wsStats = window.WS_LIST.filter((ws) => ws.id !== 'admin').map((ws) => {
    const ts = tasks.filter((t) => t.ws === ws.id);
    const done = ts.filter((t) => t.status === 'done').length;
    return { ws, total: ts.length, done, pct: ts.length ? Math.round((done / ts.length) * 100) : 0 };
  });

  const wsLookup = (wsId) => window.WORKSTREAMS[wsId] || { id: wsId, name: 'Admin', short: 'Admin', color: '#475569' };

  // ── Export helpers ─────────────────────────────────────────────────────────
  const buildMarkdown = () => {
    const lines = [];
    lines.push(`# BrightPath × S360 — Weekly Update`);
    lines.push(`**Week ${week.num} of 13** · ${fmtRange(weekStart, weekEnd)}`);
    lines.push(``);
    lines.push(`## Snapshot`);
    lines.push(`- Overall progress: ${doneTasks}/${totalTasks} tasks complete (${Math.round(doneTasks/totalTasks*100)}%)`);
    wsStats.forEach((s) => lines.push(`- ${s.ws.name}: ${s.done}/${s.total} (${s.pct}%)`));
    lines.push(``);
    lines.push(`## ✅ What we completed this week`);
    if (snap.narrative.completed) lines.push(snap.narrative.completed, ``);
    completedItems.forEach((t) => lines.push(`- ${t.title} — ${wsLookup(t.ws).short}`));
    if (!completedItems.length) lines.push(`- _No items auto-pulled._`);
    lines.push(``);
    lines.push(`## 🎯 What's on deck for next week (W${nextWeek.num} · ${fmtRange(nextWeek.start, nextWeek.end)})`);
    if (snap.narrative.onDeck) lines.push(snap.narrative.onDeck, ``);
    onDeckItems.forEach((t) => lines.push(`- ${t.title} — due ${fmtDate(t.due)}`));
    if (!onDeckItems.length) lines.push(`- _Nothing scheduled._`);
    lines.push(``);
    lines.push(`## ⚠️ Key risks & roadblocks`);
    if (snap.narrative.risks) lines.push(snap.narrative.risks, ``);
    riskItems.forEach((t) => lines.push(`- ${t.title} — ${window.STATUS[t.status].label}`));
    snap.customRisks.forEach((r) => lines.push(`- ${r.text}${r.owner ? ` (${r.owner})` : ''}`));
    if (!riskItems.length && !snap.customRisks.length) lines.push(`- _None flagged._`);
    if (snap.narrative.wins) {
      lines.push(``, `## 🏆 Wins`, snap.narrative.wins);
    }
    if (snap.narrative.decisions) {
      lines.push(``, `## 🤝 Decisions needed`, snap.narrative.decisions);
    }
    return lines.join('\n');
  };

  const onCopyMarkdown = () => {
    navigator.clipboard.writeText(buildMarkdown()).then(
      () => alert('Weekly update copied as Markdown.'),
      () => alert('Could not copy. Try a different browser.')
    );
  };

  const onPrint = () => window.print();

  // Refresh = clear excludes/extras for this week
  const onRefresh = () => {
    if (confirm('Re-pull auto items from the workplan? This clears manual exclusions and pins for this week (your narrative text is kept).')) {
      updateSnap({ excludeIds: {}, extraIds: {} });
    }
  };

  return (
    <div className="weekly">
      {/* ── Week navigator ────────────────────────────────────────────────── */}
      <div className="wk-nav">
        <button className="wk-arrow" onClick={() => setWeekIdx(Math.max(0, weekIdx - 1))} disabled={weekIdx === 0} aria-label="Previous week">‹</button>
        <div className="wk-nav-center">
          <div className="wk-nav-eyebrow">{week.idx === currentWeekIdx ? 'CURRENT WEEK' : week.idx < currentWeekIdx ? 'PAST' : 'UPCOMING'}</div>
          <div className="wk-nav-title">Week {week.num} <span className="wk-nav-of">of 13</span></div>
          <div className="wk-nav-range">{fmtRange(weekStart, weekEnd)}</div>
        </div>
        <button className="wk-arrow" onClick={() => setWeekIdx(Math.min(12, weekIdx + 1))} disabled={weekIdx === 12} aria-label="Next week">›</button>

        <div className="wk-jumper">
          {window.WEEKS.map((w) => (
            <button
              key={w.idx}
              className={`wk-pip ${w.idx === weekIdx ? 'wk-pip-active' : ''} ${w.idx === currentWeekIdx ? 'wk-pip-today' : ''} ${w.idx < currentWeekIdx ? 'wk-pip-past' : ''}`}
              onClick={() => setWeekIdx(w.idx)}
              title={`W${w.num} · ${fmtRange(w.start, w.end)}`}
            >
              {w.num}
            </button>
          ))}
          <button className="wk-jump-today" onClick={() => setWeekIdx(currentWeekIdx)} disabled={weekIdx === currentWeekIdx}>Jump to current</button>
        </div>
      </div>

      {/* ── Snapshot stat strip ───────────────────────────────────────────── */}
      <div className="wk-stats">
        <div className="wk-stat">
          <div className="wk-stat-num">{doneTasks}<span className="wk-stat-of">/{totalTasks}</span></div>
          <div className="wk-stat-lbl">Tasks complete</div>
          <div className="wk-stat-bar"><div className="wk-stat-fill" style={{ width: `${(doneTasks/totalTasks)*100}%` }} /></div>
        </div>
        <div className="wk-stat">
          <div className="wk-stat-num">{inProgTasks}</div>
          <div className="wk-stat-lbl">In progress</div>
        </div>
        <div className="wk-stat">
          <div className="wk-stat-num" style={atRiskTasks ? { color: '#dc2626' } : null}>{atRiskTasks}</div>
          <div className="wk-stat-lbl">At risk / blocked</div>
        </div>
        {wsStats.map((s) => (
          <div className="wk-stat wk-stat-ws" key={s.ws.id}>
            <div className="wk-stat-num" style={{ color: s.ws.color }}>{s.pct}<span className="wk-stat-pct">%</span></div>
            <div className="wk-stat-lbl">{s.ws.short}</div>
            <div className="wk-stat-bar"><div className="wk-stat-fill" style={{ width: `${s.pct}%`, background: s.ws.color }} /></div>
          </div>
        ))}
      </div>

      {/* ── Action bar ────────────────────────────────────────────────────── */}
      <div className="wk-actions">
        <div className="wk-actions-l">
          <button className="btn-ghost" onClick={onRefresh}>↻ Re-pull from workplan</button>
        </div>
        <div className="wk-actions-r">
          <button className="btn-ghost" onClick={onCopyMarkdown}>Copy as Markdown</button>
          <button className="btn-primary" onClick={onPrint}>Print / PDF</button>
        </div>
      </div>

      {/* ── 3 main sections ───────────────────────────────────────────────── */}
      <div className="wk-sections">
        <Section
          icon="✓"
          accent="#16a34a"
          title="What we completed this week"
          subtitle={`Auto-pulled from tasks moved to Done in W${week.num} (${fmtRange(weekStart, weekEnd)})`}
          narrative={snap.narrative.completed}
          onNarrativeChange={(v) => updateNarrative('completed', v)}
          narrativePlaceholder="Add narrative context — themes, what changed, what shifted…"
          items={completedItems}
          today={today}
          sectionKey="completed"
          snap={snap}
          updateSnap={updateSnap}
          tasks={tasks}
          wsLookup={wsLookup}
          showStatus
          emptyText="No tasks were marked Done this week."
        />

        <Section
          icon="→"
          accent="#2563eb"
          title="On deck for next week"
          subtitle={`Tasks due in W${nextWeek.num} (${fmtRange(nextWeek.start, nextWeek.end)})`}
          narrative={snap.narrative.onDeck}
          onNarrativeChange={(v) => updateNarrative('onDeck', v)}
          narrativePlaceholder="What's the focus for next week? Sequencing notes, dependencies…"
          items={onDeckItems}
          today={today}
          sectionKey="onDeck"
          snap={snap}
          updateSnap={updateSnap}
          tasks={tasks}
          wsLookup={wsLookup}
          showDue
          emptyText="Nothing currently scheduled for next week."
        />

        <Section
          icon="!"
          accent="#dc2626"
          title="Key risks & roadblocks"
          subtitle="At Risk, Blocked, or past-due tasks — plus anything else flagged"
          narrative={snap.narrative.risks}
          onNarrativeChange={(v) => updateNarrative('risks', v)}
          narrativePlaceholder="Mitigation plan, escalation path, ask of client…"
          items={riskItems}
          today={today}
          sectionKey="risks"
          snap={snap}
          updateSnap={updateSnap}
          tasks={tasks}
          wsLookup={wsLookup}
          showStatus
          showRiskExtras
          emptyText="No risks flagged. 🎉"
        />
      </div>

      {/* ── Optional sections ─────────────────────────────────────────────── */}
      <div className="wk-extras">
        <div className="wk-extra">
          <div className="wk-extra-head">
            <span className="wk-extra-icon">★</span>
            <h4>Wins / highlights</h4>
          </div>
          <textarea
            className="wk-narrative"
            value={snap.narrative.wins || ''}
            onChange={(e) => updateNarrative('wins', e.target.value)}
            placeholder="Moments worth calling out — quick wins, positive feedback, momentum…"
            rows={3}
          />
        </div>
        <div className="wk-extra">
          <div className="wk-extra-head">
            <span className="wk-extra-icon">?</span>
            <h4>Decisions needed</h4>
          </div>
          <textarea
            className="wk-narrative"
            value={snap.narrative.decisions || ''}
            onChange={(e) => updateNarrative('decisions', e.target.value)}
            placeholder="Asks of the client — approvals, sign-offs, direction needed…"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

// ── Section: one of the 3 main blocks ─────────────────────────────────────
function Section({
  icon, accent, title, subtitle,
  narrative, onNarrativeChange, narrativePlaceholder,
  items, today, sectionKey, snap, updateSnap, tasks, wsLookup,
  showStatus, showDue, showRiskExtras, emptyText,
}) {
  const [adding, setAdding] = React.useState(false);
  const [riskAdding, setRiskAdding] = React.useState(false);
  const [riskText, setRiskText] = React.useState('');

  const onExclude = (taskId) => {
    updateSnap({ excludeIds: { ...snap.excludeIds, [taskId]: sectionKey } });
  };

  const candidatesToAdd = tasks.filter(
    (t) => !items.includes(t) && snap.excludeIds[t.id] !== sectionKey
  );

  const onPin = (taskId) => {
    updateSnap({ extraIds: { ...snap.extraIds, [taskId]: sectionKey } });
    setAdding(false);
  };

  const onAddCustomRisk = () => {
    if (!riskText.trim()) return;
    updateSnap({
      customRisks: [...(snap.customRisks || []), {
        id: 'r' + Date.now(), text: riskText.trim(), owner: '',
      }],
    });
    setRiskText('');
    setRiskAdding(false);
  };

  const onRemoveCustomRisk = (id) => {
    updateSnap({ customRisks: (snap.customRisks || []).filter((r) => r.id !== id) });
  };

  return (
    <div className="wk-section" style={{ '--accent': accent }}>
      <div className="wk-section-head">
        <div className="wk-section-icon" style={{ background: accent }}>{icon}</div>
        <div className="wk-section-title-wrap">
          <h3 className="wk-section-title">{title}</h3>
          <div className="wk-section-sub">{subtitle}</div>
        </div>
        <div className="wk-section-count">{items.length}{showRiskExtras && (snap.customRisks || []).length ? `+${snap.customRisks.length}` : ''}</div>
      </div>

      <textarea
        className="wk-narrative"
        value={narrative || ''}
        onChange={(e) => onNarrativeChange(e.target.value)}
        placeholder={narrativePlaceholder}
        rows={2}
      />

      <ul className="wk-items">
        {items.length === 0 && (snap.customRisks || []).length === 0 && !narrative && (
          <li className="wk-empty">{emptyText}</li>
        )}
        {items.map((t) => {
          const ws = wsLookup(t.ws);
          return (
            <li className="wk-item" key={t.id}>
              <span className="wk-item-ws" style={{ background: ws.color }} title={ws.name} />
              <div className="wk-item-body">
                <div className="wk-item-title">{t.title}</div>
                <div className="wk-item-meta">
                  <span className="wk-item-tag">{ws.short}</span>
                  {showDue && t.due && <span className="wk-item-tag">Due {fmtDate(t.due)}</span>}
                  {showStatus && (
                    <span className="wk-item-status" style={{ background: window.STATUS[t.status].bg, color: window.STATUS[t.status].fg }}>
                      {window.STATUS[t.status].label}
                    </span>
                  )}
                  {(t.owner_s360 || []).map((p) => (
                    <span key={p} className="wk-item-owner" title={window.PEOPLE[p] ? window.PEOPLE[p].name : p}>{window.PEOPLE[p] ? window.PEOPLE[p].initials : p}</span>
                  ))}
                </div>
              </div>
              <button className="wk-item-x" onClick={() => onExclude(t.id)} title="Remove from this section">×</button>
            </li>
          );
        })}
        {showRiskExtras && (snap.customRisks || []).map((r) => (
          <li className="wk-item wk-item-custom" key={r.id}>
            <span className="wk-item-ws" style={{ background: '#dc2626' }} />
            <div className="wk-item-body">
              <div className="wk-item-title">{r.text}</div>
              <div className="wk-item-meta">
                <span className="wk-item-tag wk-item-custom-tag">Manual entry</span>
              </div>
            </div>
            <button className="wk-item-x" onClick={() => onRemoveCustomRisk(r.id)} title="Remove">×</button>
          </li>
        ))}
      </ul>

      <div className="wk-section-add">
        {!adding && !riskAdding && (
          <React.Fragment>
            <button className="wk-add-btn" onClick={() => setAdding(true)}>+ Pin a task here</button>
            {showRiskExtras && (
              <button className="wk-add-btn" onClick={() => setRiskAdding(true)}>+ Add custom risk</button>
            )}
          </React.Fragment>
        )}
        {adding && (
          <div className="wk-add-picker">
            <div className="wk-add-label">Pin task to this section:</div>
            <select
              className="wk-add-select"
              defaultValue=""
              onChange={(e) => { if (e.target.value) onPin(e.target.value); }}
            >
              <option value="" disabled>Select a task…</option>
              {candidatesToAdd.map((t) => (
                <option key={t.id} value={t.id}>{wsLookup(t.ws).short} · {t.title}</option>
              ))}
            </select>
            <button className="wk-add-cancel" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        )}
        {riskAdding && (
          <div className="wk-add-risk">
            <input
              className="wk-add-input"
              placeholder="Describe a risk or roadblock not in the workplan…"
              value={riskText}
              onChange={(e) => setRiskText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onAddCustomRisk(); }}
              autoFocus
            />
            <button className="wk-add-save" onClick={onAddCustomRisk} disabled={!riskText.trim()}>Add</button>
            <button className="wk-add-cancel" onClick={() => { setRiskAdding(false); setRiskText(''); }}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { WeeklyProgress });
