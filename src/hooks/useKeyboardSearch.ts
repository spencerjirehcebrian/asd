import { useState, useEffect, useCallback, useMemo } from 'react';
import { Service, SearchState, UseKeyboardSearchResult } from '../types';
import { 
  calculateGridDimensions, 
  getNextTabIndex, 
  getArrowNavigationIndex, 
  findServiceIndex 
} from '../utils/navigationUtils';

export const useKeyboardSearch = (services: Service[]): UseKeyboardSearchResult => {
  const [searchState, setSearchState] = useState<SearchState>({
    searchTerm: '',
    filteredServices: services,
    isSearching: false,
    shouldPulseHighlighted: false,
    focusedIndex: -1,
    focusedService: null,
  });

  const [pulseTimeoutId, setPulseTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Removed automatic search timeout - search persists until manually cleared

  const updateFocusedService = useCallback((index: number, servicesList: Service[]) => {
    const service = servicesList[index] || null;
    return { focusedIndex: index, focusedService: service };
  }, []);

  const handleTabNavigation = useCallback((direction: 'forward' | 'backward') => {
    setSearchState(prev => {
      const activeServices = prev.isSearching ? prev.filteredServices : services;
      const currentIndex = prev.focusedIndex;
      const newIndex = getNextTabIndex(currentIndex, activeServices.length, direction);
      
      return {
        ...prev,
        ...updateFocusedService(newIndex, activeServices)
      };
    });
  }, [services, updateFocusedService]);

  const handleArrowNavigation = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setSearchState(prev => {
      const activeServices = prev.isSearching ? prev.filteredServices : services;
      const gridDimensions = calculateGridDimensions(activeServices.length);
      const currentIndex = prev.focusedIndex;
      const newIndex = getArrowNavigationIndex(currentIndex, direction, gridDimensions);
      
      return {
        ...prev,
        ...updateFocusedService(newIndex, activeServices)
      };
    });
  }, [services, updateFocusedService]);

  const filterServices = useCallback((term: string) => {
    if (!term) return services;
    
    const filtered = services.filter(service => {
      const nameMatch = service.name.toLowerCase().includes(term.toLowerCase());
      const descMatch = service.description.toLowerCase().includes(term.toLowerCase());
      return nameMatch || descMatch;
    });
    
    return filtered;
  }, [services]);

  const navigateToFocusedService = useCallback(() => {
    if (searchState.focusedService) {
      window.open(searchState.focusedService.url, '_blank', 'noopener,noreferrer');
    }
  }, [searchState.focusedService]);

  const navigateToFirstMatch = useCallback(() => {
    if (searchState.filteredServices.length === 1) {
      // Single match: navigate to the service
      const firstMatch = searchState.filteredServices[0];
      window.open(firstMatch.url, '_blank', 'noopener,noreferrer');
      
      // Reset search after navigation
      setSearchState({
        searchTerm: '',
        filteredServices: services,
        isSearching: false,
        shouldPulseHighlighted: false,
        focusedIndex: -1,
        focusedService: null,
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
  }, [searchState.filteredServices, services, pulseTimeoutId]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Never intercept when modifier keys are pressed (except Shift for Tab navigation)
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    
    // Never intercept function keys, navigation keys that should work globally
    if (['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Insert', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) {
      return;
    }

    // Prevent default behavior for navigation keys when targeting body
    if (event.target === document.body) {
      if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(event.key)) {
        event.preventDefault();
      }
    }

    // Handle Tab navigation
    if (event.key === 'Tab') {
      const direction = event.shiftKey ? 'backward' : 'forward';
      handleTabNavigation(direction);
      return;
    }

    // Handle Arrow navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      const direction = event.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
      handleArrowNavigation(direction);
      return;
    }

    // Handle ESC key for search exit and focus clearing (only when no modifiers)
    if (event.key === 'Escape') {
      // Only handle ESC when no modifier keys are pressed
      if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      
      // Prevent default ESC behavior
      if (event.target === document.body) {
        event.preventDefault();
      }

      // Clear pulse timeout immediately
      if (pulseTimeoutId) {
        clearTimeout(pulseTimeoutId);
      }

      if (searchState.isSearching) {
        // Reset search state completely
        setSearchState({
          searchTerm: '',
          filteredServices: services,
          isSearching: false,
          shouldPulseHighlighted: false,
          focusedIndex: -1,
          focusedService: null,
        });
      } else {
        // Just clear focus when not searching
        setSearchState(prev => ({
          ...prev,
          focusedIndex: -1,
          focusedService: null,
        }));
      }
      return;
    }

    // Handle Enter key for navigation
    if (event.key === 'Enter') {
      if (searchState.focusedService) {
        navigateToFocusedService();
      } else if (searchState.isSearching) {
        navigateToFirstMatch();
      }
      return;
    }

    // Handle Backspace and Delete keys (only when searching and no modifiers)
    if ((event.key === 'Backspace' || event.key === 'Delete') && searchState.isSearching) {
      // Only handle when no modifier keys are pressed (allow Ctrl+Backspace, etc.)
      if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      
      // Prevent default behavior
      if (event.target === document.body) {
        event.preventDefault();
      }

      // Clear existing pulse timeout
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
          focusedIndex: -1,
          focusedService: null,
        });
      } else {
        // Update search with reduced term
        const filtered = filterServices(newSearchTerm);
        setSearchState(prev => {
          const newState: SearchState = {
            searchTerm: newSearchTerm,
            filteredServices: filtered,
            isSearching: true,
            shouldPulseHighlighted: false,
            focusedIndex: -1,
            focusedService: null,
          };
          
          // Try to maintain focus on the same service if it's still in filtered results
          if (prev.focusedService && filtered.includes(prev.focusedService)) {
            const newIndex = findServiceIndex(prev.focusedService, filtered);
            newState.focusedIndex = newIndex;
            newState.focusedService = prev.focusedService;
          }
          
          return newState;
        });
      }
      return;
    }

    // Only handle letter keys and space for adding characters (when no modifiers)
    if (!/^[a-zA-Z\s]$/.test(event.key)) {
      return;
    }

    // Already checked for modifiers at the top of function, but double-check for letter keys
    // This ensures Ctrl+A, Cmd+C, etc. work properly
    if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    // Prevent default behavior for letter keys to avoid interfering with other inputs
    if (event.target === document.body) {
      event.preventDefault();
    }

    // Clear existing pulse timeout
    if (pulseTimeoutId) {
      clearTimeout(pulseTimeoutId);
    }

    // Update search term
    const newSearchTerm = searchState.searchTerm + event.key;
    const filtered = filterServices(newSearchTerm);

    setSearchState(prev => {
      const newState: SearchState = {
        searchTerm: newSearchTerm,
        filteredServices: filtered,
        isSearching: true,
        shouldPulseHighlighted: false,
        focusedIndex: -1,
        focusedService: null,
      };
      
      // Try to maintain focus on the same service if it's still in filtered results
      if (prev.focusedService && filtered.includes(prev.focusedService)) {
        const newIndex = findServiceIndex(prev.focusedService, filtered);
        newState.focusedIndex = newIndex;
        newState.focusedService = prev.focusedService;
      }
      
      return newState;
    });
  }, [searchState.searchTerm, searchState.isSearching, searchState.focusedService, pulseTimeoutId, filterServices, navigateToFirstMatch, navigateToFocusedService, handleTabNavigation, handleArrowNavigation, services]);

  // Update filtered services when services prop changes (memoized to prevent infinite re-renders)
  const servicesChanged = useMemo(() => services, [services]);
  
  useEffect(() => {
    if (!searchState.isSearching) {
      setSearchState(prev => ({
        ...prev,
        filteredServices: servicesChanged,
        focusedIndex: -1,
        focusedService: null,
      }));
    }
  }, [servicesChanged, searchState.isSearching]);

  // Setup global keydown listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (pulseTimeoutId) {
        clearTimeout(pulseTimeoutId);
      }
    };
  }, [handleKeyPress, pulseTimeoutId]);

  return {
    searchState,
    handleKeyPress,
    navigateToFirstMatch,
  };
};