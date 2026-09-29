import type {
  Observation,
  Location,
  MetricKey,
  MetricDeviation,
} from '@/types';
import { METRIC_CONFIGS, getMetricValue } from '@/data/demoData';

export function getObservationMetric(obs: Observation, key: MetricKey): number {
  return getMetricValue(obs, key);
}

export function getLatestObservations(
  observations: Observation[],
  locationId: string,
  count = 5
): Observation[] {
  return observations
    .filter((o) => o.locationId === locationId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(-count);
}

export function getEarlyBaselineObservations(
  observations: Observation[],
  locationId: string,
  count = 4
): Observation[] {
  return observations
    .filter((o) => o.locationId === locationId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(0, count);
}

export function calculateDeviations(
  latest: Observation,
  location: Location
): MetricDeviation[] {
  return METRIC_CONFIGS.map((cfg) => {
    const currentValue = getMetricValue(latest, cfg.key);
    const baseline = location.baseline[cfg.key];
    const deviationPercent =
      ((currentValue - baseline.mean) / baseline.mean) * 100;
    const zScore = (currentValue - baseline.mean) / baseline.std;
    return {
      metric: cfg.key,
      currentValue: Math.round(currentValue * 100) / 100,
      baselineMean: baseline.mean,
      deviationPercent: Math.round(deviationPercent * 10) / 10,
      zScore: Math.round(zScore * 100) / 100,
      direction: currentValue >= baseline.mean ? 'increase' : 'decrease',
      isAnomalous: Math.abs(zScore) > 2,
    };
  });
}

export function getTimelineValues(
  observations: Observation[],
  locationId: string,
  metric: MetricKey,
  count = 7
): { date: string; value: number }[] {
  return getLatestObservations(observations, locationId, count).map((o) => ({
    date: new Date(o.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    value: getMetricValue(o, metric),
  }));
}

export function getSeverityLabel(deviationPercent: number): string {
  const abs = Math.abs(deviationPercent);
  if (abs > 30) return 'severe';
  if (abs > 15) return 'significant';
  if (abs > 5) return 'moderate';
  return 'minor';
}

export function getZScoreColor(zScore: number): string {
  const abs = Math.abs(zScore);
  if (abs > 3) return 'text-red-400';
  if (abs > 2) return 'text-orange-400';
  if (abs > 1) return 'text-yellow-400';
  return 'text-green-400';
}
