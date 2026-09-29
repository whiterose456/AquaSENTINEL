import { ArrowLeft, MapPin, Calendar, AlertTriangle, Activity, Brain, Play, FileSearch } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LOCATIONS, METRIC_CONFIGS } from '@/data/demoData';
import { getTimelineValues, getLatestObservations, calculateDeviations } from '@/lib/anomaly';
import { MetricTimeline } from '@/components/TimelineChart';
import { InvestigationPanel } from '@/components/InvestigationPanel';
import { HumanReviewPanel } from '@/components/HumanReviewPanel';
import { useInvestigationRunner } from '@/hooks/useInvestigationRunner';
import type { MetricKey } from '@/types';

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/15 border-red-500/30',
  high: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
  moderate: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
  low: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
};

export function InvestigationPage() {
  const {
    activeEvent,
    activeEventId,
    setPage,
    observations,
    investigations,
    startInvestigation,
  } = useApp();

  const { investigation, isRunning, start } = useInvestigationRunner(activeEventId);

  if (!activeEvent) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <p className="text-slate-400">No event selected. Return to the events page to select an event to investigate.</p>
        <button
          onClick={() => setPage('events')}
          className="mt-4 text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Back to Events
        </button>
      </div>
    );
  }

  const location = LOCATIONS.find((l) => l.id === activeEvent.locationId)!;
  const locObs = observations.filter((o) => o.locationId === activeEvent.locationId);
  const latest = getLatestObservations(locObs, activeEvent.locationId, 1)[0];
  const deviations = calculateDeviations(latest, location);
  const sevClass = SEVERITY_STYLES[activeEvent.severity] ?? SEVERITY_STYLES.moderate;

  const existingInvestigation = activeEventId ? investigations[activeEventId] : null;
  const showInvestigation = investigation || existingInvestigation;
  const allStepsComplete = showInvestigation?.steps.every((s) => s.status === 'complete');

  const timelineMetrics: MetricKey[] = ['dissolved_oxygen', 'temperature', 'turbidity', 'ph', 'conductivity', 'biodiversity_score'];

  return (
    <div className="space-y-5">
      {/* Back button + header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage('events')}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>
      </div>

      <div className="glass rounded-xl p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-cyan-400">
                {showInvestigation?.id ?? 'INV-----'}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${sevClass}`}>
                {activeEvent.severity.toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">{activeEvent.eventType}</h1>
            <p className="text-sm text-slate-400 mt-1">{location.name}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {location.ecosystemType}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(activeEvent.detectedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Confidence: {activeEvent.confidence}%
              </span>
            </div>
          </div>

          {!showInvestigation && (
            <button
              onClick={() => start()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-medium text-sm hover:bg-cyan-500/30 transition-all animate-fade-in"
            >
              <Play className="w-4 h-4" />
              Investigate Event
            </button>
          )}
        </div>
      </div>

      {/* Event Summary - what changed */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Event Summary</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {deviations.map((d) => {
            const cfg = METRIC_CONFIGS.find((c) => c.key === d.metric)!;
            return (
              <div
                key={d.metric}
                className={`p-3 rounded-lg border ${
                  d.isAnomalous
                    ? 'bg-red-500/5 border-red-500/20'
                    : 'bg-slate-800/30 border-slate-700/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">{cfg.label}</p>
                  {d.isAnomalous && (
                    <span className="text-[9px] text-red-400 font-medium">ANOMALY</span>
                  )}
                </div>
                <p className="text-lg font-bold text-white mt-1">
                  {d.currentValue}
                  <span className="text-xs text-slate-500 ml-1">{cfg.unit}</span>
                </p>
                <p className={`text-xs mt-0.5 ${d.direction === 'decrease' ? 'text-red-400' : 'text-orange-400'}`}>
                  {d.direction === 'decrease' ? '↓' : '↑'} {Math.abs(Math.round(d.deviationPercent))}% · z={d.zScore}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Measurement Timeline</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {timelineMetrics.map((metric) => {
            const cfg = METRIC_CONFIGS.find((c) => c.key === metric)!;
            const data = getTimelineValues(observations, activeEvent.locationId, metric, 7);
            return (
              <MetricTimeline
                key={metric}
                label={cfg.label}
                values={data}
                baseline={location.baseline[metric].mean}
                unit={cfg.unit}
                metric={metric}
              />
            );
          })}
        </div>
      </div>

      {/* AI Investigation */}
      {showInvestigation && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              AI Investigation
            </h2>
            {isRunning && (
              <span className="text-xs text-cyan-400 animate-pulse">Running...</span>
            )}
          </div>
          <InvestigationPanel investigation={showInvestigation} />
        </div>
      )}

      {/* Human Review */}
      {allStepsComplete && activeEventId && (
        <HumanReviewPanel investigationId={activeEventId} />
      )}
    </div>
  );
}
