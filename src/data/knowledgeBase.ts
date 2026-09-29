import type { KnowledgeEntry } from '@/types';

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: 'kb-001',
    category: 'Dissolved Oxygen',
    title: 'Dissolved Oxygen in Freshwater Ecosystems',
    content:
      'Dissolved oxygen (DO) is a critical indicator of water quality and ecosystem health. In healthy freshwater systems, DO typically ranges from 7.0 to 9.0 mg/L. DO levels below 5.0 mg/L place stress on aquatic organisms, and levels below 3.0 mg/L can be lethal to many fish species. DO decreases naturally with increasing temperature, as warm water holds less dissolved gas. Significant DO depletion can indicate organic pollution, eutrophication, or algal bloom decomposition.',
    tags: ['dissolved_oxygen', 'water_quality', 'ecosystem_stress'],
    source: 'Demo Knowledge Base — based on EPA Water Quality Standards',
  },
  {
    id: 'kb-002',
    category: 'Temperature',
    title: 'Thermal Effects on Aquatic Ecosystems',
    content:
      'Water temperature directly affects dissolved oxygen levels, metabolic rates of aquatic organisms, and chemical reaction rates. A temperature increase of 5°C or more above seasonal norms can indicate thermal stress. Elevated temperatures reduce oxygen solubility, accelerate microbial decomposition (further consuming oxygen), and can trigger algal blooms. Urban heat island effects and industrial discharge are common anthropogenic sources of thermal pollution.',
    tags: ['temperature', 'thermal_stress', 'dissolved_oxygen'],
    source: 'Demo Knowledge Base — based on EPA Thermal Pollution Guidelines',
  },
  {
    id: 'kb-003',
    category: 'Algae',
    title: 'Algal Blooms and Eutrophication',
    content:
      'Algal blooms occur when excess nutrients (nitrogen and phosphorus) enter a water body, causing rapid proliferation of phytoplankton. While algae produce oxygen during daylight via photosynthesis, dense blooms consume large amounts of oxygen at night through respiration and decomposition. When blooms die, bacterial decomposition can severely deplete dissolved oxygen, creating hypoxic or anoxic conditions. Visible indicators include green water discoloration, surface scum, and unusual odors.',
    tags: ['algae', 'eutrophication', 'dissolved_oxygen', 'nutrients'],
    source: 'Demo Knowledge Base — based on NOAA Harmful Algal Bloom literature',
  },
  {
    id: 'kb-004',
    category: 'Ecosystem Stress',
    title: 'Indicators of Ecosystem Stress',
    content:
      'Ecosystem stress manifests through multiple concurrent indicators: declining dissolved oxygen, rising temperature, pH shifts, increased turbidity, reduced biodiversity scores, and visible changes such as algal growth or fish mortality. A single indicator deviation may be within normal variability, but the simultaneous decline of multiple indicators strengthens the evidence for genuine ecosystem stress rather than measurement noise. Spatial patterns — where upstream sites remain near baseline while downstream sites deviate — further support a localized stress event.',
    tags: ['ecosystem_stress', 'biodiversity', 'multi_indicator'],
    source: 'Demo Knowledge Base — based on EPA Rapid Bioassessment Protocols',
  },
  {
    id: 'kb-005',
    category: 'Citizen Science',
    title: 'Citizen Observations as Complementary Evidence',
    content:
      'Citizen science observations provide valuable complementary evidence for environmental monitoring. Reports of unusual odors, visible algae, dead fish, and water color changes can corroborate sensor data and help identify events that might otherwise be attributed to sensor error. The reliability of citizen observations increases when multiple independent reports describe consistent phenomena within the same geographic area and time window. Citizen observations should be validated but should not be dismissed as anecdotal when they align with sensor-derived evidence.',
    tags: ['citizen_science', 'validation', 'observations'],
    source: 'Demo Knowledge Base — based on USGS Citizen Science Guidelines',
  },
  {
    id: 'kb-006',
    category: 'One Health',
    title: 'One Health and Freshwater Systems',
    content:
      'The One Health framework recognizes the interconnectedness of human, animal, and environmental health. Freshwater ecosystem degradation can affect drinking water quality, recreational safety, and food security. Detecting and investigating environmental stress events early — before they cascade into public health impacts — is a core goal of One Health environmental surveillance. Human-in-the-loop validation ensures that AI-assisted findings are reviewed by domain experts before triggering management actions.',
    tags: ['one_health', 'public_health', 'freshwater'],
    source: 'Demo Knowledge Base — based on WHO One Health guidance',
  },
  {
    id: 'kb-007',
    category: 'Turbidity',
    title: 'Turbidity as a Water Quality Indicator',
    content:
      'Turbidity measures the cloudiness of water caused by suspended particles. Elevated turbidity can indicate sediment runoff, algal growth, or pollution discharge. High turbidity reduces light penetration, impairing photosynthesis and disrupting aquatic food webs. Sudden turbidity increases coupled with other deviations may signal a point-source pollution event or storm-driven sediment input.',
    tags: ['turbidity', 'water_quality', 'sediment'],
    source: 'Demo Knowledge Base — based on EPA Turbidity Criteria',
  },
  {
    id: 'kb-008',
    category: 'Conductivity',
    title: 'Conductivity and Dissolved Solids',
    content:
      'Electrical conductivity reflects the concentration of dissolved ions in water. Significant increases in conductivity may indicate industrial discharge, road salt runoff, or wastewater intrusion. Conductivity deviations, when combined with other indicators like pH shifts or temperature increases, can help differentiate between natural variability and anthropogenic pollution sources.',
    tags: ['conductivity', 'pollution', 'dissolved_solids'],
    source: 'Demo Knowledge Base — based on EPA Conductivity Standards',
  },
];

export function retrieveKnowledge(tags: string[], limit = 3): KnowledgeEntry[] {
  const scored = KNOWLEDGE_BASE.map((entry) => {
    const overlap = entry.tags.filter((t) => tags.includes(t)).length;
    return { entry, score: overlap };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.entry);
}
