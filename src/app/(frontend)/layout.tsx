import { Nav } from '@/components/nav'
import { siteConfig } from '@/config/site-config'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        '--color-primary': siteConfig.theme.primaryColor,
        '--color-accent': siteConfig.theme.accentColor,
        fontFamily: siteConfig.theme.fontFamily,
      } as React.CSSProperties}
    >
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
      <footer className="py-10 text-center text-sm text-slate-400">
        <div className="mx-auto max-w-5xl px-4">
          <div className="glass-panel inline-flex items-center gap-2 rounded-full px-5 py-2.5" suppressHydrationWarning>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <path d="M12 22V12" />
              <path d="M12 12L8 8" />
              <path d="M12 12L16 8" />
              <path d="M12 8L9 5" />
              <path d="M12 8L15 5" />
              <path d="M12 5L10 3" />
              <path d="M12 5L14 3" />
            </svg>
            {siteConfig.name} &copy; {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  )
}
