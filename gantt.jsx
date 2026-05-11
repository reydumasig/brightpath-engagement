// gantt.jsx — Executive summary Gantt chart.
// Renders the 13-week timeline with monthly bands, weekly columns, today marker,
// per-workstream bars, and milestone diamonds. Hover any bar/diamond for detail.

const GanttChart = ({ today, onBarClick }) => {
  const totalCols = 13;
  const dayWidthPct = 100 / (totalCols * 7);
  const todayDay = Math.max(0, Math.min(window.totalDays - 1, window.dayOfEngagement(today)));
  const todayPct = (todayDay / (totalCols * 7)) * 100;
  const inEngagement = today >= window.ENGAGEMENT_START && today <= window.ENGAGEMENT_END;
  const beforeEngagement = today < window.ENGAGEMENT_START;

  // Group bars by workstream for layout — each ws gets its own row band
  const barsByWs = {};
  for (const b of window.GANTT_BARS) {
    if (!barsByWs[b.ws]) barsByWs[b.ws] = [];
    barsByWs[b.ws].push(b);
  }
  const milesByWs = {};
  for (const m of window.MILESTONES) {
    if (!milesByWs[m.ws]) milesByWs[m.ws] = [];
    milesByWs[m.ws].push(m);
  }

  const [hover, setHover] = React.useState(null); // {kind, x, y, item}

  const onEnter = (item, kind) => (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = e.currentTarget.closest('.gantt').getBoundingClientRect();
    setHover({
      kind, item,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top,
    });
  };
  const onLeave = () => setHover(null);

  return (
    <div className="gantt">
      {/* Header — month band + week columns */}
      <div className="gantt-head">
        <div className="gantt-head-label">90-DAY ROADMAP</div>
        <div className="gantt-head-grid">
          <div className="gantt-months">
            {window.PHASES.map((p) => {
              const left = (p.weekStart * 7 / (totalCols * 7)) * 100;
              const width = ((p.weekEnd - p.weekStart + 1) * 7 / (totalCols * 7)) * 100;
              return (
                <div key={p.id} className="gantt-month" style={{ left: `${left}%`, width: `${width}%` }}>
                  <span className="gantt-month-label">{p.label}</span>
                  <span className="gantt-month-sub">{p.sub}</span>
                </div>
              );
            })}
          </div>
          <div className="gantt-weeks">
            {window.WEEKS.map((w) => (
              <div key={w.idx} className="gantt-week-cell">
                <div className="gantt-week-num">W{w.num}</div>
                <div className="gantt-week-range">{w.range}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body — workstream rows */}
      <div className="gantt-body">
        {/* Column grid lines (rendered behind bars) */}
        <div className="gantt-grid">
          {window.WEEKS.map((wk, i) => (
            <div key={i} className="gantt-grid-col" style={{ left: `${(i * 7 / (totalCols * 7)) * 100}%`, width: `${dayWidthPct * 7}%` }} />
          ))}
          {/* Phase background tints */}
          {window.PHASES.map((p, i) => {
            const left = (p.weekStart * 7 / (totalCols * 7)) * 100;
            const width = ((p.weekEnd - p.weekStart + 1) * 7 / (totalCols * 7)) * 100;
            return (
              <div key={p.id} className={`gantt-phase-band gantt-phase-${i}`} style={{ left: `${left}%`, width: `${width}%` }} />
            );
          })}
          {/* Today marker */}
          {inEngagement && (
            <div className="gantt-today" style={{ left: `${todayPct}%` }}>
              <div className="gantt-today-line" />
              <div className="gantt-today-pill">TODAY · {window.fmtMD(today)}</div>
            </div>
          )}
        </div>

        {window.WS_LIST.map((ws) => {
          const bars = barsByWs[ws.id] || [];
          const miles = milesByWs[ws.id] || [];
          // Pack bars into lanes for non-overlapping display
          const lanes = [];
          for (const bar of bars) {
            let placed = false;
            for (const lane of lanes) {
              if (lane.every((b) => b.d1 < bar.d0 || b.d0 > bar.d1)) {
                lane.push(bar); placed = true; break;
              }
            }
            if (!placed) lanes.push([bar]);
          }

          return (
            <div key={ws.id} className="gantt-row" style={{ '--ws-color': ws.color, '--ws-tint': ws.tint, '--ws-deep': ws.deep }}>
              <div className="gantt-row-label">
                <span className="gantt-row-dot" style={{ background: ws.color }} />
                <span className="gantt-row-name">{ws.short}</span>
              </div>
              <div className="gantt-row-track" style={{ '--lanes': lanes.length }}>
                {lanes.map((lane, li) => (
                  <div key={li} className="gantt-lane">
                    {lane.map((bar, bi) => {
                      const left = (bar.d0 / (totalCols * 7)) * 100;
                      const width = ((bar.d1 - bar.d0 + 1) / (totalCols * 7)) * 100;
                      return (
                        <div
                          key={bi}
                          className={`gantt-bar ${bar.faded ? 'gantt-bar-faded' : ''}`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                          onMouseEnter={onEnter({ ...bar, ws }, 'bar')}
                          onMouseLeave={onLeave}
                          onClick={() => onBarClick && onBarClick(ws.id)}>
                          <span className="gantt-bar-label">{bar.label}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
                {/* Milestones layered on top */}
                <div className="gantt-mile-lane">
                  {miles.map((m) => {
                    const left = ((m.day + 0.5) / (totalCols * 7)) * 100;
                    return (
                      <div
                        key={m.id}
                        className="gantt-milestone"
                        style={{ left: `${left}%` }}
                        onMouseEnter={onEnter({ ...m, ws }, 'mile')}
                        onMouseLeave={onLeave}>
                        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                          <path d="M8 1l7 7-7 7-7-7z" fill={ws.deep} stroke="#fff" strokeWidth="1.5" />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hover && (
        <div className="gantt-tip" style={{ left: hover.x, top: hover.y }}>
          <div className="gantt-tip-ws" style={{ color: hover.item.ws.color }}>
            {hover.kind === 'mile' ? '◆ MILESTONE' : '▮ ' + hover.item.ws.short.toUpperCase()}
          </div>
          <div className="gantt-tip-label">{hover.item.label}</div>
          <div className="gantt-tip-date">
            {hover.kind === 'mile'
              ? window.fmtFull(window.addDays(window.ENGAGEMENT_START, hover.item.day))
              : `${window.fmtMon(window.addDays(window.ENGAGEMENT_START, hover.item.d0))} – ${window.fmtMon(window.addDays(window.ENGAGEMENT_START, hover.item.d1))}`}
          </div>
        </div>
      )}
    </div>
  );
};

window.GanttChart = GanttChart;
