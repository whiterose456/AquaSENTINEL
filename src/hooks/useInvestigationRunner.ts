import { useEffect, useRef, useState, useCallback } from 'react';
import type { Investigation } from '@/types';
import { useApp } from '@/context/AppContext';

export function useInvestigationRunner(eventId: string | null) {
  const { investigations, startInvestigation } = useApp();
  const [localInv, setLocalInv] = useState<Investigation | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const investigation = eventId ? investigations[eventId] ?? localInv : null;

  const start = useCallback(() => {
    if (!eventId) return;
    startInvestigation(eventId);
  }, [eventId, startInvestigation]);

  useEffect(() => {
    if (!eventId) return;
    if (!investigations[eventId]) return;

    const inv = investigations[eventId];
    if (inv.status !== 'idle' && inv.status !== 'running') return;

    setIsRunning(true);
    setLocalInv(inv);

    // Animate steps sequentially
    inv.steps.forEach((step, idx) => {
      const timer = setTimeout(() => {
        setLocalInv((prev) => {
          if (!prev) return prev;
          const newSteps = prev.steps.map((s, i) =>
            i === idx ? { ...s, status: 'running' as const } : s
          );
          return { ...prev, steps: newSteps };
        });

        // Complete after 600ms
        const completeTimer = setTimeout(() => {
          setLocalInv((prev) => {
            if (!prev) return prev;
            const newSteps = prev.steps.map((s, i) =>
              i === idx ? { ...s, status: 'complete' as const } : s
            );
            const allComplete = newSteps.every((s) => s.status === 'complete');
            return {
              ...prev,
              steps: newSteps,
              status: allComplete ? 'complete' : 'running',
            };
          });
        }, 650);

        timersRef.current.push(completeTimer);
      }, idx * 850);

      timersRef.current.push(timer);
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [eventId, investigations]);

  useEffect(() => {
    if (investigation?.status === 'complete') {
      setIsRunning(false);
    }
  }, [investigation?.status]);

  return {
    investigation,
    isRunning,
    start,
  };
}
