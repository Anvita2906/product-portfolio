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

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function gaussianRandom() {
    let u = 0;
    let v = 0;
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

    dustStars = Array.from({ length: 900 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: randomBetween(0.3, 0.8) * dpr,
      baseAlpha: randomBetween(0.08, 0.25),
      color: pickColor(dustPalette),
    }));

    const centerX = canvas.width * 0.5;
    const centerY = canvas.height * 0.4;
    const stdDev = canvas.width * 0.3;

    midStars = Array.from({ length: 280 }, () => ({
      x: clamp(centerX + gaussianRandom() * stdDev, 0, canvas.width),
      y: clamp(centerY + gaussianRandom() * stdDev * 0.7, 0, canvas.height),
      r: randomBetween(0.8, 2.0) * dpr,
      baseAlpha: randomBetween(0.3, 0.7),
      twinkleSpeed: randomBetween(0.5, 2.5),
      twinklePhase: randomBetween(0, Math.PI * 2),
      color: pickColor(midPalette),
    }));

    brightStars = Array.from({ length: 22 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: randomBetween(2, 3.5) * dpr,
      baseAlpha: randomBetween(0.6, 1.0),
      twinkleSpeed: randomBetween(0.3, 1.0),
      twinklePhase: randomBetween(0, Math.PI * 2),
      spikeLength: randomBetween(10, 25) * dpr,
      color: pickColor(brightPalette),
    }));
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

  function render(now) {
    const time = now / 1000;
    const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.05);
    const scrollY = window.scrollY;
    lastFrameTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const glow = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.35,
      0,
      canvas.width * 0.5,
      canvas.height * 0.35,
      canvas.width * 0.25
    );
    glow.addColorStop(0, 'rgba(232,180,140,0.025)');
    glow.addColorStop(1, 'rgba(232,180,140,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const star of dustStars) {
      const drawY = star.y + scrollY * 0.05 * dpr;
      ctx.fillStyle = hexToRgba(star.color, star.baseAlpha);
      ctx.fillRect(star.x, drawY, star.r, star.r);
    }

    for (const star of midStars) {
      const drawY = star.y + scrollY * 0.12 * dpr;
      const alpha = star.baseAlpha * (0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase));
      ctx.beginPath();
      ctx.arc(star.x, drawY, star.r, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(star.color, alpha);
      ctx.fill();
    }

    for (const star of brightStars) {
      const drawY = star.y + scrollY * 0.2 * dpr;
      const alpha = star.baseAlpha * (0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.twinklePhase));

      ctx.beginPath();
      ctx.arc(star.x, drawY, star.r, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(star.color, alpha);
      ctx.fill();

      ctx.strokeStyle = hexToRgba(star.color, alpha * 0.4);
      ctx.lineWidth = 0.5 * dpr;
      for (const angle of [0, Math.PI / 2, Math.PI / 4, 3 * Math.PI / 4]) {
        ctx.beginPath();
        ctx.moveTo(star.x, drawY);
        ctx.lineTo(star.x + Math.cos(angle) * star.spikeLength, drawY + Math.sin(angle) * star.spikeLength);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(star.x, drawY);
        ctx.lineTo(star.x - Math.cos(angle) * star.spikeLength, drawY - Math.sin(angle) * star.spikeLength);
        ctx.stroke();
      }
    }

    if (now - lastShootTime > nextShootDelay && shootingStars.length < 2) {
      spawnShootingStar(now);
    }

    for (let i = shootingStars.length - 1; i >= 0; i -= 1) {
      const star = shootingStars[i];
      star.life += deltaTime;
      if (star.life > star.maxLife) {
        shootingStars.splice(i, 1);
        continue;
      }

      const progress = star.life / star.maxLife;
      const headX = star.startX + Math.cos(star.angle) * star.speed * star.life;
      const headY = star.startY - Math.sin(star.angle) * star.speed * star.life;
      const tailX = headX - Math.cos(star.angle) * star.trailLength;
      const tailY = headY + Math.sin(star.angle) * star.trailLength;
      const fadeAlpha = 1 - progress;

      const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY);
      gradient.addColorStop(0, 'rgba(239,230,216,0)');
      gradient.addColorStop(0.7, `rgba(239,230,216,${0.3 * fadeAlpha})`);
      gradient.addColorStop(1, `rgba(255,255,255,${0.8 * fadeAlpha})`);
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
