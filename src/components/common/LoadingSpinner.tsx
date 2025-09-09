export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 border-2 border-zinc-800 rounded-full animate-pulse" />
        
        {/* Inner spinning ring */}
        <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-yellow-500 border-r-yellow-500 rounded-full animate-spin" />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};