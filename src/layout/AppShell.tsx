import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ParticleBackground } from '../components/ParticleBackground';

const nav = [
  ['/', 'Dashboard'],
  ['/studio', 'Creator Studio'],
  ['/stream-pipeline', 'Stream Pipeline'],
  ['/clip-pipeline', 'Clip Pipeline'],
  ['/growth-system', 'Growth System'],
  ['/category-arbitrage', 'Category Arbitrage'],
  ['/raid-network', 'Raid Network'],
  ['/bestie-ai', 'AI Bestie'],
  ['/architecture', 'Architecture'],
  ['/settings', 'Settings'],
];

export function AppShell() {
  const location = useLocation();
  const studioMode = location.pathname === '/studio';

  if (studioMode) {
    return (
      <div className="min-h-screen bg-[#080b12] text-slate-100">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100">
      <ParticleBackground />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 md:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-slate-700 bg-slate-900/90 p-4">
          <Link to="/" className="mb-6 block text-xl font-bold">PulseStream <span className="text-cyan-300">Amalgam</span></Link>
          <nav className="space-y-2">
            {nav.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-300 hover:bg-slate-800'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/85 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
