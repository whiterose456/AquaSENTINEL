import { Activity, Map, AlertTriangle, Search, Eye, BarChart3, Waves } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { PageId } from '@/types';

const NAV_ITEMS: { id: PageId; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'map', label: 'Live Map', icon: Map },
  { id: 'events', label: 'Events', icon: AlertTriangle },
  { id: 'observations', label: 'Observations', icon: Eye },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function Header() {
  const { currentPage, setPage, events } = useApp();
  const activeEvents = events.filter((e) => e.status === 'active').length;

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-slate-700/40">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/30">
            <Waves className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">
              Aqua<span className="text-cyan-400">Sentinel</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
              Environmental Intelligence Platform
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {item.id === 'events' && activeEvents > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-red-500/80 text-white">
                    {activeEvents}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-300 font-medium">System Online</span>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex md:hidden items-center gap-1 px-3 pb-2 overflow-x-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                active
                  ? 'bg-cyan-500/15 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
