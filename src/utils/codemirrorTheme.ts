import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { Extension } from '@codemirror/state';

// Custom dark theme that matches the app's glassmorphism aesthetic
// Force refresh: 2025-09-11T00:06:22
export const glassDarkTheme = EditorView.theme({
  '&': {
    color: '#f4f4f5', // zinc-100
    backgroundColor: '#18181b', // zinc-900
    fontSize: '12px',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
  
  '.cm-content': {
    padding: '12px',
    caretColor: '#eab308', // yellow-500
    minHeight: '100%',
    backgroundColor: '#18181b', // zinc-900
  },
  
  '.cm-focused .cm-content': {
    outline: 'none',
  },
  
  '.cm-editor': {
    borderRadius: '6px',
    backgroundColor: '#18181b', // zinc-900
  },
  
  '.cm-scroller': {
    backgroundColor: '#18181b', // zinc-900
  },
  
  '&.cm-focused': {
    outline: 'none',
  },
  
  '.cm-line': {
    padding: '0 2px',
    lineHeight: '1.5',
    wordBreak: 'break-word',
  },

  // Wrapped line styling for better readability
  '.cm-lineWrapping': {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  
  '.cm-activeLine': {
    backgroundColor: '#27272a40', // zinc-800/25
  },
  
  '.cm-activeLineGutter': {
    backgroundColor: '#27272a40', // zinc-800/25
  },
  
  '.cm-selectionBackground, ::selection': {
    backgroundColor: '#eab308 !important', // Full opacity yellow for maximum visibility
  },
  
  '.cm-focused .cm-selectionBackground, .cm-focused ::selection': {
    backgroundColor: '#eab308 !important', // Full opacity yellow when focused
  },
  
  '.cm-cursor, .cm-dropCursor': {
    borderLeft: '2px solid #eab308', // yellow-500
  },
  
  '.cm-gutters': {
    backgroundColor: '#27272a', // zinc-800
    color: '#71717a', // zinc-500
    border: 'none',
    borderTopLeftRadius: '6px',
    borderBottomLeftRadius: '6px',
    minHeight: '100%',
  },
  
  '.cm-gutter': {
    padding: '0 6px',
  },
  
  '.cm-lineNumbers': {
    color: '#71717a', // zinc-500
    fontSize: '11px',
  },
  
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 4px',
    minWidth: '24px',
    textAlign: 'right',
  },
  
  '.cm-foldGutter .cm-gutterElement': {
    padding: '0 4px',
    cursor: 'pointer',
  },
  
  '.cm-foldPlaceholder': {
    backgroundColor: '#3f3f46', // zinc-700
    border: '1px solid #52525b', // zinc-600
    color: '#d4d4d8', // zinc-300
    borderRadius: '3px',
    padding: '0 4px',
    margin: '0 2px',
  },
  
  '.cm-placeholder': {
    color: '#71717a', // zinc-500
    fontStyle: 'italic',
  },
  
  '.cm-searchMatch': {
    backgroundColor: '#eab30820', // yellow-500/12.5
    outline: '1px solid #eab30860', // yellow-500/37.5
    borderRadius: '2px',
  },
  
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: '#eab30840', // yellow-500/25
    outline: '1px solid #eab308', // yellow-500
  },
  
  '.cm-panels': {
    backgroundColor: '#27272a', // zinc-800
    color: '#f4f4f5', // zinc-100
    border: '1px solid #3f3f46', // zinc-700
    borderRadius: '6px',
  },
  
  '.cm-panels.cm-panels-top': {
    borderBottom: '1px solid #3f3f46', // zinc-700
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '6px',
    borderBottomLeftRadius: '0',
    borderBottomRightRadius: '0',
  },
  
  '.cm-panels.cm-panels-bottom': {
    borderTop: '1px solid #3f3f46', // zinc-700
    borderTopLeftRadius: '0',
    borderTopRightRadius: '0',
    borderBottomLeftRadius: '6px',
    borderBottomRightRadius: '6px',
  },
  
  '.cm-textfield': {
    backgroundColor: '#3f3f46', // zinc-700
    border: '1px solid #52525b', // zinc-600
    borderRadius: '4px',
    color: '#f4f4f5', // zinc-100
    padding: '4px 8px',
  },
  
  '.cm-textfield:focus': {
    outline: 'none',
    borderColor: '#eab308', // yellow-500
    boxShadow: '0 0 0 1px #eab308', // yellow-500
  },
  
  '.cm-button': {
    backgroundColor: '#3f3f46', // zinc-700
    border: '1px solid #52525b', // zinc-600
    borderRadius: '4px',
    color: '#f4f4f5', // zinc-100
    padding: '4px 12px',
    cursor: 'pointer',
  },
  
  '.cm-button:hover': {
    backgroundColor: '#52525b', // zinc-600
  },
  
  '.cm-button:active': {
    backgroundColor: '#71717a', // zinc-500
  },
  
  // High-contrast syntax highlighting - targeting all possible YAML tokens
  '.cm-keyword': {
    color: '#ffcc00 !important', // Bright yellow - force override
    fontWeight: '600',
  },
  
  '.cm-string': {
    color: '#90ee90 !important', // Light green - force override
    fontWeight: '400',
  },
  
  '.cm-comment': {
    color: '#c0c0c0 !important', // Light gray - force override
    fontStyle: 'italic',
  },
  
  '.cm-number': {
    color: '#ffb347 !important', // Bright orange - force override
    fontWeight: '500',
  },
  
  '.cm-bool': {
    color: '#dda0dd !important', // Plum - force override
    fontWeight: '600',
  },
  
  '.cm-null': {
    color: '#ff6b6b !important', // Bright coral red - force override
    fontWeight: '600',
  },
  
  '.cm-operator': {
    color: '#ffffff !important', // Pure white - force override
    fontWeight: '500',
  },
  
  '.cm-punctuation': {
    color: '#f0f0f0 !important', // Near white - force override
  },
  
  '.cm-bracket': {
    color: '#ffd700 !important', // Gold - force override
    fontWeight: '500',
  },
  
  '.cm-tag': {
    color: '#ffcc00 !important', // Bright yellow - force override
    fontWeight: '600',
  },
  
  '.cm-attribute': {
    color: '#ff99cc !important', // Bright pink - force override
    fontWeight: '500',
  },
  
  // Additional YAML-specific tokens that might be used
  '.cm-atom': {
    color: '#dda0dd !important', // Purple for atoms/literals
    fontWeight: '600',
  },
  
  '.cm-property': {
    color: '#ff99cc !important', // Pink for YAML properties/keys
    fontWeight: '500',
  },
  
  '.cm-variable': {
    color: '#90ee90 !important', // Green for variables
  },
  
  '.cm-variable-2': {
    color: '#ffcc00 !important', // Yellow for secondary variables
  },
  
  '.cm-definition': {
    color: '#ff99cc !important', // Pink for definitions
    fontWeight: '500',
  },
  
  '.cm-qualifier': {
    color: '#ffcc00 !important', // Yellow for qualifiers
  },
  
  '.cm-type': {
    color: '#dda0dd !important', // Purple for types
    fontWeight: '500',
  },
  
  // Catch-all for any other syntax tokens
  '.cm-variableName': {
    color: '#f0f0f0 !important', // Default text color
  },
  
  '.cm-propertyName': {
    color: '#ff99cc !important', // Pink for property names
    fontWeight: '500',
  },
  
  '.cm-literal': {
    color: '#dda0dd !important', // Purple for literals
    fontWeight: '600',
  },
  
  '.cm-meta': {
    color: '#808080', // Neutral gray for meta elements
  },
  
  '.cm-invalid': {
    color: '#f44747', // VS Code red for errors
    backgroundColor: '#f4474720', // Subtle red background
  },
  
  // Tooltip styling
  '.cm-tooltip': {
    backgroundColor: '#27272a', // zinc-800
    border: '1px solid #3f3f46', // zinc-700
    borderRadius: '6px',
    color: '#f4f4f5', // zinc-100
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.25)',
  },
  
  '.cm-tooltip-arrow': {
    '&:before': {
      borderTopColor: '#3f3f46', // zinc-700
    },
    '&:after': {
      borderTopColor: '#27272a', // zinc-800
    },
  },
  
  // Autocomplete styling
  '.cm-completionLabel': {
    color: '#f4f4f5', // zinc-100
  },
  
  '.cm-completionDetail': {
    color: '#71717a', // zinc-500
    fontStyle: 'italic',
  },
  
  '.cm-completionIcon': {
    color: '#eab308', // yellow-500
  },
  
  '.cm-completionMatchedText': {
    color: '#eab308', // yellow-500
    fontWeight: '600',
  },
}, { dark: true });

// High-contrast syntax highlighting using proper Lezer highlighting
export const glassDarkHighlighting = HighlightStyle.define([
  { tag: t.keyword, color: '#ffcc00', fontWeight: '600' }, // Bright yellow for keywords
  { tag: t.string, color: '#90ee90', fontWeight: '400' }, // Light green for strings
  { tag: t.comment, color: '#c0c0c0', fontStyle: 'italic' }, // Light gray for comments
  { tag: t.number, color: '#ffb347', fontWeight: '500' }, // Bright orange for numbers
  { tag: t.bool, color: '#dda0dd', fontWeight: '600' }, // Purple for booleans
  { tag: t.null, color: '#ff6b6b', fontWeight: '600' }, // Bright red for null
  { tag: t.operator, color: '#ffffff', fontWeight: '500' }, // Pure white for operators
  { tag: t.punctuation, color: '#f0f0f0' }, // Near white for punctuation
  { tag: t.bracket, color: '#ffd700', fontWeight: '500' }, // Gold for brackets
  { tag: t.tagName, color: '#ffcc00', fontWeight: '600' }, // Yellow for tags
  { tag: t.attributeName, color: '#ff99cc', fontWeight: '500' }, // Pink for attributes
  { tag: t.propertyName, color: '#ff99cc', fontWeight: '500' }, // Pink for property names
  { tag: t.variableName, color: '#f0f0f0' }, // Default text color for variables
  { tag: t.literal, color: '#dda0dd', fontWeight: '600' }, // Purple for literals
  { tag: t.atom, color: '#dda0dd', fontWeight: '600' }, // Purple for atoms
  { tag: t.definition(t.variableName), color: '#ff99cc', fontWeight: '500' }, // Pink for definitions
  { tag: t.special(t.string), color: '#90ee90', fontWeight: '600' }, // Bright green for special strings
]);

// High visibility selection extension using a more aggressive approach
const selectionExtension = EditorView.theme({
  '&.cm-editor': {
    // Set CSS variable for selection color
    '--selection-color': '#eab308',
  },
  '& .cm-selectionBackground': {
    backgroundColor: '#eab308 !important',
    opacity: '1 !important',
    mixBlendMode: 'normal !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: '#eab308 !important',
    opacity: '1 !important',
    mixBlendMode: 'normal !important',
  },
  '& .cm-content': {
    // Apply selection styling to the content area
    userSelect: 'text',
  },
  '& .cm-content ::selection': {
    backgroundColor: '#eab308 !important',
    color: '#000000 !important',
  },
  '& ::selection': {
    backgroundColor: '#eab308 !important',
    color: '#000000 !important',
  },
  // Target the selection layer specifically
  '& .cm-selectionLayer > div': {
    backgroundColor: '#eab308 !important',
  },
});

// Combined theme with both visual theme and syntax highlighting
export const glassThemeExtensions = [
  glassDarkTheme,
  syntaxHighlighting(glassDarkHighlighting),
  selectionExtension
];