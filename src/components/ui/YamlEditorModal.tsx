import { useState, useEffect, useCallback } from 'react';
import { Check, AlertCircle, X, FileEdit, Save, FileText, Github } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { EditorView } from '@codemirror/view';
import { Modal } from './Modal';
import { YamlEditorModalProps, SettingsValidationResult } from '../../types';
import { settingsManager } from '../../utils/settingsManager';
import { useModalContext } from '../../contexts/ModalContext';
import { glassThemeExtensions } from '../../utils/codemirrorTheme';

export const YamlEditorModal: React.FC<YamlEditorModalProps> = ({ 
  isOpen, 
  onClose, 
  initialContent, 
  onSave, 
  title = "YAML Configuration Editor" 
}) => {
  const { registerModal, unregisterModal } = useModalContext();
  const [content, setContent] = useState(initialContent);
  const [validationResult, setValidationResult] = useState<SettingsValidationResult>({ isValid: true, errors: [] });
  const [hasChanges, setHasChanges] = useState(false);
  const [githubConfigured, setGithubConfigured] = useState(false);

  // Update content when modal opens with new initial content
  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setHasChanges(false);
      
      // Check GitHub configuration
      const settings = settingsManager.getSettings();
      const githubConfig = settings.githubConfig;
      setGithubConfigured(!!(githubConfig.repository && githubConfig.filePath));
      
      // Validate initial content
      if (initialContent.trim()) {
        setValidationResult(settingsManager.validateYamlContent(initialContent));
      } else {
        setValidationResult({ isValid: true, errors: [] });
      }
    }
  }, [isOpen, initialContent]);

  // Register/unregister modal with context
  useEffect(() => {
    if (isOpen) {
      registerModal('yamlEditor');
    } else {
      unregisterModal('yamlEditor');
    }

    // Cleanup on unmount
    return () => {
      unregisterModal('yamlEditor');
    };
  }, [isOpen, registerModal, unregisterModal]);

  // Handle content changes with real-time validation
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setHasChanges(newContent !== initialContent);
    
    // Real-time validation
    if (newContent.trim()) {
      setValidationResult(settingsManager.validateYamlContent(newContent));
    } else {
      setValidationResult({ isValid: true, errors: [] });
    }
  }, [initialContent]);

  // CodeMirror extensions with custom theme and syntax highlighting
  const extensions = [yaml(), ...glassThemeExtensions, EditorView.lineWrapping];

  // Handle save
  const handleSave = useCallback(() => {
    if (validationResult.isValid && content.trim()) {
      onSave(content);
      setHasChanges(false);
      onClose();
    }
  }, [content, validationResult.isValid, onSave, onClose]);

  // Handle cancel with unsaved changes warning
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  // Handle import from GitHub
  const handleImportFromGitHub = useCallback(async () => {
    const settings = settingsManager.getSettings();
    const githubConfig = settings.githubConfig;

    if (!githubConfig.repository || !githubConfig.filePath) {
      // Could set an error state here, but for now just ignore the action
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
        const newContent = atob(fileData.content.replace(/\s/g, ''));
        setContent(newContent);
        setHasChanges(newContent !== initialContent);
        
        // Validate the imported content
        if (newContent.trim()) {
          setValidationResult(settingsManager.validateYamlContent(newContent));
        } else {
          setValidationResult({ isValid: true, errors: [] });
        }
      }
    } catch (error) {
      // Silent fail for now - could add error state handling later
    }
  }, [initialContent]);


  const exampleContent = `title: "My Services Dashboard"
description: "A curated collection of useful services and tools"

services:
  - id: "example-service"
    name: "Example Service"
    description: "An example service configuration"
    url: "https://example.com"
    category: "tools"
  
  - id: "another-service"
    name: "Another Service"
    description: "Another example with different category"
    url: "https://another-example.com"
    category: "productivity"`;

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={title} zIndex={60}>
      <div className="flex flex-col h-[70vh] max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-yellow-600/10 border border-yellow-600/20">
            <FileEdit className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-base font-medium text-zinc-100">YAML Configuration Editor</h3>
            <p className="text-xs text-zinc-400">Edit your service configuration with real-time validation</p>
          </div>
        </div>

        {/* Editor Area - flexible height */}
        <div className="flex-1 glass-luxury rounded-lg p-4 flex flex-col min-h-0">
          <label className="block text-xs font-medium text-zinc-300 mb-2">
            YAML Content
          </label>
          <div className="flex-1 min-h-0 border border-zinc-700/50 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-yellow-500 focus-within:border-yellow-500/50">
            <CodeMirror
              value={content}
              onChange={(value) => handleContentChange(value)}
              extensions={extensions}
              placeholder={exampleContent}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                dropCursor: false,
                allowMultipleSelections: false,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                highlightSelectionMatches: false,
              }}
              height="100%"
              style={{ 
                height: '100%',
                width: '100%',
                maxWidth: '100%',
                fontSize: '12px',
                overflow: 'hidden',
              }}
            />
          </div>
        </div>

        {/* Validation Messages - anchored between editor and buttons */}
        {validationResult.errors.length > 0 ? (
          <div className="mt-3 p-3 bg-red-600/10 border border-red-600/20 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-red-300 text-xs space-y-1">
                {validationResult.errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </div>
          </div>
        ) : content.trim() && validationResult.isValid ? (
          <div className="mt-3 p-3 bg-yellow-600/10 border border-yellow-600/20 rounded-md">
            <div className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-yellow-300 text-xs">
                Configuration is valid and ready to use.
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-3 bg-zinc-600/10 border border-zinc-600/20 rounded-md">
            <div className="flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
              <div className="text-zinc-400 text-xs">
                Start typing your YAML configuration above. Use the placeholder as a guide.
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 rounded-md transition-colors duration-200 text-xs"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
          
          <button
            onClick={handleImportFromGitHub}
            disabled={!githubConfigured}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-zinc-600/50 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:opacity-50 text-zinc-200 disabled:text-zinc-500 rounded-md transition-colors duration-200 text-xs"
          >
            <Github className="w-3.5 h-3.5" />
            Import from GitHub
          </button>
          
          <button
            onClick={handleSave}
            disabled={!validationResult.isValid || !hasChanges || !content.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:opacity-50 text-zinc-900 disabled:text-zinc-400 rounded-md transition-colors duration-200 font-medium text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            Save Configuration
          </button>
        </div>
      </div>
    </Modal>
  );
};