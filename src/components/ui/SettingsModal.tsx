import { useState, useEffect, useCallback } from 'react';
import { Github, FolderOpen, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { SettingsModalProps, SettingsSection, SettingsSectionId } from '../../types';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('github');

  // Define sections configuration
  const sections: SettingsSection[] = [
    {
      id: 'github',
      name: 'GitHub Source',
      icon: Github,
      description: 'Configure GitHub repository settings for service configuration.'
    },
    {
      id: 'local',
      name: 'Local Source',
      icon: FolderOpen,
      description: 'Manage local configuration files and settings.'
    },
    {
      id: 'cache',
      name: 'Clear Cache',
      icon: Trash2,
      description: 'Clear cached services and refresh the application.'
    }
  ];

  // Reset to first section when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveSection('github');
    }
  }, [isOpen]);

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
      case 'github':
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
              <div className="text-center py-12">
                <Github className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-zinc-300 mb-2">GitHub Integration</h4>
                <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">
                  Connect to a GitHub repository to automatically sync your service configurations. 
                  This feature will allow real-time updates from your repository.
                </p>
                <div className="text-zinc-500 text-sm italic">
                  Coming soon...
                </div>
              </div>
            </div>
          </div>
        );

      case 'local':
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
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-zinc-300 mb-2">Local Configuration</h4>
                <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">
                  Manage your local YAML and JSON configuration files. Upload, edit, and organize 
                  your service definitions directly from your local system.
                </p>
                <div className="text-zinc-500 text-sm italic">
                  Coming soon...
                </div>
              </div>
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