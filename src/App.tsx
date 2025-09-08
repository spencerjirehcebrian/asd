import { useServices } from './hooks/useServices';
import { ServiceGrid } from './components/ui/ServiceGrid';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { Footer } from './components/common/Footer';

const App: React.FC = () => {
  const { services, loading, error } = useServices();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 p-8 rounded-xl max-w-md mx-auto">
            <div className="w-12 h-12 mx-auto mb-4 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Error Loading Services</h2>
            <p className="text-zinc-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="w-full">
        <ServiceGrid services={services} />
      </main>
      <Footer />
    </div>
  );
};

export default App;