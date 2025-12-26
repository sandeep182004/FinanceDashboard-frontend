import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Finance Dashboard',
  description: 'Customizable stock finance dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>
          {`
            /* Hide all Next.js dev overlays and widgets */
            div[style*="position: fixed"][style*="bottom: 0"][style*="left: 0"],
            div[class*="next-error"],
            div[id*="next"],
            [role="button"]:has(svg[viewBox*="24"]),
            /* Hide Next.js route/turbopack dev menu */
            button[aria-label*="Next"],
            div[class*="nextjs"],
            [data-nextjs-router-dev-overlay],
            [data-next-router-dev-overlay],
            [id*="__next-route"],
            [class*="__next-route"],
            /* Hide Turbopack and dev panels */
            div[style*="background: rgb(0, 0, 0)"][style*="position: fixed"],
            div[style*="background-color: rgb(0, 0, 0)"][style*="position: fixed"],
            div[style*="position: fixed"][style*="z-index"][style*="border"],
            /* Catch-all for fixed overlays */
            [style*="position: fixed"][style*="left: 0"][style*="bottom"],
            [style*="position: fixed"][style*="left: 0"][style*="top"] {
              display: none !important;
              visibility: hidden !important;
              pointer-events: none !important;
            }
          `}
        </style>
        {/* Soft-hide Next.js Route Dev Tool and overlays via MutationObserver */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              const hide = (el) => {
                if (!el) return;
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
                el.style.setProperty('pointer-events', 'none', 'important');
              };

              const isBottomLeftFixed = (el) => {
                const s = (el.getAttribute('style') || '').toLowerCase();
                return s.includes('position: fixed') && s.includes('bottom') && s.includes('left');
              };

              const matchesRouteMenu = (el) => {
                const t = (el.textContent || '').toLowerCase();
                return t.includes('route info') || t.includes('try turbopack') || t.trim() === 'route';
              };

              const isNextDevOverlay = (el) => {
                const id = (el.id || '').toLowerCase();
                const cls = (el.className || '').toString().toLowerCase();
                const t = (el.textContent || '').toLowerCase();
                const s = (el.getAttribute('style') || '').toLowerCase();
                const looksFixedModal = s.includes('position: fixed') && (s.includes('z-index') || s.includes('inset') || s.includes('top') || s.includes('left'));
                return (
                  id.includes('next') && id.includes('dev') && id.includes('overlay') ||
                  cls.includes('next') && (cls.includes('dev') || cls.includes('route')) ||
                  t.includes('dev tools') || t.includes('preferences') || t.includes('disable dev tools') ||
                  looksFixedModal
                );
              };

              const scan = () => {
                const nodes = document.querySelectorAll('div,aside,nav,section,iframe');
                nodes.forEach((el) => {
                  if (isBottomLeftFixed(el) || matchesRouteMenu(el) || isNextDevOverlay(el)) hide(el);
                });
                // Hide lone bottom-left "N" bubble if present
                const bubbles = Array.from(document.querySelectorAll('div')).filter((el) => {
                  const s = (el.getAttribute('style') || '').toLowerCase();
                  const txt = (el.textContent || '').trim();
                  return s.includes('position: fixed') && s.includes('bottom') && s.includes('left') && txt === 'N';
                });
                bubbles.forEach(hide);
              };

              scan();
              const mo = new MutationObserver(() => scan());
              mo.observe(document.documentElement, { childList: true, subtree: true });
            })();`,
          }}
        />
        {/* Removed aggressive DOM removal to avoid NotFoundError from other scripts */}
      </head>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors">
        <ThemeProvider>
          <main className="container mx-auto px-4 py-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
