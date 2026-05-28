import { useEffect, useRef } from 'react'

interface DonutChartProps {
  paid: number
  total: number
  color: string
  size?: number
  strokeWidth?: number
}

export function DonutChart({ paid, total, color, size = 160, strokeWidth = 14 }: DonutChartProps) {
  const circleRef = useRef<SVGCircleElement>(null)
  const pct = total > 0 ? Math.min(paid / total, 1) : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const gap = 8
  const dashOffset = circumference - pct * (circumference - gap) + gap / 2

  useEffect(() => {
    const el = circleRef.current
    if (!el) return
    el.style.setProperty('--full-dash', String(circumference))
    el.style.setProperty('--target-dash', String(dashOffset))
    el.style.strokeDashoffset = String(circumference)
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
      el.style.strokeDashoffset = String(dashOffset)
    })
    return () => cancelAnimationFrame(raf)
  }, [circumference, dashOffset])

  const cx = size / 2
  const cy = size / 2

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Paid arc */}
      <circle
        ref={circleRef}
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
      />
    </svg>
  )
}
