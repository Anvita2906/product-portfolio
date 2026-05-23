(() => {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let lastFrameTime = performance.now();
  let lastShootTime = 0;
  let nextShootDelay = randomBetween(3000, 7000);

  let dustStars = [];
  let midStars = [];
  let brightStars = [];
  const shootingStars = [];
  let nebulae = [];

  // Constellation flicker state
  let constellation = null;
  let lastConstellationTime = 0;
  let nextConstellationDelay = randomBetween(5000, 10000);

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function pickColor(weightedColors) {
    const r = Math.random();
    let acc = 0;
    for (const [weight, color] of weightedColors) {
      acc += weight;
      if (r <= acc) return color;
    }
    return weightedColors[weightedColors.length - 1][1];
  }

  function hexToRgba(hex, alpha) {
    const clean = hex.replace('#', '');
    const int = parseInt(clean, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    const W = canvas.width, H = canvas.height;

    const dustPalette = [
      [0.85, '#dde0e0'],
      [0.10, '#e8c8a0'],
      [0.05, '#c8d0e0'],
    ];
    const midPalette = [
      [0.70, '#efe6d8'],
      [0.15, '#e8a87c'],
      [0.10, '#d6a8a8'],
      [0.05, '#ffffff'],
    ];
    const brightPalette = [
      [0.60, '#fff5e2'],
      [0.25, '#e8a87c'],
      [0.15, '#d6a8a8'],
    ];

    // Layer 1 — distant dust: flat squares, barely visible, move slowest
    dustStars = Array.from({ length: 900 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: randomBetween(0.3, 0.8) * dpr,
      baseAlpha: randomBetween(0.08, 0.25),
      color: pickColor(dustPalette),
    }));

    // Layer 2 — mid stars: circular, twinkling, gaussian distribution
    const centerX = W * 0.5;
    const centerY = H * 0.4;
    const stdDev  = W * 0.3;
    midStars = Array.from({ length: 280 }, () => ({
      x: clamp(centerX + gaussianRandom() * stdDev,     0, W),
      y: clamp(centerY + gaussianRandom() * stdDev * 0.7, 0, H),
      r: randomBetween(0.8, 2.0) * dpr,
      baseAlpha: randomBetween(0.3, 0.7),
      twinkleSpeed: randomBetween(0.5, 2.5),
      twinklePhase: randomBetween(0, Math.PI * 2),
      color: pickColor(midPalette),
    }));

    // Layer 3 — bright foreground stars: spikes, move the most
    brightStars = Array.from({ length: 22 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: randomBetween(2, 3.5) * dpr,
      baseAlpha: randomBetween(0.6, 1.0),
      twinkleSpeed: randomBetween(0.3, 1.0),
      twinklePhase: randomBetween(0, Math.PI * 2),
      spikeLength: randomBetween(10, 25) * dpr,
      color: pickColor(brightPalette),
    }));

    // Nebula clouds — soft drifting color blobs in brand palette
    nebulae = [
      { x: W * 0.15, y: H * 0.25, rx: W * 0.28, ry: H * 0.22, r: 180, g: 100, b: 100, maxAlpha: 0.045, vx:  0.18 * dpr, vy:  0.07 * dpr },
      { x: W * 0.80, y: H * 0.55, rx: W * 0.25, ry: H * 0.24, r: 122, g:  59, b:  74, maxAlpha: 0.050, vx: -0.12 * dpr, vy:  0.10 * dpr },
      { x: W * 0.50, y: H * 0.05, rx: W * 0.32, ry: H * 0.18, r: 212, g: 163, b: 115, maxAlpha: 0.028, vx:  0.08 * dpr, vy:  0.06 * dpr },
      { x: W * 0.05, y: H * 0.75, rx: W * 0.22, ry: H * 0.25, r: 155, g: 106, b: 108, maxAlpha: 0.038, vx:  0.22 * dpr, vy: -0.09 * dpr },
    ];
  }

  function spawnShootingStar(now) {
    shootingStars.push({
      startX: Math.random() * (canvas.width * 0.3),
      startY: Math.random() * (canvas.height * 0.3),
      angle: randomBetween(210, 240) * (Math.PI / 180),
      speed: randomBetween(400, 700) * dpr,
      trailLength: randomBetween(80, 150) * dpr,
      life: 0,
      maxLife: randomBetween(0.4, 0.7),
    });
    lastShootTime = now;
    nextShootDelay = randomBetween(3000, 7000);
  }

  function spawnConstellation(now) {
    if (brightStars.length < 3) return;
    const count = 3 + Math.floor(Math.random() * 2);
    const indices = brightStars
      .map((_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    constellation = {
      indices,
      spawnTime: now,
      fadeIn:   700,
      hold:    2200,
      fadeOut:  900,
    };
    lastConstellationTime = now;
    nextConstellationDelay = randomBetween(7000, 15000);
  }

  function render(now) {
    const time = now / 1000;
    const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.05);
    const scrollY = window.scrollY;
    lastFrameTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ── 1. Nebula clouds (drawn first, underneath stars) ──────────────
    for (const neb of nebulae) {
      neb.x += neb.vx;
      neb.y += neb.vy;
      // wrap with padding so cloud fully exits before reappearing
      const px = neb.rx * 1.1, py = neb.ry * 1.1;
      if (neb.x >  canvas.width  + px) neb.x = -px;
      if (neb.x < -px)                 neb.x = canvas.width  + px;
      if (neb.y >  canvas.height + py) neb.y = -py;
      if (neb.y < -py)                 neb.y = canvas.height + py;

      ctx.save();
      ctx.translate(neb.x, neb.y);
      ctx.scale(1, neb.ry / neb.rx);
      const nebGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, neb.rx);
      nebGrad.addColorStop(0,    `rgba(${neb.r},${neb.g},${neb.b},${neb.maxAlpha.toFixed(4)})`);
      nebGrad.addColorStop(0.45, `rgba(${neb.r},${neb.g},${neb.b},${(neb.maxAlpha * 0.28).toFixed(4)})`);
      nebGrad.addColorStop(1,    `rgba(${neb.r},${neb.g},${neb.b},0)`);
      ctx.fillStyle = nebGrad;
      ctx.beginPath();
      ctx.arc(0, 0, neb.rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Existing warm glow at center
    const glow = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.35, 0,
      canvas.width * 0.5, canvas.height * 0.35, canvas.width * 0.25
    );
    glow.addColorStop(0, 'rgba(232,180,140,0.025)');
    glow.addColorStop(1, 'rgba(232,180,140,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ── 2. Depth parallax — each layer drifts at a different speed ────
    // Using independent sinusoidal phases so layers oscillate at different
    // frequencies, creating a genuine "camera floating through space" feel.
    const dp = time * 0.04;
    const dustDX  = Math.sin(dp * 0.90) *  4 * dpr,  dustDY  = Math.cos(dp * 0.70) *  3 * dpr;
    const midDX   = Math.sin(dp * 1.55) * 10 * dpr,  midDY   = Math.cos(dp * 0.95) *  6 * dpr;
    const brightDX= Math.sin(dp * 2.10) * 22 * dpr,  brightDY= Math.cos(dp * 1.35) * 14 * dpr;

    // Layer 1 — dust (far, barely moves)
    for (const star of dustStars) {
      ctx.fillStyle = hexToRgba(star.color, star.baseAlpha);
      ctx.fillRect(
        star.x + dustDX,
        star.y + scrollY * 0.05 * dpr + dustDY,
        star.r, star.r
      );
    }

    // Layer 2 — mid
    for (const star of midStars) {
      const alpha = star.baseAlpha * (0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase));
      ctx.beginPath();
      ctx.arc(star.x + midDX, star.y + scrollY * 0.12 * dpr + midDY, star.r, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(star.color, alpha);
      ctx.fill();
    }

    // Layer 3 — bright (near, moves the most); track drawn positions for constellation
    const brightDrawPos = brightStars.map((star) => {
      const drawX = star.x + brightDX;
      const drawY = star.y + scrollY * 0.2 * dpr + brightDY;
      const alpha = star.baseAlpha * (0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.twinklePhase));

      ctx.beginPath();
      ctx.arc(drawX, drawY, star.r, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(star.color, alpha);
      ctx.fill();

      ctx.strokeStyle = hexToRgba(star.color, alpha * 0.4);
      ctx.lineWidth = 0.5 * dpr;
      for (const angle of [0, Math.PI / 2, Math.PI / 4, 3 * Math.PI / 4]) {
        ctx.beginPath();
        ctx.moveTo(drawX, drawY);
        ctx.lineTo(drawX + Math.cos(angle) * star.spikeLength, drawY + Math.sin(angle) * star.spikeLength);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(drawX, drawY);
        ctx.lineTo(drawX - Math.cos(angle) * star.spikeLength, drawY - Math.sin(angle) * star.spikeLength);
        ctx.stroke();
      }
      return { x: drawX, y: drawY };
    });

    // ── 3. Constellation flicker ──────────────────────────────────────
    if (!constellation && now - lastConstellationTime > nextConstellationDelay) {
      spawnConstellation(now);
    }
    if (constellation) {
      const elapsed = now - constellation.spawnTime;
      const total   = constellation.fadeIn + constellation.hold + constellation.fadeOut;
      if (elapsed >= total) {
        constellation = null;
      } else {
        let t;
        if (elapsed < constellation.fadeIn) {
          t = elapsed / constellation.fadeIn;
        } else if (elapsed < constellation.fadeIn + constellation.hold) {
          t = 1;
        } else {
          t = 1 - (elapsed - constellation.fadeIn - constellation.hold) / constellation.fadeOut;
        }
        // Ease in/out with smoothstep
        t = t * t * (3 - 2 * t);

        const lineAlpha = t * 0.11;
        const dotAlpha  = t * 0.20;
        const pts = constellation.indices
          .filter(i => i < brightDrawPos.length)
          .map(i => brightDrawPos[i]);

        if (pts.length >= 2) {
          ctx.save();
          ctx.setLineDash([3 * dpr, 6 * dpr]);
          ctx.lineWidth   = 0.7 * dpr;
          ctx.strokeStyle = `rgba(239,230,216,${lineAlpha.toFixed(4)})`;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k].x, pts[k].y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();

          for (const pt of pts) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2.2 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(239,230,216,${dotAlpha.toFixed(4)})`;
            ctx.fill();
          }
        }
      }
    }

    // ── Shooting stars (unchanged) ────────────────────────────────────
    if (now - lastShootTime > nextShootDelay && shootingStars.length < 2) {
      spawnShootingStar(now);
    }

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

      const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY);
      gradient.addColorStop(0,   'rgba(239,230,216,0)');
      gradient.addColorStop(0.7, `rgba(239,230,216,${0.3 * fadeAlpha})`);
      gradient.addColorStop(1,   `rgba(255,255,255,${0.8 * fadeAlpha})`);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(headX, headY, 1.5 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.9 * fadeAlpha})`;
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(render);
})();
