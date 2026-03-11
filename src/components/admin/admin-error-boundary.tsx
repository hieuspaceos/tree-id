/**
 * Error boundary — catches React render errors in admin SPA
 * Shows friendly recovery UI instead of blank screen
 */
import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class AdminErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Admin Error Boundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="admin-error-panel glass-panel">
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>!</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              className="admin-btn admin-btn-ghost"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </button>
            <a href="/admin" className="admin-btn admin-btn-primary" style={{ textDecoration: 'none' }}>
              Back to Dashboard
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
