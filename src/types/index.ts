// Enhanced service interface with optional metadata
export interface Service {
  id: string;
  name: string;
  description: string;
  url: string;
  category?: string;
}

// Configuration file structure for both JSON and YAML
export interface ServicesConfig {
  title?: string;
  services: Service[];
}

// GitHub API response types
export interface GitHubFileResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

// Cache structure for localStorage
export interface CacheEntry {
  data: ServicesConfig;
  timestamp: number;
  etag?: string;
  source: 'github_api' | 'local_yaml' | 'local_json';
  ttl: number;
}

// Cache manager configuration
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  key: string; // localStorage key
  enableSessionStorage: boolean;
  enableMemoryCache: boolean;
}

// Hook return type
export interface UseServicesResult {
  services: Service[];
  title?: string;
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
  focusedIndex: number;
  focusedService: Service | null;
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
  isFocused?: boolean;
  shouldShowShimmer?: boolean;
  onSettingsClick?: () => void;
}

export interface ServiceGridProps {
  services: Service[];
  searchState?: SearchState;
  onSettingsClick?: () => void;
}

export interface SearchOverlayProps {
  searchTerm: string;
  isVisible: boolean;
}

// Modal interfaces
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface YamlEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent: string;
  onSave: (content: string) => void;
  title?: string;
}

// Settings section types
export type SettingsSectionId = 'configuration' | 'cache';

export interface SettingsSection {
  id: SettingsSectionId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

// Settings system types
export type ConfigSource = 'github' | 'local';

export interface GitHubRepoConfig {
  repository: string; // format: "owner/repo"
  filePath: string;
  token?: string;
}

export interface LocalConfig {
  yamlContent: string;
  lastModified: number;
}

export interface AppSettings {
  activeSource: ConfigSource;
  githubConfig: GitHubRepoConfig;
  localConfig: LocalConfig;
}

export interface SettingsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Utility types  
export type LucideIconName = 
  | 'Sun'
  | 'Moon'
  | 'Star'
  | 'Heart'
  | 'Flower'
  | 'Coffee'
  | 'Gem'
  | 'Leaf'
  | 'Sparkles'
  | 'Zap'
  | 'Cloud'
  | 'Snowflake'
  | 'Flame'
  | 'TreePine'
  | 'Cherry'
  | 'Feather'
  | 'Music'
  | 'Palette'
  | 'Compass'
  | 'Anchor'
  | 'Crown'
  | 'Clover'
  | 'Flower2'
  | 'Gift'
  | 'Magnet'
  | 'Scissors'
  | 'Shell'
  | 'Umbrella'
  | 'Waves'
  | 'Wind'
  | 'Apple'
  | 'Bird'
  | 'Fish'
  | 'Key'
  | 'Mountain'
  | 'Puzzle'
  | 'Sailboat'
  | 'Trophy'
  | 'Wand2';