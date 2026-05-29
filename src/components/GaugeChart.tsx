import { useEffect, useState } from 'react'
import { formatCurrency } from '../utils/formatters'

interface GaugeChartProps {
  pct: number
  color: string
  savedAmount: number
  targetAmount: number
  uid: string
  delayMs?: number
}

export function GaugeChart({ pct, color, savedAmount, targetAmount, uid, delayMs = 80 }: GaugeChartProps) {
  const [animPct, setAnimPct] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setAnimPct(pct), delayMs)
    return () => clearTimeout(t)
  }, [pct, delayMs])

  const cx = 100
  const cy = 102
  const r = 76
  const sw = 13
  const circ = Math.PI * r

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
  const needleLen = 69
  const needleAngle = -90 + animPct * 180
  const isComplete = pct >= 1

  const glowId = `g-${uid}`
  const shadowId = `s-${uid}`

  return (
    <svg
      viewBox="0 0 200 112"
      style={{ width: '100%', overflow: 'visible' }}
      aria-label={`${Math.round(pct * 100)}% naspořeno`}
    >
      <defs>
        <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={shadowId}>
          <feDropShadow dx="1" dy="2" stdDeviation="3" floodColor={color} floodOpacity="0.55" />
        </filter>
      </defs>

      {/* Track background */}
      <path
        d={arcPath}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={sw}
        strokeLinecap="round"
      />

      {/* Glow layer */}
      <path
        d={arcPath}
        fill="none"
        stroke={color}
        strokeWidth={sw + 14}
        strokeLinecap="round"
        opacity={isComplete ? 0.28 : 0.14}
        strokeDasharray={`${circ}`}
        strokeDashoffset={`${(1 - animPct) * circ}`}
        filter={`url(#${glowId})`}
        style={{ transition: 'stroke-dashoffset 1.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s' }}
      />

      {/* Filled arc */}
      <path
        d={arcPath}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${circ}`}
        strokeDashoffset={`${(1 - animPct) * circ}`}
        style={{ transition: 'stroke-dashoffset 1.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
      />

      {/* Needle */}
      <g
        filter={`url(#${shadowId})`}
        style={{
          transform: `translate(${cx}px, ${cy}px) rotate(${needleAngle}deg)`,
          transition: 'transform 1.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Thin tapered needle: wide at base, sharp tip */}
        <path d={`M -2 10 L 0 ${-needleLen} L 2 10 Z`} fill={color} opacity={0.95} />
        {/* Highlight line along needle */}
        <line x1={0} y1={8} x2={0} y2={-(needleLen - 4)} stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} />
      </g>

      {/* Hub — layered for depth */}
      <circle cx={cx} cy={cy} r={11} fill="var(--card)" />
      <circle cx={cx} cy={cy} r={11} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6} />
      <circle cx={cx} cy={cy} r={5} fill={color} />
      <circle cx={cx} cy={cy} r={2.5} fill="rgba(255,255,255,0.4)" />

      {/* End markers */}
      <circle cx={cx - r} cy={cy} r={3} fill="rgba(255,255,255,0.1)" />
      <circle cx={cx + r} cy={cy} r={3} fill="rgba(255,255,255,0.1)" />

      {/* Percentage */}
      <text
        x={cx}
        y={cy - 28}
        textAnchor="middle"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 21,
          fontWeight: 600,
          fill: isComplete ? color : 'var(--text-primary)',
          letterSpacing: '-0.04em',
        }}
      >
        {Math.round(pct * 100)}%
      </text>

      {/* Amounts */}
      <text
        x={cx}
        y={cy - 13}
        textAnchor="middle"
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 9.5,
          fill: 'rgba(136,146,176,0.85)',
        }}
      >
        {formatCurrency(savedAmount)} / {formatCurrency(targetAmount)}
      </text>
    </svg>
  )
}
