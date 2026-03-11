/**
 * Marketing/Distribution dashboard — integrated into admin SPA
 * Fetches distribution stats + content inventory from /api/admin/distribution
 * Reuses DistributionTable patterns but styled for admin glass-panel theme
 */
import { useEffect, useState, useMemo } from 'react'
import { api } from '@/lib/admin/api-client'

// ── Types ──

interface DistributionStats {
  total: number
  posted: number
  drafted: number
  platformCounts: Record<string, number>
  firstDate: string | null
  lastDate: string | null
  avgPerWeek: number
}

interface ContentItem {
  title: string
  slug: string
  collection: 'articles' | 'notes'
  publishedAt: string | null
  distributedPlatforms: string[]
  distributionStatus: 'not_distributed' | 'drafted' | 'posted'
  distributionDate: string | null
}

interface DistributionEntry {
  date: string
  slug: string
  type: string
  status: string
  wordCount: number
}

interface DistributionData {
  stats: DistributionStats
  inventory: ContentItem[]
  recentEntries: DistributionEntry[]
}

// ── Status badge helpers ──

const STATUS_LABEL: Record<string, string> = {
  posted: 'Posted',
  drafted: 'Drafted',
  not_distributed: 'Not distributed',
}

const STATUS_CLASS: Record<string, string> = {
  posted: 'admin-badge-success',
  drafted: 'admin-badge-warning',
  not_distributed: 'admin-badge-neutral',
}

// ── Stat Card ──

function StatCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{sub}</div>
    </div>
  )
}

// ── Main Component ──

export function MarketingDashboard() {
  const [data, setData] = useState<DistributionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    api.distribution.stats()
      .then((res) => {
        if (res.ok && res.data) {
          setData(res.data as unknown as DistributionData)
        } else {
          setError(res.error || 'Failed to load')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!data) return []
    return data.inventory.filter((item) => {
      if (typeFilter !== 'all' && item.collection !== typeFilter) return false
      if (statusFilter !== 'all' && item.distributionStatus !== statusFilter) return false
      return true
    })
  }, [data, typeFilter, statusFilter])

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8' }}>Loading marketing data...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px', textAlign: 'center' }}>
        <p style={{ color: '#ef4444' }}>{error || 'No data available'}</p>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Run <code>/distribute slug-name</code> in Claude Code to generate social posts.
        </p>
      </div>
    )
  }

  const { stats, recentEntries } = data
  const platforms = Object.keys(stats.platformCounts)
  const platformSummary = platforms.length > 3
    ? platforms.slice(0, 3).join(', ') + '...'
    : platforms.join(', ') || 'none'
  const sinceLabel = stats.firstDate ? `Since ${stats.firstDate}` : 'No data yet'

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>
        Marketing
      </h1>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Distributed" value={stats.total} sub={sinceLabel} />
        <StatCard label="Posted" value={stats.posted} sub={`${stats.drafted} drafted`} />
        <StatCard label="Platforms" value={platforms.length} sub={platformSummary} />
        <StatCard label="Frequency" value={stats.avgPerWeek || '-'} sub="posts/week" />
      </div>

      {/* Content inventory */}
      <h2 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '0.75rem' }}>
        Content Inventory
      </h2>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="admin-select">
          <option value="all">All types</option>
          <option value="articles">Articles</option>
          <option value="notes">Notes</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-select">
          <option value="all">All statuses</option>
          <option value="posted">Posted</option>
          <option value="drafted">Drafted</option>
          <option value="not_distributed">Not distributed</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8' }}>
          {filtered.length} of {data.inventory.length} items
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
          No content found. Create articles or notes first.
        </div>
      ) : (
        <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Platforms</th>
                  <th>Status</th>
                  <th>Published</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.slug}>
                    <td style={{ fontWeight: 500 }}>{item.title}</td>
                    <td>
                      <span className="admin-badge-neutral">
                        {item.collection === 'articles' ? 'Article' : 'Note'}
                      </span>
                    </td>
                    <td>
                      {item.distributedPlatforms.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {item.distributedPlatforms.map((p) => (
                            <span key={p} className="admin-badge-info">{p}</span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>-</span>
                      )}
                    </td>
                    <td>
                      <span className={STATUS_CLASS[item.distributionStatus]}>
                        {STATUS_LABEL[item.distributionStatus]}
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <h2 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '0.75rem' }}>
        Recent Activity
      </h2>

      {recentEntries.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
          No distribution activity yet. Run <code>/distribute</code> to get started.
        </div>
      ) : (
        <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Slug</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Words</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map((entry, i) => (
                  <tr key={`${entry.slug}-${i}`}>
                    <td>{entry.date}</td>
                    <td style={{ fontWeight: 500 }}>{entry.slug}</td>
                    <td>{entry.type}</td>
                    <td>
                      <span className={entry.status === 'posted' ? 'admin-badge-success' : 'admin-badge-warning'}>
                        {entry.status}
                      </span>
                    </td>
                    <td>{entry.wordCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '0.75rem' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {['/distribute slug-name', '/distribute --latest', '/distribute --mark-posted --slug slug-name', '/marketing-review'].map((cmd) => (
            <code key={cmd} style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', fontSize: '0.8rem', color: '#64748b' }}>
              {cmd}
            </code>
          ))}
        </div>
      </div>
    </div>
  )
}
