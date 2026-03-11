/**
 * Individual social post card with edit, copy, and optional Postiz schedule
 * Used inside DistributionPostGenerator modal
 */

/** Platform icon/emoji mapping */
const PLATFORM_ICON: Record<string, string> = {
  'Twitter/X': 'X',
  'LinkedIn': 'in',
  'Facebook': 'fb',
  'Reddit': 'r/',
  'Threads': '@',
  'Hacker News': 'HN',
  'Dev.to': 'DEV',
  'Medium': 'M',
  'Hashnode': '#',
  'Viblo': 'V',
  'Substack': 'S',
  'Raw Output': '*',
}

interface PostCardProps {
  platform: string
  content: string
  isCopied: boolean
  onEdit: (content: string) => void
  onCopy: () => void
  /** Whether Postiz scheduling is available for this platform */
  canSchedule: boolean
  scheduleStatus?: string
  onSchedule?: () => void
}

export function DistributionPostCard({
  platform, content, isCopied, onEdit, onCopy,
  canSchedule, scheduleStatus, onSchedule,
}: PostCardProps) {
  return (
    <div className="distribution-post-card">
      <div className="distribution-post-header">
        <span className="distribution-post-platform-badge">
          {PLATFORM_ICON[platform] || platform.charAt(0)}
        </span>
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
          {platform}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.375rem' }}>
          {canSchedule && onSchedule && (
            <button
              className="admin-btn admin-btn-primary"
              onClick={onSchedule}
              disabled={scheduleStatus === 'scheduling' || scheduleStatus === 'scheduled'}
              style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
            >
              {scheduleStatus === 'scheduling' ? 'Scheduling...'
                : scheduleStatus === 'scheduled' ? 'Scheduled!'
                : scheduleStatus === 'error' ? 'Retry Schedule'
                : 'Schedule'}
            </button>
          )}
          <button
            className="admin-btn admin-btn-ghost"
            onClick={onCopy}
            style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <textarea
        className="distribution-post-textarea"
        value={content}
        onChange={(e) => onEdit(e.target.value)}
        rows={Math.min(12, Math.max(4, content.split('\n').length + 1))}
      />
    </div>
  )
}
