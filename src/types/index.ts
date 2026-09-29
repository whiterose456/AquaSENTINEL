export type MetricKey =
  | 'dissolved_oxygen'
  | 'temperature'
  | 'ph'
  | 'turbidity'
  | 'conductivity'
  | 'biodiversity_score';

export type MetricLabel =
  | 'Dissolved Oxygen'
  | 'Temperature'
  | 'pH'
  | 'Turbidity'
  | 'Conductivity'
  | 'Biodiversity Score';

export interface Location {
  id: string;
  name: string;
  ecosystemType: 'river' | 'lake' | 'stream' | 'wetland';
  latitude: number;
  longitude: number;
  mapX: number;
  mapY: number;
  baseline: Record<MetricKey, { mean: number; std: number; unit: string }>;
}

export interface Observation {
  id: string;
  timestamp: string;
  locationId: string;
  dissolvedOxygen: number;
  temperature: number;
  ph: number;
  turbidity: number;
  conductivity: number;
  biodiversityScore: number;
  source: 'sensor' | 'manual';
}

export interface CitizenReport {
  id: string;
  timestamp: string;
  locationId: string;
  observationType: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  validationStatus: 'pending' | 'validated' | 'rejected';
}

export interface MetricDeviation {
  metric: MetricKey;
  currentValue: number;
  baselineMean: number;
  deviationPercent: number;
  zScore: number;
  direction: 'increase' | 'decrease';
  isAnomalous: boolean;
}

export interface EcoEvent {
  id: string;
  locationId: string;
  detectedAt: string;
  eventType: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
  status: 'active' | 'investigating' | 'validated' | 'rejected';
  deviations: MetricDeviation[];
  citizenReportCount: number;
}

export interface KnowledgeEntry {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  source: string;
}

export interface InvestigationStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'complete';
  detail: string;
}

export interface Finding {
  id: string;
  text: string;
  confidence: number;
}

export interface EvidenceItem {
  id: string;
  evidenceType: 'sensor' | 'historical' | 'citizen' | 'spatial' | 'knowledge';
  title: string;
  description: string;
  confidence: number;
  source: string;
}

export interface ContributingFactor {
  id: string;
  factor: string;
  description: string;
  confidence: number;
}

export interface Recommendation {
  id: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export interface HumanReview {
  decision: 'confirmed' | 'rejected' | 'needs_evidence';
  notes: string;
  reviewedAt: string;
}

export interface Investigation {
  id: string;
  eventId: string;
  createdAt: string;
  status: 'idle' | 'running' | 'complete' | 'human_review';
  steps: InvestigationStep[];
  findings: Finding[];
  evidence: EvidenceItem[];
  contributingFactors: ContributingFactor[];
  recommendations: Recommendation[];
  uncertainty: string;
  humanReview: HumanReview | null;
}

export type PageId =
  | 'overview'
  | 'map'
  | 'events'
  | 'investigation'
  | 'observations'
  | 'analytics';

export interface MetricConfig {
  key: MetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  normalRange: [number, number];
  goodDirection: 'high' | 'low' | 'stable';
}
