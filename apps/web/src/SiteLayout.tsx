import type { ReactNode } from 'react';

interface SiteLayoutProps {
  tagline: string;
  activeNav: 'guest' | 'admin';
  children: ReactNode;
  sticky?: ReactNode;
}

export function SiteLayout({ tagline, activeNav, children, sticky }: SiteLayoutProps) {
  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand">
            <h1 className="logo">Harmony Hotel</h1>
            <p className="tagline">{tagline}</p>
          </div>
          <nav className="site-nav" aria-label="Main">
            <a href="/" className={activeNav === 'guest' ? 'active' : undefined}>
              Guest booking
            </a>
            <a href="/admin" className={activeNav === 'admin' ? 'active' : undefined}>
              Admin
            </a>
          </nav>
        </div>
      </header>

      {sticky && <div className="sticky-bar">{sticky}</div>}

      <main className="container main">{children}</main>

      <footer className="site-footer">
        <div className="container">
          <p>Harmony Hotel · Book with confidence</p>
        </div>
      </footer>
    </div>
  );
}
