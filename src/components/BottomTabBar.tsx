import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpenText, User, Info, Phone } from 'lucide-react';

// Simple analytics hook (no PII)
const trackTabClick = (tab: string) => {
  try {
    window.dispatchEvent(new CustomEvent('analytics:tab_click', { detail: { tab } }));
    // Fallback log for development
    // eslint-disable-next-line no-console
    console.debug('[analytics] tab_click', tab);
  } catch (e) {
    // ignore analytics errors in non-browser/test environments
  }
};

const tabs = [
  { key: 'home', label: 'Accueil', to: '/', icon: Home },
  { key: 'blog', label: 'Blog', to: '/blog', icon: BookOpenText },
  { key: 'contact', label: 'Contact', to: '/contact', icon: Phone },
  { key: 'about', label: 'À propos', to: '/about', icon: Info },
  { key: 'auth', label: 'Profil', to: '/auth', icon: User },
] as const;

const BottomTabBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav
      role="tablist"
      aria-label="Navigation principale"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
    >
      <div
        className="mx-auto max-w-7xl"
      >
        <div
          className="backdrop-blur supports-[backdrop-filter]:bg-background/80 bg-background/95 border-t border-border shadow-sm"
          style={{
            // ensure the bar sits above the device safe area
            paddingBottom: 'calc(env(safe-area-inset-bottom))',
          }}
        >
          <ul className="grid grid-cols-5">
            {tabs.map(({ key, label, to, icon: Icon }) => {
              const selected = location.pathname === to;
              return (
                <li key={key} className="">
                  <Link
                    to={to}
                    role="tab"
                    aria-selected={selected}
                    aria-label={label}
                    onClick={() => trackTabClick(key)}
                    className={[
                      'flex flex-col items-center justify-center',
                      'h-16', // 64px height as specified
                      'px-3 py-2', // ensure 44x44 touch target
                      'text-xs',
                      selected ? 'text-primary' : 'text-muted-foreground',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                      'transition-colors',
                    ].join(' ')}
                  >
                    <Icon
                      aria-hidden="true"
                      className={[
                        'w-6 h-6', // 24px
                        selected ? 'fill-current' : 'opacity-70',
                      ].join(' ')}
                    />
                    <span className="mt-1 leading-none text-[11px]">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default BottomTabBar;
