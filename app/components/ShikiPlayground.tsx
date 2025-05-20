'use client';

import { useState, useEffect } from 'react';
import { getHighlighter, Highlighter } from 'shiki';
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
];

const DEFAULT_THEMES = [
  'vitesse-dark',
  'nord',
  'vitesse-light',
  'github-dark',
  'github-light',
  'min-dark',
  'min-light',
  'rose-pine',
  'rose-pine-moon',
  'slack-dark',
  'slack-ochin',
  'solarized-dark',
  'solarized-light',
];

// Language-specific default code examples
const DEFAULT_CODE_EXAMPLES = {
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
};

export default function ShikiPlayground() {
  const [code, setCode] = useState(DEFAULT_CODE_EXAMPLES.markdown);
  const [language, setLanguage] = useState('markdown');
  const [theme, setTheme] = useState('vitesse-dark');
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const [highlightedCode, setHighlightedCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize the highlighter for non-markdown languages
  useEffect(() => {
    if (language !== 'markdown') {
      const initHighlighter = async () => {
        try {
          const shikiHighlighter = await getHighlighter({
            langs: DEFAULT_LANGUAGES.filter(lang => lang !== 'markdown'),
            themes: DEFAULT_THEMES,
          });
          setHighlighter(shikiHighlighter);
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to initialize Shiki:', error);
        }
      };

      initHighlighter();
    } else {
      // For markdown, we don't need the highlighter
      setIsLoading(false);
    }
  }, [language]);

  // Update highlighted code when code, language, or theme changes
  useEffect(() => {
    if (highlighter && language !== 'markdown') {
      try {
        const html = highlighter.codeToHtml(code, {
          lang: language,
          theme: theme,
        });
        setHighlightedCode(html);
      } catch (error) {
        console.error('Failed to highlight code:', error);
      }
    }
  }, [code, language, theme, highlighter]);

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Only change the code if we have a default example for this language
    if (DEFAULT_CODE_EXAMPLES[newLanguage]) {
      setCode(DEFAULT_CODE_EXAMPLES[newLanguage]);
    }
    
    // Reset loading state when changing languages
    setIsLoading(true);
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
            {DEFAULT_LANGUAGES.map((lang) => (
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
            onChange={(e) => setTheme(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
          >
            {DEFAULT_THEMES.map((t) => (
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

        {/* Single column editor */}
        <div className="relative bg-white dark:bg-neutral-900">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-96 p-4 font-mono text-sm bg-transparent text-transparent caret-black dark:caret-white focus:outline-none resize-none absolute inset-0 z-10"
            spellCheck="false"
          />
          <div className="w-full h-96 p-4 font-mono text-sm overflow-auto shiki-container">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            ) : language === 'markdown' ? (
              <MarkdownRenderer code={code} theme={theme} />
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
        }
        .shiki {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
} 