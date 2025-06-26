#!/usr/bin/env python3
"""
Script to list all tags currently used across all recipes.
Reads Jekyll front matter from recipe files and extracts unique tags.
"""

import os
import yaml
import sys
from pathlib import Path

def extract_front_matter(file_path):
    """Extract YAML front matter from a markdown file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if not content.startswith('---'):
            return None
        
        # Find the end of front matter
        end_marker = content.find('\n---\n', 3)
        if end_marker == -1:
            return None
        
        front_matter = content[3:end_marker]
        return yaml.safe_load(front_matter)
    except Exception as e:
        print(f"Error reading {file_path}: {e}", file=sys.stderr)
        return None

def find_recipe_files(base_dir):
    """Find all recipe markdown files."""
    recipe_files = []
    
    # Look in _recipes and other collection directories
    for pattern in ['_*/', '']:
        search_path = Path(base_dir) / pattern
        if pattern:  # Collection directories
            for collection_dir in Path(base_dir).glob(pattern):
                if collection_dir.is_dir():
                    recipe_files.extend(collection_dir.glob('*.md'))
        else:  # Root directory
            recipe_files.extend(Path(base_dir).glob('*.md'))
    
    return recipe_files

def main():
    base_dir = Path(__file__).parent.parent
    recipe_files = find_recipe_files(base_dir)
    
    all_tags = set()
    recipes_without_tags = []
    total_recipes = 0
    
    print(f"Scanning {len(recipe_files)} recipe files...")
    
    for file_path in recipe_files:
        # Skip non-recipe files
        if file_path.name in ['index.md', 'README.md']:
            continue
            
        total_recipes += 1
        front_matter = extract_front_matter(file_path)
        
        if not front_matter:
            recipes_without_tags.append(str(file_path.relative_to(base_dir)))
            continue
        
        tags = front_matter.get('tags', [])
        if not tags:
            recipes_without_tags.append(str(file_path.relative_to(base_dir)))
        else:
            all_tags.update(tags)
    
    # Sort tags alphabetically
    sorted_tags = sorted(all_tags)
    
    print(f"\n=== TAG SUMMARY ===")
    print(f"Total recipes: {total_recipes}")
    print(f"Recipes with tags: {total_recipes - len(recipes_without_tags)}")
    print(f"Recipes without tags: {len(recipes_without_tags)}")
    print(f"Unique tags: {len(sorted_tags)}")
    
    print(f"\n=== ALL TAGS ({len(sorted_tags)}) ===")
    for i, tag in enumerate(sorted_tags, 1):
        print(f"{i:2}. {tag}")
    
    if recipes_without_tags:
        print(f"\n=== RECIPES WITHOUT TAGS ({len(recipes_without_tags)}) ===")
        for recipe in sorted(recipes_without_tags):
            print(f"  {recipe}")

if __name__ == '__main__':
    main()