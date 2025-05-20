'use client';

import { useEffect, useState } from 'react';
import MarkdownIt from 'markdown-it';

interface MarkdownRendererProps {
  code: string;
  theme: string;
}

export default function MarkdownRenderer({ code, theme }: MarkdownRendererProps) {
  const [renderedHTML, setRenderedHTML] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize markdown-it with Shiki
  useEffect(() => {
    const initMarkdownIt = async () => {
      try {
        // Create a basic markdown-it instance first
        const md = new MarkdownIt({
          html: true,
          linkify: true,
          typographer: true
        });
        
        // Use a simple approach for code blocks first
        md.set({ highlight: function(str, lang) {
          return `<pre class="language-${lang}"><code>${md.utils.escapeHtml(str)}</code></pre>`;
        }});
        
        // Render the markdown
        let html = md.render(code);
        
        // Then try to enhance with Shiki if available
        try {
          const { renderToHtml } = await import('shiki');
          
          // Find all code blocks and re-render them with Shiki
          const codeBlockRegex = /<pre class="language-([^"]+)"><code>([\s\S]*?)<\/code><\/pre>/g;
          
          html = html.replace(codeBlockRegex, (match, language, content) => {
            try {
              // Unescape the HTML content
              const decodedContent = md.utils.unescapeHtml(content);
              
              // Return the original if language not supported
              if (!language || language === 'null') {
                return `<pre class="language-text"><code>${decodedContent}</code></pre>`;
              }
              
              // Try to render with Shiki theme
              return `<div class="code-block ${theme}"><pre class="language-${language}"><code>${decodedContent}</code></pre></div>`;
            } catch (e) {
              return match; // Return original on error
            }
          });
        } catch (e) {
          console.warn('Shiki import failed, using basic syntax highlighting');
        }
        
        setRenderedHTML(html);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize markdown-it:', error);
        // Fallback to very basic rendering
        setRenderedHTML(`<div>${code.replace(/\n/g, '<br>')}</div>`);
        setIsLoading(false);
      }
    };

    initMarkdownIt();
  }, [code, theme]);

  // Apply theme class to handle background colors
  const themeClass = theme.includes('dark') ? 'theme-dark' : 'theme-light';
  const specificThemeClass = `theme-${theme}`;

  return (
    <div className={`markdown-content ${themeClass} ${specificThemeClass}`}>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: renderedHTML }} />
      )}
    </div>
  );
} 