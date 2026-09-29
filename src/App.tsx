import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { OverviewPage } from '@/pages/OverviewPage';
import { LiveMapPage } from '@/pages/LiveMapPage';
import { EventsPage } from '@/pages/EventsPage';
import { InvestigationPage } from '@/pages/InvestigationPage';
import { ObservationsPage } from '@/pages/ObservationsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';

function PageRouter() {
  const { currentPage } = useApp();

  switch (currentPage) {
    case 'overview':
      return <OverviewPage />;
    case 'map':
      return <LiveMapPage />;
    case 'events':
      return <EventsPage />;
    case 'investigation':
      return <InvestigationPage />;
    case 'observations':
      return <ObservationsPage />;
    case 'analytics':
      return <AnalyticsPage />;
    default:
      return <OverviewPage />;
  }
}

function AppContent() {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <Header />
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-12">
          <PageRouter />
        </main>
        <footer className="border-t border-slate-800/40 py-4 px-6 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest">
            AquaSentinel — OneAquaHealth IEEE Global Hackathon · AI-Assisted Environmental Intelligence
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
