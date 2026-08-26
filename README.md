# 11ty Course Notes Skeleton

A modern, lightweight skeleton project for generating structured online course notes using [Eleventy v3](https://www.11ty.dev/) and Sass. 

The styling and visual design use a clean, card-based interface inspired by Cardiff University's design system.

---

## Key Features

*   **Modern ESM Configuration**: Built using native ES Modules (`eleventy.config.mjs`) for modern Node.js environments.
*   **Automatic Sass Compilation**: Compiles and minifies stylesheets dynamically during the Eleventy build process.
*   **Cross-platform and Lightweight**: Relies on native Node.js APIs rather than external dependency wrappers, keeping the build pipeline minimal and cross-platform.
*   **Centralized Metadata**: Exposes global site details (`title`, `description`, `author`, `twitter`, `url`) via `src/_data/metadata.json` for consistent layouts.
*   **Clean and Flexible Design**: Features clean responsive card grids, a structured sidebar navigation, breadcrumbs, custom warning/info panels, and Segoe UI typography.
*   **Interactive Shortcodes**:
    *   `image`: Automatically outputs responsive `<picture>` tags using multiple widths and modern formats.
    *   `questions`: Creates interactive multiple-choice questions with success and failure feedback highlights.
    *   `panel`: Formats visually distinct info, warning, and note panels.
*   **Utterances Integration**: Displays comment threads backed by GitHub issues on every page.

---

## Getting Started

### 1. Prerequisites
Make sure you have Node.js installed on your system.

### 2. Install Dependencies
Clone the repository and install dependencies
```bash
npm install
```

### 3. Local Development
Start the Eleventy development server. This compiles pages, watches all markdown/liquid/sass files, and serves the site with hot-reloading:
```bash
npm start
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### 4. Build for Production
Run a single build to output fully minified assets and optimized markup into the `public/` directory:
```bash
npm run build
```

### 5. Clean Output Directory
Delete the compiled `public/` build folder:
```bash
npm run clean
```

---

## Project Structure

```text
├── build/
│   └── shortcodes.js        # Helper custom shortcode engines (ESM)
├── eleventy.config.mjs      # Eleventy configuration and Sass hooks
├── package.json             # Scripts and devDependencies
├── src/
│   ├── _data/
│   │   └── metadata.json    # Global site configuration properties
│   ├── _includes/
│   │   ├── base.njk         # Base HTML skeleton layout
│   │   ├── page.njk         # Two-column course notes layout (sidebar + content card)
│   │   └── partials/
│   │       └── _head.njk    # Shared head metadata and external stylesheet links
│   ├── _sass/
│   │   ├── _layout.scss     # Responsive grids, cards, sidebars, panels
│   │   ├── _pagination.scss # Capsule buttons for next/previous pages
│   │   ├── _questions.scss  # Multiple-choice choices and feedback highlights
│   │   ├── _reset.scss      # Basic stylesheet resets
│   │   ├── _typography.scss # Fonts, sizing, inline codes, and transitions
│   │   ├── _variables.scss  # Color tokens and layout variables
│   │   └── main.scss        # Sass compilation entry point
│   ├── about.md             # Sample about page
│   ├── index.md             # Sample course index page
│   └── notes/
│       ├── index.md         # Sample notes page
│       └── notes.json       # Directives tagging all note files
```

---

## 💬 Note on Comments (Utterances)
The comment section is powered by [Utterances](https://utteranc.es/) which loads comments dynamically via a GitHub issue integration iframe.

