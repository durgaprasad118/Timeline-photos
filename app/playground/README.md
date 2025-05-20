# Shiki Playground Setup

This playground uses Shiki for syntax highlighting. Follow these steps to set it up:

## Installation

1. Install Shiki package:

```bash
npm install shiki
# or
yarn add shiki
# or
pnpm add shiki
```

## Features

- Syntax highlighting for multiple languages with emphasis on Markdown support
- Multiple themes support
- Single-column editable preview
- Language-specific code examples
- Client-side rendering

## How It Works

The playground uses Shiki's client-side rendering capabilities to highlight code. The component loads languages and themes on demand when selected from the dropdown. The editor uses a clever overlay technique where you type in a transparent textarea positioned over the highlighted code.

## Single-Column Editor

The editor uses a unique approach:
1. A transparent textarea is positioned absolutely over the highlighted code
2. As you type in the textarea, the code underneath is updated in real-time
3. This creates the illusion of typing directly in a syntax-highlighted editor

## Language Examples

The playground includes example code for various languages:
- Markdown (default)
- TypeScript
- JavaScript
- HTML
- CSS
- Python
- And more...

When you switch languages, the editor automatically loads an appropriate example for that language.

## Customization

You can customize the available languages and themes by modifying the `DEFAULT_LANGUAGES` and `DEFAULT_THEMES` arrays in the `ShikiPlayground.tsx` component. You can also add more language examples by extending the `DEFAULT_CODE_EXAMPLES` object.

## Troubleshooting

If you encounter issues with Shiki:

1. Make sure you've installed the package correctly
2. Check the browser console for any errors
3. Ensure you're using the correct language identifiers
4. Try using a different theme if a specific one isn't working

## References

- [Shiki Documentation](https://shiki.style/guide/)
- [Available Languages](https://shiki.style/languages)
- [Available Themes](https://shiki.style/themes) 