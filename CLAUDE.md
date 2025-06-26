# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Swedish recipe collection ("Emils receptsamling") organized as a static Jekyll site. The repository contains markdown files with cooking recipes for personal use.

**Design Philosophy**: Simplicity is key. This is a personal recipe collection focused on quick access to recipes, not a commercial site. Avoid adding unnecessary features like analytics, complex tracking, or commercial plugins.

## Architecture

- **Content Structure**: All recipes are now organized in a single Jekyll collection (`_recipes/`)
- **Asset Organization**: Static assets follow Jekyll conventions:
  - `assets/css/` - Custom CSS files (e.g., `recipe-filter.css`)
  - `assets/js/` - Custom JavaScript files (e.g., `recipe-filter.js`)
- **Index Generation**: Jekyll automatically generates the main index.md using Liquid templates and collections
- **Site Generation**: Uses Jekyll with the `jekyll-theme-tactile` theme via GitHub Pages
- **Recipe Layout**: Custom `_layouts/recipe.html` displays titles from YAML metadata with tag badges

## Commands

### Jekyll Development
```bash
bundle exec jekyll serve
```
Run local Jekyll server for development. The index page is now generated automatically by Jekyll using Liquid templates and collections.

### Code Style
- Uses .editorconfig with UTF-8, LF line endings, 2-space indentation (4 spaces for Python)
- Max line length: 80 characters
- Trim trailing whitespace and insert final newline

## Content Organization

Recipe files follow this structure:
- All recipes are in the `_recipes/` directory (single collection)
- Each recipe uses the `recipe` layout which displays the title from YAML front matter
- Recipes no longer have duplicate markdown headers (e.g., `### Recipe Name`)
- Ingredients listed as bullet points or code blocks
- Instructions in paragraph form
- Some recipes include subheadings like `#### Topping`

### File Structure:
```
_recipes/
  ├── carbonara.md
  ├── pizza.md
  └── ...
_layouts/
  └── recipe.html          # Custom layout for recipe pages
assets/
  ├── css/
  │   └── recipe-filter.css # Recipe filtering styles
  └── js/
      └── recipe-filter.js  # Recipe filtering logic
```

## Recipe Tagging System

All recipes now include Jekyll front matter with comprehensive Swedish tags for filtering:

### Tag Categories:
- **Ingredients**: kött, fisk, vegetarisk, ost, pasta, potatis, morötter, etc.
- **Cooking methods**: ugn, gryta, stekpanna, grill, kokt, etc.
- **Cuisine types**: asiatiskt, italienskt, mexikanskt, traditionellt, etc.
- **Dietary**: vegetarisk, vegansk, mjölkprodukter, etc.
- **Meal types**: frukost, middag, efterrätt, tillbehör, etc.

### Front Matter Format:
```yaml
---
title: "Recipe Name"
tags: [kött, ugn, morötter, helgmat, traditionellt]
---
```

When adding new recipes:
1. Place in the `_recipes/` directory
2. Add Jekyll front matter with title, layout, and 3-6 relevant Swedish tags:
   ```yaml
   ---
   layout: recipe
   title: "Recipe Name"
   tags: [kött, ugn, morötter]
   ---
   ```
3. Do NOT include duplicate markdown headers (title comes from front matter)
4. Index page updates automatically with filtering functionality when Jekyll builds

### Asset Management:
- CSS customizations go in `assets/css/`
- JavaScript functionality goes in `assets/js/`
- Follow Jekyll asset conventions for proper caching and organization