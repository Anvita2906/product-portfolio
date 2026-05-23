// Main app — opening scene → universe → planet detail.

const { useState, useEffect, useRef, useCallback } = React;

/* ---------- Starfield (canvas) ---------- */
function Starfield() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf;
    let lastFrameTime = performance.now();
    let lastShootTime = 0;
    let nextShootDelay = rb(3000, 7000);
    let dustStars = [], midStars = [], brightStars = [];
    const shootingStars = [];
    let nebulae = [];
    let constellation = null;
    let lastConstellationTime = 0;
    let nextConstellationDelay = rb(5000, 10000);

    function rb(mn, mx) { return mn + Math.random() * (mx - mn); }
    function gaussRand() {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    function clamp(val, mn, mx) { return Math.min(mx, Math.max(mn, val)); }
    function pickColor(wc) {
      const r = Math.random(); let acc = 0;
      for (const [w, col] of wc) { acc += w; if (r <= acc) return col; }
      return wc[wc.length - 1][1];
    }
    function hexToRgba(hex, alpha) {
      const clean = hex.replace('#', '');
      const int = parseInt(clean, 16);
      return `rgba(${(int >> 16) & 255},${(int >> 8) & 255},${int & 255},${alpha})`;
    }

    const resize = () => {
      c.width  = window.innerWidth  * dpr;
      c.height = window.innerHeight * dpr;
      const W = c.width, H = c.height;
      const dustPalette   = [[0.85,'#dde0e0'],[0.10,'#e8c8a0'],[0.05,'#c8d0e0']];
      const midPalette    = [[0.70,'#efe6d8'],[0.15,'#e8a87c'],[0.10,'#d6a8a8'],[0.05,'#ffffff']];
      const brightPalette = [[0.60,'#fff5e2'],[0.25,'#e8a87c'],[0.15,'#d6a8a8']];
      dustStars = Array.from({ length: 900 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: rb(0.3, 0.8) * dpr, baseAlpha: rb(0.08, 0.25), color: pickColor(dustPalette),
      }));
      const cx = W * 0.5, cy = H * 0.4, sd = W * 0.3;
      midStars = Array.from({ length: 280 }, () => ({
        x: clamp(cx + gaussRand() * sd, 0, W),
        y: clamp(cy + gaussRand() * sd * 0.7, 0, H),
        r: rb(0.8, 2.0) * dpr, baseAlpha: rb(0.3, 0.7),
        twinkleSpeed: rb(0.5, 2.5), twinklePhase: rb(0, Math.PI * 2),
        color: pickColor(midPalette),
      }));
      brightStars = Array.from({ length: 22 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: rb(2, 3.5) * dpr, baseAlpha: rb(0.6, 1.0),
        twinkleSpeed: rb(0.3, 1.0), twinklePhase: rb(0, Math.PI * 2),
        spikeLength: rb(10, 25) * dpr, color: pickColor(brightPalette),
      }));
      nebulae = [
        { x: W*0.15, y: H*0.25, rx: W*0.28, ry: H*0.22, r:180, g:100, b:100, maxAlpha:0.045, vx: 0.18*dpr, vy: 0.07*dpr },
        { x: W*0.80, y: H*0.55, rx: W*0.25, ry: H*0.24, r:122, g: 59, b: 74, maxAlpha:0.050, vx:-0.12*dpr, vy: 0.10*dpr },
        { x: W*0.50, y: H*0.05, rx: W*0.32, ry: H*0.18, r:212, g:163, b:115, maxAlpha:0.028, vx: 0.08*dpr, vy: 0.06*dpr },
        { x: W*0.05, y: H*0.75, rx: W*0.22, ry: H*0.25, r:155, g:106, b:108, maxAlpha:0.038, vx: 0.22*dpr, vy:-0.09*dpr },
      ];
    };

    const spawnShoot = (now) => {
      shootingStars.push({
        startX: Math.random() * (c.width * 0.3),
        startY: Math.random() * (c.height * 0.3),
        angle: rb(210, 240) * (Math.PI / 180),
        speed: rb(400, 700) * dpr,
        trailLength: rb(80, 150) * dpr,
        life: 0, maxLife: rb(0.4, 0.7),
      });
      lastShootTime = now;
      nextShootDelay = rb(3000, 7000);
    };

    const spawnConstellation = (now) => {
      if (brightStars.length < 3) return;
      const count = 3 + Math.floor(Math.random() * 2);
      const indices = brightStars.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, count);
      constellation = { indices, spawnTime: now, fadeIn: 700, hold: 2200, fadeOut: 900 };
      lastConstellationTime = now;
      nextConstellationDelay = rb(7000, 15000);
    };

    const draw = (now) => {
      const time = now / 1000;
      const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.05);
      const scrollY = window.scrollY;
      lastFrameTime = now;
      ctx.clearRect(0, 0, c.width, c.height);

      for (const neb of nebulae) {
        neb.x += neb.vx; neb.y += neb.vy;
        const px = neb.rx * 1.1, py = neb.ry * 1.1;
        if (neb.x >  c.width  + px) neb.x = -px;
        if (neb.x < -px)            neb.x = c.width  + px;
        if (neb.y >  c.height + py) neb.y = -py;
        if (neb.y < -py)            neb.y = c.height + py;
        ctx.save();
        ctx.translate(neb.x, neb.y);
        ctx.scale(1, neb.ry / neb.rx);
        const ng = ctx.createRadialGradient(0, 0, 0, 0, 0, neb.rx);
        ng.addColorStop(0,    `rgba(${neb.r},${neb.g},${neb.b},${neb.maxAlpha.toFixed(4)})`);
        ng.addColorStop(0.45, `rgba(${neb.r},${neb.g},${neb.b},${(neb.maxAlpha * 0.28).toFixed(4)})`);
        ng.addColorStop(1,    `rgba(${neb.r},${neb.g},${neb.b},0)`);
        ctx.fillStyle = ng;
        ctx.beginPath(); ctx.arc(0, 0, neb.rx, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      const glow = ctx.createRadialGradient(c.width*0.5, c.height*0.35, 0, c.width*0.5, c.height*0.35, c.width*0.25);
      glow.addColorStop(0, 'rgba(232,180,140,0.025)');
      glow.addColorStop(1, 'rgba(232,180,140,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, c.width, c.height);

      const dp = time * 0.04;
      const dustDX   = Math.sin(dp * 0.90) *  4 * dpr, dustDY   = Math.cos(dp * 0.70) *  3 * dpr;
      const midDX    = Math.sin(dp * 1.55) * 10 * dpr, midDY    = Math.cos(dp * 0.95) *  6 * dpr;
      const brightDX = Math.sin(dp * 2.10) * 22 * dpr, brightDY = Math.cos(dp * 1.35) * 14 * dpr;

      for (const star of dustStars) {
        ctx.fillStyle = hexToRgba(star.color, star.baseAlpha);
        ctx.fillRect(star.x + dustDX, star.y + scrollY * 0.05 * dpr + dustDY, star.r, star.r);
      }
      for (const star of midStars) {
        const alpha = star.baseAlpha * (0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase));
        ctx.beginPath();
        ctx.arc(star.x + midDX, star.y + scrollY * 0.12 * dpr + midDY, star.r, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(star.color, alpha); ctx.fill();
      }
      const brightDrawPos = brightStars.map((star) => {
        const drawX = star.x + brightDX;
        const drawY = star.y + scrollY * 0.2 * dpr + brightDY;
        const alpha = star.baseAlpha * (0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.twinklePhase));
        ctx.beginPath(); ctx.arc(drawX, drawY, star.r, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(star.color, alpha); ctx.fill();
        ctx.strokeStyle = hexToRgba(star.color, alpha * 0.4);
        ctx.lineWidth = 0.5 * dpr;
        for (const angle of [0, Math.PI/2, Math.PI/4, 3*Math.PI/4]) {
          ctx.beginPath(); ctx.moveTo(drawX, drawY);
          ctx.lineTo(drawX + Math.cos(angle) * star.spikeLength, drawY + Math.sin(angle) * star.spikeLength); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(drawX, drawY);
          ctx.lineTo(drawX - Math.cos(angle) * star.spikeLength, drawY - Math.sin(angle) * star.spikeLength); ctx.stroke();
        }
        return { x: drawX, y: drawY };
      });

      if (!constellation && now - lastConstellationTime > nextConstellationDelay) spawnConstellation(now);
      if (constellation) {
        const elapsed = now - constellation.spawnTime;
        const total = constellation.fadeIn + constellation.hold + constellation.fadeOut;
        if (elapsed >= total) {
          constellation = null;
        } else {
          let t;
          if (elapsed < constellation.fadeIn) t = elapsed / constellation.fadeIn;
          else if (elapsed < constellation.fadeIn + constellation.hold) t = 1;
          else t = 1 - (elapsed - constellation.fadeIn - constellation.hold) / constellation.fadeOut;
          t = t * t * (3 - 2 * t);
          const pts = constellation.indices.filter(i => i < brightDrawPos.length).map(i => brightDrawPos[i]);
          if (pts.length >= 2) {
            ctx.save();
            ctx.setLineDash([3 * dpr, 6 * dpr]);
            ctx.lineWidth = 0.7 * dpr;
            ctx.strokeStyle = `rgba(239,230,216,${(t * 0.11).toFixed(4)})`;
            ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
            for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k].x, pts[k].y);
            ctx.stroke(); ctx.setLineDash([]); ctx.restore();
            for (const pt of pts) {
              ctx.beginPath(); ctx.arc(pt.x, pt.y, 2.2 * dpr, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(239,230,216,${(t * 0.20).toFixed(4)})`; ctx.fill();
            }
          }
        }
      }

      if (now - lastShootTime > nextShootDelay && shootingStars.length < 2) spawnShoot(now);
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.life += deltaTime;
        if (star.life > star.maxLife) { shootingStars.splice(i, 1); continue; }
        const progress = star.life / star.maxLife;
        const headX = star.startX + Math.cos(star.angle) * star.speed * star.life;
        const headY = star.startY - Math.sin(star.angle) * star.speed * star.life;
        const tailX = headX - Math.cos(star.angle) * star.trailLength;
        const tailY = headY + Math.sin(star.angle) * star.trailLength;
        const fadeAlpha = 1 - progress;
        const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
        grad.addColorStop(0,   'rgba(239,230,216,0)');
        grad.addColorStop(0.7, `rgba(239,230,216,${0.3 * fadeAlpha})`);
        grad.addColorStop(1,   `rgba(255,255,255,${0.8 * fadeAlpha})`);
        ctx.strokeStyle = grad; ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(headX, headY); ctx.stroke();
        ctx.beginPath(); ctx.arc(headX, headY, 1.5 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.9 * fadeAlpha})`; ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="stars-canvas" />;
}

/* ---------- Opening scene ---------- */
function Backdrop({ launching }) {
  const canvasRef = useRef(null);
  const launchingRef = useRef(false);
  useEffect(() => { launchingRef.current = launching; }, [launching]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;
    let stars = [];

    const buildStars = () => {
      stars = [];
      const N = Math.round((W * H) / 4200);
      for (let i = 0; i < N; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          size: Math.random() * 0.7 + 0.15,
          alpha: 0.10 + Math.random() * 0.45,
          tw: Math.random() * 0.014 + 0.003,
          ph: Math.random() * Math.PI * 2,
          ang: 0, len: 0,
        });
      }
      const cx = W / 2, cy = H / 2;
      for (const s of stars) {
        const dx = s.x - cx, dy = s.y - cy;
        s.ang = Math.atan2(dy, dx);
        s.len = Math.hypot(dx, dy);
      }
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0, raf;
    const draw = () => {
      t += 1;
      const warp = launchingRef.current;
      ctx.fillStyle = warp ? 'rgba(12,7,10,0.05)' : 'rgba(12,7,10,0.30)';
      ctx.fillRect(0, 0, W, H);

      const vg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
      vg.addColorStop(0, 'rgba(36,22,28,0.22)');
      vg.addColorStop(0.6, 'rgba(18,12,16,0.10)');
      vg.addColorStop(1, 'rgba(8,5,7,0)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'lighter';
      const cx = W / 2, cy = H / 2;
      for (const s of stars) {
        const a = s.alpha * (0.55 + 0.45 * Math.sin(t * s.tw + s.ph));
        if (warp) {
          s.len += 4 + s.len * 0.012;
          if (s.len > Math.hypot(W, H)) s.len = Math.random() * 80;
          s.x = cx + Math.cos(s.ang) * s.len;
          s.y = cy + Math.sin(s.ang) * s.len;
          const tail = 24 + s.len * 0.02;
          ctx.strokeStyle = `rgba(244,224,196,${a * 0.85})`;
          ctx.lineWidth = Math.max(0.6, s.size * 1.6);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(s.x - Math.cos(s.ang) * tail, s.y - Math.sin(s.ang) * tail);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(239,230,216,${a})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="opening-backdrop" aria-hidden="true" />;
}

/* ---------- Cosmic door: ornate two-panel door covering the page; click to open it into the universe ---------- */
function DoorEngraving({ mirror }) {
  return (
    <div className="door-engraving" aria-hidden="true">
      <div className="eng-frame">
        <span className="eng-corner eng-corner-tl"></span>
        <span className="eng-corner eng-corner-tr"></span>
        <span className="eng-corner eng-corner-bl"></span>
        <span className="eng-corner eng-corner-br"></span>
      </div>

      <svg className="eng-sun" viewBox="-50 -50 100 100">
        <circle r="22" fill="rgba(244,192,137,0.06)" stroke="#d4a373" strokeWidth="0.9" />
        <circle r="16" fill="none" stroke="#d4a373" strokeWidth="0.5" opacity="0.6" />
        <circle r="6" fill="#d4a373" opacity="0.35" />
        <g stroke="#d4a373" strokeWidth="0.8" opacity="0.75">
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i * 22.5) * Math.PI / 180;
            const r1 = 26, r2 = i % 2 === 0 ? 36 : 30;
            return (
              <line
                key={i}
                x1={Math.cos(a) * r1} y1={Math.sin(a) * r1}
                x2={Math.cos(a) * r2} y2={Math.sin(a) * r2}
              />
            );
          })}
        </g>
      </svg>

      <div className="eng-label eng-label-top">· COSMOGRAPHIA ·</div>

      <svg
        className="eng-constellation"
        viewBox="-60 -40 120 80"
        style={mirror ? { transform: 'scaleX(-1)' } : undefined}
      >
        <g stroke="#d4a373" strokeWidth="0.55" fill="#d4a373" opacity="0.78">
          <line x1="-50" y1="-15" x2="-20" y2="0" />
          <line x1="-20" y1="0" x2="10" y2="-12" />
          <line x1="10" y1="-12" x2="36" y2="10" />
          <line x1="36" y1="10" x2="52" y2="32" />
          <line x1="10" y1="-12" x2="0" y2="-32" />
          <circle cx="-50" cy="-15" r="1.7" />
          <circle cx="-20" cy="0" r="2.2" />
          <circle cx="10" cy="-12" r="2.8" />
          <circle cx="36" cy="10" r="1.8" />
          <circle cx="52" cy="32" r="1.5" />
          <circle cx="0" cy="-32" r="1.4" />
        </g>
      </svg>

      <svg className="eng-moon" viewBox="-30 -30 60 60">
        <circle r="18" fill="none" stroke="#d4a373" strokeWidth="0.9" opacity="0.85" />
        <path d="M 6 -16 A 16 16 0 0 1 6 16 A 12 16 0 0 0 6 -16 Z" fill="#d4a373" opacity="0.45" />
        <g stroke="#d4a373" strokeWidth="0.4" opacity="0.5">
          <line x1="-30" y1="0" x2="-22" y2="0" />
          <line x1="22" y1="0" x2="30" y2="0" />
        </g>
      </svg>

      <div className="eng-label eng-label-bot">VOL. I · MMXXVI</div>
    </div>
  );
}

/* ---------- Opening scene — full-screen cosmic doorway ---------- */
function Opening({ onEnter }) {
  const [fading, setFading] = useState(false);
  const enter = () => {
    if (fading) return;
    setFading(true);
    setTimeout(onEnter, 1900);
  };

  return (
    <div className={`opening ${fading ? 'fade-out' : ''}`}>
      <Backdrop launching={fading} />

      <div className={`door ${fading ? 'door-opening' : ''}`}>
        <div className="door-half door-l">
          <div className="door-grain"></div>
          <DoorEngraving />
        </div>
        <div className="door-half door-r">
          <div className="door-grain"></div>
          <DoorEngraving mirror />
        </div>

        <div className="door-seam" aria-hidden="true">
          <div className="seam-line"></div>
          <div className="seam-bloom"></div>
        </div>

        <button
          className="door-knob"
          onClick={enter}
          aria-label="Open the door to Anvita’s universe"
        >
          <span className="knob-ring knob-ring-1" aria-hidden="true"></span>
          <span className="knob-ring knob-ring-2" aria-hidden="true"></span>
          <span className="knob-ring knob-ring-3" aria-hidden="true"></span>

          <span className="knob-disc">
            <svg className="knob-emblem" viewBox="-50 -50 100 100" aria-hidden="true">
              <g stroke="#f4c089" strokeWidth="0.9">
                {Array.from({ length: 24 }).map((_, i) => {
                  const a = (i * 15) * Math.PI / 180;
                  const major = i % 6 === 0;
                  const r1 = 36, r2 = major ? 44 : 40;
                  return (
                    <line
                      key={i}
                      x1={Math.cos(a) * r1} y1={Math.sin(a) * r1}
                      x2={Math.cos(a) * r2} y2={Math.sin(a) * r2}
                      strokeWidth={major ? 1.2 : 0.7}
                    />
                  );
                })}
              </g>
              <circle r="32" fill="none" stroke="#f4c089" strokeWidth="0.6" opacity="0.6" />
              <circle r="26" fill="none" stroke="#f4c089" strokeWidth="0.5" opacity="0.5" strokeDasharray="2 3" />
              <circle r="18" fill="rgba(244,192,137,0.18)" stroke="#f4c089" strokeWidth="0.9" />
              <circle r="4.5" fill="#fff5dc" />
              <circle r="9" fill="none" stroke="#f4c089" strokeWidth="0.4" opacity="0.55" />
              <g className="knob-orbit">
                <circle cx="26" cy="0" r="1.6" fill="#f4c089" />
              </g>
            </svg>
          </span>

          <span className="knob-label">
            <span className="kl-mark">◇</span>
            <span className="kl-text">Enter Anvita's Universe</span>
            <span className="kl-mark">◇</span>
          </span>
        </button>
      </div>

      <button className="opening-skip" onClick={enter}>Skip →</button>
    </div>
  );
}

/* ---------- Universe ---------- */
function Universe({ tweaks }) {
  const PLANETS = window.PLANETS;
  const stageRef = useRef(null);
  const rotatorRef = useRef(null);
  const planetRefs = useRef({});
  const cameraRef = useRef({ rot: 16, zoom: 1.2, baseScale: 1 });
  const dragRef = useRef({ active: false, lastX: 0 });
  const clickTimerRef = useRef(null);

  const [focusedId, setFocusedId] = useState(null);
  const [zoomDisplay, setZoomDisplay] = useState(1.2);
  const [systemRevealed, setSystemRevealed] = useState(false);
  const [clickedId, setClickedId] = useState(null);

  // intro reveal
  useEffect(() => {
    const t = setTimeout(() => setSystemRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  // base scale to fit viewport
  useEffect(() => {
    const compute = () => {
      const maxR = Math.max(...PLANETS.map((p) => p.orbitR || 0)) + 80;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const fitW = (w * 0.92) / (maxR * 2);
      const fitH = (h * 0.74) / (maxR * 0.86);
      const base = Math.min(fitW, fitH, 1);
      cameraRef.current.baseScale = Math.max(0.45, base);
      applyCamera();
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const applyCamera = () => {
    const { rot, zoom, baseScale } = cameraRef.current;
    if (rotatorRef.current) {
      rotatorRef.current.style.transform = `scale(${baseScale * zoom}) rotate(${rot}deg)`;
      rotatorRef.current.style.setProperty('--camera-rot-neg', `${-rot}deg`);
    }
  };

  // animate planet orbits via rAF (no React re-render)
  useEffect(() => {
    let raf;
    let t0 = performance.now();
    const speedMult = tweaks.motion;
    const animate = (now) => {
      const elapsed = (now - t0) / 1000;
      for (const p of PLANETS) {
        const el = planetRefs.current[p.id];
        if (!el) continue;
        const planetEl = el.firstElementChild;
        if (p.orbitR === 0) {
          if (planetEl) planetEl.classList.add('central');
          continue;
        }
        const focus = focusedId === p.id;
        const speed = focus ? 0 : p.speed * speedMult;
        const a = (p.angle * Math.PI / 180) + elapsed * speed;
        const rx = p.orbitR;
        const ry = p.orbitR * 0.32;
        const x = Math.cos(a) * rx;
        const y = Math.sin(a) * ry;
        const central = p.orbitR === 0;
        // counter-rotate so planet stays upright relative to viewer
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        if (planetEl) {
          planetEl.classList.toggle('central', central);
        }
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [PLANETS, focusedId, tweaks.motion]);

  // drag rotate
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const down = (e) => {
      if (focusedId) return;
      dragRef.current.active = true;
      dragRef.current.lastX = (e.touches ? e.touches[0].clientX : e.clientX);
      stage.classList.add('grabbing');
    };
    const move = (e) => {
      if (!dragRef.current.active) return;
      const x = (e.touches ? e.touches[0].clientX : e.clientX);
      const dx = x - dragRef.current.lastX;
      dragRef.current.lastX = x;
      cameraRef.current.rot += dx * 0.3;
      applyCamera();
    };
    const up = () => {
      dragRef.current.active = false;
      stage.classList.remove('grabbing');
    };
    stage.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    stage.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', up);
    return () => {
      stage.removeEventListener('mousedown', down);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      stage.removeEventListener('touchstart', down);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [focusedId]);

  // wheel zoom
  useEffect(() => {
    const onWheel = (e) => {
      if (focusedId) return;
      e.preventDefault();
      const delta = -e.deltaY * 0.0015;
      cameraRef.current.zoom = Math.max(0.55, Math.min(1.8, cameraRef.current.zoom + delta));
      setZoomDisplay(cameraRef.current.zoom);
      applyCamera();
    };
    const stage = stageRef.current;
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [focusedId]);

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setFocusedId(null); return; }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusedId, PLANETS]);

  useEffect(() => {
    return () => clearTimeout(clickTimerRef.current);
  }, []);

  const focusedPlanet = focusedId ? PLANETS.find(p => p.id === focusedId) : null;
  const hudPlanet = focusedPlanet;
  const openProjectsPage = () => {
    window.location.href = 'projects.html';
  };
  const openJourneyPage = () => {
    window.location.href = 'journey.html';
  };
  const openSkillsPage = () => {
    window.location.href = 'skills.html';
  };
  const openAboutPage = () => {
    window.location.href = 'about.html';
  };
  const openPlanetDestination = (planet) => {
    if (!planet) return false;
    if (planet.id === 'projects' || planet.detail?.component === 'projects') {
      openProjectsPage();
      return true;
    }
    if (planet.id === 'journey' || planet.detail?.component === 'journey') {
      openJourneyPage();
      return true;
    }
    if (planet.id === 'skills' || planet.detail?.component === 'skills') {
      openSkillsPage();
      return true;
    }
    if (planet.id === 'about' || planet.detail?.component === 'about') {
      openAboutPage();
      return true;
    }
    return false;
  };

  return (
    <div className={`universe-scene ${systemRevealed ? 'show' : ''}`}>
      <Starfield />

      <div
        ref={stageRef}
        className={`universe-stage ${focusedId ? 'dim' : ''}`}
      >
        <div ref={rotatorRef} className="universe-rotator">
          {/* orbit rings */}
          {PLANETS.filter(p => p.orbitR > 0).map(p => (
            <div
              key={`orbit-${p.id}`}
              className={`orbit-ring ${focusedId === p.id ? 'active' : ''}`}
              style={{
                width: p.orbitR * 2,
                height: p.orbitR * 2 * 0.32,
              }}
            />
          ))}

          {/* planets */}
          {PLANETS.map(p => {
            const isFocused = focusedId === p.id;
            const isDimmed = focusedId && !isFocused;
            return (
              <div
                key={p.id}
                className="planet-anchor"
                ref={el => { planetRefs.current[p.id] = el; }}
                style={p.orbitR === 0 ? { transform: 'translate(-50%, -50%)' } : {}}
              >
                <div
                  className={`planet ${p.orbitR === 0 ? 'planet-core' : ''} ${isFocused ? 'focused' : ''} ${isDimmed ? 'dimmed' : ''} ${clickedId === p.id ? 'clicked' : ''}`}
                  style={{ '--p-glow': p.glow, '--p-tint': p.tint }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (clickedId === p.id) return;
                    clearTimeout(clickTimerRef.current);
                    setClickedId(p.id);
                    clickTimerRef.current = setTimeout(() => {
                      if (openPlanetDestination(p)) {
                        setClickedId(null);
                        return;
                      }
                      setFocusedId(p.id);
                      setClickedId(null);
                    }, 180);
                  }}
                >
                  <PlanetBody planet={p} />
                  <div className="planet-tag">
                    <span className="pt-role">{p.role}</span>
                    <span className="pt-teaser">{p.teaser}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HUD */}
      <div className="hud">
        <div className="hud-tl">
          <div className="brand-mark">Anvita’s <em>Universe</em></div>
          <div className="brand-sub">Heliocentric view · GMT−07</div>
        </div>

        <div className="hud-bl">
          {hudPlanet ? (
            <>
              <span className="focus-name">{hudPlanet.role}</span>
              <span className="focus-blurb"><em>{hudPlanet.teaser}</em></span>
            </>
          ) : (
            <span className="focus-blurb">Click any planet to enter.</span>
          )}
        </div>

        <div className="hud-bc">
          <span className="key"><span className="kbd">drag</span> orbit</span>
          <span className="key"><span className="kbd">scroll</span> zoom</span>
          <span className="key"><span className="kbd">esc</span> back</span>
        </div>

        <div className="hud-br">
          <div className="zoom-readout">zoom · {(zoomDisplay * 100).toFixed(0)}%</div>
          <div className="zoom-bar">
            <div className="fill" style={{ width: `${((zoomDisplay - 0.55) / (1.8 - 0.55)) * 100}%` }}></div>
          </div>
        </div>

        <div className="planet-selector">
          {PLANETS.map(p => (
            <div
              key={p.id}
              className={`selector-pip ${focusedId === p.id ? 'active' : ''}`}
              style={{ '--p-tint': p.tint }}
              onClick={() => {
                if (openPlanetDestination(p)) return;
                setFocusedId(p.id);
              }}
            >
              <span className="label">{p.role}</span>
              <span className="dot"></span>
            </div>
          ))}
        </div>
      </div>

      {focusedPlanet && (
        <PlanetDetail planet={focusedPlanet} onClose={() => setFocusedId(null)} />
      )}
    </div>
  );
}

/* ---------- Root ---------- */
function App() {
  const initialScene = (() => {
    if (window.__INITIAL_SCENE__ === 'universe') {
      return 'universe';
    }
    const params = new URLSearchParams(window.location.search);
    const returnToUniverse = window.sessionStorage.getItem('returnToUniverse') === '1';
    if (params.get('scene') === 'universe' || returnToUniverse) {
      window.sessionStorage.removeItem('returnToUniverse');
      return 'universe';
    }
    return 'opening';
  })();
  const [scene, setScene] = useState(initialScene);
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "motion": 1,
    "showHints": true,
    "palette": "dusty"
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = (window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}]);

  return (
    <div className="app">
      {scene === 'opening' && <Opening onEnter={() => setScene('universe')} />}
      {scene === 'universe' && <Universe tweaks={tweaks} />}

      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Motion">
            <window.TweakSlider label="Orbit speed" value={tweaks.motion} min={0} max={2} step={0.1}
              onChange={v => setTweak('motion', v)} />
          </window.TweakSection>
          <window.TweakSection title="Scene">
            <window.TweakButton label="Replay intro" onClick={() => setScene('opening')} />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
