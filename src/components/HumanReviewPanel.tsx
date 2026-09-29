import { useState } from 'react';
import { Check, X, FileQuestion, ClipboardList } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { HumanReview } from '@/types';

const DECISIONS: { value: HumanReview['decision']; label: string; icon: typeof Check; color: string }[] = [
  { value: 'confirmed', label: 'Confirm', icon: Check, color: 'green' },
  { value: 'rejected', label: 'Reject', icon: X, color: 'red' },
  { value: 'needs_evidence', label: 'Needs More Evidence', icon: FileQuestion, color: 'yellow' },
];

const COLOR_STYLES: Record<string, { bg: string; border: string; text: string; hover: string }> = {
  green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', hover: 'hover:bg-green-500/20' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', hover: 'hover:bg-red-500/20' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', hover: 'hover:bg-yellow-500/20' },
};

export function HumanReviewPanel({ investigationId }: { investigationId: string }) {
  const { activeInvestigation, submitReview } = useApp();
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!activeInvestigation) return null;

  const existingReview = activeInvestigation.humanReview;

  const handleSubmit = (decision: HumanReview['decision']) => {
    const review: HumanReview = {
      decision,
      notes,
      reviewedAt: new Date().toISOString(),
    };
    submitReview(investigationId, review);
    setSubmitted(true);
  };

  if (existingReview) {
    const decisionConfig = DECISIONS.find((d) => d.value === existingReview.decision)!;
    const styles = COLOR_STYLES[decisionConfig.color];

    return (
      <div className={`glass rounded-xl p-5 border ${styles.border} animate-fade-in-up`}>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Human Review</h3>
        </div>
        <div className={`p-4 rounded-lg ${styles.bg} border ${styles.border}`}>
          <div className="flex items-center gap-2 mb-2">
            <decisionConfig.icon className={`w-5 h-5 ${styles.text}`} />
            <p className={`text-sm font-semibold ${styles.text}`}>
              Decision: {decisionConfig.label}
            </p>
          </div>
          {existingReview.notes && (
            <p className="text-xs text-slate-400 mt-2">"{existingReview.notes}"</p>
          )}
          <p className="text-[10px] text-slate-600 mt-2">
            Reviewed on {new Date(existingReview.reviewedAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Human Review</h3>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-slate-800/30">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">AI Assessment</p>
        <p className="text-sm text-slate-200">
          {activeInvestigation.contributingFactors[0]?.factor ?? 'Potential ecosystem stress'}
        </p>
        <p className="text-xs text-cyan-400 mt-1">Confidence: ~78%</p>
      </div>

      <p className="text-xs text-slate-400 mb-3">Reviewer decision:</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {DECISIONS.map((d) => {
          const styles = COLOR_STYLES[d.color];
          return (
            <button
              key={d.value}
              onClick={() => handleSubmit(d.value)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-all ${styles.bg} ${styles.border} ${styles.text} ${styles.hover}`}
            >
              <d.icon className="w-4 h-4" />
              <span className="text-[11px] font-medium text-center">{d.label}</span>
            </button>
          );
        })}
      </div>

      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">
          Reviewer Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add observations, caveats, or context for this decision..."
          className="w-full h-20 px-3 py-2 text-sm text-slate-200 bg-slate-900/50 border border-slate-700/50 rounded-lg focus:outline-none focus:border-cyan-500/40 resize-none scrollbar-thin"
        />
      </div>

      {submitted && (
        <p className="text-xs text-green-400 mt-3 animate-fade-in">Review submitted successfully.</p>
      )}

      <p className="text-[10px] text-slate-600 mt-4 italic">
        AI assists scientific decision-making. Human validation is required before any management action.
      </p>
    </div>
  );
}
