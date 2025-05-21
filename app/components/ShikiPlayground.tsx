'use client';

import { useState, useEffect, useRef } from 'react';
import { createHighlighter, type Highlighter } from 'shiki';
import MarkdownRenderer from './MarkdownRenderer';

// Default languages and themes
const DEFAULT_LANGUAGES = [
  'markdown',
  'typescript',
  'javascript',
  'html',
  'css',
  'json',
  'python',
  'rust',
  'go',
  'java',
  'c',
  'cpp',
] as const;

type SupportedLanguage = typeof DEFAULT_LANGUAGES[number];

const DEFAULT_THEMES = [
  'vitesse-dark',
  'slack-ochin',
  'nord',
  'vitesse-light',
  'github-dark',
  'github-light',
  'min-dark',
  'min-light',
  'rose-pine',
  'rose-pine-moon',
  'slack-dark',
  'solarized-dark',
  'solarized-light',
] as const;

type SupportedTheme = typeof DEFAULT_THEMES[number];

// Language-specific default code examples
const DEFAULT_CODE_EXAMPLES: Record<SupportedLanguage, string> = {
  markdown: `# Hello World

This is a **markdown** example with:

- Bullet points
- *Italic text*
- **Bold text**

## Code Example

\`\`\`javascript
function greet() {
  return "Hello from markdown!";
}
\`\`\`

> This is a blockquote

[Link to Shiki](https://shiki.style)
`,
  typescript: `// TypeScript Example
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

interface User {
  id: number;
  name: string;
  isActive: boolean;
}

const user: User = {
  id: 1,
  name: "World",
  isActive: true
};

console.log(greet(user.name));
`,
  javascript: `// JavaScript Example
function greet(name) {
  return \`Hello, \${name}!\`;
}

const user = {
  id: 1,
  name: "World",
  isActive: true
};

console.log(greet(user.name));
`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello World</title>
  <style>
    body {
      font-family: sans-serif;
      padding: 2rem;
    }
  </style>
</head>
<body>
  <h1>Hello World</h1>
  <p>This is an HTML example.</p>
</body>
</html>
`,
  css: `/* CSS Example */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.container {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #2c3e50;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}
`,
  python: `# Python Example
def greet(name):
    return f"Hello, {name}!"

class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def describe(self):
        return f"{self.name} is {self.age} years old."

user = User("World", 25)
print(greet(user.name))
print(user.describe())
`,
  rust: '',
  go: '',
  java: '',
  c: '',
  cpp: '',
  json: '',
};

export default function ShikiPlayground() {
  const [code, setCode] = useState<string>(DEFAULT_CODE_EXAMPLES.markdown);
  const [language, setLanguage] = useState<SupportedLanguage>('markdown');
  const [theme, setTheme] = useState<SupportedTheme>('slack-ochin');
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const shikiContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize the highlighter for all languages
  useEffect(() => {
    const initHighlighter = async () => {
      try {
        setIsLoading(true); // Make sure loading state is set before initialization
        const shikiHighlighter = await createHighlighter({
          langs: [...DEFAULT_LANGUAGES, 'md'], // Explicitly add 'md' for markdown
          themes: [...DEFAULT_THEMES],
        });
        setHighlighter(shikiHighlighter);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize Shiki:', error);
        setIsLoading(false);
      }
    };

    initHighlighter();
  }, []);

  // Re-render markdown code with any updates
  useEffect(() => {
    if (language === 'markdown' && highlighter && !isLoading) {
      try {
        const html = highlighter.codeToHtml(code, {
          lang: 'md',
          theme: theme,
        });
        setHighlightedCode(html);
      } catch (error) {
        console.error('Failed to update markdown:', error);
      }
    }
  }, [code, language, theme, highlighter, isLoading]);

  // Helper function to get the correct language identifier
  const getLanguageIdentifier = (lang: string, highlighter: Highlighter): string => {
    // Special case for markdown
    if (lang === 'markdown') {
      return 'md';
    }
    
    // Check if language is supported directly
    const languages = highlighter.getLoadedLanguages();
    if (languages.includes(lang)) return lang;
    
    // For unsupported languages, fall back to text
    console.log(`Language not directly supported: ${lang}. Using text.`);
    return 'text';
  };

  // Update highlighted code when code, language, or theme changes
  useEffect(() => {
    if (highlighter && language !== 'markdown') {
      try {
        // Set loading state when changing code or language
        setIsLoading(true);
        
        // Get the correct language identifier
        const langToUse = getLanguageIdentifier(language, highlighter);
        console.log(`Using language: ${langToUse} for ${language}`);
        
        const html = highlighter.codeToHtml(code, {
          lang: langToUse,
          theme: theme,
        });
        
        setHighlightedCode(html);
        // Set loading to false after highlighting is complete
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to highlight code:', error);
        setIsLoading(false);
      }
    }
  }, [code, language, theme, highlighter]);

  // Apply theme class to shiki element
  useEffect(() => {
    if (shikiContainerRef.current && !isLoading) {
      // Find all shiki elements
      const shikiElements = shikiContainerRef.current.querySelectorAll('.shiki');
      
      // Remove all theme classes and add the current theme
      shikiElements.forEach(element => {
        // Remove existing theme classes
        DEFAULT_THEMES.forEach(themeClass => {
          element.classList.remove(themeClass);
        });
        
        // Add the current theme class
        element.classList.add(theme);
        
        // Set background color based on theme - use type assertion for TypeScript
        const htmlElement = element as HTMLElement;
        htmlElement.style.backgroundColor = 'transparent';
      });
      
      // Also style the container for consistent theme
      if (shikiContainerRef.current) {
        const container = shikiContainerRef.current.closest('.relative');
        if (container && container instanceof HTMLElement) {
          // Apply theme classes to container
          DEFAULT_THEMES.forEach(themeClass => {
            container.classList.remove(themeClass);
          });
          container.classList.add(theme);
        }
      }
    }
  }, [highlightedCode, theme, isLoading]);

  // Setup scroll synchronization
  useEffect(() => {
    const textarea = textareaRef.current;
    const contentContainer = editorRef.current?.querySelector('.editor-content');
    
    if (!textarea || !contentContainer) return;
    
    const syncScroll = () => {
      contentContainer.scrollTop = textarea.scrollTop;
      contentContainer.scrollLeft = textarea.scrollLeft;
    };
    
    textarea.addEventListener('scroll', syncScroll);
    textarea.addEventListener('input', syncScroll);
    
    return () => {
      textarea.removeEventListener('scroll', syncScroll);
      textarea.removeEventListener('input', syncScroll);
    };
  }, []);

  // Setup the editor synchronization
  useEffect(() => {
    const textarea = textareaRef.current;
    const editor = editorRef.current;
    
    if (!textarea || !editor) return;
    
    // Function to position cursor properly
    const updateCursor = () => {
      if (language === 'markdown') {
        // For markdown, we need to make sure the cursor is visible
        textarea.style.color = 'transparent';
        textarea.style.caretColor = theme.includes('dark') ? 'white' : 'black';
      }
    };
    
    // Initialize
    updateCursor();
    
    // Add focus event listener
    const handleFocus = () => {
      updateCursor();
    };
    
    textarea.addEventListener('focus', handleFocus);
    return () => {
      textarea.removeEventListener('focus', handleFocus);
    };
  }, [language, theme]);

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    const typedLanguage = newLanguage as SupportedLanguage;
    
    // If current language is markdown or new language is markdown
    // We need to force a refresh by temporarily setting loading to true
    if (language === 'markdown' || typedLanguage === 'markdown') {
      setIsLoading(true);
    }
    
    setLanguage(typedLanguage);
    
    // Only change the code if we have a default example for this language
    if (Object.prototype.hasOwnProperty.call(DEFAULT_CODE_EXAMPLES, typedLanguage)) {
      setCode(DEFAULT_CODE_EXAMPLES[typedLanguage]);
    }
    
    // Only set loading to true if we don't have a highlighter yet
    if (!highlighter) {
      setIsLoading(true);
    }
  };

  // Format the theme name for display
  const formatThemeName = (themeName: string) => {
    return themeName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Create a code tag with the correct language
  const codeTag = `</> ${language.charAt(0).toUpperCase() + language.slice(1)}`;

  // Handle special key events for better editing experience
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    
    // Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // If there's a selection, indent/unindent the selected lines
      if (start !== end) {
        const selectedText = code.substring(start, end);
        const lines = selectedText.split('\n');
        
        // Add or remove indentation
        const indentedText = e.shiftKey
          ? lines.map(line => line.startsWith('  ') ? line.substring(2) : line).join('\n')
          : lines.map(line => '  ' + line).join('\n');
        
        const newValue = code.substring(0, start) + indentedText + code.substring(end);
        setCode(newValue);
        
        // Adjust selection to maintain the same selected lines
        setTimeout(() => {
          textarea.selectionStart = start;
          textarea.selectionEnd = start + indentedText.length;
        }, 0);
      } else {
        // No selection, just insert a tab at cursor position
        const newValue = code.substring(0, start) + '  ' + code.substring(end);
        setCode(newValue);
        
        // Set cursor position after tab
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
      return;
    }
    
    // Handle Enter key to preserve indentation
    if (e.key === 'Enter') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Get current line's indentation
      const currentLine = code.substring(0, start).split('\n').pop() || '';
      const indentation = currentLine.match(/^\s*/)?.[0] || '';
      
      // Insert newline with the same indentation
      const newValue = code.substring(0, start) + '\n' + indentation + code.substring(end);
      setCode(newValue);
      
      // Set cursor position after indentation
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + indentation.length;
      }, 0);
      return;
    }
  };

  // Render specific editor based on language
  const renderEditor = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      );
    }
    
    return (
      <div ref={editorRef} className="editor-container w-full h-full relative">
        {/* Common textarea for all languages */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-full p-4 font-mono text-sm bg-transparent resize-none absolute inset-0 z-20 focus:outline-none editor-textarea"
          style={{ 
            caretColor: theme.includes('dark') ? 'white' : 'black',
            color: 'rgba(0,0,0,0.0)',
            fontFamily: 'Menlo, Monaco, Courier New, monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            tabSize: 2,
            letterSpacing: 'normal',
            wordSpacing: 'normal'
          }}
          spellCheck="false"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          data-gramm="false"
        />
        
        {/* Language specific content */}
        <div 
          className="w-full h-full p-4 font-mono text-sm overflow-auto absolute inset-0 z-10 pointer-events-none editor-content"
          style={{
            fontFamily: 'Menlo, Monaco, Courier New, monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            tabSize: 2,
            letterSpacing: 'normal',
            wordSpacing: 'normal'
          }}
        >
          {language === 'markdown' ? (
            <MarkdownRenderer code={code} theme={theme} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="language" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Language:
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
          >
            {[...DEFAULT_LANGUAGES].map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="theme" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme:
          </label>
          <select
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as SupportedTheme)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
          >
            {[...DEFAULT_THEMES].map((t) => (
              <option key={t} value={t}>
                {formatThemeName(t)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
        {/* Title bar with language and theme */}
        <div className="flex items-center justify-between bg-gray-100 dark:bg-neutral-800 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {codeTag}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formatThemeName(theme)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Playground
          </div>
        </div>

        {/* Editor container */}
        <div 
          ref={shikiContainerRef}
          className={`editor-wrapper relative bg-transparent ${theme}`}
          style={{ height: '24rem' }}
        >
          {renderEditor()}
        </div>
      </div>
      
  

      {/* Add CSS for Shiki styling */}
      <style jsx global>{`
        .editor-wrapper {
          overflow: hidden;
        }
        
        .editor-container {
          position: relative;
        }
        
        .editor-textarea, .editor-content {
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          letter-spacing: normal !important;
          word-spacing: normal !important;
          tab-size: 2 !important;
          white-space: pre-wrap !important;
          padding: 1rem !important;
          box-sizing: border-box !important;
        }
        
        /* Fix character width for monospace alignment */
        .editor-textarea, .editor-content, 
        .markdown-content, .markdown-content pre, 
        .markdown-content code, .shiki, .shiki code {
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          letter-spacing: normal !important;
          word-spacing: normal !important;
        }
        
        .shiki-container pre {
          margin: 0;
          background: transparent !important;
        }
        
        .shiki-container code {
          font-family: inherit;
          white-space: pre;
          position: relative;
        }
        
        .shiki {
          background: transparent !important;
        }
        
        .pointer-events-none {
          position: relative;
        }
        
        /* Theme background colors for the container */
        .editor-wrapper.vitesse-dark { background-color: #121212 !important; }
        .editor-wrapper.vitesse-light { background-color: #ffffff !important; }
        .editor-wrapper.slack-ochin { background-color: #1b2125 !important; }
        .editor-wrapper.nord { background-color: #2e3440 !important; }
        .editor-wrapper.github-dark { background-color: #0d1117 !important; }
        .editor-wrapper.github-light { background-color: #ffffff !important; }
        .editor-wrapper.min-dark { background-color: #1f1f1f !important; }
        .editor-wrapper.min-light { background-color: #ffffff !important; }
        .editor-wrapper.rose-pine { background-color: #191724 !important; }
        .editor-wrapper.rose-pine-moon { background-color: #232136 !important; }
        .editor-wrapper.slack-dark { background-color: #1a1d21 !important; }
        .editor-wrapper.solarized-dark { background-color: #002b36 !important; }
        .editor-wrapper.solarized-light { background-color: #fdf6e3 !important; }
      `}</style>
    </div>
  );
} 