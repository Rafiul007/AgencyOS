import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { usePageTitleContext } from './PageTitleContext';

/**
 * Page wrapper used inside the persistent {@link AppShell}. It no longer renders the
 * shell (rail/sidebar/topbar) — that stays mounted across navigations — it only
 * publishes this page's title to the Topbar and renders the page content.
 */
export function DashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  const { setTitle } = usePageTitleContext();
  useEffect(() => {
    setTitle(title);
    return () => setTitle(null);
  }, [title, setTitle]);

  return <>{children}</>;
}
