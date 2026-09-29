import { useApp } from '@/context/AppContext';
import { EcoMap } from '@/components/EcoMap';
import { LOCATIONS } from '@/data/demoData';
import { MapPin } from 'lucide-react';

export function LiveMapPage() {
  const { events, openEvent } = useApp();

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-1">
          Live Environmental Map
        </h2>
        <p className="text-xs text-slate-500">
          Urban freshwater monitoring network — click any site to view details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 h-[520px]">
          <EcoMap />
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
            Monitoring Sites
          </h3>
          {LOCATIONS.map((loc) => {
            const event = events.find((e) => e.locationId === loc.id);
            return (
              <button
                key={loc.id}
                onClick={() => event && openEvent(event.id)}
                className="w-full glass rounded-lg p-3 text-left hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className={`w-3.5 h-3.5 ${event ? 'text-red-400' : 'text-green-400'}`} />
                  <p className="text-sm font-medium text-white">{loc.name}</p>
                </div>
                <p className="text-xs text-slate-500 capitalize">{loc.ecosystemType} ecosystem</p>
                <p className="text-xs text-slate-600 mt-1 font-mono">
                  {loc.latitude.toFixed(4)}°N, {loc.longitude.toFixed(4)}°E
                </p>
                {event && (
                  <p className="text-xs text-red-400 mt-2 font-medium">
                    ⚠ {event.eventType}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
