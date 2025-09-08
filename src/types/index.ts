// Core service interface (simplified)
export interface Service {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
}

// Configuration file structure (simplified)
export interface ServicesConfig {
  services: Service[];
}

// Hook return type
export interface UseServicesResult {
  services: Service[];
  loading: boolean;
  error: string | null;
}

// Component prop interfaces (updated with search support)

// Search-related interfaces
export interface SearchState {
  searchTerm: string;
  filteredServices: Service[];
  isSearching: boolean;
  shouldPulseHighlighted: boolean;
}

export interface UseKeyboardSearchResult {
  searchState: SearchState;
  // eslint-disable-next-line no-unused-vars
  handleKeyPress: (event: KeyboardEvent) => void;
  navigateToFirstMatch: () => void;
}

// Updated component prop interfaces with search support
export interface ServiceCardProps {
  service: Service;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  shouldPulse?: boolean;
}

export interface ServiceGridProps {
  services: Service[];
  searchState?: SearchState;
}

export interface SearchOverlayProps {
  searchTerm: string;
  isVisible: boolean;
}

// Utility types
export type LucideIconName = 
  | 'Server'
  | 'Database'
  | 'Code'
  | 'Monitor'
  | 'Container'
  | 'Folder'
  | 'Play'
  | 'Shield'
  | 'Globe'
  | 'Terminal'
  | 'HardDrive'
  | 'Network';