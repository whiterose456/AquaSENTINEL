import { AlertTriangle, MapPin, TrendingDown, TrendingUp, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LOCATIONS, METRIC_CONFIGS } from '@/data/demoData';
import type { EcoEvent } from '@/types';

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  critical: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', label: 'Critical' },
  high: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', label: 'High' },
  moderate: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Moderate' },
  low: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Low' },
};

export function EventCard({ event, index = 0 }: { event: EcoEvent; index?: number }) {
  const { openEvent, citizenReports } = useApp();
  const location = LOCATIONS.find((l) => l.id === event.locationId);
  const sev = SEVERITY_STYLES[event.severity] ?? SEVERITY_STYLES.moderate;

  const topDeviations = event.deviations
    .filter((d) => d.isAnomalous)
    .slice(0, 3);

  const locReports = citizenReports.filter((r) => r.locationId === event.locationId);

  return (
    <div
      className="glass rounded-xl p-5 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 cursor-pointer group animate-fade-in-up"
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={() => openEvent(event.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${sev.bg} ${sev.border} border`}>
            <AlertTriangle className={`w-4 h-4 ${sev.text}`} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">
              {event.eventType}
            </p>
            <p className="text-sm font-semibold text-white mt-0.5">
              {location?.name}
            </p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded ${sev.bg} ${sev.text}`}>
          {sev.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Detected</p>
          <p className="text-xs text-slate-300 mt-0.5">
            {new Date(event.detectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Confidence</p>
          <p className="text-xs text-cyan-400 font-semibold mt-0.5">{event.confidence}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Status</p>
          <p className={`text-xs mt-0.5 ${event.status === 'validated' ? 'text-blue-400' : event.status === 'rejected' ? 'text-slate-500' : 'text-orange-400'}`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </p>
        </div>
      </div>

      {topDeviations.length > 0 && (
        <div className="space-y-1.5 mb-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Key Deviations</p>
          {topDeviations.map((d) => {
            const cfg = METRIC_CONFIGS.find((c) => c.key === d.metric);
            return (
              <div key={d.metric} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{cfg?.shortLabel}</span>
                <span className={`flex items-center gap-1 font-medium ${d.direction === 'decrease' ? 'text-red-400' : 'text-orange-400'}`}>
                  {d.direction === 'decrease' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                  {Math.abs(Math.round(d.deviationPercent))}%
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-700/40">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3 h-3" />
          {locReports.length} citizen reports
        </div>
        <span className="flex items-center gap-1 text-xs text-cyan-400 font-medium group-hover:gap-2 transition-all">
          Investigate
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
