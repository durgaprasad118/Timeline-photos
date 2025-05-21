'use client';

import { useState, useEffect, memo, useRef } from 'react';
import MarkdownIt from 'markdown-it';
import Shiki from '@shikijs/markdown-it';

interface MarkdownRendererProps {
  code: string;
  theme: string;
}

// Define a type for markdown-it instance
interface MarkdownItInstance {
  render: (source: string) => string;
  use: (plugin: unknown) => MarkdownItInstance;
}

// Memoize the component to prevent unnecessary re-renders
const MarkdownRenderer = memo(({ code, theme }: MarkdownRendererProps) => {
  const [renderedHTML, setRenderedHTML] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const mdRef = useRef<MarkdownItInstance | null>(null);

  // Initialize markdown-it once
  useEffect(() => {
    const initMarkdownIt = async () => {
      try {
        // Create markdown-it instance with options
        const md = MarkdownIt({
          html: true,
          linkify: true,
          typographer: true,
          breaks: true, // Convert \n to <br>
          highlight: undefined // Let Shiki handle highlighting
        }) as MarkdownItInstance;
        
        // Configure Shiki with the current theme
        const shikiPlugin = await Shiki({
          themes: {
            light: theme.includes('light') ? theme : 'vitesse-light',
            dark: theme.includes('dark') ? theme : 'vitesse-dark',
          },
          defaultColor: false
        });
        
        // Apply Shiki plugin to markdown-it
        md.use(shikiPlugin);
        mdRef.current = md;
        
        // Initial render
        setRenderedHTML(md.render(code));
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing markdown-it:', error);
        // Fallback to basic markdown-it
        const fallbackMd = MarkdownIt({
          html: true,
          breaks: true,
          linkify: true
        }) as MarkdownItInstance;
        mdRef.current = fallbackMd;
        setRenderedHTML(fallbackMd.render(code));
        setIsLoading(false);
      }
    };

    initMarkdownIt();
  }, [theme]); // Only re-initialize when theme changes

  // Update rendered HTML when code changes
  useEffect(() => {
    if (mdRef.current && !isLoading) {
      try {
        const html = mdRef.current.render(code);
        setRenderedHTML(html);
      } catch (error) {
        console.error('Error rendering markdown:', error);
      }
    }
  }, [code, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Rendering markdown...</p>
      </div>
    );
  }

  return (
    <div 
      className={`markdown-content theme-${theme} w-full h-full markdown-render`}
      style={{
        fontFamily: 'Menlo, Monaco, Courier New, monospace',
        fontSize: '14px',
        lineHeight: '1.5',
        letterSpacing: 'normal',
        wordSpacing: 'normal',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word'
      }}
      dangerouslySetInnerHTML={{ __html: renderedHTML }}
    />
  );
});

// Add display name for better debugging
MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer; 