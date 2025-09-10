import { useState, useEffect, useCallback, useMemo } from 'react';
import { Settings, Trash2, Check, AlertCircle, Loader2, Github, FolderOpen, FileEdit } from 'lucide-react';
import { Modal } from './Modal';
import { YamlEditorModal } from './YamlEditorModal';
import { SettingsModalProps, SettingsSection, SettingsSectionId, ConfigSource, GitHubRepoConfig, LocalConfig } from '../../types';
import { settingsManager } from '../../utils/settingsManager';
import { useModalContext } from '../../contexts/ModalContext';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { registerModal, unregisterModal } = useModalContext();
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
  const [isYamlEditorOpen, setIsYamlEditorOpen] = useState(false);

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

  // Register/unregister modal with context
  useEffect(() => {
    if (isOpen) {
      registerModal('settings');
    } else {
      unregisterModal('settings');
    }

    // Cleanup on unmount
    return () => {
      unregisterModal('settings');
    };
  }, [isOpen, registerModal, unregisterModal]);

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

  const handleOpenYamlEditor = () => {
    setIsYamlEditorOpen(true);
  };

  const handleCloseYamlEditor = () => {
    setIsYamlEditorOpen(false);
  };

  const handleSaveFromYamlEditor = (content: string) => {
    handleLocalConfigChange(content);
    // Auto-save the configuration
    setIsSaving(true);
    settingsManager.updateLocalConfig(content);
    setTimeout(() => setIsSaving(false), 500);
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
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <IconComponent className="w-6 h-6 text-zinc-400" />
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">{currentSection.name}</h3>
                <p className="text-sm text-zinc-400 mt-1">{currentSection.description}</p>
              </div>
            </div>

            {/* Current Source Status */}
            <div className="glass-luxury rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span className="text-xs text-zinc-300">Active:</span>
                  <span className="text-xs font-medium text-zinc-100">
                    {activeSource === 'github' ? 'GitHub Repository' : 'Local Configuration'}
                  </span>
                </div>
                {activeSource === 'github' ? (
                  <Github className="w-3.5 h-3.5 text-yellow-400" />
                ) : (
                  <FolderOpen className="w-3.5 h-3.5 text-yellow-400" />
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="glass-luxury rounded-lg p-4">
              <div className="flex p-0.5 bg-zinc-800/50 rounded-md">
                <button
                  onClick={() => handleTabChange('github')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all duration-200 font-medium text-xs ${
                    activeTab === 'github'
                      ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                  }`}
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub
                </button>
                <button
                  onClick={() => handleTabChange('local')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all duration-200 font-medium text-xs ${
                    activeTab === 'local'
                      ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Local
                </button>
              </div>
            </div>

            {/* Dynamic Content */}
            <div className="min-h-[320px]">
              {activeTab === 'github' ? (
                <div className="glass-luxury rounded-lg p-5">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-yellow-600/10 border border-yellow-600/20">
                        <Github className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-medium text-zinc-100 mb-1">GitHub Repository</h4>
                        <p className="text-xs text-zinc-400 mb-4">
                          Configure your GitHub repository to fetch service configurations automatically.
                        </p>

                        <div className="space-y-3">
                          {/* Repository Field */}
                          <div>
                            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                              Repository (owner/repo)
                            </label>
                            <input
                              type="text"
                              value={githubConfig.repository}
                              onChange={(e) => handleGitHubConfigChange('repository', e.target.value)}
                              placeholder="spencerjirehcebrian/asd"
                              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500/50"
                            />
                          </div>

                          {/* File Path Field */}
                          <div>
                            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                              Configuration File Path
                            </label>
                            <input
                              type="text"
                              value={githubConfig.filePath}
                              onChange={(e) => handleGitHubConfigChange('filePath', e.target.value)}
                              placeholder="public/config/services.yml"
                              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500/50"
                            />
                          </div>

                          {/* Token Field */}
                          <div>
                            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                              GitHub Token (Optional, for private repositories)
                            </label>
                            <input
                              type="password"
                              value={githubConfig.token}
                              onChange={(e) => handleGitHubConfigChange('token', e.target.value)}
                              placeholder="ghp_..."
                              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500/50"
                            />
                          </div>

                          {/* Test Connection Button */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleTestConnection}
                              disabled={isTestingConnection || !githubConfig.repository}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:opacity-50 text-zinc-900 rounded-md transition-colors duration-200 font-medium text-xs"
                            >
                              {isTestingConnection ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : connectionStatus === 'success' ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : connectionStatus === 'error' ? (
                                <AlertCircle className="w-3.5 h-3.5" />
                              ) : (
                                <Github className="w-3.5 h-3.5" />
                              )}
                              {isTestingConnection ? 'Testing...' : 'Test Connection'}
                            </button>
                            
                            {connectionStatus === 'success' && (
                              <span className="text-yellow-400 text-xs flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                Repository accessible
                              </span>
                            )}
                          </div>

                          {/* Source Activation Button */}
                          <div className="pt-3 border-t border-zinc-700/30">
                            {activeSource === 'github' ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 px-3 py-2 bg-yellow-600/10 border border-yellow-600/20 rounded-md">
                                  <Check className="w-3.5 h-3.5 text-yellow-400" />
                                  <span className="text-yellow-300 font-medium text-xs">Active Source</span>
                                </div>
                                <span className="text-zinc-400 text-xs">
                                  This GitHub repository is actively being used
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSourceActivation('github')}
                                disabled={!githubConfig.repository || !githubConfig.filePath}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:opacity-50 text-zinc-900 rounded-md transition-colors duration-200 font-medium text-xs"
                              >
                                <Github className="w-3.5 h-3.5" />
                                Use GitHub as Source
                              </button>
                            )}
                          </div>

                          {/* Validation Errors */}
                          {validationErrors.length > 0 && (
                            <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-md">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="text-red-300 text-xs">
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
                <div className="glass-luxury rounded-lg p-5">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-yellow-600/10 border border-yellow-600/20">
                        <FolderOpen className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-medium text-zinc-100 mb-1">Local YAML Configuration</h4>
                        <p className="text-xs text-zinc-400 mb-4">
                          Edit your service configuration directly. Import from GitHub or create your own YAML configuration.
                        </p>

                        <div className="space-y-3">
                          {/* Action Buttons */}
                          <div className="flex gap-3 flex-wrap">
                            <button
                              onClick={handleImportFromGitHub}
                              disabled={!githubConfig.repository || !githubConfig.filePath}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:opacity-50 text-zinc-900 rounded-md transition-colors duration-200 font-medium text-xs"
                            >
                              <Github className="w-3.5 h-3.5" />
                              Import from GitHub
                            </button>
                            
                            <button
                              onClick={handleOpenYamlEditor}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border border-zinc-600/50 rounded-md transition-colors duration-200 font-medium text-xs"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                              Open Editor
                            </button>
                          </div>

                          {localConfig.lastModified > 0 && (
                            <div className="text-zinc-400 text-xs">
                              Last modified: {new Date(localConfig.lastModified).toLocaleString()}
                            </div>
                          )}

                          {/* Inline YAML Editor */}
                          <div>
                            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
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
                              className="w-full h-48 px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500/50 font-mono text-xs resize-none"
                            />
                          </div>

                          {/* Success Message - moved above Save button */}
                          {localConfig.yamlContent && validationErrors.length === 0 && (
                            <div className="p-3 bg-yellow-600/10 border border-yellow-600/20 rounded-md">
                              <div className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div className="text-yellow-300 text-xs">
                                  Configuration is valid and ready to use.
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Save Button */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleSaveLocalConfig}
                              disabled={!localConfig.yamlContent.trim() || validationErrors.length > 0 || isSaving}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:opacity-50 text-zinc-900 rounded-md transition-colors duration-200 font-medium text-xs"
                            >
                              {isSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              {isSaving ? 'Saving...' : 'Save Configuration'}
                            </button>
                          </div>

                          {/* Source Activation Button */}
                          <div className="pt-3 border-t border-zinc-700/30">
                            {activeSource === 'local' ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 px-3 py-2 bg-yellow-600/10 border border-yellow-600/20 rounded-md">
                                  <Check className="w-3.5 h-3.5 text-yellow-400" />
                                  <span className="text-yellow-300 font-medium text-xs">Active Source</span>
                                </div>
                                <span className="text-zinc-400 text-xs">
                                  This local configuration is actively being used
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSourceActivation('local')}
                                disabled={!localConfig.yamlContent.trim() || validationErrors.length > 0}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:opacity-50 text-zinc-900 rounded-md transition-colors duration-200 font-medium text-xs"
                              >
                                <FolderOpen className="w-3.5 h-3.5" />
                                Use Local as Source
                              </button>
                            )}
                          </div>

                          {/* Validation Errors */}
                          {validationErrors.length > 0 && (
                            <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-md">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="text-red-300 text-xs">
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
              )}
            </div>
          </div>
        );

      case 'cache':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <IconComponent className="w-6 h-6 text-zinc-400" />
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">{currentSection.name}</h3>
                <p className="text-sm text-zinc-400 mt-1">{currentSection.description}</p>
              </div>
            </div>
            <div className="glass-luxury rounded-lg p-5">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-600/10 border border-red-600/20">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-medium text-zinc-100 mb-1">Clear Application Cache</h4>
                    <p className="text-xs text-zinc-400 mb-3">
                      This will remove all cached service data and force a fresh reload of your configuration. 
                      The application will restart and fetch the latest service definitions.
                    </p>
                    <p className="text-amber-400 text-xs mb-4 font-medium">
                      ⚠️ This action will refresh the entire page and reload all services.
                    </p>
                    <button
                      onClick={handleClearCache}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 font-medium text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Settings">
        <div className="flex h-[500px]">
          {/* Left Sidebar Navigation */}
          <div className="w-48 border-r border-zinc-800/30 pr-4">
            <nav className="space-y-1">
              {sections.map((section) => {
                const IconComponent = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200 text-sm ${
                      isActive
                        ? 'bg-zinc-800/60 text-zinc-100 border border-yellow-500/30'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-yellow-400' : 'text-zinc-500'}`} />
                    <span className="font-medium">{section.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 pl-4 overflow-y-auto">
            {renderSectionContent()}
          </div>
        </div>
      </Modal>

      {/* YAML Editor Modal */}
      <YamlEditorModal
        isOpen={isYamlEditorOpen}
        onClose={handleCloseYamlEditor}
        initialContent={localConfig.yamlContent}
        onSave={handleSaveFromYamlEditor}
        title="YAML Configuration Editor"
      />
    </>
  );
};