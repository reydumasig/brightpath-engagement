// workplan.jsx — Monday.com-style itemized board.
// Groups tasks by workstream (or phase), shows owner avatars, status pill,
// due date, priority, and inline-expandable comments thread.

const STATUS_LIST = window.STATUS_ORDER.map((id) => window.STATUS[id]);

const Avatar = ({ pid, size = 22 }) => {
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

const AvatarStack = ({ ids, size = 22, max = 4 }) => {
  if (!ids || !ids.length) return <span className="avatar-empty">—</span>;
  const shown = ids.slice(0, max);
  const overflow = ids.length - shown.length;
  return (
    <div className="avatar-stack">
      {shown.map((pid) => <Avatar key={pid} pid={pid} size={size} />)}
      {overflow > 0 && <span className="avatar avatar-more" style={{ width: size, height: size, fontSize: size * 0.38 }}>+{overflow}</span>}
    </div>
  );
};

const StatusPill = ({ status, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  const s = window.STATUS[status];
  return (
    <div className="status-pill-wrap" ref={ref}>
      <button className="status-pill" style={{ background: s.bg, color: s.fg }} onClick={() => setOpen(!open)}>
        {s.label}
      </button>
      {open && (
        <div className="status-menu">
          {STATUS_LIST.map((opt) => (
            <button key={opt.id} className="status-menu-item"
                    style={{ background: opt.bg, color: opt.fg }}
                    onClick={() => { onChange(opt.id); setOpen(false); }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PriorityChip = ({ priority }) => {
  const p = window.PRIORITY[priority];
  return <span className="priority-chip" style={{ background: p.bg, color: p.fg }}><i style={{ background: p.dot }} />{p.label}</span>;
};

const DueCell = ({ task, today }) => {
  if (task.recurring) return <span className="due-recurring">↻ {task.recurring}</span>;
  if (!task.due) return <span className="due-empty">—</span>;
  const days = Math.ceil((task.due - today) / window.ONE_DAY);
  let cls = 'due-cell';
  let hint = '';
  if (task.status === 'done') { cls += ' due-done'; hint = ''; }
  else if (days < 0) { cls += ' due-late'; hint = `${-days}d late`; }
  else if (days === 0) { cls += ' due-today'; hint = 'today'; }
  else if (days <= 7) { cls += ' due-soon'; hint = `in ${days}d`; }
  else { hint = `in ${days}d`; }
  return (
    <span className={cls}>
      <span className="due-date">{window.fmtMon(task.due)}</span>
      {hint && <span className="due-hint">{hint}</span>}
    </span>
  );
};

const CommentThread = ({ task, onAddComment }) => {
  const [draft, setDraft] = React.useState('');
  const [author, setAuthor] = React.useState('LE');
  const submit = () => {
    if (!draft.trim()) return;
    onAddComment(task.id, { who: author, when: new Date().toISOString(), text: draft.trim() });
    setDraft('');
  };
  return (
    <div className="comment-thread">
      <div className="comment-thread-head">Activity & comments</div>
      {task.comments.length === 0 && <div className="comment-empty">No comments yet.</div>}
      {task.comments.map((c, i) => {
        const p = window.PEOPLE[c.who] || { name: c.who, initials: '?' };
        const when = new Date(c.when);
        return (
          <div key={i} className="comment">
            <Avatar pid={c.who} size={26} />
            <div className="comment-body">
              <div className="comment-meta">
                <span className="comment-author">{p.name}</span>
                <span className="comment-when">{when.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
              </div>
              <div className="comment-text">{c.text}</div>
            </div>
          </div>
        );
      })}
      {task.notes && (
        <div className="comment-note">
          <span className="comment-note-tag">NOTE</span>
          {task.notes}
        </div>
      )}
      <div className="comment-compose">
        <select className="comment-author-pick" value={author} onChange={(e) => setAuthor(e.target.value)}>
          {window.PEOPLE_LIST.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input className="comment-input" placeholder="Add a comment…"
               value={draft} onChange={(e) => setDraft(e.target.value)}
               onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
        <button className="comment-submit" onClick={submit} disabled={!draft.trim()}>Post</button>
      </div>
    </div>
  );
};

const TaskRow = ({ task, today, expanded, onToggle, onUpdate, onAddComment }) => {
  const ws = window.WORKSTREAMS[task.ws] || { color: '#475569', short: 'Admin' };
  const wsTag = task.ws === 'admin'
    ? { color: '#475569', tint: '#f1f5f9', short: 'Admin' }
    : ws;
  const isDone = task.status === 'done';
  return (
    <>
      <div className={`row ${isDone ? 'row-done' : ''} ${expanded ? 'row-expanded' : ''}`} onClick={onToggle}>
        <div className="cell cell-expand">
          <span className={`expand-chev ${expanded ? 'open' : ''}`}>›</span>
          {task.isMilestone && <span className="milestone-flag" title="Milestone">◆</span>}
        </div>
        <div className="cell cell-task">
          <div className="task-title">{task.title}</div>
          <div className="task-meta">
            <span className="ws-tag" style={{ background: wsTag.tint, color: wsTag.color }}>
              <i style={{ background: wsTag.color }} />{wsTag.short}
            </span>
            {task.comments.length > 0 && (
              <span className="comment-count">💬 {task.comments.length}</span>
            )}
          </div>
        </div>
        <div className="cell cell-owner-s360" onClick={(e) => e.stopPropagation()}>
          <AvatarStack ids={task.owner_s360} />
        </div>
        <div className="cell cell-owner-client" onClick={(e) => e.stopPropagation()}>
          <AvatarStack ids={task.owner_client} />
        </div>
        <div className="cell cell-status" onClick={(e) => e.stopPropagation()}>
          <StatusPill status={task.status} onChange={(v) => onUpdate(task.id, { status: v })} />
        </div>
        <div className="cell cell-priority">
          <PriorityChip priority={task.priority} />
        </div>
        <div className="cell cell-due">
          <DueCell task={task} today={today} />
        </div>
      </div>
      {expanded && (
        <div className="row-detail">
          <CommentThread task={task} onAddComment={onAddComment} />
        </div>
      )}
    </>
  );
};

const Workplan = ({ tasks, today, grouping, hideCompleted, expandedIds, onToggle, onUpdate, onAddComment, focusWs }) => {
  // Group tasks
  let groups;
  if (grouping === 'workstream') {
    groups = [
      { key: 'sec',    label: 'IT Security',  meta: window.WORKSTREAMS.sec },
      { key: 'mos',    label: 'MOS Rollout',  meta: window.WORKSTREAMS.mos },
      { key: 'claude', label: 'Claude AI',    meta: window.WORKSTREAMS.claude },
      { key: 'admin',  label: 'Engagement & Admin', meta: { color: '#475569', tint: '#f1f5f9' } },
    ].map((g) => ({ ...g, tasks: tasks.filter((t) => t.ws === g.key) }));
  } else {
    // by phase based on due date
    groups = window.PHASES.map((p) => {
      const pStart = window.addDays(window.ENGAGEMENT_START, p.weekStart * 7);
      const pEnd = window.addDays(window.ENGAGEMENT_START, (p.weekEnd + 1) * 7 - 1);
      return {
        key: p.id,
        label: p.label,
        meta: { color: '#475569', tint: '#f1f5f9' },
        sub: p.sub,
        tasks: tasks.filter((t) => {
          if (!t.due) return p.id === 'm1'; // recurring → bucket in M1
          return t.due >= pStart && t.due <= pEnd;
        }),
      };
    });
    // tasks before engagement start → M1
    const orphan = tasks.filter((t) => t.due && t.due < window.addDays(window.ENGAGEMENT_START, 0));
    if (orphan.length) groups[0].tasks.push(...orphan);
  }

  if (focusWs) groups = groups.filter((g) => g.key === focusWs);

  return (
    <div className="workplan">
      <div className="workplan-header">
        <div className="cell-h cell-expand"></div>
        <div className="cell-h cell-task">Task</div>
        <div className="cell-h cell-owner-s360">S360</div>
        <div className="cell-h cell-owner-client">BrightPath</div>
        <div className="cell-h cell-status">Status</div>
        <div className="cell-h cell-priority">Priority</div>
        <div className="cell-h cell-due">Due</div>
      </div>
      {groups.map((g) => {
        let rows = g.tasks;
        if (hideCompleted) rows = rows.filter((t) => t.status !== 'done');
        if (rows.length === 0) return null;
        const doneCount = g.tasks.filter((t) => t.status === 'done').length;
        return (
          <div key={g.key} className="group" style={{ '--g-color': g.meta.color }}>
            <div className="group-head">
              <span className="group-bar" style={{ background: g.meta.color }} />
              <span className="group-label">{g.label}</span>
              {g.sub && <span className="group-sub">{g.sub}</span>}
              <span className="group-count">{doneCount}/{g.tasks.length} done</span>
            </div>
            {rows.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                today={today}
                expanded={expandedIds.has(task.id)}
                onToggle={() => onToggle(task.id)}
                onUpdate={onUpdate}
                onAddComment={onAddComment}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

window.Workplan = Workplan;
window.Avatar = Avatar;
