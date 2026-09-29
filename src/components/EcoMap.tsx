import { useApp } from '@/context/AppContext';
import { LOCATIONS } from '@/data/demoData';
import type { Location, EcoEvent } from '@/types';

function getStatusColor(locationId: string, events: EcoEvent[]): string {
  const event = events.find((e) => e.locationId === locationId);
  if (!event) return '#22c55e';
  if (event.status === 'validated') return '#3b82f6';
  if (event.status === 'rejected') return '#64748b';
  return '#ef4444';
}

function getStatusLabel(locationId: string, events: EcoEvent[]): string {
  const event = events.find((e) => e.locationId === locationId);
  if (!event) return 'Normal';
  if (event.status === 'validated') return 'Validated';
  if (event.status === 'rejected') return 'Rejected';
  if (event.severity === 'critical' || event.severity === 'high') return 'Anomaly';
  return 'Watch';
}

interface EcoMapProps {
  onEventClick?: (eventId: string) => void;
  className?: string;
}

export function EcoMap({ onEventClick, className = '' }: EcoMapProps) {
  const { events, openEvent } = useApp();

  const handleClick = (loc: Location) => {
    const event = events.find((e) => e.locationId === loc.id);
    if (event && onEventClick) {
      onEventClick(event.id);
    } else if (event) {
      openEvent(event.id);
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-xl bg-gradient-to-br from-[#0a0f1a] via-[#0d1420] to-[#0a0f1a] border border-slate-700/40 ${className}`}
    >
      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-20" aria-hidden>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Water bodies SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* River A - main river */}
        <path
          d="M 10,55 Q 25,58 30,62 Q 40,68 50,66 Q 60,64 70,58 Q 80,52 90,48"
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* River B - tributary */}
        <path
          d="M 50,66 Q 53,72 55,78 Q 57,84 60,90"
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Stream D */}
        <path
          d="M 20,80 Q 30,85 38,88 Q 45,90 50,92"
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Lake C */}
        <ellipse cx="73" cy="34" rx="8" ry="5" fill="#1e3a5f" opacity="0.5" />
        {/* Wetland E */}
        <ellipse cx="62" cy="51" rx="6" ry="4" fill="#1e3a5f" opacity="0.4" />

        {/* Flow animation on River A */}
        <path
          d="M 10,55 Q 25,58 30,62 Q 40,68 50,66 Q 60,64 70,58 Q 80,52 90,48"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="3 6"
          className="animate-dash-flow"
          opacity="0.5"
        />
      </svg>

      {/* Location markers */}
      {LOCATIONS.map((loc) => {
        const color = getStatusColor(loc.id, events);
        const label = getStatusLabel(loc.id, events);
        const hasEvent = events.some((e) => e.locationId === loc.id);
        const event = events.find((e) => e.locationId === loc.id);

        return (
          <button
            key={loc.id}
            onClick={() => handleClick(loc)}
            className="absolute group flex flex-col items-center"
            style={{
              left: `${loc.mapX}%`,
              top: `${loc.mapY}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Pulse ring for active events */}
            {hasEvent && event?.status === 'active' && (
              <span
                className="absolute w-6 h-6 rounded-full animate-pulse-ring"
                style={{ backgroundColor: color, opacity: 0.4 }}
              />
            )}

            {/* Marker dot */}
            <span
              className="relative w-3 h-3 rounded-full border-2 border-white/30 transition-transform group-hover:scale-150"
              style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
            />

            {/* Label */}
            <span
              className="absolute top-4 whitespace-nowrap px-2 py-0.5 text-[10px] font-medium rounded glass opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ color }}
            >
              {loc.name}
              <span className="text-slate-400 ml-1">· {label}</span>
            </span>
          </button>
        );
      })}

      {/* Compass / scale */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[10px] text-slate-600">
        <span className="font-mono">48.84°N · 2.35°E</span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 glass rounded-lg px-3 py-2 space-y-1">
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-green-500" /> Normal
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-yellow-500" /> Watch
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Anomaly
        </div>
      </div>
    </div>
  );
}
