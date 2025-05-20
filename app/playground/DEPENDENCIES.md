# Dependencies for Shiki Playground

To implement the Shiki playground, you need to add the following dependency to your project:

## Required Package

```json
{
  "dependencies": {
    "shiki": "^1.1.7"
  }
}
```

You can add this to your package.json file manually, or run one of the following commands:

```bash
# Using npm
npm install shiki@^1.1.7

# Using yarn
yarn add shiki@^1.1.7

# Using pnpm
pnpm add shiki@^1.1.7
```

## What is Shiki?

Shiki is a syntax highlighter that uses the same TextMate grammar as VS Code. It provides accurate syntax highlighting for many programming languages and supports various themes.

## Why Shiki?

- **Accurate Highlighting**: Uses the same engine as VS Code
- **Multiple Languages**: Supports a wide range of programming languages
- **Theme Support**: Comes with many built-in themes
- **Client-Side Rendering**: Can be used in the browser

## Note

After installing the dependency, you might need to restart your development server for the changes to take effect. 