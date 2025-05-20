# Required Packages for Shiki Markdown Playground

To make the playground work correctly with markdown, you need to install these packages:

```bash
# Install the core Shiki package
npm install shiki

# Install markdown-it and the Shiki plugin for markdown-it
npm install markdown-it @shikijs/markdown-it
```

Or if you prefer using yarn:

```bash
# Install the core Shiki package
yarn add shiki

# Install markdown-it and the Shiki plugin for markdown-it
yarn add markdown-it @shikijs/markdown-it
```

## Package Versions

The playground has been tested with these versions:

```json
{
  "dependencies": {
    "shiki": "^1.1.7",
    "markdown-it": "^14.0.0",
    "@shikijs/markdown-it": "^1.1.7"
  }
}
```

## What Each Package Does

- **shiki**: The core syntax highlighting library
- **markdown-it**: A fast and extensible Markdown parser
- **@shikijs/markdown-it**: A plugin that integrates Shiki with markdown-it

## After Installation

After installing these packages, restart your development server to ensure they are properly loaded. 