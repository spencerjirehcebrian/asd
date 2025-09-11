import { useState, useEffect, useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { EditorView } from '@codemirror/view';
import { glassThemeExtensions } from '../../utils/codemirrorTheme';
import {
  Settings,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  Github,
  FolderOpen,
  FileEdit,
} from 'lucide-react';
import { Modal } from './Modal';
import { YamlEditorModal } from './YamlEditorModal';
import {
  SettingsModalProps,
  SettingsSection,
  SettingsSectionId,
  ConfigSource,
  GitHubRepoConfig,
  LocalConfig,
} from '../../types';
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
    token: '',
  });
  const [localConfig, setLocalConfig] = useState<LocalConfig>({
    yamlContent: '',
    lastModified: 0,
  });

  // UI state
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isYamlEditorOpen, setIsYamlEditorOpen] = useState(false);

  // Define sections configuration (memoized to prevent dependency issues)
  const sections: SettingsSection[] = useMemo(
    () => [
      {
        id: 'configuration',
        name: 'Configuration',
        icon: Settings,
        description: 'Configure GitHub repository or local YAML settings for service data.',
      },
      {
        id: 'cache',
        name: 'Clear Cache',
        icon: Trash2,
        description: 'Clear cached services and refresh the application.',
      },
    ],
    []
  );

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
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'ASD-Dashboard/1.0',
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
      lastModified: Date.now(),
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

  // CodeMirror extensions for inline editor with syntax highlighting
  const inlineExtensions = [yaml(), ...glassThemeExtensions, EditorView.lineWrapping];

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
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'ASD-Dashboard/1.0',
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

  const handleKeyNavigation = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      const currentIndex = sections.findIndex((section) => section.id === activeSection);

      if (event.key === 'ArrowUp' && currentIndex > 0) {
        event.preventDefault();
        setActiveSection(sections[currentIndex - 1].id);
      } else if (event.key === 'ArrowDown' && currentIndex < sections.length - 1) {
        event.preventDefault();
        setActiveSection(sections[currentIndex + 1].id);
      }
    },
    [isOpen, activeSection, sections]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyNavigation);
    return () => document.removeEventListener('keydown', handleKeyNavigation);
  }, [handleKeyNavigation]);

  const renderSectionContent = () => {
    const currentSection = sections.find((section) => section.id === activeSection);
    if (!currentSection) return null;

    const IconComponent = currentSection.icon;

    switch (activeSection) {
      case 'configuration':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <IconComponent className="h-6 w-6 text-zinc-400" />
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">{currentSection.name}</h3>
                <p className="mt-1 text-sm text-zinc-400">{currentSection.description}</p>
              </div>
            </div>

            {/* Current Source Status */}
            <div className="glass-luxury rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-400"></div>
                  <span className="text-xs text-zinc-300">Active:</span>
                  <span className="text-xs font-medium text-zinc-100">
                    {activeSource === 'github' ? 'GitHub Repository' : 'Local Configuration'}
                  </span>
                </div>
                {activeSource === 'github' ? (
                  <Github className="h-3.5 w-3.5 text-yellow-400" />
                ) : (
                  <FolderOpen className="h-3.5 w-3.5 text-yellow-400" />
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="glass-luxury rounded-lg p-4">
              <div className="flex rounded-md bg-zinc-800/50 p-0.5">
                <button
                  onClick={() => handleTabChange('github')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    activeTab === 'github'
                      ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                      : 'text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
                  }`}
                >
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </button>
                <button
                  onClick={() => handleTabChange('local')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    activeTab === 'local'
                      ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                      : 'text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
                  }`}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
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
                      <div className="rounded-lg border border-yellow-600/20 bg-yellow-600/10 p-2">
                        <Github className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-1 text-base font-medium text-zinc-100">
                          GitHub Repository
                        </h4>
                        <p className="mb-4 text-xs text-zinc-400">
                          Configure your GitHub repository to fetch service configurations
                          automatically.
                        </p>

                        <div className="space-y-3">
                          {/* Repository Field */}
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                              Repository (owner/repo)
                            </label>
                            <input
                              type="text"
                              value={githubConfig.repository}
                              onChange={(e) =>
                                handleGitHubConfigChange('repository', e.target.value)
                              }
                              placeholder="spencerjirehcebrian/asd"
                              className="w-full rounded-md border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            />
                          </div>

                          {/* File Path Field */}
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                              Configuration File Path
                            </label>
                            <input
                              type="text"
                              value={githubConfig.filePath}
                              onChange={(e) => handleGitHubConfigChange('filePath', e.target.value)}
                              placeholder="public/config/services.yml"
                              className="w-full rounded-md border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            />
                          </div>

                          {/* Token Field */}
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                              GitHub Token (Optional, for private repositories)
                            </label>
                            <input
                              type="password"
                              value={githubConfig.token}
                              onChange={(e) => handleGitHubConfigChange('token', e.target.value)}
                              placeholder="ghp_..."
                              className="w-full rounded-md border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            />
                          </div>

                          {/* Test Connection Button */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleTestConnection}
                              disabled={isTestingConnection || !githubConfig.repository}
                              className="inline-flex items-center gap-1.5 rounded-md bg-yellow-600 px-4 py-2 text-xs font-medium text-zinc-900 transition-colors duration-200 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:opacity-50"
                            >
                              {isTestingConnection ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : connectionStatus === 'success' ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : connectionStatus === 'error' ? (
                                <AlertCircle className="h-3.5 w-3.5" />
                              ) : (
                                <Github className="h-3.5 w-3.5" />
                              )}
                              {isTestingConnection ? 'Testing...' : 'Test Connection'}
                            </button>

                            {connectionStatus === 'success' && (
                              <span className="flex items-center gap-1 text-xs text-yellow-400">
                                <Check className="h-3.5 w-3.5" />
                                Repository accessible
                              </span>
                            )}
                          </div>

                          {/* Source Activation Button */}
                          <div className="border-t border-zinc-700/30 pt-3">
                            {activeSource === 'github' ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 rounded-md border border-yellow-600/20 bg-yellow-600/10 px-3 py-2">
                                  <Check className="h-3.5 w-3.5 text-yellow-400" />
                                  <span className="text-xs font-medium text-yellow-300">
                                    Active Source
                                  </span>
                                </div>
                                <span className="text-xs text-zinc-400">
                                  This GitHub repository is actively being used
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSourceActivation('github')}
                                disabled={!githubConfig.repository || !githubConfig.filePath}
                                className="inline-flex items-center gap-1.5 rounded-md bg-yellow-600 px-4 py-2 text-xs font-medium text-zinc-900 transition-colors duration-200 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:opacity-50"
                              >
                                <Github className="h-3.5 w-3.5" />
                                Use GitHub as Source
                              </button>
                            )}
                          </div>

                          {/* Validation Errors */}
                          {validationErrors.length > 0 && (
                            <div className="rounded-md border border-red-600/20 bg-red-600/10 p-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
                                <div className="text-xs text-red-300">
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
                      <div className="rounded-lg border border-yellow-600/20 bg-yellow-600/10 p-2">
                        <FolderOpen className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-1 text-base font-medium text-zinc-100">
                          Local YAML Configuration
                        </h4>
                        <p className="mb-4 text-xs text-zinc-400">
                          Edit your service configuration directly. Import from GitHub or create
                          your own YAML configuration.
                        </p>

                        <div className="space-y-3">
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={handleImportFromGitHub}
                              disabled={!githubConfig.repository || !githubConfig.filePath}
                              className="inline-flex items-center gap-1.5 rounded-md bg-yellow-600 px-3 py-2 text-xs font-medium text-zinc-900 transition-colors duration-200 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:opacity-50"
                            >
                              <Github className="h-3.5 w-3.5" />
                              Import from GitHub
                            </button>

                            <button
                              onClick={handleOpenYamlEditor}
                              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-600/50 bg-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200 transition-colors duration-200 hover:bg-zinc-600"
                            >
                              <FileEdit className="h-3.5 w-3.5" />
                              Open Editor
                            </button>
                          </div>

                          {localConfig.lastModified > 0 && (
                            <div className="text-xs text-zinc-400">
                              Last modified: {new Date(localConfig.lastModified).toLocaleString()}
                            </div>
                          )}

                          {/* Inline YAML Editor */}
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                              YAML Configuration
                            </label>
                            <div className="h-48 w-full rounded-md border border-zinc-700/50 overflow-hidden focus-within:ring-1 focus-within:ring-yellow-500 focus-within:border-yellow-500/50">
                              <CodeMirror
                                value={localConfig.yamlContent}
                                onChange={(value) => handleLocalConfigChange(value)}
                                extensions={inlineExtensions}
                                placeholder={`title: "My Services Dashboard"
services:
  - id: "example"
    name: "Example Service"
    description: "An example service configuration"
    url: "https://example.com"
    category: "tools"`}
                                basicSetup={{
                                  lineNumbers: true,
                                  foldGutter: false,
                                  dropCursor: false,
                                  allowMultipleSelections: false,
                                  indentOnInput: true,
                                  bracketMatching: true,
                                  closeBrackets: true,
                                  autocompletion: true,
                                  highlightSelectionMatches: false,
                                }}
                                height="192px"
                                style={{
                                  height: '192px',
                                  width: '100%',
                                  maxWidth: '100%',
                                  overflow: 'hidden',
                                }}
                              />
                            </div>
                          </div>

                          {/* Success Message - moved above Save button */}
                          {localConfig.yamlContent && validationErrors.length === 0 && (
                            <div className="rounded-md border border-yellow-600/20 bg-yellow-600/10 p-3">
                              <div className="flex items-start gap-2">
                                <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-yellow-400" />
                                <div className="text-xs text-yellow-300">
                                  Configuration is valid and ready to use.
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Save Button */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleSaveLocalConfig}
                              disabled={
                                !localConfig.yamlContent.trim() ||
                                validationErrors.length > 0 ||
                                isSaving
                              }
                              className="inline-flex items-center gap-1.5 rounded-md bg-yellow-600 px-4 py-2 text-xs font-medium text-zinc-900 transition-colors duration-200 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:opacity-50"
                            >
                              {isSaving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              {isSaving ? 'Saving...' : 'Save Configuration'}
                            </button>
                          </div>

                          {/* Source Activation Button */}
                          <div className="border-t border-zinc-700/30 pt-3">
                            {activeSource === 'local' ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 rounded-md border border-yellow-600/20 bg-yellow-600/10 px-3 py-2">
                                  <Check className="h-3.5 w-3.5 text-yellow-400" />
                                  <span className="text-xs font-medium text-yellow-300">
                                    Active Source
                                  </span>
                                </div>
                                <span className="text-xs text-zinc-400">
                                  This local configuration is actively being used
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSourceActivation('local')}
                                disabled={
                                  !localConfig.yamlContent.trim() || validationErrors.length > 0
                                }
                                className="inline-flex items-center gap-1.5 rounded-md bg-yellow-600 px-4 py-2 text-xs font-medium text-zinc-900 transition-colors duration-200 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:opacity-50"
                              >
                                <FolderOpen className="h-3.5 w-3.5" />
                                Use Local as Source
                              </button>
                            )}
                          </div>

                          {/* Validation Errors */}
                          {validationErrors.length > 0 && (
                            <div className="rounded-md border border-red-600/20 bg-red-600/10 p-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
                                <div className="text-xs text-red-300">
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
              <IconComponent className="h-6 w-6 text-zinc-400" />
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">{currentSection.name}</h3>
                <p className="mt-1 text-sm text-zinc-400">{currentSection.description}</p>
              </div>
            </div>
            <div className="glass-luxury rounded-lg p-5">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg border border-red-600/20 bg-red-600/10 p-2">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1 text-base font-medium text-zinc-100">
                      Clear Application Cache
                    </h4>
                    <p className="mb-3 text-xs text-zinc-400">
                      This will remove all cached service data and force a fresh reload of your
                      configuration. The application will restart and fetch the latest service
                      definitions.
                    </p>
                    <p className="mb-4 text-xs font-medium text-amber-400">
                      ⚠️ This action will refresh the entire page and reload all services.
                    </p>
                    <button
                      onClick={handleClearCache}
                      className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-xs font-medium text-white transition-colors duration-200 hover:bg-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${
                      isActive
                        ? 'border border-yellow-500/30 bg-zinc-800/60 text-zinc-100'
                        : 'border border-transparent text-zinc-400 hover:border-zinc-700/50 hover:bg-zinc-800/30 hover:text-zinc-200'
                    }`}
                  >
                    <IconComponent
                      className={`h-4 w-4 ${isActive ? 'text-yellow-400' : 'text-zinc-500'}`}
                    />
                    <span className="font-medium">{section.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto pl-4">{renderSectionContent()}</div>
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
