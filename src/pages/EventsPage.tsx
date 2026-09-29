import { AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { EventCard } from '@/components/EventCard';

export function EventsPage() {
  const { events } = useApp();

  const activeEvents = events.filter((e) => e.status === 'active');
  const validatedEvents = events.filter((e) => e.status === 'validated');
  const rejectedEvents = events.filter((e) => e.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-1">
          Detected Events
        </h2>
        <p className="text-xs text-slate-500">
          Anomalies detected by the statistical monitoring system
        </p>
      </div>

      {activeEvents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Active ({activeEvents.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEvents.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </div>
        </div>
      )}

      {validatedEvents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Validated ({validatedEvents.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {validatedEvents.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </div>
        </div>
      )}

      {rejectedEvents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Rejected ({rejectedEvents.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedEvents.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <Clock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No events detected. All monitoring sites are within normal parameters.</p>
        </div>
      )}
    </div>
  );
}
