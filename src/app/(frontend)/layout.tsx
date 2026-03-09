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
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500" suppressHydrationWarning>
        {siteConfig.name} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
