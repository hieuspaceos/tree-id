/**
 * Reusable loading skeleton components — pulsing glass-card placeholders
 * Used in content list, editor, and dashboard during data fetch
 */

/** Single skeleton line with optional width */
export function SkeletonLine({ width = '100%', height = '1rem' }: { width?: string; height?: string }) {
  return <div className="skeleton-line" style={{ width, height }} />
}

/** Table skeleton — mimics admin table rows */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-panel" style={{ padding: '1rem', borderRadius: '14px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--t-glass-border)' }}>
        <SkeletonLine width="30%" height="0.7rem" />
        <SkeletonLine width="20%" height="0.7rem" />
        <SkeletonLine width="15%" height="0.7rem" />
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0' }}>
          <SkeletonLine width="35%" />
          <SkeletonLine width="20%" />
          <SkeletonLine width="10%" />
        </div>
      ))}
    </div>
  )
}

/** Form skeleton — mimics editor form fields */
export function SkeletonForm({ fields = 6 }: { fields?: number }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px' }}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ marginBottom: '1.25rem' }}>
          <SkeletonLine width="80px" height="0.7rem" />
          <div style={{ marginTop: '0.375rem' }}>
            <SkeletonLine height={i === fields - 1 ? '120px' : '2.25rem'} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Dashboard stat cards skeleton */
export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: '1rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-block" style={{ height: '100px', borderRadius: '12px' }} />
      ))}
    </div>
  )
}
