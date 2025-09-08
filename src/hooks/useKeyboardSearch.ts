import { useState, useEffect, useCallback } from 'react';
import { Service, SearchState, UseKeyboardSearchResult } from '../types';

export const useKeyboardSearch = (services: Service[]): UseKeyboardSearchResult => {
  const [searchState, setSearchState] = useState<SearchState>({
    searchTerm: '',
    filteredServices: services,
    isSearching: false,
    shouldPulseHighlighted: false,
  });

  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const [pulseTimeoutId, setPulseTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const resetSearchTimeout = useCallback(() => {
    return setTimeout(() => {
      setSearchState(prev => ({
        ...prev,
        searchTerm: '',
        isSearching: false,
        filteredServices: services,
        shouldPulseHighlighted: false,
      }));
    }, 5000);
  }, [services]);

  const filterServices = useCallback((term: string) => {
    if (!term) return services;
    
    return services.filter(service =>
      service.name.toLowerCase().includes(term.toLowerCase()) ||
      service.description.toLowerCase().includes(term.toLowerCase())
    );
  }, [services]);

  const navigateToFirstMatch = useCallback(() => {
    if (searchState.filteredServices.length === 1) {
      // Single match: navigate to the service
      const firstMatch = searchState.filteredServices[0];
      window.open(firstMatch.url, '_blank', 'noopener,noreferrer');
      
      // Reset search after navigation
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setSearchState({
        searchTerm: '',
        filteredServices: services,
        isSearching: false,
        shouldPulseHighlighted: false,
      });
    } else if (searchState.filteredServices.length > 1) {
      // Multiple matches: trigger pulse animation
      if (pulseTimeoutId) {
        clearTimeout(pulseTimeoutId);
      }
      
      setSearchState(prev => ({
        ...prev,
        shouldPulseHighlighted: true,
      }));
      
      // Clear pulse after animation duration
      const newPulseTimeoutId = setTimeout(() => {
        setSearchState(prev => ({
          ...prev,
          shouldPulseHighlighted: false,
        }));
      }, 600);
      
      setPulseTimeoutId(newPulseTimeoutId);
    }
  }, [searchState.filteredServices, timeoutId, services, pulseTimeoutId]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Handle ESC key for instant search exit (highest priority)
    if (event.key === 'Escape' && searchState.isSearching) {
      // Prevent default ESC behavior
      if (event.target === document.body) {
        event.preventDefault();
      }

      // Clear all timeouts immediately
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (pulseTimeoutId) {
        clearTimeout(pulseTimeoutId);
      }

      // Reset search state immediately
      setSearchState({
        searchTerm: '',
        filteredServices: services,
        isSearching: false,
        shouldPulseHighlighted: false,
      });
      return;
    }

    // Handle Enter key for navigation
    if (event.key === 'Enter' && searchState.isSearching) {
      navigateToFirstMatch();
      return;
    }

    // Handle Backspace and Delete keys
    if ((event.key === 'Backspace' || event.key === 'Delete') && searchState.isSearching) {
      // Prevent default behavior
      if (event.target === document.body) {
        event.preventDefault();
      }

      // Clear existing timeouts
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (pulseTimeoutId) {
        clearTimeout(pulseTimeoutId);
      }

      // Remove last character from search term
      const newSearchTerm = searchState.searchTerm.slice(0, -1);
      
      if (newSearchTerm === '') {
        // If search term becomes empty, reset search state
        setSearchState({
          searchTerm: '',
          filteredServices: services,
          isSearching: false,
          shouldPulseHighlighted: false,
        });
      } else {
        // Update search with reduced term
        const filtered = filterServices(newSearchTerm);
        setSearchState({
          searchTerm: newSearchTerm,
          filteredServices: filtered,
          isSearching: true,
          shouldPulseHighlighted: false,
        });

        // Set new timeout
        const newTimeoutId = resetSearchTimeout();
        setTimeoutId(newTimeoutId);
      }
      return;
    }

    // Only handle letter keys and space for adding characters
    if (!/^[a-zA-Z\s]$/.test(event.key)) {
      return;
    }

    // Prevent default behavior for letter keys to avoid interfering with other inputs
    if (event.target === document.body) {
      event.preventDefault();
    }

    // Clear existing timeouts
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (pulseTimeoutId) {
      clearTimeout(pulseTimeoutId);
    }

    // Update search term
    const newSearchTerm = searchState.searchTerm + event.key;
    const filtered = filterServices(newSearchTerm);

    setSearchState({
      searchTerm: newSearchTerm,
      filteredServices: filtered,
      isSearching: true,
      shouldPulseHighlighted: false,
    });

    // Set new timeout
    const newTimeoutId = resetSearchTimeout();
    setTimeoutId(newTimeoutId);
  }, [searchState.searchTerm, searchState.isSearching, timeoutId, pulseTimeoutId, filterServices, resetSearchTimeout, navigateToFirstMatch, services]);

  // Update filtered services when services prop changes
  useEffect(() => {
    if (!searchState.isSearching) {
      setSearchState(prev => ({
        ...prev,
        filteredServices: services,
      }));
    }
  }, [services, searchState.isSearching]);

  // Setup global keydown listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (pulseTimeoutId) {
        clearTimeout(pulseTimeoutId);
      }
    };
  }, [handleKeyPress, timeoutId, pulseTimeoutId]);

  return {
    searchState,
    handleKeyPress,
    navigateToFirstMatch,
  };
};