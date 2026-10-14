import { Link } from 'react-router-dom';
import { LivePill } from '../components/LivePill';
import { PreFlightChecklist } from '../components/PreFlightChecklist';

export function DashboardPage() {
  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Creator Command Center</h1>
          <p className="text-sm text-slate-300">Manage creator operations from one resilient workspace without implying external connections that are not configured.</p>
        </div>
        <div className="flex items-center gap-3">
          <LivePill live={false} />
          <Link
            to="/studio"
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Open Studio
          </Link>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          ['Platform telemetry', 'Not connected'],
          ['External broadcast', 'Off'],
          ['Local creator tools', 'Ready'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-slate-800/80 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
            <p className="mt-2 text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PreFlightChecklist />
        <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">Workspace state</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Creator Studio is available for local camera, microphone and recording workflows.</li>
            <li>Platform chat and external broadcast remain unavailable until real integrations are configured.</li>
            <li>No synthetic live audience or connected-platform metrics are shown here.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
