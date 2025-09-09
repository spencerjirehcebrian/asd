import { useState, useEffect, useRef } from 'react';
import { SearchOverlayProps } from '../../types';

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ searchTerm, isVisible }) => {
  const [shouldFade, setShouldFade] = useState(false);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isVisible || !searchTerm) {
      setShouldFade(false);
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      return;
    }

    // Reset fade state when search term changes
    setShouldFade(false);
    
    // Clear existing timeout
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
    }

    // Start fade-out after 1 second
    fadeTimeoutRef.current = setTimeout(() => {
      setShouldFade(true);
    }, 1000);

    // Cleanup on unmount or dependency change
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, [searchTerm, isVisible]);

  if (!isVisible || !searchTerm) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className={`bg-black/20 backdrop-blur-sm rounded-2xl px-8 py-4 animate-in fade-in-0 duration-200 transition-opacity duration-[10000ms] ease-out ${
        shouldFade ? 'opacity-0' : 'opacity-100'
      }`}>
        <span 
          className={`text-6xl font-normal tracking-wider transition-opacity duration-[10000ms] ease-out ${
            shouldFade ? 'opacity-0' : 'opacity-90'
          }`}
        >
          {searchTerm}
        </span>
      </div>
    </div>
  );
};