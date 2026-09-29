import type {
  Location,
  Observation,
  CitizenReport,
  EcoEvent,
  MetricConfig,
  MetricKey,
} from '@/types';

export const METRIC_CONFIGS: MetricConfig[] = [
  {
    key: 'dissolved_oxygen',
    label: 'Dissolved Oxygen',
    shortLabel: 'DO',
    unit: 'mg/L',
    normalRange: [7.0, 9.0],
    goodDirection: 'high',
  },
  {
    key: 'temperature',
    label: 'Temperature',
    shortLabel: 'Temp',
    unit: '°C',
    normalRange: [22, 27],
    goodDirection: 'stable',
  },
  {
    key: 'ph',
    label: 'pH',
    shortLabel: 'pH',
    unit: '',
    normalRange: [6.8, 7.8],
    goodDirection: 'stable',
  },
  {
    key: 'turbidity',
    label: 'Turbidity',
    shortLabel: 'Turb',
    unit: 'NTU',
    normalRange: [1, 5],
    goodDirection: 'low',
  },
  {
    key: 'conductivity',
    label: 'Conductivity',
    shortLabel: 'Cond',
    unit: 'µS/cm',
    normalRange: [200, 450],
    goodDirection: 'stable',
  },
  {
    key: 'biodiversity_score',
    label: 'Biodiversity Score',
    shortLabel: 'Bio',
    unit: '',
    normalRange: [6, 9],
    goodDirection: 'high',
  },
];

export const LOCATIONS: Location[] = [
  {
    id: 'loc-river-a',
    name: 'Seine River — Sector A',
    ecosystemType: 'river',
    latitude: 48.8566,
    longitude: 2.3522,
    mapX: 28,
    mapY: 62,
    baseline: {
      dissolved_oxygen: { mean: 7.8, std: 0.25, unit: 'mg/L' },
      temperature: { mean: 24, std: 0.8, unit: '°C' },
      ph: { mean: 7.3, std: 0.1, unit: '' },
      turbidity: { mean: 2.4, std: 0.6, unit: 'NTU' },
      conductivity: { mean: 320, std: 25, unit: 'µS/cm' },
      biodiversity_score: { mean: 7.5, std: 0.4, unit: '' },
    },
  },
  {
    id: 'loc-river-b',
    name: 'Marne River — Sector B',
    ecosystemType: 'river',
    latitude: 48.8015,
    longitude: 2.4305,
    mapX: 55,
    mapY: 78,
    baseline: {
      dissolved_oxygen: { mean: 8.1, std: 0.2, unit: 'mg/L' },
      temperature: { mean: 23, std: 0.7, unit: '°C' },
      ph: { mean: 7.4, std: 0.08, unit: '' },
      turbidity: { mean: 1.8, std: 0.4, unit: 'NTU' },
      conductivity: { mean: 290, std: 20, unit: 'µS/cm' },
      biodiversity_score: { mean: 8.0, std: 0.3, unit: '' },
    },
  },
  {
    id: 'loc-lake-c',
    name: 'Lac Daumesnil',
    ecosystemType: 'lake',
    latitude: 48.8414,
    longitude: 2.4613,
    mapX: 72,
    mapY: 35,
    baseline: {
      dissolved_oxygen: { mean: 8.5, std: 0.3, unit: 'mg/L' },
      temperature: { mean: 22, std: 1.0, unit: '°C' },
      ph: { mean: 7.6, std: 0.12, unit: '' },
      turbidity: { mean: 3.1, std: 0.8, unit: 'NTU' },
      conductivity: { mean: 350, std: 30, unit: 'µS/cm' },
      biodiversity_score: { mean: 7.8, std: 0.5, unit: '' },
    },
  },
  {
    id: 'loc-stream-d',
    name: 'Bievre Stream',
    ecosystemType: 'stream',
    latitude: 48.8235,
    longitude: 2.3528,
    mapX: 38,
    mapY: 88,
    baseline: {
      dissolved_oxygen: { mean: 7.6, std: 0.28, unit: 'mg/L' },
      temperature: { mean: 24.5, std: 0.9, unit: '°C' },
      ph: { mean: 7.2, std: 0.1, unit: '' },
      turbidity: { mean: 2.8, std: 0.7, unit: 'NTU' },
      conductivity: { mean: 340, std: 28, unit: 'µS/cm' },
      biodiversity_score: { mean: 7.0, std: 0.4, unit: '' },
    },
  },
  {
    id: 'loc-wetland-e',
    name: 'Wetland Reserve E',
    ecosystemType: 'wetland',
    latitude: 48.8390,
    longitude: 2.4010,
    mapX: 62,
    mapY: 52,
    baseline: {
      dissolved_oxygen: { mean: 7.9, std: 0.3, unit: 'mg/L' },
      temperature: { mean: 23.5, std: 1.1, unit: '°C' },
      ph: { mean: 7.3, std: 0.14, unit: '' },
      turbidity: { mean: 4.2, std: 1.0, unit: 'NTU' },
      conductivity: { mean: 310, std: 35, unit: 'µS/cm' },
      biodiversity_score: { mean: 8.3, std: 0.4, unit: '' },
    },
  },
];

function genId(prefix: string, i: number): string {
  return `${prefix}-${String(i).padStart(4, '0')}`;
}

// Generate 14 days of observations per location
// River A has a deliberate anomaly in the last 4 days
export function generateObservations(): Observation[] {
  const obs: Observation[] = [];
  const now = new Date('2026-09-27T14:00:00Z');
  let counter = 0;

  for (const loc of LOCATIONS) {
    for (let day = 13; day >= 0; day--) {
      const ts = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
      const isAnomaly =
        loc.id === 'loc-river-a' && day < 4;
      const anomalyProgress = isAnomaly ? (4 - day) / 4 : 0;

      const noise = () => (Math.random() - 0.5) * 0.5;

      obs.push({
        id: genId('obs', counter++),
        timestamp: ts.toISOString(),
        locationId: loc.id,
        dissolvedOxygen: isAnomaly
          ? round(
              loc.baseline.dissolved_oxygen.mean -
                anomalyProgress * 3.1 +
                noise() * 0.3
            )
          : round(loc.baseline.dissolved_oxygen.mean + noise()),
        temperature: isAnomaly
          ? round(
              loc.baseline.temperature.mean +
                anomalyProgress * 7 +
                noise() * 0.4
            )
          : round(loc.baseline.temperature.mean + noise() * 0.8),
        ph: isAnomaly
          ? round(loc.baseline.ph.mean - anomalyProgress * 0.6 + noise() * 0.05)
          : round(loc.baseline.ph.mean + noise() * 0.1),
        turbidity: isAnomaly
          ? round(
              loc.baseline.turbidity.mean +
                anomalyProgress * 8.5 +
                noise() * 0.5
            )
          : round(loc.baseline.turbidity.mean + noise() * 0.6),
        conductivity: isAnomaly
          ? round(
              loc.baseline.conductivity.mean +
                anomalyProgress * 110 +
                noise() * 10
            )
          : round(loc.baseline.conductivity.mean + noise() * 20),
        biodiversityScore: isAnomaly
          ? round(
              loc.baseline.biodiversity_score.mean -
                anomalyProgress * 2.8 +
                noise() * 0.2
            )
          : round(loc.baseline.biodiversity_score.mean + noise() * 0.3),
        source: 'sensor',
      });
    }
  }

  return obs;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export const CITIZEN_REPORTS: CitizenReport[] = [
  {
    id: 'cr-0001',
    timestamp: '2026-09-24T08:30:00Z',
    locationId: 'loc-river-a',
    observationType: 'Unusual Odor',
    description:
      'Strong, unpleasant smell near the river bank. Chemical-like odor.',
    severity: 'high',
    validationStatus: 'validated',
  },
  {
    id: 'cr-0002',
    timestamp: '2026-09-24T11:15:00Z',
    locationId: 'loc-river-a',
    observationType: 'Algae Bloom',
    description: 'Visible green algae spreading along the water surface.',
    severity: 'high',
    validationStatus: 'validated',
  },
  {
    id: 'cr-0003',
    timestamp: '2026-09-25T07:45:00Z',
    locationId: 'loc-river-a',
    observationType: 'Dead Fish',
    description: 'Several dead fish observed near the east bank.',
    severity: 'high',
    validationStatus: 'validated',
  },
  {
    id: 'cr-0004',
    timestamp: '2026-09-25T14:20:00Z',
    locationId: 'loc-river-a',
    observationType: 'Algae Bloom',
    description: 'Algae coverage expanding. Water appears cloudy green.',
    severity: 'medium',
    validationStatus: 'pending',
  },
  {
    id: 'cr-0005',
    timestamp: '2026-09-26T09:00:00Z',
    locationId: 'loc-river-a',
    observationType: 'Water Color Change',
    description: 'Water has turned noticeably darker with greenish tint.',
    severity: 'high',
    validationStatus: 'pending',
  },
  {
    id: 'cr-0006',
    timestamp: '2026-09-26T16:30:00Z',
    locationId: 'loc-river-a',
    observationType: 'Unusual Odor',
    description: 'Odor persisting through the afternoon.',
    severity: 'medium',
    validationStatus: 'pending',
  },
  {
    id: 'cr-0007',
    timestamp: '2026-09-27T10:10:00Z',
    locationId: 'loc-river-a',
    observationType: 'Reduced Wildlife',
    description:
      'Normally active birds and insects absent from this stretch of river.',
    severity: 'medium',
    validationStatus: 'pending',
  },
  {
    id: 'cr-0008',
    timestamp: '2026-09-23T12:00:00Z',
    locationId: 'loc-lake-c',
    observationType: 'Algae Bloom',
    description: 'Small patches of algae near the north shore.',
    severity: 'low',
    validationStatus: 'validated',
  },
  {
    id: 'cr-0009',
    timestamp: '2026-09-22T15:00:00Z',
    locationId: 'loc-stream-d',
    observationType: 'Water Color Change',
    description: 'Slightly murky water after rainfall.',
    severity: 'low',
    validationStatus: 'validated',
  },
];

export function buildEvents(
  observations: Observation[],
  citizenReports: CitizenReport[]
): EcoEvent[] {
  const events: EcoEvent[] = [];

  for (const loc of LOCATIONS) {
    const locObs = observations
      .filter((o) => o.locationId === loc.id)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    if (locObs.length < 3) continue;

    const latest = locObs[locObs.length - 1];
    const early = locObs.slice(0, 4);
    const earlyMean = (key: MetricKey) =>
      early.reduce((s, o) => s + getMetric(o, key), 0) / early.length;

    const deviations = METRIC_CONFIGS.map((cfg) => {
      const current = getMetric(latest, cfg.key);
      const baselineMean = loc.baseline[cfg.key].mean;
      const std = loc.baseline[cfg.key].std;
      const deviationPercent =
        ((current - baselineMean) / baselineMean) * 100;
      const zScore = (current - baselineMean) / std;
      return {
        metric: cfg.key,
        currentValue: current,
        baselineMean,
        deviationPercent: Math.round(deviationPercent * 10) / 10,
        zScore: Math.round(zScore * 100) / 100,
        direction: current >= baselineMean ? ('increase' as const) : ('decrease' as const),
        isAnomalous: Math.abs(zScore) > 2,
      };
    });

    const anomalousCount = deviations.filter((d) => d.isAnomalous).length;
    const crCount = citizenReports.filter(
      (r) => r.locationId === loc.id
    ).length;

    if (anomalousCount >= 2 && crCount >= 2) {
      const severityScore = anomalousCount * 25 + crCount * 5;
      const severity =
        severityScore > 100
          ? 'critical'
          : severityScore > 70
          ? 'high'
          : severityScore > 40
          ? 'moderate'
          : 'low';
      const confidence = Math.min(
        95,
        50 + anomalousCount * 12 + crCount * 3
      );

      events.push({
        id: `evt-${loc.id}`,
        locationId: loc.id,
        detectedAt: latest.timestamp,
        eventType:
          deviations.find((d) => d.metric === 'dissolved_oxygen')?.isAnomalous
            ? 'Potential Ecosystem Stress'
            : 'Environmental Anomaly',
        severity,
        confidence,
        status: 'active',
        deviations,
        citizenReportCount: crCount,
      });
    }
  }

  return events;
}

function getMetric(obs: Observation, key: MetricKey): number {
  switch (key) {
    case 'dissolved_oxygen':
      return obs.dissolvedOxygen;
    case 'temperature':
      return obs.temperature;
    case 'ph':
      return obs.ph;
    case 'turbidity':
      return obs.turbidity;
    case 'conductivity':
      return obs.conductivity;
    case 'biodiversity_score':
      return obs.biodiversityScore;
  }
}

export function getMetricValue(obs: Observation, key: MetricKey): number {
  return getMetric(obs, key);
}
