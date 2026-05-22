// SVG planet body renderers — abstract but distinct for each bodyType.

function PlanetBody({ planet, size, focused }) {
  const s = size || planet.size;
  const id = planet.id;
  const t = planet.tint;
  const g = planet.glow;

  if (planet.bodyType === 'sun') {
    return (
      <svg width={s} height={s} viewBox="-50 -50 100 100" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <radialGradient id={`grad-${id}`}>
            <stop offset="0%" stopColor="#fff3df" />
            <stop offset="35%" stopColor={g} />
            <stop offset="70%" stopColor={t} />
            <stop offset="100%" stopColor="#7a3b2a" />
          </radialGradient>
          <radialGradient id={`halo-${id}`}>
            <stop offset="0%" stopColor={g} stopOpacity="0.55" />
            <stop offset="60%" stopColor={t} stopOpacity="0.05" />
            <stop offset="100%" stopColor={t} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="0" cy="0" r="48" fill={`url(#halo-${id})`} />
        <circle cx="0" cy="0" r="40" fill={`url(#halo-${id})`} opacity="0.7" />
        <circle cx="0" cy="0" r="28" fill={`url(#grad-${id})`} />
        <circle cx="-6" cy="-6" r="6" fill="#fff8e8" opacity="0.35" />
      </svg>
    );
  }

  if (planet.bodyType === 'ringed') {
    return (
      <svg width={s * 2.2} height={s} viewBox="-110 -50 220 100" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <radialGradient id={`grad-${id}`}>
            <stop offset="0%" stopColor={g} />
            <stop offset="55%" stopColor={t} />
            <stop offset="100%" stopColor="#2a1518" />
          </radialGradient>
          <linearGradient id={`ring-${id}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={t} stopOpacity="0" />
            <stop offset="35%" stopColor={g} stopOpacity="0.6" />
            <stop offset="65%" stopColor={g} stopOpacity="0.6" />
            <stop offset="100%" stopColor={t} stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="0" cy="6" rx="88" ry="14" fill="none" stroke={`url(#ring-${id})`} strokeWidth="6" opacity="0.7" />
        <ellipse cx="0" cy="4" rx="74" ry="10" fill="none" stroke={`url(#ring-${id})`} strokeWidth="2" opacity="0.5" />
        <circle cx="0" cy="0" r="36" fill={`url(#grad-${id})`} />
        <ellipse cx="-8" cy="-10" rx="10" ry="3" fill="#fff" opacity="0.18" />
        <ellipse cx="0" cy="6" rx="88" ry="14" fill="none" stroke={`url(#ring-${id})`} strokeWidth="6" opacity="0.4" transform="scale(1,-1)" />
      </svg>
    );
  }

  if (planet.bodyType === 'gas') {
    return (
      <svg width={s} height={s} viewBox="-50 -50 100 100" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <radialGradient id={`grad-${id}`}>
            <stop offset="0%" stopColor={g} />
            <stop offset="60%" stopColor={t} />
            <stop offset="100%" stopColor="#3d3528" />
          </radialGradient>
          <clipPath id={`clip-${id}`}><circle cx="0" cy="0" r="38" /></clipPath>
        </defs>
        <circle cx="0" cy="0" r="38" fill={`url(#grad-${id})`} />
        <g clipPath={`url(#clip-${id})`} opacity="0.45">
          <path d="M -42 -14 Q 0 -22 42 -14" stroke="#fff" strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M -42 0 Q 0 -6 42 0" stroke="#3d2a26" strokeWidth="3" fill="none" opacity="0.5" />
          <path d="M -42 12 Q 0 18 42 12" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.3" />
          <path d="M -42 22 Q 0 28 42 22" stroke="#3d2a26" strokeWidth="2" fill="none" opacity="0.5" />
        </g>
      </svg>
    );
  }

  if (planet.bodyType === 'moon') {
    return (
      <svg width={s} height={s} viewBox="-50 -50 100 100" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <radialGradient id={`grad-${id}`} cx="0.35" cy="0.35">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="40%" stopColor={g} />
            <stop offset="100%" stopColor={t} />
          </radialGradient>
        </defs>
        <circle cx="0" cy="0" r="38" fill={`url(#grad-${id})`} />
        <circle cx="10" cy="-8" r="4" fill="#fff" opacity="0.18" />
        <circle cx="-12" cy="6" r="6" fill="#3d2a26" opacity="0.12" />
        <circle cx="6" cy="14" r="3" fill="#3d2a26" opacity="0.18" />
      </svg>
    );
  }

  // rocky default
  return (
    <svg width={s} height={s} viewBox="-50 -50 100 100" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <radialGradient id={`grad-${id}`} cx="0.4" cy="0.35">
          <stop offset="0%" stopColor={g} />
          <stop offset="65%" stopColor={t} />
          <stop offset="100%" stopColor="#2a1a18" />
        </radialGradient>
      </defs>
      <circle cx="0" cy="0" r="38" fill={`url(#grad-${id})`} />
      <ellipse cx="-12" cy="-6" rx="12" ry="4" fill="#fff" opacity="0.1" />
      <circle cx="14" cy="10" r="6" fill="#3d2a26" opacity="0.18" />
      <circle cx="-8" cy="14" r="3" fill="#3d2a26" opacity="0.22" />
    </svg>
  );
}

window.PlanetBody = PlanetBody;
