import { useState, useEffect, useCallback, useMemo } from 'react';
import { Settings, Trash2, Check, AlertCircle, Loader2, Github, FolderOpen } from 'lucide-react';
import { Modal } from './Modal';
import { SettingsModalProps, SettingsSection, SettingsSectionId, ConfigSource, GitHubRepoConfig, LocalConfig } from '../../types';
import { settingsManager } from '../../utils/settingsManager';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('configuration');
  
  // Settings state
  const [activeSource, setActiveSource] = useState<ConfigSource>('github');
  const [activeTab, setActiveTab] = useState<ConfigSource>('github');
  const [githubConfig, setGithubConfig] = useState<GitHubRepoConfig>({
    repository: '',
    filePath: '',
    token: ''
  });
  const [localConfig, setLocalConfig] = useState<LocalConfig>({
    yamlContent: '',
    lastModified: 0
  });
  
  // UI state
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Define sections configuration (memoized to prevent dependency issues)
  const sections: SettingsSection[] = useMemo(() => [
    {
      id: 'configuration',
      name: 'Configuration',
      icon: Settings,
      description: 'Configure GitHub repository or local YAML settings for service data.'
    },
    {
      id: 'cache',
      name: 'Clear Cache',
      icon: Trash2,
      description: 'Clear cached services and refresh the application.'
    }
  ], []);

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen) {
      const settings = settingsManager.getSettings();
      setActiveSource(settings.activeSource);
      setActiveTab(settings.activeSource); // Start viewing the currently active source
      setGithubConfig(settings.githubConfig);
      setLocalConfig(settings.localConfig);
      setActiveSection('configuration');
      setValidationErrors([]);
      setConnectionStatus('idle');
    }
  }, [isOpen]);

  // Tab navigation (separate from source activation)
  const handleTabChange = (tab: ConfigSource) => {
    setActiveTab(tab);
    setValidationErrors([]); // Clear errors when switching tabs
    setConnectionStatus('idle');
  };

  // Source activation (actually changes the active source)
  const handleSourceActivation = (source: ConfigSource) => {
    setActiveSource(source);
    settingsManager.setActiveSource(source);
    // Clear any existing errors/status when switching sources
    setValidationErrors([]);
    setConnectionStatus('idle');
  };

  // GitHub config handlers
  const handleGitHubConfigChange = (field: keyof GitHubRepoConfig, value: string) => {
    const newConfig = { ...githubConfig, [field]: value };
    setGithubConfig(newConfig);
    settingsManager.updateGitHubConfig({ [field]: value });
    setConnectionStatus('idle');
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    
    // Validate repository format
    const repoValidation = settingsManager.validateGitHubRepo(githubConfig.repository);
    const pathValidation = settingsManager.validateFilePath(githubConfig.filePath);
    
    if (!repoValidation.isValid || !pathValidation.isValid) {
      setValidationErrors([...repoValidation.errors, ...pathValidation.errors]);
      setConnectionStatus('error');
      setIsTestingConnection(false);
      return;
    }

    try {
      // Simple connectivity test - try to fetch repository info
      const url = `https://api.github.com/repos/${githubConfig.repository}`;
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ASD-Dashboard/1.0'
      };
      
      if (githubConfig.token) {
        headers['Authorization'] = `token ${githubConfig.token}`;
      }

      const response = await fetch(url, { headers });
      
      if (response.ok) {
        setConnectionStatus('success');
        setValidationErrors([]);
      } else {
        setConnectionStatus('error');
        setValidationErrors([`Repository not accessible (${response.status})`]);
      }
    } catch (error) {
      setConnectionStatus('error');
      setValidationErrors(['Network error: Could not connect to GitHub']);
    }
    
    setIsTestingConnection(false);
  };

  // Local config handlers
  const handleLocalConfigChange = (content: string) => {
    setLocalConfig({
      yamlContent: content,
      lastModified: Date.now()
    });
    
    // Validate YAML content
    const validation = settingsManager.validateYamlContent(content);
    setValidationErrors(validation.errors);
  };

  const handleSaveLocalConfig = () => {
    setIsSaving(true);
    settingsManager.updateLocalConfig(localConfig.yamlContent);
    setTimeout(() => setIsSaving(false), 500); // Brief loading state
  };

  const handleImportFromGitHub = async () => {
    if (!githubConfig.repository || !githubConfig.filePath) {
      setValidationErrors(['Repository and file path must be configured first']);
      return;
    }

    try {
      const url = `https://api.github.com/repos/${githubConfig.repository}/contents/${githubConfig.filePath}`;
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ASD-Dashboard/1.0'
      };
      
      if (githubConfig.token) {
        headers['Authorization'] = `token ${githubConfig.token}`;
      }

      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const fileData = await response.json();
        const content = atob(fileData.content.replace(/\s/g, ''));
        handleLocalConfigChange(content);
        setValidationErrors([]);
      } else {
        setValidationErrors([`Failed to fetch file: ${response.status} ${response.statusText}`]);
      }
    } catch (error) {
      setValidationErrors(['Failed to import from GitHub: Network error']);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem('asd_services_cache');
    sessionStorage.removeItem('asd_services_cache');
    window.location.reload();
  };

  const handleKeyNavigation = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    const currentIndex = sections.findIndex(section => section.id === activeSection);
    
    if (event.key === 'ArrowUp' && currentIndex > 0) {
      event.preventDefault();
      setActiveSection(sections[currentIndex - 1].id);
    } else if (event.key === 'ArrowDown' && currentIndex < sections.length - 1) {
      event.preventDefault();
      setActiveSection(sections[currentIndex + 1].id);
    }
  }, [isOpen, activeSection, sections]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyNavigation);
    return () => document.removeEventListener('keydown', handleKeyNavigation);
  }, [handleKeyNavigation]);

  const renderSectionContent = () => {
    const currentSection = sections.find(section => section.id === activeSection);
    if (!currentSection) return null;

    const IconComponent = currentSection.icon;

    switch (activeSection) {
      case 'configuration':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <IconComponent className="w-8 h-8 text-zinc-400" />
              <div>
                <h3 className="text-2xl font-semibold text-zinc-100">{currentSection.name}</h3>
                <p className="text-zinc-400 mt-1">{currentSection.description}</p>
              </div>
            </div>

            {/* Current Source Status */}
            <div className="border border-zinc-800/50 rounded-xl p-4 bg-zinc-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-zinc-300">Currently Active:</span>
                  <span className="text-sm font-medium text-zinc-100">
                    {activeSource === 'github' ? 'GitHub Repository' : 'Local Configuration'}
                  </span>
                </div>
                {activeSource === 'github' ? (
                  <Github className="w-4 h-4 text-blue-400" />
                ) : (
                  <FolderOpen className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border border-zinc-800/50 rounded-xl p-6 bg-zinc-900/30">
              <div className="flex p-1 bg-zinc-800/50 rounded-lg">
                <button
                  onClick={() => handleTabChange('github')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-200 font-medium text-sm ${
                    activeTab === 'github'
                      ? 'bg-zinc-700 text-zinc-100 shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                  }`}
                >
                  <Github className="w-4 h-4" />
                  GitHub Repository
                  {activeSource === 'github' && (
                    <span className="ml-1 text-xs px-1.5 py-0.5 bg-green-500 text-white rounded-full">
                      ACTIVE
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleTabChange('local')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-200 font-medium text-sm ${
                    activeTab === 'local'
                      ? 'bg-zinc-700 text-zinc-100 shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  Local Configuration
                  {activeSource === 'local' && (
                    <span className="ml-1 text-xs px-1.5 py-0.5 bg-green-500 text-white rounded-full">
                      ACTIVE
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Dynamic Content */}
            <div className="min-h-[400px]">
              {activeTab === 'github' ? (
                <div className="border border-zinc-800/50 rounded-xl p-8 bg-zinc-900/30">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-600/20">
                        <Github className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-zinc-100 mb-2">GitHub Repository</h4>
                        <p className="text-zinc-400 text-sm mb-6">
                          Configure your GitHub repository to fetch service configurations automatically.
                        </p>

                        <div className="space-y-4">
                          {/* Repository Field */}
                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              Repository (owner/repo)
                            </label>
                            <input
                              type="text"
                              value={githubConfig.repository}
                              onChange={(e) => handleGitHubConfigChange('repository', e.target.value)}
                              placeholder="spencerjirehcebrian/asd"
                              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* File Path Field */}
                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              Configuration File Path
                            </label>
                            <input
                              type="text"
                              value={githubConfig.filePath}
                              onChange={(e) => handleGitHubConfigChange('filePath', e.target.value)}
                              placeholder="public/config/services.yml"
                              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Token Field */}
                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              GitHub Token (Optional, for private repositories)
                            </label>
                            <input
                              type="password"
                              value={githubConfig.token}
                              onChange={(e) => handleGitHubConfigChange('token', e.target.value)}
                              placeholder="ghp_..."
                              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Test Connection Button */}
                          <div className="flex items-center gap-4">
                            <button
                              onClick={handleTestConnection}
                              disabled={isTestingConnection || !githubConfig.repository}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-200 font-medium"
                            >
                              {isTestingConnection ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : connectionStatus === 'success' ? (
                                <Check className="w-4 h-4" />
                              ) : connectionStatus === 'error' ? (
                                <AlertCircle className="w-4 h-4" />
                              ) : (
                                <Github className="w-4 h-4" />
                              )}
                              {isTestingConnection ? 'Testing...' : 'Test Connection'}
                            </button>
                            
                            {connectionStatus === 'success' && (
                              <span className="text-green-400 text-sm flex items-center gap-1">
                                <Check className="w-4 h-4" />
                                Repository accessible
                              </span>
                            )}
                          </div>

                          {/* Source Activation Button */}
                          <div className="pt-4 border-t border-zinc-700/50">
                            {activeSource === 'github' ? (
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-3 bg-green-600/10 border border-green-600/20 rounded-lg">
                                  <Check className="w-5 h-5 text-green-400" />
                                  <span className="text-green-300 font-medium">Currently Active Source</span>
                                </div>
                                <span className="text-zinc-400 text-sm">
                                  This GitHub repository is actively being used for service data
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSourceActivation('github')}
                                disabled={!githubConfig.repository || !githubConfig.filePath}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-200 font-medium"
                              >
                                <Github className="w-5 h-5" />
                                Use GitHub as Source
                              </button>
                            )}
                          </div>

                          {/* Validation Errors */}
                          {validationErrors.length > 0 && (
                            <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="text-red-300 text-sm">
                                  {validationErrors.map((error, index) => (
                                    <div key={index}>{error}</div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-zinc-800/50 rounded-xl p-8 bg-zinc-900/30">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-green-600/10 border border-green-600/20">
                        <FolderOpen className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-zinc-100 mb-2">Local YAML Configuration</h4>
                        <p className="text-zinc-400 text-sm mb-6">
                          Edit your service configuration directly. Import from GitHub or create your own YAML configuration.
                        </p>

                        <div className="space-y-4">
                          {/* Import Button */}
                          <div className="flex gap-3">
                            <button
                              onClick={handleImportFromGitHub}
                              disabled={!githubConfig.repository || !githubConfig.filePath}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
                            >
                              <Github className="w-4 h-4" />
                              Import from GitHub
                            </button>
                            {localConfig.lastModified > 0 && (
                              <span className="text-zinc-400 text-sm flex items-center">
                                Last modified: {new Date(localConfig.lastModified).toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* YAML Editor */}
                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              YAML Configuration
                            </label>
                            <textarea
                              value={localConfig.yamlContent}
                              onChange={(e) => handleLocalConfigChange(e.target.value)}
                              placeholder={`title: "My Services Dashboard"
services:
  - id: "example"
    name: "Example Service"
    description: "An example service configuration"
    url: "https://example.com"
    category: "tools"`}
                              className="w-full h-64 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm resize-none"
                            />
                          </div>

                          {/* Save Button */}
                          <div className="flex items-center gap-4">
                            <button
                              onClick={handleSaveLocalConfig}
                              disabled={!localConfig.yamlContent.trim() || validationErrors.length > 0 || isSaving}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-200 font-medium"
                            >
                              {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              {isSaving ? 'Saving...' : 'Save Configuration'}
                            </button>
                          </div>

                          {/* Source Activation Button */}
                          <div className="pt-4 border-t border-zinc-700/50">
                            {activeSource === 'local' ? (
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-3 bg-green-600/10 border border-green-600/20 rounded-lg">
                                  <Check className="w-5 h-5 text-green-400" />
                                  <span className="text-green-300 font-medium">Currently Active Source</span>
                                </div>
                                <span className="text-zinc-400 text-sm">
                                  This local configuration is actively being used for service data
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSourceActivation('local')}
                                disabled={!localConfig.yamlContent.trim() || validationErrors.length > 0}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-200 font-medium"
                              >
                                <FolderOpen className="w-5 h-5" />
                                Use Local as Source
                              </button>
                            )}
                          </div>

                          {/* Validation Errors */}
                          {validationErrors.length > 0 && (
                            <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="text-red-300 text-sm">
                                  {validationErrors.map((error, index) => (
                                    <div key={index}>{error}</div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Success Message */}
                          {localConfig.yamlContent && validationErrors.length === 0 && (
                            <div className="p-4 bg-green-600/10 border border-green-600/20 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <div className="text-green-300 text-sm">
                                  Configuration is valid and ready to use.
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'cache':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <IconComponent className="w-8 h-8 text-zinc-400" />
              <div>
                <h3 className="text-2xl font-semibold text-zinc-100">{currentSection.name}</h3>
                <p className="text-zinc-400 mt-1">{currentSection.description}</p>
              </div>
            </div>
            <div className="border border-zinc-800/50 rounded-xl p-8 bg-zinc-900/30">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-red-600/10 border border-red-600/20">
                    <Trash2 className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-zinc-100 mb-2">Clear Application Cache</h4>
                    <p className="text-zinc-400 text-sm mb-4">
                      This will remove all cached service data and force a fresh reload of your configuration. 
                      The application will restart and fetch the latest service definitions.
                    </p>
                    <p className="text-amber-400 text-sm mb-6 font-medium">
                      ⚠️ This action will refresh the entire page and reload all services.
                    </p>
                    <button
                      onClick={handleClearCache}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Cache & Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="flex h-[600px]">
        {/* Left Sidebar Navigation */}
        <div className="w-64 border-r border-zinc-800/50 pr-6">
          <nav className="space-y-2">
            {sections.map((section) => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-zinc-800/60 text-zinc-100 border border-zinc-700/50'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-zinc-300' : 'text-zinc-500'}`} />
                  <span className="font-medium">{section.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 pl-6 overflow-y-auto">
          {renderSectionContent()}
        </div>
      </div>
    </Modal>
  );
};