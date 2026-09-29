import { TrendingDown, TrendingUp, BarChart3, Activity, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LOCATIONS, METRIC_CONFIGS } from '@/data/demoData';
import { getLatestObservations } from '@/lib/anomaly';
import { TimelineChart } from '@/components/TimelineChart';

export function AnalyticsPage() {
  const { observations, events } = useApp();

  // Get all latest readings per location for each metric
  const metricSummaries = METRIC_CONFIGS.map((cfg) => {
    const allLatest = LOCATIONS.map((loc) => {
      const latest = getLatestObservations(
        observations.filter((o) => o.locationId === loc.id),
        loc.id,
        1
      )[0];
      return { loc, value: latest ? getMetric(latest, cfg.key) : 0, latest };
    });

    const anomalousCount = allLatest.filter(({ loc, value }) => {
      const dev = Math.abs((value - loc.baseline[cfg.key].mean) / loc.baseline[cfg.key].mean) * 100;
      return dev > 15;
    }).length;

    return { cfg, allLatest, anomalousCount };
  });

  // Anomaly heatmap data
  const heatmapData = LOCATIONS.map((loc) => {
    const latest = getLatestObservations(
      observations.filter((o) => o.locationId === loc.id),
      loc.id,
      1
    )[0];
    if (!latest) return null;
    const deviations = METRIC_CONFIGS.map((cfg) => {
      const value = getMetric(latest, cfg.key);
      const baseline = loc.baseline[cfg.key].mean;
      const dev = ((value - baseline) / baseline) * 100;
      return { metric: cfg.key, label: cfg.shortLabel, dev, value, isAnom: Math.abs(dev) > 15 };
    });
    return { loc, deviations };
  }).filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="glass rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-1">
          Analytics
        </h2>
        <p className="text-xs text-slate-500">
          Cross-site environmental metrics, anomaly patterns, and trend analysis
        </p>
      </div>

      {/* Metric summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {metricSummaries.map(({ cfg, allLatest, anomalousCount }) => {
          const data = allLatest.map(({ loc, value, latest }) => ({
            date: loc.name.split('—')[0].trim().slice(0, 6),
            value,
          }));
          return (
            <div key={cfg.key} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-wider text-slate-500">{cfg.label}</p>
                {anomalousCount > 0 && (
                  <span className="text-[10px] text-red-400 font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {anomalousCount} anomalous
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {allLatest.map(({ loc, value }) => {
                  const dev = ((value - loc.baseline[cfg.key].mean) / loc.baseline[cfg.key].mean) * 100;
                  const isAnom = Math.abs(dev) > 15;
                  return (
                    <div key={loc.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 truncate flex-1">{loc.name.split('—')[0]}</span>
                      <span className={`font-mono ml-2 ${isAnom ? 'text-red-400' : 'text-slate-300'}`}>
                        {value.toFixed(1)}{cfg.unit && ` ${cfg.unit}`}
                      </span>
                      <span className={`ml-2 text-[10px] font-medium ${dev < 0 ? 'text-red-400' : 'text-orange-400'}`}>
                        {dev > 0 ? '+' : ''}{dev.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Anomaly Heatmap */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Anomaly Heatmap</h3>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Location</th>
                {METRIC_CONFIGS.map((c) => (
                  <th key={c.key} className="text-center py-2 px-2 text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                    {c.shortLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row) => (
                <tr key={row!.loc.id} className="border-t border-slate-800/30">
                  <td className="py-3 px-3 text-xs text-slate-300 whitespace-nowrap">
                    {row!.loc.name.split('—')[0]}
                  </td>
                  {row!.deviations.map((d) => {
                    const absDev = Math.abs(d.dev);
                    const intensity = Math.min(absDev / 40, 1);
                    const bgColor = d.isAnom
                      ? d.dev < 0
                        ? `rgba(239, 68, 68, ${0.15 + intensity * 0.25})`
                        : `rgba(249, 115, 22, ${0.15 + intensity * 0.25})`
                      : 'rgba(34, 197, 94, 0.08)';
                    return (
                      <td key={d.metric} className="py-3 px-2 text-center">
                        <div
                          className="inline-block w-12 h-10 rounded flex flex-col items-center justify-center"
                          style={{ backgroundColor: bgColor }}
                        >
                          <span className={`text-xs font-mono ${d.isAnom ? 'text-white' : 'text-slate-400'}`}>
                            {d.value.toFixed(1)}
                          </span>
                          <span className={`text-[8px] ${d.isAnom ? 'text-white/70' : 'text-slate-600'}`}>
                            {d.dev > 0 ? '+' : ''}{d.dev.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Event Distribution</h3>
          </div>
          <div className="space-y-3">
            {events.map((event) => {
              const loc = LOCATIONS.find((l) => l.id === event.locationId);
              return (
                <div key={event.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{loc?.name.split('—')[0]}</span>
                    <span className="text-slate-500">{event.confidence}% confidence</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${event.severity === 'critical' || event.severity === 'high' ? 'bg-red-400' : 'bg-yellow-400'}`}
                      style={{ width: `${event.confidence}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-600">
                    <span>{event.deviations.filter((d) => d.isAnomalous).length} anomalous metrics</span>
                    <span>{event.citizenReportCount} citizen reports</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              DO Trend — All Sites
            </h3>
          </div>
          <div className="space-y-3">
            {LOCATIONS.map((loc) => {
              const data = getLatestObservations(
                observations.filter((o) => o.locationId === loc.id),
                loc.id,
                7
              ).map((o) => ({
                date: new Date(o.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: o.dissolvedOxygen,
              }));
              return (
                <div key={loc.id}>
                  <p className="text-[10px] text-slate-500 mb-1">{loc.name.split('—')[0]}</p>
                  <TimelineChart data={data} metric="dissolved_oxygen" baseline={loc.baseline.dissolved_oxygen.mean} unit="mg/L" height={60} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function getMetric(obs: { dissolvedOxygen: number; temperature: number; ph: number; turbidity: number; conductivity: number; biodiversityScore: number }, key: string): number {
  switch (key) {
    case 'dissolved_oxygen': return obs.dissolvedOxygen;
    case 'temperature': return obs.temperature;
    case 'ph': return obs.ph;
    case 'turbidity': return obs.turbidity;
    case 'conductivity': return obs.conductivity;
    case 'biodiversity_score': return obs.biodiversityScore;
    default: return 0;
  }
}
