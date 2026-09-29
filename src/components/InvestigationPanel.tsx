import { CheckCircle2, Loader2, Circle, Brain, Sparkles, ShieldAlert, Lightbulb, FileSearch } from 'lucide-react';
import type { Investigation, EvidenceItem, ContributingFactor, Finding, Recommendation } from '@/types';
import { KNOWLEDGE_BASE } from '@/data/knowledgeBase';
import { useApp } from '@/context/AppContext';

const STEP_ICONS = [FileSearch, FileSearch, FileSearch, FileSearch, FileSearch, Sparkles];

const EVIDENCE_ICONS: Record<string, typeof CheckCircle2> = {
  sensor: FileSearch,
  historical: FileSearch,
  citizen: FileSearch,
  spatial: FileSearch,
  knowledge: FileSearch,
};

const EVIDENCE_COLORS: Record<string, string> = {
  sensor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  historical: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  citizen: 'text-green-400 bg-green-500/10 border-green-500/20',
  spatial: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  knowledge: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
};

function ConfidenceBar({ value }: { value: number }) {
  const color = value > 80 ? 'bg-green-400' : value > 60 ? 'bg-yellow-400' : 'bg-orange-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-slate-700 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-slate-400 font-mono">{value}%</span>
    </div>
  );
}

export function InvestigationPanel({ investigation }: { investigation: Investigation }) {
  const { events } = useApp();
  const event = events.find((e) => e.id === investigation.eventId);
  const allComplete = investigation.steps.every((s) => s.status === 'complete');
  const retrievedKnowledge = KNOWLEDGE_BASE.filter((k) =>
    investigation.evidence.find((e) => e.evidenceType === 'knowledge')?.description.includes(k.title)
  );

  return (
    <div className="space-y-4">
      {/* Agent header */}
      <div className="glass rounded-xl p-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/30">
          <Brain className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">AquaAgent</p>
          <p className="text-xs text-slate-500">
            {investigation.status === 'complete' ? 'Investigation complete' : isRunningStatus(investigation) ? 'Investigating event...' : 'Ready to investigate'}
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="glass rounded-xl p-5 space-y-3">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Investigation Steps</p>
        {investigation.steps.map((step, i) => {
          const Icon = STEP_ICONS[i] ?? FileSearch;
          return (
            <div key={step.id} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="mt-0.5">
                {step.status === 'complete' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : step.status === 'running' ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${step.status === 'pending' ? 'text-slate-500' : 'text-slate-200'}`}>
                  {step.label}
                </p>
                {step.status !== 'pending' && (
                  <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Findings */}
      {allComplete && (
        <>
          <Section title="Findings" icon={Sparkles} delay={0}>
            <div className="space-y-3">
              {investigation.findings.map((f, i) => (
                <FindingItem key={f.id} finding={f} index={i} />
              ))}
            </div>
          </Section>

          {/* Evidence */}
          <Section title="Evidence" icon={FileSearch} delay={0.1}>
            <div className="space-y-2">
              {investigation.evidence.map((ev, i) => (
                <EvidenceRow key={ev.id} evidence={ev} index={i} />
              ))}
            </div>
          </Section>

          {/* Retrieved Knowledge */}
          {retrievedKnowledge.length > 0 && (
            <Section title="Retrieved Knowledge (RAG)" icon={Brain} delay={0.15}>
              <div className="space-y-2">
                {retrievedKnowledge.map((k) => (
                  <div key={k.id} className="glass rounded-lg p-3 border-l-2 border-violet-500/40">
                    <p className="text-xs font-semibold text-violet-300">{k.title}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{k.content}</p>
                    <p className="text-[10px] text-slate-600 mt-2 italic">{k.source}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Contributing Factors */}
          <Section title="Possible Contributing Factors" icon={Lightbulb} delay={0.2}>
            <div className="space-y-2">
              {investigation.contributingFactors.map((f, i) => (
                <FactorRow key={f.id} factor={f} index={i} />
              ))}
            </div>
            <div className="mt-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <p className="text-xs text-yellow-300/80">
                These are possible explanations based on available evidence, NOT confirmed causes.
                Further investigation is required to establish causality.
              </p>
            </div>
          </Section>

          {/* Uncertainty */}
          <Section title="Uncertainty Assessment" icon={ShieldAlert} delay={0.25}>
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <p className="text-sm text-amber-200/90 leading-relaxed">{investigation.uncertainty}</p>
            </div>
          </Section>

          {/* Recommendations */}
          <Section title="Recommended Next Investigation" icon={Lightbulb} delay={0.3}>
            <div className="space-y-2">
              {investigation.recommendations.map((r) => (
                <RecommendationRow key={r.id} rec={r} />
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

function isRunningStatus(inv: Investigation): boolean {
  return inv.steps.some((s) => s.status === 'running' || s.status === 'pending') && inv.status !== 'idle';
}

function Section({ title, icon: Icon, children, delay = 0 }: { title: string; icon: typeof Brain; children: React.ReactNode; delay?: number }) {
  return (
    <div className="glass rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FindingItem({ finding, index }: { finding: Finding; index: number }) {
  return (
    <div className="flex items-start gap-3 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-slate-200 leading-relaxed">{finding.text}</p>
        <div className="mt-2">
          <ConfidenceBar value={Math.round(finding.confidence)} />
        </div>
      </div>
    </div>
  );
}

function EvidenceRow({ evidence, index }: { evidence: EvidenceItem; index: number }) {
  const Icon = EVIDENCE_ICONS[evidence.evidenceType] ?? FileSearch;
  const colorClass = EVIDENCE_COLORS[evidence.evidenceType] ?? EVIDENCE_COLORS.sensor;
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 animate-fade-in-up" style={{ animationDelay: `${index * 0.08}s` }}>
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg border ${colorClass} flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white">{evidence.title}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{evidence.description}</p>
        <p className="text-[10px] text-slate-600 mt-1 italic">{evidence.source}</p>
      </div>
      <div className="flex-shrink-0">
        <ConfidenceBar value={Math.round(evidence.confidence)} />
      </div>
    </div>
  );
}

function FactorRow({ factor, index }: { factor: ContributingFactor; index: number }) {
  return (
    <div className="p-3 rounded-lg bg-slate-800/30 animate-fade-in-up" style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-white">{factor.factor}</p>
        <ConfidenceBar value={Math.round(factor.confidence)} />
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{factor.description}</p>
    </div>
  );
}

function RecommendationRow({ rec }: { rec: Recommendation }) {
  const priorityColors: Record<string, string> = {
    high: 'text-red-400 bg-red-500/10 border-red-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800/30 transition-colors">
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${priorityColors[rec.priority]}`}>
        {rec.priority.toUpperCase()}
      </span>
      <p className="text-xs text-slate-300 flex-1">{rec.action}</p>
    </div>
  );
}
