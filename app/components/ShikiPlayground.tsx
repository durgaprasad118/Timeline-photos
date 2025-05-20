'use client';

import { useState, useEffect, useRef } from 'react';
import { createHighlighter, type Highlighter } from 'shiki';

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
    if (highlighter) {
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

  // Sync scroll positions between textarea and highlighted code
  useEffect(() => {
    const textarea = textareaRef.current;
    const codeContainer = shikiContainerRef.current;
    
    if (!textarea || !codeContainer) return;
    
    const syncScroll = () => {
      codeContainer.scrollTop = textarea.scrollTop;
      codeContainer.scrollLeft = textarea.scrollLeft;
    };
    
    textarea.addEventListener('scroll', syncScroll);
    return () => {
      textarea.removeEventListener('scroll', syncScroll);
    };
  }, []);

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

        {/* Unified editor for all languages */}
        <div className="relative bg-transparent" style={{ height: '24rem' }}>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => {
              const newCode = e.target.value;
              setCode(newCode);
              // Force re-highlighting for markdown to ensure it updates properly
              if (language === 'markdown') {
                setIsLoading(true);
                // Use a small timeout to ensure state updates properly
                setTimeout(() => setIsLoading(false), 10);
              }
            }}
            className="w-full h-full p-4 font-mono text-sm bg-transparent text-transparent caret-black dark:caret-white focus:outline-none resize-none absolute inset-0 z-20"
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
          />
          <div 
            ref={shikiContainerRef}
            className="w-full h-full p-4 font-mono text-sm overflow-auto shiki-container absolute inset-0 z-10"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            ) : (
              <div 
                className="pointer-events-none" 
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Powered by <a href="https://shiki.style" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Shiki</a>
      </div>

      {/* Add CSS for Shiki styling */}
      <style jsx global>{`
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
        textarea.text-transparent {
          color: transparent !important;
          caret-color: #fff; /* Ensure caret is visible */
        }
        
        /* Ensure the editor takes the full height */
        .relative {
          position: relative;
        }
        
        textarea:focus {
          outline: none !important;
        }
        
        /* Theme background colors for the container */
        .relative.vitesse-dark { background-color: #121212 !important; }
        .relative.vitesse-light { background-color: #ffffff !important; }
        .relative.slack-ochin { background-color: #1b2125 !important; }
        .relative.nord { background-color: #2e3440 !important; }
        .relative.github-dark { background-color: #0d1117 !important; }
        .relative.github-light { background-color: #ffffff !important; }
        .relative.min-dark { background-color: #1f1f1f !important; }
        .relative.min-light { background-color: #ffffff !important; }
        .relative.rose-pine { background-color: #191724 !important; }
        .relative.rose-pine-moon { background-color: #232136 !important; }
        .relative.slack-dark { background-color: #1a1d21 !important; }
        .relative.solarized-dark { background-color: #002b36 !important; }
        .relative.solarized-light { background-color: #fdf6e3 !important; }
        
        /* Dark mode adjustments for caret */
        .dark textarea.text-transparent {
          caret-color: #fff;
        }
        
        /* Light mode adjustments for caret */
        textarea.text-transparent {
          caret-color: #000;
        }
      `}</style>
    </div>
  );
} 