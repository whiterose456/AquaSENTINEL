import { AlertTriangle, Activity, MapPin, TrendingDown, Droplets, Gauge, Eye } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { EcoMap } from '@/components/EcoMap';
import { EventCard } from '@/components/EventCard';
import { LOCATIONS, METRIC_CONFIGS } from '@/data/demoData';
import { getLatestObservations } from '@/lib/anomaly';
import { TimelineChart } from '@/components/TimelineChart';

export function OverviewPage() {
  const { events, observations, setPage, openEvent, citizenReports } = useApp();

  const activeEvents = events.filter((e) => e.status === 'active');
  const totalLocations = LOCATIONS.length;
  const totalObservations = observations.length;
  const totalReports = citizenReports.length;
  const validatedReports = citizenReports.filter((r) => r.validationStatus === 'validated').length;

  // Get latest DO and temp for River A (the anomaly site)
  const riverAObs = observations.filter((o) => o.locationId === 'loc-river-a');
  const riverALatest = getLatestObservations(riverAObs, 'loc-river-a', 7);

  const doData = riverALatest.map((o) => ({
    date: new Date(o.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: o.dissolvedOxygen,
  }));
  const tempData = riverALatest.map((o) => ({
    date: new Date(o.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: o.temperature,
  }));

  return (
    <div className="space-y-6">
      {/* Hero stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={AlertTriangle}
          label="Active Events"
          value={activeEvents.length}
          color="red"
        />
        <StatCard
          icon={MapPin}
          label="Monitoring Sites"
          value={totalLocations}
          color="cyan"
        />
        <StatCard
          icon={Activity}
          label="Sensor Readings"
          value={totalObservations}
          color="teal"
        />
        <StatCard
          icon={Eye}
          label="Citizen Reports"
          value={`${validatedReports}/${totalReports}`}
          color="green"
        />
      </div>

      {/* Map + key metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Live Monitoring Map</h2>
            <button
              onClick={() => setPage('map')}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View full map →
            </button>
          </div>
          <div className="h-[340px]">
            <EcoMap />
          </div>
        </div>

        <div className="space-y-3">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Dissolved Oxygen — River A
              </h3>
            </div>
            <TimelineChart
              data={doData}
              metric="dissolved_oxygen"
              baseline={7.8}
              unit="mg/L"
              height={90}
            />
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Temperature — River A
              </h3>
            </div>
            <TimelineChart
              data={tempData}
              metric="temperature"
              baseline={24}
              unit="°C"
              height={90}
            />
          </div>
        </div>
      </div>

      {/* Active events */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Active Events
          </h2>
          <button
            onClick={() => setPage('events')}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View all →
          </button>
        </div>
        {activeEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEvents.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-slate-400">No active events detected.</p>
          </div>
        )}
      </div>

      {/* All locations status */}
      <div className="glass rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
          All Monitoring Sites
        </h2>
        <div className="space-y-2">
          {LOCATIONS.map((loc) => {
            const event = events.find((e) => e.locationId === loc.id);
            const latest = getLatestObservations(
              observations.filter((o) => o.locationId === loc.id),
              loc.id,
              1
            )[0];
            const doDeviation = latest
              ? ((latest.dissolvedOxygen - loc.baseline.dissolved_oxygen.mean) /
                  loc.baseline.dissolved_oxygen.mean) * 100
              : 0;

            return (
              <button
                key={loc.id}
                onClick={() => event && openEvent(event.id)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/30 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      event ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ boxShadow: event ? '0 0 8px #ef4444' : '0 0 8px #22c55e' }}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{loc.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{loc.ecosystemType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase">DO</p>
                    <p className={`text-xs font-mono ${doDeviation < -10 ? 'text-red-400' : 'text-slate-300'}`}>
                      {latest?.dissolvedOxygen.toFixed(1)} mg/L
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase">Temp</p>
                    <p className="text-xs font-mono text-slate-300">
                      {latest?.temperature.toFixed(1)}°C
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase">Status</p>
                    <p className={`text-xs font-medium ${
                      event ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {event ? 'Anomaly' : 'Normal'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Activity; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    teal: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
  };
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-3 animate-fade-in-up">
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg border ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{label}</p>
      </div>
    </div>
  );
}
