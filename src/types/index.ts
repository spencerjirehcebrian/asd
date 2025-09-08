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

// Component prop interfaces
export interface ServiceCardProps {
  service: Service;
}

export interface ServiceGridProps {
  services: Service[];
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