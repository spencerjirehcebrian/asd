import yaml from 'js-yaml';
import { AppSettings, GitHubRepoConfig, LocalConfig, ConfigSource, ServicesConfig, SettingsValidationResult } from '../types';

const SETTINGS_KEY = 'asd_app_settings';

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  activeSource: 'github',
  githubConfig: {
    repository: 'spencerjirehcebrian/asd',
    filePath: 'public/config/services.yml',
    token: ''
  },
  localConfig: {
    yamlContent: '',
    lastModified: 0
  }
};

export class SettingsManager {
  private settings: AppSettings = DEFAULT_SETTINGS;

  constructor() {
    this.loadSettings();
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppSettings;
        
        // Merge with defaults to handle missing properties
        this.settings = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          githubConfig: {
            ...DEFAULT_SETTINGS.githubConfig,
            ...parsed.githubConfig
          },
          localConfig: {
            ...DEFAULT_SETTINGS.localConfig,
            ...parsed.localConfig
          }
        };
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
      this.settings = DEFAULT_SETTINGS;
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }

  /**
   * Get current settings
   */
  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  /**
   * Get active source
   */
  public getActiveSource(): ConfigSource {
    return this.settings.activeSource;
  }

  /**
   * Set active source
   */
  public setActiveSource(source: ConfigSource): void {
    this.settings.activeSource = source;
    this.saveSettings();
  }

  /**
   * Get GitHub configuration
   */
  public getGitHubConfig(): GitHubRepoConfig {
    return { ...this.settings.githubConfig };
  }

  /**
   * Update GitHub configuration
   */
  public updateGitHubConfig(config: Partial<GitHubRepoConfig>): void {
    this.settings.githubConfig = {
      ...this.settings.githubConfig,
      ...config
    };
    this.saveSettings();
  }

  /**
   * Get local configuration
   */
  public getLocalConfig(): LocalConfig {
    return { ...this.settings.localConfig };
  }

  /**
   * Update local configuration
   */
  public updateLocalConfig(content: string): void {
    this.settings.localConfig = {
      yamlContent: content,
      lastModified: Date.now()
    };
    this.saveSettings();
  }

  /**
   * Validate GitHub repository format
   */
  public validateGitHubRepo(repository: string): SettingsValidationResult {
    const errors: string[] = [];
    
    if (!repository.trim()) {
      errors.push('Repository cannot be empty');
      return { isValid: false, errors };
    }

    // Check format: owner/repo
    const repoPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
    if (!repoPattern.test(repository.trim())) {
      errors.push('Repository must be in format "owner/repo"');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate file path
   */
  public validateFilePath(filePath: string): SettingsValidationResult {
    const errors: string[] = [];
    
    if (!filePath.trim()) {
      errors.push('File path cannot be empty');
      return { isValid: false, errors };
    }

    if (!filePath.endsWith('.yml') && !filePath.endsWith('.yaml')) {
      errors.push('File must have .yml or .yaml extension');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate YAML content
   */
  public validateYamlContent(content: string): SettingsValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!content.trim()) {
      errors.push('YAML content cannot be empty');
      return { isValid: false, errors };
    }

    try {
      const parsed = yaml.load(content) as ServicesConfig;
      
      if (!parsed) {
        errors.push('Invalid YAML format');
        return { isValid: false, errors };
      }

      if (!parsed.services) {
        errors.push('YAML must contain a "services" property');
      } else if (!Array.isArray(parsed.services)) {
        errors.push('Services must be an array');
      } else {
        // Validate each service
        parsed.services.forEach((service, index) => {
          if (!service.id) {
            errors.push(`Service ${index + 1}: Missing required "id" property`);
          }
          if (!service.name) {
            errors.push(`Service ${index + 1}: Missing required "name" property`);
          }
          if (!service.url) {
            errors.push(`Service ${index + 1}: Missing required "url" property`);
          }
          if (!service.description) {
            warnings.push(`Service ${index + 1}: Missing "description" property`);
          }
        });
      }

      if (!parsed.title) {
        warnings.push('Consider adding a "title" property for the dashboard');
      }

    } catch (yamlError) {
      errors.push(`YAML parsing error: ${yamlError instanceof Error ? yamlError.message : 'Unknown error'}`);
    }

    return { 
      isValid: errors.length === 0, 
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Parse YAML content to ServicesConfig
   */
  public parseYamlToConfig(content: string): ServicesConfig | null {
    try {
      const validation = this.validateYamlContent(content);
      if (!validation.isValid) {
        return null;
      }

      return yaml.load(content) as ServicesConfig;
    } catch (error) {
      console.error('Failed to parse YAML content:', error);
      return null;
    }
  }

  /**
   * Reset settings to defaults
   */
  public resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }

  /**
   * Clear all settings
   */
  public clearSettings(): void {
    try {
      localStorage.removeItem(SETTINGS_KEY);
      this.settings = { ...DEFAULT_SETTINGS };
    } catch (error) {
      console.error('Failed to clear settings:', error);
    }
  }
}

// Export default settings manager instance
export const settingsManager = new SettingsManager();