import { useServices } from './hooks/useServices';
import { useKeyboardSearch } from './hooks/useKeyboardSearch';
import { ServiceGrid } from './components/ui/ServiceGrid';
import { SearchOverlay } from './components/ui/SearchOverlay';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const App: React.FC = () => {
  const { services, loading, error } = useServices();
  const { searchState } = useKeyboardSearch(services);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto max-w-md rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-8 backdrop-blur-sm">
            <div className="mx-auto mb-4 h-12 w-12 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-zinc-100">Error Loading Services</h2>
            <p className="mb-4 text-zinc-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-yellow-600 px-4 py-2 text-black font-semibold transition-all duration-300 hover:bg-yellow-500 hover:shadow-lg hover:shadow-yellow-600/20"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      <main className="w-full">
        <ServiceGrid services={services} searchState={searchState} />
      </main>
      
      <SearchOverlay 
        searchTerm={searchState.searchTerm}
        isVisible={searchState.isSearching}
      />
    </div>
  );
};

export default App;
