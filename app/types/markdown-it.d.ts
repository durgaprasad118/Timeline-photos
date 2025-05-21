declare module 'markdown-it' {
  interface MarkdownIt {
    render(src: string): string;
    use(plugin: any): this;
    utils: {
      escapeHtml(str: string): string;
      unescapeHtml(str: string): string;
    };
  }

  interface Options {
    html?: boolean;
    xhtmlOut?: boolean;
    breaks?: boolean;
    langPrefix?: string;
    linkify?: boolean;
    typographer?: boolean;
    quotes?: string;
    highlight?: (str: string, lang: string) => string;
  }

  function MarkdownIt(options?: Options): MarkdownIt;
  export = MarkdownIt;
}

declare module '@shikijs/markdown-it' {
  interface ShikiOptions {
    themes?: {
      light?: string;
      dark?: string;
    };
    defaultColor?: boolean;
  }

  function Shiki(options?: ShikiOptions): any;
  export default Shiki;
} 