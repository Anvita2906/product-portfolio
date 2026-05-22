// Detail components for each section, plus the dispatcher.

const { useState: useStateD, useEffect: useEffectD, useRef: useRefD } = React;

/* ───────────────────────── Projects Constellation ───────────────────────── */
function ProjectsConstellation() {
  const PROJECTS = window.PROJECTS;
  const EDGES = window.PROJECT_EDGES;
  const [active, setActive] = useStateD(null);
  const [hover, setHover] = useStateD(null);

  const W = 540, H = 380;
  const toPx = (p) => ({ x: (p.x * 0.42 + 0.5) * W, y: (-p.y * 0.42 + 0.5) * H });
  const pxMap = Object.fromEntries(PROJECTS.map(p => [p.id, toPx(p)]));

  const activeProj = active ? PROJECTS.find(p => p.id === active) : null;

  return (
    <div className="constellation-wrap">
      <div className="constellation">
        <svg viewBox={`0 0 ${W} ${H}`} className="constellation-svg">
          <defs>
            <radialGradient id="star-glow">
              <stop offset="0%" stopColor="#fff5e2" stopOpacity="1" />
              <stop offset="40%" stopColor="#e8a87c" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#e8a87c" stopOpacity="0" />
            </radialGradient>
            <filter id="star-blur"><feGaussianBlur stdDeviation="1.2" /></filter>
          </defs>

          {/* edges */}
          {EDGES.map(([a, b], i) => {
            const pa = pxMap[a], pb = pxMap[b];
            const lit = hover && (hover === a || hover === b);
            return (
              <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={lit ? '#e8a87c' : 'rgba(239,230,216,0.18)'}
                strokeWidth={lit ? 0.8 : 0.4}
                strokeDasharray={lit ? '0' : '2 3'} />
            );
          })}

          {/* stars */}
          {PROJECTS.map(p => {
            const { x, y } = pxMap[p.id];
            const r = 3 + p.mag * 2.5;
            const isHover = hover === p.id;
            return (
              <g key={p.id}
                 onMouseEnter={() => setHover(p.id)}
                 onMouseLeave={() => setHover(null)}
                 onClick={() => setActive(p.id)}
                 style={{ cursor: 'pointer' }}>
                <circle cx={x} cy={y} r={r * 4} fill="url(#star-glow)" opacity={isHover ? 1 : 0.6} />
                <circle cx={x} cy={y} r={r} fill="#fff5e2" filter="url(#star-blur)" />
                <circle cx={x} cy={y} r={r * 0.5} fill="#fff" />
                {p.video && (
                  <circle cx={x + r + 6} cy={y - r - 4} r="2" fill="#e8a87c">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                )}
                <text x={x + r + 8} y={y + 4}
                  fill={isHover ? '#efe6d8' : '#b9a99a'}
                  fontFamily="Instrument Serif, serif"
                  fontSize="13"
                  style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}>
                  {p.title}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="constellation-foot">
          <span className="legend"><span className="lg lg-case"></span> case study</span>
          <span className="legend"><span className="lg lg-pres"></span> presentation</span>
          <span className="legend"><span className="lg lg-vibe"></span> vibe-coded · has video</span>
        </div>
      </div>

      {/* Side rail of project chips */}
      <div className="proj-rail">
        {PROJECTS.map(p => (
          <button key={p.id}
            className={`proj-chip ${active === p.id ? 'active' : ''} ${hover === p.id ? 'hover' : ''}`}
            onMouseEnter={() => setHover(p.id)}
            onMouseLeave={() => setHover(null)}
            onClick={() => setActive(p.id)}>
            <span className={`chip-kind chip-${p.kind.split(' ')[0].toLowerCase()}`}>{p.kind}</span>
            <span className="chip-title">{p.title}</span>
            <span className="chip-blurb">{p.blurb}</span>
            <span className="chip-meta">
              <span>{p.year}</span>
              <span className="chip-tag">· {p.tag}</span>
              {p.video && <span className="chip-video">▸ video</span>}
            </span>
          </button>
        ))}
      </div>

      {activeProj && (
        <div className="proj-modal" onClick={(e) => e.target === e.currentTarget && setActive(null)}>
          <div className="proj-modal-inner">
            <button className="detail-close" onClick={() => setActive(null)} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 6L18 18M6 18L18 6" /></svg>
            </button>
            <div className="detail-kicker">
              <span className="dot" style={{ background: '#e8a87c' }}></span>
              <span>{activeProj.kind}</span>
              <span className="sep">·</span>
              <span className="planet-codename">{activeProj.year}</span>
            </div>
            <h2 className="detail-title" style={{ fontSize: 38 }}>{activeProj.title}</h2>
            <p className="detail-line" style={{ marginTop: 8 }}>{activeProj.blurb}</p>

            {activeProj.video ? (
              <div className="video-slot">
                <div className="video-frame">
                  <div className="video-placeholder">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
                    </svg>
                    <span>video walkthrough · coming soon</span>
                  </div>
                </div>
                <p className="video-cap">A 2-minute build log of how this came together.</p>
              </div>
            ) : (
              <div className="case-slot">
                <div className="case-grid">
                  <div className="case-cell"><span className="cc-label">Problem</span><span className="cc-body">Placeholder — what the user couldn’t do before.</span></div>
                  <div className="case-cell"><span className="cc-label">Approach</span><span className="cc-body">Placeholder — how I framed and reduced the bet.</span></div>
                  <div className="case-cell"><span className="cc-label">Outcome</span><span className="cc-body">Placeholder — what changed; metrics if any.</span></div>
                </div>
                <button className="open-deck">Open deck →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Skills Arsenal ───────────────────────── */
function SkillsArsenal() {
  const spaceRef = useRefD(null);
  const [orbLayout, setOrbLayout] = useStateD([]);
  const [openOrbs, setOpenOrbs] = useStateD({ tech: false, prod: false, ai: false });

  const bgStars = [
    { id: 1, left: '7%', top: '5%', size: 1.4, duration: '3.2s', delay: '0.1s' },
    { id: 2, left: '18%', top: '12%', size: 1.8, duration: '4.5s', delay: '0.6s' },
    { id: 3, left: '34%', top: '9%', size: 1.5, duration: '4.1s', delay: '1.4s' },
    { id: 4, left: '58%', top: '7%', size: 1.3, duration: '3.8s', delay: '0.9s' },
    { id: 5, left: '82%', top: '14%', size: 1.7, duration: '4.8s', delay: '1.2s' },
    { id: 6, left: '12%', top: '30%', size: 1.9, duration: '3.6s', delay: '0.3s' },
    { id: 7, left: '46%', top: '38%', size: 1.4, duration: '4.9s', delay: '1.8s' },
    { id: 8, left: '84%', top: '33%', size: 1.6, duration: '4.2s', delay: '0.8s' },
    { id: 9, left: '6%', top: '52%', size: 1.5, duration: '3.9s', delay: '1.6s' },
    { id: 10, left: '29%', top: '64%', size: 1.8, duration: '4.4s', delay: '0.5s' },
    { id: 11, left: '74%', top: '58%', size: 1.4, duration: '3.7s', delay: '1.1s' },
    { id: 12, left: '18%', top: '82%', size: 1.9, duration: '4.3s', delay: '0.7s' },
  ];

  const orbs = [
    {
      id: 'prod',
      title: 'Product',
      sub: 'How I think',
      color: 'rose',
      left: '78%',
      top: 220,
      size: 300,
      ringRadius: 238,
      startAngle: 252,
      skills: ['Product strategy', 'Roadmapping', 'PRD writing', 'User research', 'Product design', 'Product improvement', 'RCA', 'Stakeholder alignment', 'KPI design', 'A/B testing', 'Cross-functional'],
    },
    {
      id: 'tech',
      title: 'Technical',
      sub: 'What I build',
      color: 'green',
      left: '18%',
      top: 620,
      size: 300,
      ringRadius: 226,
      startAngle: 270,
      skills: ['Python', 'SQL', 'AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Git', 'Grafana', 'Prometheus'],
    },
    {
      id: 'ai',
      title: 'AI',
      sub: 'The new layer',
      color: 'purple',
      left: '68%',
      top: 1080,
      size: 330,
      ringRadius: 248,
      startAngle: 270,
      skills: ['Claude Code', 'Cursor', 'Codex', 'Vibe coding', 'Agentic AI', 'RAG', 'N8N', 'Zapier', 'Prompt eng', 'LLM APIs', 'GenAI lifecycle', 'Model eval'],
    },
  ];

  useEffectD(() => {
    const node = spaceRef.current;
    if (!node) return;
    const width = node.clientWidth;
    const nextLayout = orbs.map((orb) => {
      const centerX = width * (parseFloat(orb.left) / 100);
      const centerY = orb.top;
      const N = orb.skills.length;
      const skills = orb.skills.map((skill, i) => {
        const angle = ((orb.startAngle || 270) + (i * 360 / N)) * (Math.PI / 180);
        const x = centerX + Math.cos(angle) * orb.ringRadius;
        const y = centerY + Math.sin(angle) * orb.ringRadius;
        return { name: skill, x, y };
      });
      return { ...orb, centerX, centerY, skills };
    });
    setOrbLayout(nextLayout);
  }, []);

  return (
    <div className="skills-page">
      <div className="skills-hero">
        <div className="detail-kicker">
          <span className="dot" style={{ background: '#c4a8e0' }}></span>
          <span>Skills</span>
          <span className="sep">·</span>
          <span className="planet-codename">Arsenal</span>
        </div>
        <h2 className="detail-title">Skills <em>Arsenal.</em></h2>
        <p className="skills-hero-note">A static map of the toolkit I carry.</p>
      </div>

      <div ref={spaceRef} className="skills-space">
        <div className="skills-nebula skills-nebula-tech" />
        <div className="skills-nebula skills-nebula-prod" />
        <div className="skills-nebula skills-nebula-ai" />

        <svg className="skills-connectors" aria-hidden="true">
          {orbLayout.map((orb) =>
            openOrbs[orb.id] ? orb.skills.map((skill) => (
              <line
                key={`${orb.id}-${skill.name}`}
                x1={orb.centerX}
                y1={orb.centerY}
                x2={skill.x}
                y2={skill.y}
                stroke={
                  orb.color === 'green'
                    ? 'rgba(93,202,122,0.06)'
                    : orb.color === 'rose'
                      ? 'rgba(214,168,168,0.06)'
                      : 'rgba(184,160,214,0.06)'
                }
                strokeWidth="0.5"
              />
            )) : null
          )}
        </svg>

        {bgStars.map((star) => (
          <span
            key={star.id}
            className="skills-bg-star"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDuration: star.duration,
              animationDelay: star.delay,
            }}
          />
        ))}

        <span className="skills-shooting-star" />

        {orbLayout.map((orb) => (
          <React.Fragment key={orb.id}>
            <div
              className={`skill-orb skill-orb-${orb.id}`}
              style={{
                left: orb.left,
                top: `${orb.top}px`,
                width: `${orb.size}px`,
                height: `${orb.size}px`,
              }}
              onClick={() =>
                setOpenOrbs((current) => ({
                  ...current,
                  [orb.id]: !current[orb.id],
                }))
              }
            >
              <div className="skill-orb-title">{orb.title}</div>
              <div className="skill-orb-sub">{orb.sub}</div>
              <div className="skill-orb-tap">{openOrbs[orb.id] ? 'click to hide' : 'click to reveal'}</div>
            </div>

            {openOrbs[orb.id] ? orb.skills.map((skill) => (
              <div
                key={skill.name}
                className={`skill-pill ${orb.color} show`}
                style={{
                  left: `${skill.x}px`,
                  top: `${skill.y}px`,
                }}
              >
                {skill.name}
              </div>
            )) : null}
          </React.Fragment>
        ))}

        {openOrbs.tech ? <div className="cert-text">✓ CKA · CKAD · Terraform · AWS</div> : null}
      </div>
    </div>
  );
}

/* ───────────────────────── Journey Spaceship ───────────────────────── */
function JourneySpaceship({ idx: controlledIdx, onGo, flightRef: externalFlightRef }) {
  const J = window.JOURNEY;
  const VIEW_W = 900;
  const VIEW_H = 2800;
  const FLIGHT_H = 2800;
  const PATH_D = 'M 115 150 C 210 230, 360 330, 610 520 C 740 625, 745 810, 655 965 C 535 1175, 255 1260, 165 1555 C 120 1735, 255 1910, 470 2140 C 610 2285, 700 2360, 765 2310';
  const STATION_PCTS = [0.01, 0.285, 0.555, 0.955];
  const STOP_LABELS = ['station 01', 'station 02', 'station 03', 'destination'];
  const COPY_POSITIONS = [
    { left: '42%', top: '120px', width: '440px' },
    { left: '19%', top: '540px', width: '560px' },
    { left: '41%', top: '1400px', width: '560px' },
    { left: '18%', top: '2140px', width: '470px' },
  ];
  const LABEL_OFFSETS = [
    { dx: 18, dy: -18, anchor: 'start' },
    { dx: 22, dy: -6, anchor: 'start' },
    { dx: -22, dy: -6, anchor: 'end' },
    { dx: 18, dy: 2, anchor: 'start' },
  ];
  const pathRef = useRefD(null);
  const progRef = useRefD(null);
  const shipRef = useRefD(null);
  const cardRefs = useRefD([]);
  const flightRef = useRefD(null);
  const totalLenRef = useRefD(1);
  const [internalIdx, setInternalIdx] = useStateD(0);
  const idx = controlledIdx ?? internalIdx;
  const setIdx = onGo ?? setInternalIdx;
  const [stationPoints, setStationPoints] = useStateD(STATION_PCTS.map(() => ({ x: 150, y: 100 })));
  const prevIdxRef = useRefD(idx);

  useEffectD(() => {
    if (externalFlightRef) externalFlightRef.current = flightRef.current;
  }, [externalFlightRef]);

  useEffectD(() => {
    const measure = () => {
      if (!pathRef.current) return;
      const totalLen = pathRef.current.getTotalLength();
      totalLenRef.current = totalLen;
      const points = STATION_PCTS.map((pct) => pathRef.current.getPointAtLength(totalLen * pct));
      setStationPoints(points);
      const pt = points[idx] || points[0];
      if (shipRef.current) shipRef.current.setAttribute('transform', `translate(${pt.x},${pt.y})`);
      if (progRef.current) {
        progRef.current.style.strokeDasharray = totalLen;
        progRef.current.style.strokeDashoffset = totalLen * (1 - STATION_PCTS[idx]);
      }
    };
    let raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [idx]);

  const goStation = (newIdx) => {
    if (newIdx < 0 || newIdx >= J.length) return;
    setIdx(newIdx);
    if (!pathRef.current) return;
    const pct = STATION_PCTS[newIdx];
    const totalLen = totalLenRef.current || pathRef.current.getTotalLength();
    const pt = pathRef.current.getPointAtLength(pct * totalLen);
    if (shipRef.current) {
      shipRef.current.setAttribute('transform', `translate(${pt.x},${pt.y})`);
    }
    if (progRef.current) {
      progRef.current.style.strokeDasharray = totalLen;
      progRef.current.style.strokeDashoffset = totalLen * (1 - pct);
    }
  };

  useEffectD(() => {
    if (prevIdxRef.current === idx) return;
    const card = cardRefs.current[idx];
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    prevIdxRef.current = idx;
  }, [idx]);

  const flowLog = (lines) => {
    const chunks = [];
    for (let i = 0; i < lines.length; i += 2) {
      chunks.push(lines.slice(i, i + 2).join(' '));
    }
    return chunks;
  };

  return (
    <div className="journey-page">
      <div ref={flightRef} className="journey-flight" style={{ position: 'relative', height: FLIGHT_H }}>
        <svg
          className="flight-svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <defs>
            <linearGradient id="journey-ship-glow" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#fff5e2" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#e8a87c" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path
            ref={pathRef}
            d={PATH_D}
            className="journey-path-base"
            fill="none"
          />
          <path
            d={PATH_D}
            className="journey-path-dash"
            fill="none"
          />
          <path
            ref={progRef}
            d={PATH_D}
            className="journey-path-progress"
            fill="none"
          />

          {J.map((station, stationIdx) => {
            const pt = stationPoints[stationIdx] || { x: 150, y: 100 };
            const active = stationIdx === idx;
            const isBreak = stationIdx === 2;
            const isDestination = stationIdx === J.length - 1;
            const labelCfg = LABEL_OFFSETS[stationIdx];
            return (
              <g
                key={station.id}
                className={`journey-station ${active ? 'active' : ''} ${isBreak ? 'career-break' : ''} ${isDestination ? 'destination' : ''}`}
                transform={`translate(${pt.x} ${pt.y})`}
                onClick={() => goStation(stationIdx)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goStation(stationIdx)}
                tabIndex="0"
                role="button"
                style={{ pointerEvents: 'all' }}
              >
                <circle
                  className="station-outer-glow"
                  r="20"
                  fill={isBreak ? 'rgba(155,106,108,0.12)' : 'rgba(232,168,124,0.08)'}
                />
                {isDestination && (
                  <circle
                    r="18"
                    fill="none"
                    stroke="rgba(232,168,124,0.45)"
                    strokeWidth="1"
                  >
                    <animate attributeName="r" values="18;28;18" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  r="8"
                  fill="#1f1518"
                  stroke={
                    isBreak
                      ? 'rgba(155,106,108,0.5)'
                      : active
                        ? 'rgba(232,168,124,0.5)'
                        : 'rgba(239,230,216,0.25)'
                  }
                  strokeWidth="1.5"
                />
                <circle
                  r="3"
                  fill={
                    isBreak
                      ? '#d6a8a8'
                      : (active ? '#e8a87c' : '#efe6d8')
                  }
                />
                <text
                  x={labelCfg.dx}
                  y={labelCfg.dy}
                  textAnchor={labelCfg.anchor}
                  className="journey-stop-label"
                >
                  {STOP_LABELS[stationIdx]}
                </text>
              </g>
            );
          })}

          <g
            ref={shipRef}
            className="journey-ship"
          >
            <circle cx="0" cy="0" r="16" fill="rgba(232,168,124,0.12)" />
            <circle cx="0" cy="0" r="16" fill="rgba(232,168,124,0.15)" />
            <path d="M -8 -6 L 8 0 L -8 6 L -4 0 Z" fill="#efe6d8" stroke="#e8a87c" strokeWidth="0.5" />
            <circle cx="2" cy="0" r="1.6" fill="#e8a87c" />
          </g>
        </svg>

        <div
          className="nebula-cloud"
          style={{
            position: 'absolute',
            left: '10%',
            top: 1400,
            width: 300,
            height: 250,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(155,106,108,0.08), rgba(214,168,168,0.03), transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        ></div>

        {J.map((station, stationIdx) => {
          const active = stationIdx === idx;
          return (
            <div
              key={station.id}
              data-station-card={stationIdx}
              ref={(el) => { cardRefs.current[stationIdx] = el; }}
              className={`journey-copy ${active ? 'active' : ''}`}
              style={COPY_POSITIONS[stationIdx]}
            >
              <div className="journey-copy-body" key={station.id}>
                <div className="readout-head">
                  <div className="readout-code">{station.code}</div>
                  <div className="readout-period">{station.period}</div>
                </div>
                <div className="readout-place">{station.place}</div>
                <div className="readout-role">{station.role}</div>
                <div className="journey-copy-text">
                  {flowLog(station.log).map((line, lineIdx) => (
                    <p key={lineIdx}>{line}</p>
                  ))}
                </div>
                {station.metrics && (
                  <div className="readout-metrics">
                    {station.metrics.map((metric, metricIdx) => (
                      <div key={metricIdx} className="metric">
                        <div className="m-v">{metric.v}</div>
                        <div className="m-l">{metric.l}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────── About (cabin window) ───────────────────────── */
function WhoIAmDetail() {
  const textBulbs = [
    {
      id: 'left-long',
      cord: 'long',
      text: `I started in engineering. Wrote code, shipped features, spent three years deep in infrastructure and security tooling. It was solid work. But the part I kept gravitating toward wasn't the building — it was the conversation before the building. Why this feature? Who asked for it? Are we solving the real problem or just the one that made it to the ticket?`,
    },
    {
      id: 'left-short',
      cord: 'short',
      text: `I never really stopped asking those questions. Eventually I realized that's most of the job in product management — and in chief of staff roles. The title's different, the instinct is the same. Stay close to the decisions. Make sure they're actually informed. Follow through on what happens after.`,
    },
    {
      id: 'right-short',
      cord: 'short',
      text: `What I've noticed about myself is that I see systems before I see tasks. Someone says a tool has low adoption and I'm already thinking about whether it's a trust issue, a discovery issue, or a problem that was scoped wrong six months ago. It's not some superpower — it's just where my attention naturally goes.`,
    },
    {
      id: 'right-long',
      cord: 'long',
      text: `I'm not someone who needs a clean brief to start. Honestly, I prefer the opposite — the half-formed thing that three people describe differently. Figuring out what it actually is, that's the part I find interesting. I have a CS background, real engineering experience, and enough technical context to know what's genuinely hard versus what's just been deprioritized. I'm not trying to be the most experienced person in any room. I just want to be in the right room.`,
    },
  ];

  const centerGlowRef = useRefD(null);
  const handlePortraitMove = (event) => {
    const glow = centerGlowRef.current;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!glow || !bounds.width || !bounds.height) return;
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    glow.style.setProperty('--glow-x', `${x}%`);
    glow.style.setProperty('--glow-y', `${y}%`);
  };
  const resetPortraitMove = () => {
    const glow = centerGlowRef.current;
    if (!glow) return;
    glow.style.setProperty('--glow-x', '50%');
    glow.style.setProperty('--glow-y', '28%');
  };

  const [fireflies] = useStateD(() =>
    Array.from({ length: 62 }, (_, idx) => {
      const size = 1.5 + ((idx * 7) % 15) / 10;
      const duration = 7 + ((idx * 11) % 12);
      const delay = ((idx * 13) % 10) / 1;
      const dx = ((idx * 17) % 51) - 25;
      const dy = ((idx * 19) % 81) - 30;
      return {
        id: idx,
        left: `${((idx * 37) % 96) + 2}%`,
        top: `${8 + ((idx * 29) % 84)}%`,
        size,
        duration: `${duration}s`,
        glowDuration: `${(duration * 0.55).toFixed(2)}s`,
        delay: `${delay}s`,
        dx: `${dx}px`,
        dy: `${dy}px`,
      };
    })
  );

  return (
    <div className="who-layout">
      <div className="who-banner">WHO I AM</div>
      <h2 className="who-hero-title">
        <span>I think too much.</span>
        <em>Turns out that&apos;s useful.</em>
      </h2>
      <div className="who-rail-line" aria-hidden="true"></div>

      <div className="who-sanctum">
        {fireflies.map((firefly, idx) => (
          <span
            key={`firefly-${idx}`}
            className="who-firefly"
            style={{
              left: firefly.left,
              top: firefly.top,
              width: `${firefly.size}px`,
              height: `${firefly.size}px`,
              '--dx': firefly.dx,
              '--dy': firefly.dy,
              '--ff-delay': firefly.delay,
              animationDelay: firefly.delay,
              animationDuration: `${firefly.duration}, ${firefly.glowDuration}`,
            }}
            aria-hidden="true"
          />
        ))}

        <div className="who-installation">
          {textBulbs.slice(0, 2).map((bulb, idx) => (
            <div key={bulb.id} className={`who-pendant who-pendant-${bulb.cord} who-pendant-${idx + 1}`}>
              <svg className="who-cord-svg" viewBox="0 0 14 180" preserveAspectRatio="none" aria-hidden="true">
                <path d="M7 0 C3 34, 11 64, 7 96 C3 128, 11 150, 7 180" />
              </svg>
              <span className="who-fixture-cap" aria-hidden="true"></span>
              <article className="who-text-bulb">
                <span className="who-filament-glow" aria-hidden="true"></span>
                <p className="who-note-copy">{bulb.text}</p>
              </article>
              <span className="who-light-cone" aria-hidden="true"></span>
            </div>
          ))}

          <div className="who-center-pendant">
            <svg className="who-cord-svg who-cord-svg-center" viewBox="0 0 14 140" preserveAspectRatio="none" aria-hidden="true">
              <path d="M7 0 C5 24, 9 44, 7 68 C5 92, 9 112, 7 140" />
            </svg>
            <span className="who-fixture-cap who-fixture-cap-center" aria-hidden="true"></span>
            <section className="who-center-bulb">
              <div ref={centerGlowRef} className="who-center-glow" aria-hidden="true"></div>
              <div
                className="who-center-portrait-area"
                onMouseMove={handlePortraitMove}
                onMouseLeave={resetPortraitMove}
              >
                <div className="who-center-portrait-ring">
                  <img
                    className="who-center-portrait-img"
                    src="./assets/media/who-i-am-portrait.jpeg"
                    alt="Portrait of Anvita Singh"
                  />
                </div>
              </div>
              <div className="who-center-divider"></div>
              <div className="who-education-card">
                <div className="who-education-kicker">Education</div>
                <div className="who-education-title">B.Tech in Computer Science</div>
                <div className="who-education-sub">PES University</div>
                <div className="who-education-meta">2018 → 2022 · Bengaluru</div>
              </div>
            </section>
            <div className="who-center-name">Anvita Singh</div>
            <div className="who-center-locale">Bengaluru, India</div>
          </div>

          {textBulbs.slice(2).map((bulb, idx) => (
            <div key={bulb.id} className={`who-pendant who-pendant-${bulb.cord} who-pendant-${idx + 3}`}>
              <svg className="who-cord-svg" viewBox="0 0 14 180" preserveAspectRatio="none" aria-hidden="true">
                <path d="M7 0 C3 34, 11 64, 7 96 C3 128, 11 150, 7 180" />
              </svg>
              <span className="who-fixture-cap" aria-hidden="true"></span>
              <article className="who-text-bulb">
                <span className="who-filament-glow" aria-hidden="true"></span>
                <p className="who-note-copy">{bulb.text}</p>
              </article>
              <span className="who-light-cone" aria-hidden="true"></span>
            </div>
          ))}
        </div>
      </div>

      <div className="who-closing-tag">
        <span>Curious by default. Systems-minded by training.</span>
        <span><em>Product-shaped by instinct.</em></span>
      </div>
    </div>
  );
}

function AboutCabin() {
  const [tab, setTab] = useStateD('why');
  const tabs = [
    { id: 'why',    label: 'Why I left',        glyph: '◈' },
    { id: 'gym',    label: 'Iron & sweat',      glyph: '▲' },
    { id: 'books',  label: 'On the shelf',      glyph: '◫' },
    { id: 'write',  label: 'Recently writing',  glyph: '✎' },
    { id: 'free',   label: 'Free hours',        glyph: '∞' },
  ];
  const essays = [
    { id: 'e1', date: '2026 · 02', title: 'On the boring middle of every product', latest: true },
    { id: 'e2', date: '2026 · 01', title: 'What I learned from three years of internal tools' },
    { id: 'e3', date: '2025 · 12', title: 'Why I took the break, and what it cost' },
  ];

  return (
    <div className="cabin">
      {/* Top: porthole + intro */}
      <div className="cabin-top">
        <div className="porthole-main">
          <div className="porthole-frame">
            <image-slot id="about-portrait" shape="circle" placeholder="Drag a portrait of yourself here" style={{ width: 240, height: 240 }}></image-slot>
          </div>
          <div className="porthole-meta">
            <span className="pm-label">Identification</span>
            <span className="pm-name">Anvita Singh</span>
            <span className="pm-coord">28.6°N · 77.2°E · Earth</span>
          </div>
        </div>
        <div className="station-arm" aria-hidden="true">
          <span className="arm-node arm-node-core"></span>
          <span className="arm-line"></span>
          <span className="arm-node arm-node-module"></span>
        </div>
        <div className="cabin-intro">
          <p className="ci-lead">There are people who optimize. I tend to wonder.</p>
          <p className="ci-body">
            I am most alive when I am asking why something works the way it does, and most useful when I can turn that
            wondering into a small, decisive change. The rest of this page is the long way of saying that.
          </p>
          <p className="ci-write">
            I’ve also started writing recently &mdash; <a href="#" className="write-link">read the essays →</a>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="cabin-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`ctab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
            <span className="ctab-glyph" aria-hidden="true">{t.glyph}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="cabin-module-label" aria-hidden="true">
        {tabs.map(t => (
          <span key={t.id} className={`module-marker ${tab === t.id ? 'on' : ''}`}>
            {t.label}
          </span>
        ))}
      </div>

      {/* Tab content */}
      <div className="cabin-content" key={tab}>
        {tab === 'why' && (
          <div className="captains-log">
            <div className="log-head">CAPTAIN&apos;S LOG · STARDATE 2025.05</div>
            <div className="cab-prose">
              <p>I didn’t leave engineering because I disliked it. I left because I noticed I was always wandering one room over &mdash; into the room where the product was being decided.</p>
              <p>I wanted to stop translating decisions made elsewhere and start being part of making them. The break gave me space to test that hypothesis honestly &mdash; through a PM fellowship, a founders fellowship, certifications, and conversations &mdash; and the answer kept coming back yes.</p>
            </div>
          </div>
        )}
        {tab === 'gym' && (
          <div className="cab-gallery">
            <p className="cg-lead">I lift. It teaches me patience and progressive overload &mdash; same as shipping product.</p>
            <div className="polaroid-wall">
              {[1,2,3].map(i => (
                <div
                  key={i}
                  className="polaroid"
                  style={{
                    '--tilt': `${(i - 2) * 4}deg`,
                    '--float-delay': `${(i - 1) * -1.25}s`,
                    '--float-dur': `${5 + i}s`,
                  }}
                >
                  <image-slot id={`gym-${i}`} shape="rect" placeholder="Drag a gym photo" style={{ width: 180, height: 220 }}></image-slot>
                  <span className="pl-cap">Session {i}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'books' && (
          <div className="cab-gallery">
            <p className="cg-lead">A shelf rotates faster than I do.</p>
            <div className="book-wall">
              {[
                { id: 'b1', title: 'Working in Public', author: 'Nadia Eghbal' },
                { id: 'b2', title: 'The Mom Test',     author: 'Rob Fitzpatrick' },
                { id: 'b3', title: 'High Output Management', author: 'Andy Grove' },
                { id: 'b4', title: 'Inspired',         author: 'Marty Cagan' },
                { id: 'b5', title: 'Hooked',           author: 'Nir Eyal' },
              ].map(b => (
                <div key={b.id} className="book">
                  <image-slot id={`book-${b.id}`} shape="rect" placeholder="Cover" style={{ width: 110, height: 160 }}></image-slot>
                  <div className="book-meta">
                    <div className="b-title">{b.title}</div>
                    <div className="b-author">{b.author}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'write' && (
          <div className="cab-prose">
            <p>I started writing this year. Mostly to think out loud about products, the people who build them, and the small decisions that quietly shape both.</p>
            <ul className="essay-list">
              {essays.map(essay => (
                <li key={essay.id}>
                  <a href="#">
                    <span className="ed">{essay.date}</span>
                    <span className="et">
                      {essay.title}
                      {essay.latest && <span className="essay-badge">latest</span>}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {tab === 'free' && (
          <div className="cab-prose">
            <p>Free hours look like: long walks without a destination, way too much time picking a playlist, airport people-watching, and a Notion page that quietly refuses to be finished.</p>
            <div className="chip-row">
              {['romanticizes airports', 'Notion pedant', 'playlist architect', 'reads receipts as design', 'will replan a city for the right cafe'].map(c => (
                <span key={c} className="cchip">{c}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AboutGalaxies({ planet, onClose, standalone = false }) {
  const [activeGalaxy, setActiveGalaxy] = useStateD(null);

  const galaxies = [
    {
      id: 'rewrite',
      name: 'The Rewrite',
      sub: '108 → 73 kg',
      img: 'assets/media/galaxy-rewrite.jpg',
      content: {
        title: 'The Rewrite',
        body: `I never planned to lose 35 kilograms. It started as a quiet refusal to keep living in a body that felt borrowed and a life that kept shrinking around it. What followed was not a dramatic montage. It was repetition. Walking when I did not feel like it. Lifting when progress was invisible. Learning that discipline is less about force and more about returning. The weight changed, yes. But what really changed was the story I had about what I was capable of rebuilding.`,
        photos: 3,
      },
    },
    {
      id: 'library',
      name: 'Library',
      sub: 'books that shaped me',
      img: 'assets/media/galaxy-library.png',
      content: {
        title: 'Library',
        body: 'I read to think differently. Books are where I go when I need better questions, cleaner frameworks, or language for something I only half understand.',
        items: true,
      },
    },
    {
      id: 'signal',
      name: 'Signal',
      sub: 'why I left',
      img: 'assets/media/galaxy-signal.webp',
      content: {
        title: 'Signal',
        body: `I left my job because life asked me to. Family reasons, the kind you do not negotiate with. But the break itself was a choice I made deliberately. I did not want to just find the next thing. I wanted to find the right thing — something that actually lined up with who I am, not just what I am qualified for on paper. So I explored. I liked DevOps, got certified, and learned a lot. But the deeper truth kept surfacing: I care most about the room where the product gets decided. This break did not make me weaker. It made me specific.`,
      },
    },
    {
      id: 'offduty',
      name: 'Off-duty',
      sub: 'badminton · life · fun',
      img: 'assets/media/galaxy-offduty.jpg',
      content: {
        title: 'Off-duty',
        body: 'When I am not thinking about products, I like movement, noise, and small rituals that make life feel textured. Badminton, long conversations, strong playlists, airport energy, and the kind of evenings that turn into stories later all belong here.',
      },
    },
    {
      id: 'transmissions',
      name: 'Transmissions',
      sub: 'recently started writing',
      img: 'assets/media/galaxy-transmissions.webp',
      content: {
        title: 'Transmissions',
        body: 'I started writing because some thoughts need a longer runway than a notes app can give them. It is still new, but it already feels like one of the clearest ways I have found to understand myself in public.',
        link: 'https://medium.com/@inthebetween_/behind-the-concrete-walls-of-my-head-c837bc4ae23a',
      },
    },
  ];

  const fieldStars = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${6 + ((i * 17) % 86)}%`,
    top: `${8 + ((i * 23) % 76)}%`,
    size: 1 + (i % 3),
    opacity: 0.12 + ((i % 4) * 0.05),
    duration: `${3.2 + (i % 5) * 0.45}s`,
    delay: `${(i % 6) * 0.28}s`,
  }));

  const active = galaxies.find((g) => g.id === activeGalaxy) || null;

  const renderGalaxyExtras = () => {
    if (!active) return null;
    if (active.id === 'rewrite') {
      return (
        <div className="fly-slot-grid fly-slot-grid-photos">
          {[1, 2, 3].map((i) => (
            <image-slot
              key={i}
              id={`rewrite-photo-${i}`}
              shape="rect"
              placeholder="Photo"
              style={{ width: 100, height: 100, borderRadius: 6 }}
            ></image-slot>
          ))}
        </div>
      );
    }
    if (active.id === 'library') {
      return (
        <div className="fly-slot-grid fly-slot-grid-books">
          {[1, 2, 3, 4, 5].map((i) => (
            <image-slot
              key={i}
              id={`library-book-${i}`}
              shape="rect"
              placeholder="Cover"
              style={{ width: 80, height: 120, borderRadius: 6 }}
            ></image-slot>
          ))}
        </div>
      );
    }
    if (active.id === 'offduty') {
      return (
        <div className="fly-slot-grid fly-slot-grid-offduty">
          {[1, 2, 3].map((i) => (
            <image-slot
              key={i}
              id={`offduty-photo-${i}`}
              shape="rect"
              placeholder="Moment"
              style={{ width: 128, height: 108, borderRadius: 8 }}
            ></image-slot>
          ))}
        </div>
      );
    }
    if (active.id === 'transmissions') {
      return (
        <a
          className="fly-link-card"
          href={active.content.link}
          target="_blank"
          rel="noreferrer"
        >
          <span className="fly-link-kicker">Published</span>
          <span className="fly-link-title">Behind the Concrete Walls of My Head</span>
          <span className="fly-link-cta">Read the transmission →</span>
        </a>
      );
    }
    return null;
  };

  return (
    <div className={`about-galaxies ${standalone ? 'about-galaxies-standalone' : ''}`} onClick={(e) => e.stopPropagation()}>
      {!standalone && (
        <>
          <button className="detail-close" onClick={onClose}>×</button>
          <div className="detail-kicker">{planet.detail.kicker} · {planet.detail.title}</div>
        </>
      )}

      <div className="galaxy-field">
        {fieldStars.map((star) => (
          <span
            key={star.id}
            className="galaxy-field-star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animationDuration: star.duration,
              animationDelay: star.delay,
            }}
          />
        ))}

        {galaxies.map((g) => (
          <div
            key={g.id}
            className={`galaxy-item galaxy-${g.id} ${activeGalaxy && activeGalaxy !== g.id ? 'dimmed' : ''}`}
            onClick={() => setActiveGalaxy(g.id)}
          >
            <div className="galaxy-core">
              <img src={g.img} alt={g.name} />
            </div>
            <div className="galaxy-label">
              <div className="galaxy-label-name">{g.name}</div>
              <div className="galaxy-label-sub">{g.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div className="galaxy-fly-overlay show" onClick={() => setActiveGalaxy(null)}>
          <div className="fly-bg-galaxy">
            <img src={active.img} alt="" />
          </div>
          <div className="fly-content" onClick={(e) => e.stopPropagation()}>
            <div className="fly-title">{active.content.title}</div>
            {active.id === 'signal' && (
              <div className="fly-log-head">CAPTAIN&apos;S LOG · STARDATE 2025.05</div>
            )}
            <div className="fly-body">{active.content.body}</div>
            {renderGalaxyExtras()}
            <button className="fly-back" onClick={() => setActiveGalaxy(null)}>← back to the sky</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Contact ───────────────────────── */
function ContactEnvelope() {
  const [isOpen, setIsOpen] = useStateD(false);
  const particleRef = useRefD(null);
  const bgStarsRef = useRefD(null);

  if (!bgStarsRef.current) {
    bgStarsRef.current = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: `${8 + Math.random() * 84}%`,
      top: `${10 + Math.random() * 78}%`,
      size: 1 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.2,
      duration: `${3 + Math.random() * 2}s`,
      delay: `${Math.random() * 2.8}s`,
    }));
  }

  const spawnParticles = () => {
    const container = particleRef.current;
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#e8a87c', '#d6a8a8', '#efe6d8', '#c98a6b'];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 100;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const size = 2 + Math.random() * 3;
      p.className = 'env-particle';
      p.style.cssText = `
        width:${size}px;
        height:${size}px;
        background:${colors[Math.floor(Math.random() * 4)]};
        animation: particleBurst ${0.6 + Math.random() * 0.5}s ease-out forwards;
        --dx:${dx}px;
        --dy:${dy}px;
      `;
      container.appendChild(p);
    }
    setTimeout(() => { if (container) container.innerHTML = ''; }, 1200);
  };

  const toggleEnvelope = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) spawnParticles();
      return next;
    });
  };

  const links = [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      orbClass: 'orb-linkedin',
      left: '12%',
      top: '28%',
      action: () => window.open('https://www.linkedin.com/in/anvita-singh-6779b7188', '_blank', 'noopener,noreferrer'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" fill="#7ab5e0"/>
          <rect x="2" y="9" width="4" height="12" fill="#7ab5e0"/>
          <circle cx="4" cy="4" r="2" fill="#7ab5e0"/>
        </svg>
      ),
    },
    {
      id: 'twitter',
      label: 'X',
      orbClass: 'orb-twitter',
      left: '88%',
      top: '24%',
      action: () => window.open('https://x.com/anvitasingh99?s=21', '_blank', 'noopener,noreferrer'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" fill="#e0e0e0"/>
        </svg>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      orbClass: 'orb-email',
      left: '10%',
      top: '78%',
      action: () => { window.location.href = 'mailto:anvitasingh99@gmail.com'; },
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#e8a87c" strokeWidth="1.5"/>
          <path d="M22 6l-10 7L2 6" stroke="#e8a87c" strokeWidth="1.5"/>
        </svg>
      ),
    },
    {
      id: 'instagram',
      label: 'Instagram',
      orbClass: 'orb-instagram',
      left: '88%',
      top: '76%',
      action: () => window.open('https://www.instagram.com/_anvita29?igsh=MWVqdXdkeWxscXZmMw%3D%3D&utm_source=qr', '_blank', 'noopener,noreferrer'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="#e07aac" strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="5" stroke="#e07aac" strokeWidth="1.5"/>
          <circle cx="17.5" cy="6.5" r="1.5" fill="#e07aac"/>
        </svg>
      ),
    },
    {
      id: 'form',
      label: 'Contact form',
      orbClass: 'orb-form',
      left: '50%',
      top: '90%',
      action: () => window.open('https://forms.gle/XUT8Br6vCu52Uky7A', '_blank', 'noopener,noreferrer'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#7abe7a" strokeWidth="1.5"/>
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#7abe7a" strokeWidth="1.5"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="detail-kicker">
          <span className="dot" style={{ background: '#8b3a3a' }}></span>
          <span>Contact</span>
          <span className="sep">·</span>
          <span className="planet-codename">Outpost</span>
        </div>
        <h2 className="detail-title">Open a channel</h2>
      </div>

      {bgStarsRef.current.map((star) => (
        <span
          key={star.id}
          className="contact-star"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: star.duration,
            animationDelay: star.delay,
          }}
        />
      ))}

      <div className="env-particles" ref={particleRef} aria-hidden="true"></div>

      {links.map((link, index) => (
        <button
          key={link.id}
          className={`logo-orb ${link.orbClass} ${isOpen ? 'show' : ''}`}
          style={{
            left: link.left,
            top: link.top,
            transitionDelay: isOpen ? `${500 + index * 150}ms` : `${index * 50}ms`,
            animationDelay: `${index * 0.35}s`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            link.action();
          }}
          aria-label={link.label}
        >
          <span className="ring-pulse"></span>
          {link.icon}
          <span className="logo-label">{link.label}</span>
        </button>
      ))}

      <div className={`envelope-wrap ${isOpen ? 'opened' : ''}`} onClick={toggleEnvelope}>
        <div className="polaroid">
          <span className="polaroid-tape" aria-hidden="true"></span>
          <img
            className="contact-polaroid-photo"
            src="./assets/media/contact-polaroid-photo-2.jpeg"
            alt="Portrait of Anvita Singh"
            width="120"
            height="150"
          />
          <span className="polaroid-cap">♡ me, hi!</span>
        </div>

        <div className="envelope">
          <div className="env-body">
            <div className="env-stamp">A.S<br />✦</div>
            <div className="env-text">
              <div className="env-to">To →</div>
              <div className="env-addr">Whoever&apos;s Reading This</div>
              <div className="env-cta">Click Here To Open <span className="env-arrow">→</span></div>
            </div>
          </div>
          <div className="env-flap" />
          <div className="env-seal"><span>A</span></div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Generic detail (Core, Thinking) ───────────────────────── */
function GenericDetail({ planet }) {
  const d = planet.detail;
  const hasFrameworks = Boolean(d.frameworks?.length);
  const quoteLine = hasFrameworks && d.body?.length ? d.body[0] : null;
  const bodyLines = hasFrameworks && d.body?.length ? d.body.slice(1) : d.body;
  return (
    <>
      {d.subtitle && <p className="detail-subtitle">{d.subtitle}</p>}
      {quoteLine && (
        <div className="detail-quote">
          <p className="dq-line">{quoteLine}</p>
        </div>
      )}
      <div className="detail-body">
        {bodyLines && bodyLines.map((l, i) => <p key={i} className="detail-line">{l}</p>)}
      </div>
      {d.frameworks && (
        <div className="frameworks process">
          {d.frameworks.map((f, i) => (
            <div key={i} className="framework">
              <div className="fw-num">{String(i + 1).padStart(2, '0')}</div>
              <div className="fw-title">{f.title}</div>
              <div className="fw-sub">{f.sub}</div>
            </div>
          ))}
        </div>
      )}
      {d.tags && (
        <div className="tags">
          {d.tags.map((t, i) => <span key={i} className="tag">{t}</span>)}
        </div>
      )}
    </>
  );
}

/* ───────────────────────── Dispatcher ───────────────────────── */
function PlanetDetail({ planet, onClose }) {
  if (!planet) return null;
  const d = planet.detail;
  const c = d.component;
  const isJourney = c === 'journey';
  const JOURNEY = window.JOURNEY || [];
  const [journeyIdx, setJourneyIdx] = useStateD(0);
  const [navVisible, setNavVisible] = useStateD(false);
  const cardRef = useRefD(null);
  const flightRef = useRefD(null);

  useEffectD(() => {
    setJourneyIdx(0);
  }, [planet?.id]);

  useEffectD(() => {
    if (!isJourney) return;
    const scrollEl = cardRef.current;
    if (!scrollEl) return;

    const onScroll = () => {
      const firstCard = scrollEl.querySelector('[data-station-card="0"]');
      if (!firstCard) return;
      const rect = firstCard.getBoundingClientRect();
      const cardRect = scrollEl.getBoundingClientRect();
      setNavVisible(rect.top < cardRect.top + cardRect.height * 0.8);
    };

    onScroll();
    scrollEl.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onScroll);
    return () => {
      scrollEl.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isJourney, planet?.id]);

  return (
    <div className="detail-shell" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={cardRef} className={`detail-card detail-${c || 'std'}`} key={planet.id}>
        <button className="detail-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 6L18 18M6 18L18 6" /></svg>
        </button>
        {c !== 'who' && c !== 'skills' && c !== 'contact' && c !== 'about' && (
          <div className="detail-head">
            <div className="detail-kicker">
              <span className="dot" style={{ background: planet.glow }}></span>
              <span>{d.kicker}</span>
              <span className="sep">·</span>
              <span className="planet-codename">{planet.name}</span>
            </div>
            <h1 className="detail-title">{d.title}</h1>
          </div>
        )}

        {c === 'projects' && <ProjectsConstellation />}
        {c === 'journey'  && <JourneySpaceship idx={journeyIdx} onGo={setJourneyIdx} flightRef={flightRef} />}
        {c === 'who'      && <WhoIAmDetail />}
        {c === 'skills'   && <SkillsArsenal />}
        {c === 'about'    && <AboutGalaxies planet={planet} onClose={onClose} />}
        {c === 'contact'  && <ContactEnvelope />}
        {!c && <GenericDetail planet={planet} />}

        <div className="detail-foot">
          <span>← back to orbit</span>
          <span className="kbd">Esc</span>
        </div>
      </div>

      {isJourney && navVisible && (
        <>
          <button
            className="jump journey-side-btn journey-side-prev"
            onClick={(e) => {
              e.stopPropagation();
              setJourneyIdx(Math.max(0, journeyIdx - 1));
            }}
            disabled={journeyIdx === 0}
          >
            ◂
            <span className="journey-side-label">prev station</span>
          </button>

          <button
            className="jump journey-side-btn journey-side-next"
            onClick={(e) => {
              e.stopPropagation();
              setJourneyIdx(Math.min(JOURNEY.length - 1, journeyIdx + 1));
            }}
            disabled={journeyIdx === JOURNEY.length - 1}
          >
            <span className="journey-side-label">next station</span>
            ▸
          </button>

          <div className="journey-bottom-progress" onClick={(e) => e.stopPropagation()}>
            {JOURNEY.map((_, i) => (
              <span
                key={i}
                className={`jbp-dot ${i === journeyIdx ? 'on' : ''} ${i < journeyIdx ? 'past' : ''}`}
                onClick={() => setJourneyIdx(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

window.PlanetDetail = PlanetDetail;
