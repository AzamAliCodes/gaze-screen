import { motion } from 'framer-motion';

/**
 * Minimalist White Neo-Brutalist Animated Counter Card
 */
export function CounterCard({ value, label, unit = '', color = 'var(--ink)', delay = 0 }) {
  return (
    <motion.div
      className="brutal-card"
      style={{
        padding: '1.25rem 1.5rem',
        minWidth: 140,
        background: '#ffffff',
        border: 'var(--border-brutal)',
        boxShadow: 'var(--shadow-sm)',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -3,
        boxShadow: 'var(--shadow-brutal)',
        transition: { duration: 0.15 },
      }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color, lineHeight: 1 }}>
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.15, type: 'spring', stiffness: 300, damping: 20 }}
        >
          {value != null ? (typeof value === 'number' ? value.toFixed(typeof value === 'integer' ? 0 : 1) : value) : '—'}
        </motion.span>
        {unit && <span style={{ fontSize: '0.95rem', color: 'var(--ink-muted)', marginLeft: 3 }}>{unit}</span>}
      </div>
      <div className="text-label" style={{ marginTop: 6, color: 'var(--ink-muted)' }}>{label}</div>
    </motion.div>
  );
}

/**
 * Neo-Brutalist Status Badge Pill
 */
export function StatusBadge({ status, label }) {
  const colors = {
    ok:      { bg: '#dcfce7', border: 'var(--ink)', text: '#15803d', dot: '#16a34a' },
    warning: { bg: '#fef3c7', border: 'var(--ink)', text: '#b45309', dot: '#d97706' },
    error:   { bg: '#fee2e2', border: 'var(--ink)', text: '#b91c1c', dot: '#dc2626' },
    idle:    { bg: '#f1f5f9', border: 'var(--ink)', text: '#475569', dot: '#64748b' },
  };
  const c = colors[status] || colors.idle;
  return (
    <motion.span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px',
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        borderRadius: '3px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: c.text,
        boxShadow: '2px 2px 0px var(--ink)',
      }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.span
        style={{
          width: 7, height: 7, borderRadius: '50%',
          background: c.dot,
        }}
        animate={{ opacity: [1, 0.35, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {label}
    </motion.span>
  );
}

/**
 * Minimalist Divider with label
 */
export function BrutalDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
      <div style={{ flex: 1, height: 2, background: 'var(--ink-subtle)' }} />
      {label && (
        <span className="text-label" style={{ whiteSpace: 'nowrap', color: 'var(--ink-muted)' }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: 2, background: 'var(--ink-subtle)' }} />
    </div>
  );
}

/**
 * Neo-Brutalist Progress Ring
 */
export function ProgressRing({ progress = 0, size = 120, stroke = 10, color = 'var(--green-600)' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * Noise / static overlay
 */
export function NoiseOverlay({ opacity = 0.02 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        inset: 0,
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '200px 200px',
      }}
    />
  );
}

/**
 * Blinking live indicator dot
 */
export function LiveDot({ color = 'var(--green-600)' }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: 10, height: 10, flexShrink: 0 }}>
      <motion.span
        style={{
          position: 'absolute', inset: -2, borderRadius: '50%',
          background: color, opacity: 0.35,
        }}
        animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
      />
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: color,
        boxShadow: `0 0 4px ${color}`,
      }} />
    </span>
  );
}
