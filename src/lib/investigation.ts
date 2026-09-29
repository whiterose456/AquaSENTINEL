import type {
  EcoEvent,
  Observation,
  Location,
  Investigation,
  InvestigationStep,
  Finding,
  EvidenceItem,
  ContributingFactor,
  Recommendation,
  CitizenReport,
  MetricKey,
} from '@/types';
import { METRIC_CONFIGS, getMetricValue } from '@/data/demoData';
import { retrieveKnowledge } from '@/data/knowledgeBase';
import {
  getLatestObservations,
  getEarlyBaselineObservations,
  calculateDeviations,
} from '@/lib/anomaly';

let investigationCounter = 146;

export function createInvestigation(
  event: EcoEvent,
  observations: Observation[],
  locations: Location[],
  citizenReports: CitizenReport[]
): Investigation {
  const id = `INV-${String(++investigationCounter).padStart(4, '0')}`;
  const location = locations.find((l) => l.id === event.locationId)!;
  const locObs = observations.filter((o) => o.locationId === event.locationId);
  const latest = getLatestObservations(locObs, event.locationId, 1)[0];
  const early = getEarlyBaselineObservations(locObs, event.locationId, 4);
  const deviations = calculateDeviations(latest, location);

  const doDev = deviations.find((d) => d.metric === 'dissolved_oxygen')!;
  const tempDev = deviations.find((d) => d.metric === 'temperature')!;
  const turbDev = deviations.find((d) => d.metric === 'turbidity')!;
  const phDev = deviations.find((d) => d.metric === 'ph')!;
  const condDev = deviations.find((d) => d.metric === 'conductivity')!;
  const bioDev = deviations.find((d) => d.metric === 'biodiversity_score')!;

  const locReports = citizenReports.filter((r) => r.locationId === event.locationId);
  const algaeReports = locReports.filter((r) =>
    r.observationType.toLowerCase().includes('algae')
  );

  // Tags for RAG retrieval
  const tags: string[] = ['ecosystem_stress', 'citizen_science'];
  if (doDev.isAnomalous) tags.push('dissolved_oxygen');
  if (tempDev.isAnomalous) tags.push('temperature', 'thermal_stress');
  if (algaeReports.length > 0) tags.push('algae', 'eutrophication');
  if (turbDev.isAnomalous) tags.push('turbidity');
  if (condDev.isAnomalous) tags.push('conductivity');

  const knowledge = retrieveKnowledge(tags, 4);

  const steps: InvestigationStep[] = [
    {
      id: 'step-sensor',
      label: 'Sensor Data Analysis',
      status: 'pending',
      detail: `Retrieved ${locObs.length} sensor readings for ${location.name}`,
    },
    {
      id: 'step-baseline',
      label: 'Historical Baseline Comparison',
      status: 'pending',
      detail: `Compared current readings against 14-day baseline for ${location.name}`,
    },
    {
      id: 'step-spatial',
      label: 'Spatial Comparison',
      status: 'pending',
      detail: 'Comparing upstream and downstream measurements across monitoring sites',
    },
    {
      id: 'step-citizen',
      label: 'Citizen Observation Analysis',
      status: 'pending',
      detail: `${locReports.length} citizen observations within the affected area`,
    },
    {
      id: 'step-knowledge',
      label: 'Environmental Knowledge Retrieval',
      status: 'pending',
      detail: `Retrieved ${knowledge.length} relevant knowledge entries from RAG database`,
    },
    {
      id: 'step-synthesis',
      label: 'Evidence Synthesis',
      status: 'pending',
      detail: 'Synthesizing multi-source evidence into investigation findings',
    },
  ];

  // Findings
  const findings: Finding[] = [];

  findings.push({
    id: 'finding-do',
    text: `Dissolved oxygen is approximately ${Math.abs(Math.round(doDev.deviationPercent))}% ${doDev.direction === 'decrease' ? 'below' : 'above'} the historical baseline, with a current reading of ${doDev.currentValue} mg/L.`,
    confidence: Math.min(95, 60 + Math.abs(doDev.zScore) * 8),
  });

  findings.push({
    id: 'finding-temp',
    text: `Temperature is approximately ${Math.abs(Math.round(tempDev.deviationPercent))}% ${tempDev.direction === 'decrease' ? 'below' : 'above'} the historical baseline, with a current reading of ${tempDev.currentValue}°C.`,
    confidence: Math.min(92, 58 + Math.abs(tempDev.zScore) * 7),
  });

  if (turbDev.isAnomalous) {
    findings.push({
      id: 'finding-turb',
      text: `Turbidity is ${Math.abs(Math.round(turbDev.deviationPercent))}% ${turbDev.direction === 'decrease' ? 'below' : 'above'} baseline, indicating increased suspended particulate matter.`,
      confidence: Math.min(88, 55 + Math.abs(turbDev.zScore) * 6),
    });
  }

  findings.push({
    id: 'finding-citizen',
    text: `${locReports.length} citizen observations were recorded within the affected area during the same period, including ${algaeReports.length} algae-related reports and reports of unusual odor and dead fish.`,
    confidence: 82,
  });

  findings.push({
    id: 'finding-synthesis',
    text: `The simultaneous decline in dissolved oxygen, increase in temperature and turbidity, and corroborating citizen observations are consistent with potential ecosystem stress, possibly linked to eutrophication and algal bloom dynamics.`,
    confidence: 78,
  });

  // Evidence
  const evidence: EvidenceItem[] = [
    {
      id: 'ev-sensor',
      evidenceType: 'sensor',
      title: 'Sensor Data',
      description: `DO decreased from ${early[0].dissolvedOxygen} mg/L to ${latest.dissolvedOxygen} mg/L (${Math.abs(Math.round(doDev.deviationPercent))}% deviation). Temperature increased from ${early[0].temperature}°C to ${latest.temperature}°C.`,
      confidence: 90,
      source: 'In-situ sensor network',
    },
    {
      id: 'ev-historical',
      evidenceType: 'historical',
      title: 'Historical Baseline',
      description: `Current DO measurement is ${doDev.zScore} standard deviations from the 14-day baseline mean of ${location.baseline.dissolved_oxygen.mean} mg/L, placing it well outside normal variability.`,
      confidence: 88,
      source: '14-day rolling baseline',
    },
    {
      id: 'ev-citizen',
      evidenceType: 'citizen',
      title: 'Citizen Science',
      description: `${locReports.length} observations recorded within the affected area, including reports of algae blooms, unusual odors, and dead fish. ${locReports.filter((r) => r.validationStatus === 'validated').length} reports have been validated.`,
      confidence: 80,
      source: 'Citizen observation reports',
    },
    {
      id: 'ev-spatial',
      evidenceType: 'spatial',
      title: 'Spatial Pattern',
      description: `Upstream monitoring sites (Marne River, Wetland Reserve) show DO and temperature readings closer to baseline, suggesting the stress event is localized to ${location.name}.`,
      confidence: 75,
      source: 'Multi-site spatial comparison',
    },
    {
      id: 'ev-knowledge',
      evidenceType: 'knowledge',
      title: 'Knowledge Base',
      description: knowledge
        .map((k) => `[${k.category}] ${k.title}`)
        .join('; '),
      confidence: 70,
      source: knowledge.map((k) => k.source).join('; '),
    },
  ];

  // Contributing factors
  const factors: ContributingFactor[] = [];
  if (tempDev.isAnomalous && doDev.isAnomalous) {
    factors.push({
      id: 'factor-thermal',
      factor: 'Thermal Stress',
      description:
        'Elevated water temperature reduces oxygen solubility and may accelerate microbial decomposition, further consuming dissolved oxygen.',
      confidence: 72,
    });
  }
  if (algaeReports.length > 0 || turbDev.isAnomalous) {
    factors.push({
      id: 'factor-nutrient',
      factor: 'Nutrient Enrichment / Eutrophication',
      description:
        'Excess nutrient input may have triggered algal growth. Nighttime respiration and bloom decomposition can severely deplete dissolved oxygen.',
      confidence: 68,
    });
  }
  factors.push({
    id: 'factor-reduced-o2',
    factor: 'Reduced Oxygen Availability',
    description:
      'The combined effect of thermal stress and biological oxygen demand has likely reduced oxygen availability below the tolerance threshold for sensitive aquatic species.',
    confidence: 74,
  });
  if (condDev.isAnomalous) {
    factors.push({
      id: 'factor-discharge',
      factor: 'Possible Point-Source Discharge',
      description:
        'Elevated conductivity may indicate industrial or wastewater discharge upstream. This is a possible contributing factor and requires further investigation.',
      confidence: 55,
    });
  }

  // Recommendations
  const recommendations: Recommendation[] = [
    {
      id: 'rec-1',
      action: 'Collect additional dissolved oxygen measurements at multiple depths and times of day',
      priority: 'high',
    },
    {
      id: 'rec-2',
      action: 'Inspect upstream and downstream conditions to identify potential point-source inputs',
      priority: 'high',
    },
    {
      id: 'rec-3',
      action: 'Validate pending citizen observations through field verification',
      priority: 'medium',
    },
    {
      id: 'rec-4',
      action: 'Compare current readings against historical seasonal records for the same period',
      priority: 'medium',
    },
    {
      id: 'rec-5',
      action: 'Conduct nutrient analysis (nitrogen, phosphorus) to assess eutrophication risk',
      priority: 'medium',
    },
    {
      id: 'rec-6',
      action: 'Deploy continuous DO and temperature loggers for high-resolution temporal monitoring',
      priority: 'low',
    },
  ];

  const uncertainty = `The available observations indicate potential ecosystem stress at ${location.name}. The concurrent deviations in dissolved oxygen, temperature, and turbidity — combined with corroborating citizen reports — are consistent with a stress event. However, the current data is insufficient to establish a definitive causal mechanism. The contributing factors listed above are plausible explanations, not confirmed causes. Human validation and additional field measurements are required before management action is taken.`;

  return {
    id,
    eventId: event.id,
    createdAt: new Date().toISOString(),
    status: 'idle',
    steps,
    findings,
    evidence,
    contributingFactors: factors,
    recommendations,
    uncertainty,
    humanReview: null,
  };
}

export function getRetrievedKnowledge(
  event: EcoEvent,
  observations: Observation[],
  locations: Location[]
) {
  const location = locations.find((l) => l.id === event.locationId)!;
  const locObs = observations.filter((o) => o.locationId === event.locationId);
  const latest = getLatestObservations(locObs, event.locationId, 1)[0];
  const deviations = calculateDeviations(latest, location);
  const tags: string[] = ['ecosystem_stress'];
  deviations.forEach((d) => {
    if (d.isAnomalous) tags.push(d.metric);
  });
  if (tags.includes('temperature')) tags.push('thermal_stress');
  return retrieveKnowledge(tags, 4);
}
