// supabase.js — shared data layer (task updates, comments, user tasks, real-time)

(function () {
  const SUPABASE_URL = 'https://zvvvxhqzgafdhvebrity.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2dnZ4aHF6Z2FmZGh2ZWJyaXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzQyMjMsImV4cCI6MjA5NDI1MDIyM30.88H0ckIcVnotVOR427k6n0rOJnJ14CIo5TNSbSPY6MI';

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // ── Load overlay (task field edits + comments) ────────────────────────────
  async function loadOverlay() {
    const [{ data: updates, error: e1 }, { data: comments, error: e2 }] = await Promise.all([
      db.from('task_updates').select('*'),
      db.from('comments').select('*').order('created_at', { ascending: true }),
    ]);

    if (e1 || e2) throw new Error((e1 || e2).message);

    const overlay = {};

    for (const u of (updates || [])) {
      overlay[u.task_id] = {
        ...(u.status   != null && { status:   u.status }),
        ...(u.priority != null && { priority: u.priority }),
        ...(u.due      != null && { due:      u.due }),
        owner_s360:    u.owner_s360    || [],
        owner_client:  u.owner_client  || [],
        statusHistory: u.status_history || [],
        comments: [],
      };
    }

    for (const c of (comments || [])) {
      if (!overlay[c.task_id]) overlay[c.task_id] = { comments: [] };
      if (!overlay[c.task_id].comments) overlay[c.task_id].comments = [];
      overlay[c.task_id].comments.push({ who: c.who, when: c.created_at, text: c.text });
    }

    return overlay;
  }

  // ── Load user-created tasks ───────────────────────────────────────────────
  async function loadUserTasks() {
    const { data, error } = await db.from('user_tasks').select('*').order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map((r) => ({
      id:           r.id,
      ws:           r.ws,
      title:        r.title,
      subgroup:     r.subgroup || null,
      status:       r.status   || 'not_started',
      priority:     r.priority || 'med',
      due:          null,
      owner_s360:   r.owner_s360   || [],
      owner_client: r.owner_client || [],
      comments:     [],
      isMilestone:  false,
      recurring:    null,
      notes:        '',
    }));
  }

  // ── Insert a new user-created task ────────────────────────────────────────
  async function insertUserTask(task) {
    const { error } = await db.from('user_tasks').insert({
      id:           task.id,
      ws:           task.ws,
      title:        task.title,
      subgroup:     task.subgroup || null,
      status:       task.status   || 'not_started',
      priority:     task.priority || 'med',
      due:          task.due      || null,
      owner_s360:   task.owner_s360   || [],
      owner_client: task.owner_client || [],
      created_by:   task.created_by   || null,
    });
    if (error) console.error('[Supabase] insertUserTask:', error.message);
  }

  // ── Upsert a task's mutable fields ───────────────────────────────────────
  async function upsertTask(taskId, data) {
    const row = { task_id: taskId, updated_at: new Date().toISOString() };
    if (data.status       !== undefined) row.status         = data.status;
    if (data.priority     !== undefined) row.priority       = data.priority;
    if ('due' in data)                   row.due            = data.due || null;
    if (data.owner_s360   !== undefined) row.owner_s360     = data.owner_s360;
    if (data.owner_client !== undefined) row.owner_client   = data.owner_client;
    if (data.statusHistory !== undefined) row.status_history = data.statusHistory;

    const { error } = await db.from('task_updates').upsert(row, { onConflict: 'task_id' });
    if (error) console.error('[Supabase] upsertTask:', error.message);
  }

  // ── Insert a comment ──────────────────────────────────────────────────────
  async function insertComment(taskId, comment) {
    const { error } = await db.from('comments').insert({
      task_id:    taskId,
      who:        comment.who,
      text:       comment.text,
      created_at: comment.when,
    });
    if (error) console.error('[Supabase] insertComment:', error.message);
  }

  // ── Update a user-created task ────────────────────────────────────────────
  async function updateUserTask(id, patch) {
    const { error } = await db.from('user_tasks').update(patch).eq('id', id);
    if (error) console.error('[Supabase] updateUserTask:', error.message);
  }

  // ── Delete a user-created task ────────────────────────────────────────────
  async function deleteUserTask(id) {
    const { error, count } = await db
      .from('user_tasks')
      .delete({ count: 'exact' })
      .eq('id', id);
    if (error) {
      console.error('[Supabase] deleteUserTask error:', error.message);
      return false;
    }
    if (count === 0) {
      console.warn('[Supabase] deleteUserTask: no rows deleted (RLS or missing row)');
      return false;
    }
    return true;
  }

  // ── Security Hub: load / save system notes overrides ─────────────────────
  async function loadSecOverrides() {
    const { data, error } = await db.from('sec_overrides').select('*');
    if (error) throw new Error(error.message);
    const map = {};
    for (const r of (data || [])) {
      map[r.system_name] = {
        mfaNotes:  r.mfa_notes,
        ssoNotes:  r.sso_notes,
        action:    r.action,
        notes:     r.notes,
        deleted:   r.deleted || false,
        mfaStatus:       r.mfa_status,
        ssoStatus:       r.sso_status,
        riskLevel:       r.risk_level,
        ssoCompatStatus: r.sso_compat_status,
      };
    }
    return map;
  }

  async function upsertSecOverride(systemName, patch) {
    const row = { system_name: systemName, updated_at: new Date().toISOString() };
    if ('mfaNotes'  in patch) row.mfa_notes  = patch.mfaNotes;
    if ('ssoNotes'  in patch) row.sso_notes  = patch.ssoNotes;
    if ('action'    in patch) row.action     = patch.action;
    if ('notes'     in patch) row.notes      = patch.notes;
    if ('deleted'   in patch) row.deleted    = patch.deleted;
    if ('mfaStatus' in patch) row.mfa_status = patch.mfaStatus;
    if ('ssoStatus' in patch) row.sso_status = patch.ssoStatus;
    if ('riskLevel'       in patch) row.risk_level        = patch.riskLevel;
    if ('ssoCompatStatus' in patch) row.sso_compat_status = patch.ssoCompatStatus;
    const { error } = await db.from('sec_overrides').upsert(row, { onConflict: 'system_name' });
    if (error) console.error('[Supabase] upsertSecOverride:', error.message);
  }

  // ── Security Hub: load / save system owners ──────────────────────────────
  async function loadSecOwners() {
    const { data, error } = await db.from('task_updates').select('task_id,owner_s360').like('task_id', 'sec-sys:%');
    if (error) throw new Error(error.message);
    const map = {};
    for (const r of (data || [])) {
      map[r.task_id.slice('sec-sys:'.length)] = r.owner_s360 || [];
    }
    return map;
  }

  async function upsertSecOwner(systemName, ownerIds) {
    const { error } = await db.from('task_updates').upsert(
      { task_id: `sec-sys:${systemName}`, owner_s360: ownerIds, updated_at: new Date().toISOString() },
      { onConflict: 'task_id' }
    );
    if (error) console.error('[Supabase] upsertSecOwner:', error.message);
  }

  // ── Weekly snapshots (shared across all users) ───────────────────────────
  async function loadWeeklySnaps() {
    const { data, error } = await db.from('weekly_snapshots').select('*');
    // Return empty gracefully if table doesn't exist yet (won't sink the Promise.all)
    if (error) { console.warn('[Supabase] loadWeeklySnaps:', error.message); return { snaps: {}, meta: {} }; }
    const snaps = {};
    const meta  = {};
    for (const r of (data || [])) {
      snaps[r.week_idx] = r.snap_json || {};
      meta[r.week_idx]  = { updatedAt: r.updated_at, updatedBy: r.updated_by };
    }
    return { snaps, meta };
  }

  async function upsertWeeklySnap(weekIdx, snap, updatedBy) {
    const { error } = await db.from('weekly_snapshots').upsert({
      week_idx:   weekIdx,
      snap_json:  snap,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy || null,
    }, { onConflict: 'week_idx' });
    if (error) console.error('[Supabase] upsertWeeklySnap:', error.message);
    return !error;
  }

  // ── Real-time subscription ────────────────────────────────────────────────
  function subscribe(onTaskRow, onCommentRow, onUserTaskInsert, onUserTaskUpdate, onUserTaskDelete, onWeeklySnap) {
    db.channel('bp-realtime')
      .on('postgres_changes', { event: '*',      schema: 'public', table: 'task_updates' },
        (p) => onTaskRow(p.new))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' },
        (p) => onCommentRow(p.new))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_tasks' },
        (p) => onUserTaskInsert && onUserTaskInsert(p.new))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_tasks' },
        (p) => onUserTaskUpdate && onUserTaskUpdate(p.new))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'user_tasks' },
        (p) => onUserTaskDelete && onUserTaskDelete(p.old))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_snapshots' },
        (p) => onWeeklySnap && onWeeklySnap(p.new))
      .subscribe();
  }

  // ── User-added security systems (MFA heatmap + SSO compat) ──────────────────
  async function loadUserSecSystems() {
    const { data, error } = await db.from('user_sec_systems').select('*').order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async function insertUserSecSystem(row) {
    const { error } = await db.from('user_sec_systems').insert(row);
    if (error) console.error('[Supabase] insertUserSecSystem:', error.message);
  }

  async function deleteUserSecSystem(id) {
    const { error } = await db.from('user_sec_systems').delete().eq('id', id);
    if (error) console.error('[Supabase] deleteUserSecSystem:', error.message);
  }

  // ── Google Workspace user cache (shared across all viewers) ─────────────────
  async function loadGWCache() {
    const { data, error } = await db.from('gw_cache').select('*').eq('key', 'users').maybeSingle();
    if (error) throw new Error(error.message);
    return data; // { key, data: { users, methodMap }, updated_at, updated_by } | null
  }

  async function saveGWCache(users, methodMap, updatedBy) {
    const { error } = await db.from('gw_cache').upsert({
      key:        'users',
      data:       { users, methodMap: methodMap || {} },
      updated_at: new Date().toISOString(),
      updated_by: updatedBy || null,
    }, { onConflict: 'key' });
    if (error) console.error('[Supabase] saveGWCache:', error.message);
  }

  window.SupabaseDB = { loadOverlay, loadUserTasks, insertUserTask, updateUserTask, deleteUserTask, upsertTask, insertComment, subscribe, loadSecOwners, upsertSecOwner, loadSecOverrides, upsertSecOverride, loadGWCache, saveGWCache, loadUserSecSystems, insertUserSecSystem, deleteUserSecSystem, loadWeeklySnaps, upsertWeeklySnap };
})();
