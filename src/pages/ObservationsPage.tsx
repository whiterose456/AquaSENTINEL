import { useState } from 'react';
import { Eye, MapPin, Clock, Filter } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LOCATIONS, METRIC_CONFIGS } from '@/data/demoData';
import { getLatestObservations } from '@/lib/anomaly';
import type { MetricKey } from '@/types';

type Tab = 'sensor' | 'citizen';

export function ObservationsPage() {
  const { observations, citizenReports, locations } = useApp();
  const [tab, setTab] = useState<Tab>('sensor');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const filteredObs =
    selectedLocation === 'all'
      ? observations
      : observations.filter((o) => o.locationId === selectedLocation);

  const filteredReports =
    selectedLocation === 'all'
      ? citizenReports
      : citizenReports.filter((r) => r.locationId === selectedLocation);

  const latestPerLocation = LOCATIONS.map((loc) => ({
    loc,
    latest: getLatestObservations(
      observations.filter((o) => o.locationId === loc.id),
      loc.id,
      1
    )[0],
  }));

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-1">
          Observations
        </h2>
        <p className="text-xs text-slate-500">
          Sensor readings and citizen science reports across all monitoring sites
        </p>
      </div>

      {/* Location filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-500" />
        <button
          onClick={() => setSelectedLocation('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            selectedLocation === 'all'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          All Sites
        </button>
        {LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setSelectedLocation(loc.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              selectedLocation === loc.id
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {loc.name}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setTab('sensor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'sensor'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Eye className="w-4 h-4" />
          Sensor Data ({filteredObs.length})
        </button>
        <button
          onClick={() => setTab('citizen')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'citizen'
              ? 'bg-green-500/15 text-green-300 border border-green-500/30'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Citizen Reports ({filteredReports.length})
        </button>
      </div>

      {tab === 'sensor' ? (
        <div className="space-y-3">
          {/* Latest readings summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {latestPerLocation
              .filter((x) => selectedLocation === 'all' || x.loc.id === selectedLocation)
              .map(({ loc, latest }) => {
                if (!latest) return null;
                const doDev = ((latest.dissolvedOxygen - loc.baseline.dissolved_oxygen.mean) / loc.baseline.dissolved_oxygen.mean) * 100;
                return (
                  <div key={loc.id} className="glass rounded-xl p-4">
                    <p className="text-sm font-medium text-white mb-3">{loc.name}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {METRIC_CONFIGS.slice(0, 6).map((cfg) => {
                        const value = getMetric(latest, cfg.key);
                        const baseline = loc.baseline[cfg.key].mean;
                        const dev = ((value - baseline) / baseline) * 100;
                        const isAnom = Math.abs(dev) > 15;
                        return (
                          <div key={cfg.key}>
                            <p className="text-[9px] uppercase tracking-wider text-slate-500">{cfg.shortLabel}</p>
                            <p className={`text-sm font-mono mt-0.5 ${isAnom ? 'text-red-400' : 'text-slate-300'}`}>
                              {value.toFixed(1)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Full table */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700/40">
                    <th className="text-left py-3 px-4 text-slate-500 uppercase tracking-wider font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-slate-500 uppercase tracking-wider font-medium">Location</th>
                    {METRIC_CONFIGS.map((c) => (
                      <th key={c.key} className="text-right py-3 px-3 text-slate-500 uppercase tracking-wider font-medium">
                        {c.shortLabel}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredObs
                    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                    .slice(0, 30)
                    .map((obs) => {
                      const loc = LOCATIONS.find((l) => l.id === obs.locationId);
                      return (
                        <tr key={obs.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                          <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                            {new Date(obs.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-2.5 px-4 text-slate-300 whitespace-nowrap">{loc?.name}</td>
                          {METRIC_CONFIGS.map((cfg) => {
                            const value = getMetric(obs, cfg.key);
                            const baseline = loc!.baseline[cfg.key].mean;
                            const dev = ((value - baseline) / baseline) * 100;
                            const isAnom = Math.abs(dev) > 15;
                            return (
                              <td key={cfg.key} className={`py-2.5 px-3 text-right font-mono ${isAnom ? 'text-red-400' : 'text-slate-300'}`}>
                                {value.toFixed(1)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredReports
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
            .map((report, i) => {
              const loc = LOCATIONS.find((l) => l.id === report.locationId);
              const sevColors: Record<string, string> = {
                high: 'border-red-500/30 bg-red-500/5',
                medium: 'border-yellow-500/30 bg-yellow-500/5',
                low: 'border-blue-500/30 bg-blue-500/5',
              };
              const statusColors: Record<string, string> = {
                validated: 'text-green-400 bg-green-500/10',
                pending: 'text-yellow-400 bg-yellow-500/10',
                rejected: 'text-red-400 bg-red-500/10',
              };
              return (
                <div
                  key={report.id}
                  className={`glass rounded-xl p-4 border ${sevColors[report.severity]} animate-fade-in-up`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{report.observationType}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{loc?.name}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-1 rounded ${statusColors[report.validationStatus]}`}>
                      {report.validationStatus.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{report.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.timestamp).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </span>
                    <span className={`capitalize ${report.severity === 'high' ? 'text-red-400' : report.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'}`}>
                      {report.severity} severity
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

function getMetric(obs: { dissolvedOxygen: number; temperature: number; ph: number; turbidity: number; conductivity: number; biodiversityScore: number }, key: MetricKey): number {
  switch (key) {
    case 'dissolved_oxygen': return obs.dissolvedOxygen;
    case 'temperature': return obs.temperature;
    case 'ph': return obs.ph;
    case 'turbidity': return obs.turbidity;
    case 'conductivity': return obs.conductivity;
    case 'biodiversity_score': return obs.biodiversityScore;
  }
}
