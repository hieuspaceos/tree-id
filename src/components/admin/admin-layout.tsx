/**
 * Admin layout — sidebar + topbar + content area with client-side routing.
 * Feature routes are gated by enabledFeatures from site-settings.
 * Optional pages lazy-loaded via React.lazy for code splitting.
 */
import { useState, useEffect, Suspense, lazy } from 'react'
import { Route, Switch } from 'wouter'
import type { AdminUserInfo } from './admin-app'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'
import { AdminDashboard } from './admin-dashboard'
import { ContentList } from './content-list'
import { ContentEditor } from './content-editor'
import { SettingsEditor } from './settings-editor'
import { CategoriesList } from './categories-list'
import { CategoryEditor } from './category-editor'
import { isFeatureEnabled, type EnabledFeaturesMap } from '@/lib/admin/feature-registry'

// Lazy-loaded feature pages — only fetched when route is matched
const LazyMediaBrowser = lazy(() => import('./media-browser').then((m) => ({ default: m.MediaBrowser })))
const LazyMarketingDashboard = lazy(() => import('./marketing-dashboard').then((m) => ({ default: m.MarketingDashboard })))
const LazySubscribersPage = lazy(() => import('./admin-subscribers-page').then((m) => ({ default: m.AdminSubscribersPage })))
const LazyAnalyticsPage = lazy(() => import('./admin-analytics-page').then((m) => ({ default: m.AdminAnalyticsPage })))
const LazyTranslationsPage = lazy(() => import('./admin-translations-page').then((m) => ({ default: m.AdminTranslationsPage })))

interface Props {
  siteName: string
  onLogout: () => void
  user: AdminUserInfo | null
  enabledFeatures?: EnabledFeaturesMap
}

const SIDEBAR_KEY = 'admin-sidebar-collapsed'

/** Loading fallback for lazy-loaded feature routes */
function RouteLoading() {
  return (
    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '14px', textAlign: 'center' }}>
      <p style={{ color: '#94a3b8' }}>Loading...</p>
    </div>
  )
}

export function AdminLayout({ siteName, onLogout, user, enabledFeatures }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true' } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_KEY, String(sidebarCollapsed)) } catch {}
  }, [sidebarCollapsed])

  const ef = enabledFeatures

  return (
    <div className={sidebarCollapsed ? 'admin-wrapper sidebar-collapsed' : 'admin-wrapper'}>
      <AdminSidebar
        siteName={siteName}
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        enabledFeatures={ef}
      />

      <main className="admin-main">
        <AdminTopbar onToggleSidebar={() => setSidebarOpen((s) => !s)} user={user} />

        <Switch>
          <Route path="/" component={AdminDashboard} />

          {/* Core content routes — always on */}
          <Route path="/articles"><ContentList collection="articles" /></Route>
          <Route path="/notes"><ContentList collection="notes" /></Route>
          <Route path="/records"><ContentList collection="records" /></Route>
          <Route path="/articles/new"><ContentEditor collection="articles" /></Route>
          <Route path="/notes/new"><ContentEditor collection="notes" /></Route>
          <Route path="/records/new"><ContentEditor collection="records" /></Route>
          <Route path="/articles/:slug">
            {(params) => <ContentEditor collection="articles" slug={params.slug} />}
          </Route>
          <Route path="/notes/:slug">
            {(params) => <ContentEditor collection="notes" slug={params.slug} />}
          </Route>
          <Route path="/records/:slug">
            {(params) => <ContentEditor collection="records" slug={params.slug} />}
          </Route>

          {/* Categories — always on */}
          <Route path="/categories"><CategoriesList /></Route>
          <Route path="/categories/new"><CategoryEditor /></Route>
          <Route path="/categories/:slug">
            {(params) => <CategoryEditor slug={params.slug} />}
          </Route>

          {/* Voices — collection-based, gated by feature toggle */}
          {isFeatureEnabled('voices', ef) && (
            <Route path="/voices"><ContentList collection="voices" /></Route>
          )}
          {isFeatureEnabled('voices', ef) && (
            <Route path="/voices/new"><ContentEditor collection="voices" /></Route>
          )}
          {isFeatureEnabled('voices', ef) && (
            <Route path="/voices/:slug">
              {(params) => <ContentEditor collection="voices" slug={params.slug} />}
            </Route>
          )}

          {/* Media — lazy, gated */}
          {isFeatureEnabled('media', ef) && (
            <Route path="/media">
              <Suspense fallback={<RouteLoading />}>
                <LazyMediaBrowser mode="page" />
              </Suspense>
            </Route>
          )}

          {/* Distribution — lazy, gated */}
          {isFeatureEnabled('distribution', ef) && (
            <Route path="/marketing">
              <Suspense fallback={<RouteLoading />}><LazyMarketingDashboard /></Suspense>
            </Route>
          )}

          {/* Subscribers — lazy, gated */}
          {isFeatureEnabled('email', ef) && (
            <Route path="/subscribers">
              <Suspense fallback={<RouteLoading />}><LazySubscribersPage /></Suspense>
            </Route>
          )}

          {/* Analytics — lazy, gated */}
          {isFeatureEnabled('analytics', ef) && (
            <Route path="/analytics">
              <Suspense fallback={<RouteLoading />}><LazyAnalyticsPage /></Suspense>
            </Route>
          )}

          {/* Translations — lazy, gated */}
          {isFeatureEnabled('translations', ef) && (
            <Route path="/translations">
              <Suspense fallback={<RouteLoading />}><LazyTranslationsPage /></Suspense>
            </Route>
          )}

          {/* Settings — always on */}
          <Route path="/settings"><SettingsEditor /></Route>

          {/* 404 */}
          <Route>
            <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                Page not found
              </h2>
              <p style={{ color: '#94a3b8' }}>This admin page doesn't exist.</p>
            </div>
          </Route>
        </Switch>
      </main>
    </div>
  )
}
