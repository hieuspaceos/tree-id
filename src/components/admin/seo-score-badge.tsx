/**
 * SEO score badge — circular ring with conic-gradient color coding
 * 0-40: red, 41-70: orange, 71-100: green
 */

interface Props {
  score: number
  size?: number
}

function scoreColor(score: number): string {
  if (score <= 40) return '#ef4444'
  if (score <= 70) return '#f59e0b'
  return '#22c55e'
}

export function SeoScoreBadge({ score, size = 32 }: Props) {
  const color = scoreColor(score)
  const pct = Math.min(100, Math.max(0, score))
  const fontSize = size * 0.35

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `conic-gradient(${color} ${pct * 3.6}deg, rgba(148,163,184,0.2) 0deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: size - 6,
          height: size - 6,
          borderRadius: '50%',
          background: 'var(--admin-card-bg, #fff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize,
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}
      >
        {score}
      </div>
    </div>
  )
}
