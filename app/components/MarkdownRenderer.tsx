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
        // Dynamically import Shiki for markdown-it
        const { default: Shiki } = await import('@shikijs/markdown-it');
        
        // Create markdown-it instance
        const md = new MarkdownIt({
          html: true,
          linkify: true,
          typographer: true
        });
        
        // Apply Shiki plugin
        await md.use(await Shiki({
          themes: {
            light: theme.includes('light') ? theme : 'vitesse-light',
            dark: theme.includes('dark') ? theme : 'vitesse-dark',
          },
          defaultColor: false, // Use the current theme
          cssVariablePrefix: '--shiki-'
        }));
        
        // Render the markdown
        const html = md.render(code);
        setRenderedHTML(html);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize markdown-it with Shiki:', error);
        // Fallback to basic rendering if there's an error
        const basicMd = new MarkdownIt();
        setRenderedHTML(basicMd.render(code));
        setIsLoading(false);
      }
    };

    initMarkdownIt();
  }, [code, theme]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div 
      className="markdown-content" 
      dangerouslySetInnerHTML={{ __html: renderedHTML }}
    />
  );
} 