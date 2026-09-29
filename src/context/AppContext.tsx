import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  PageId,
  EcoEvent,
  Investigation,
  HumanReview,
} from '@/types';
import {
  LOCATIONS,
  CITIZEN_REPORTS,
  generateObservations,
  buildEvents,
} from '@/data/demoData';
import { createInvestigation } from '@/lib/investigation';

interface AppState {
  currentPage: PageId;
  setPage: (page: PageId) => void;
  locations: typeof LOCATIONS;
  observations: ReturnType<typeof generateObservations>;
  citizenReports: typeof CITIZEN_REPORTS;
  events: EcoEvent[];
  activeEventId: string | null;
  activeEvent: EcoEvent | null;
  openEvent: (eventId: string) => void;
  investigations: Record<string, Investigation>;
  activeInvestigation: Investigation | null;
  startInvestigation: (eventId: string) => void;
  submitReview: (eventId: string, review: HumanReview) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [observations] = useState(() => generateObservations());
  const [events, setEvents] = useState<EcoEvent[]>(() =>
    buildEvents(generateObservations(), CITIZEN_REPORTS)
  );
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [investigations, setInvestigations] = useState<
    Record<string, Investigation>
  >({});

  const setPage = useCallback((page: PageId) => {
    setCurrentPage(page);
  }, []);

  const openEvent = useCallback((eventId: string) => {
    setActiveEventId(eventId);
    setCurrentPage('investigation');
  }, []);

  const activeEvent = events.find((e) => e.id === activeEventId) ?? null;
  const activeInvestigation = activeEventId
    ? investigations[activeEventId] ?? null
    : null;

  const startInvestigation = useCallback(
    (eventId: string) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return;

      if (!investigations[eventId]) {
        const inv = createInvestigation(
          event,
          observations,
          LOCATIONS,
          CITIZEN_REPORTS
        );
        setInvestigations((prev) => ({ ...prev, [eventId]: inv }));
      }
    },
    [events, observations, investigations]
  );

  const submitReview = useCallback(
    (eventId: string, review: HumanReview) => {
      setInvestigations((prev) => {
        const inv = prev[eventId];
        if (!inv) return prev;
        return {
          ...prev,
          [eventId]: { ...inv, humanReview: review, status: 'human_review' },
        };
      });
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                status:
                  review.decision === 'confirmed'
                    ? 'validated'
                    : review.decision === 'rejected'
                    ? 'rejected'
                    : 'investigating',
              }
            : e
        )
      );
    },
    []
  );

  const value: AppState = {
    currentPage,
    setPage,
    locations: LOCATIONS,
    observations,
    citizenReports: CITIZEN_REPORTS,
    events,
    activeEventId,
    activeEvent,
    openEvent,
    investigations,
    activeInvestigation,
    startInvestigation,
    submitReview,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
