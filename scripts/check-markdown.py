#!/usr/bin/env python3
"""
Script to check for broken markdown in recipe files.
Identifies common markdown issues and suggests fixes.
"""

import os
import yaml
import re
from pathlib import Path

def extract_front_matter_and_content(file_path):
    """Extract YAML front matter and content from a markdown file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if not content.startswith('---'):
            return None, content
        
        end_marker = content.find('\n---\n', 3)
        if end_marker == -1:
            return None, content
        
        front_matter = content[3:end_marker]
        recipe_content = content[end_marker + 4:]
        return yaml.safe_load(front_matter), recipe_content
    except Exception as e:
        return None, content

def check_markdown_issues(content, filename):
    """Check for common markdown issues."""
    issues = []
    lines = content.split('\n')
    
    # Check for unclosed code blocks
    code_block_count = content.count('```')
    if code_block_count % 2 != 0:
        issues.append("Unclosed code block (odd number of ```)")
    
    # Check for headers without space after #
    for i, line in enumerate(lines, 1):
        if re.match(r'^#+[^\s]', line):
            issues.append(f"Line {i}: Header missing space after # ({line.strip()})")
    
    # Check for unmatched bold/italic markers
    bold_count = content.count('**')
    if bold_count % 2 != 0:
        issues.append("Unmatched bold markers (**)")
    
    italic_count = content.count('*') - bold_count * 2
    if italic_count % 2 != 0:
        issues.append("Unmatched italic markers (*)")
    
    # Check for broken links
    broken_links = re.findall(r'\[([^\]]*)\]\(\s*\)', content)
    if broken_links:
        issues.append(f"Empty link URLs: {broken_links}")
    
    # Check for inconsistent list formatting
    list_items = []
    in_list = False
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if re.match(r'^[\*\-\+]\s', stripped):
            list_items.append((i, stripped[0]))
            in_list = True
        elif re.match(r'^\d+\.\s', stripped):
            list_items.append((i, 'numbered'))
            in_list = True
        elif stripped == '' and in_list:
            continue
        else:
            in_list = False
    
    # Check for mixed list markers
    if list_items:
        markers = set(item[1] for item in list_items)
        if len(markers) > 1 and 'numbered' not in markers:
            issues.append(f"Mixed list markers used: {markers}")
    
    # Check for missing newlines before headers
    for i, line in enumerate(lines):
        if i > 0 and re.match(r'^#+\s', line):
            if lines[i-1].strip() != '':
                issues.append(f"Line {i+1}: Header should have blank line before it")
    
    # Check for trailing spaces
    for i, line in enumerate(lines, 1):
        if line.endswith(' ') or line.endswith('\t'):
            issues.append(f"Line {i}: Trailing whitespace")
    
    return issues

def main():
    base_dir = Path(__file__).parent.parent
    recipes_dir = base_dir / '_recipes'
    
    print("=== MARKDOWN ISSUES CHECK ===\n")
    
    total_issues = 0
    files_with_issues = 0
    
    for file_path in sorted(recipes_dir.glob('*.md')):
        front_matter, content = extract_front_matter_and_content(file_path)
        
        issues = check_markdown_issues(content, file_path.name)
        
        if issues:
            files_with_issues += 1
            total_issues += len(issues)
            
            print(f"{file_path.name}")
            title = front_matter.get('title', 'No title') if front_matter else 'No title'
            print(f"  Title: {title}")
            
            for issue in issues:
                print(f"  ❌ {issue}")
            print()
    
    print(f"=== SUMMARY ===")
    print(f"Files checked: {len(list(recipes_dir.glob('*.md')))}")
    print(f"Files with issues: {files_with_issues}")
    print(f"Total issues: {total_issues}")
    
    if files_with_issues == 0:
        print("✅ No markdown issues found!")

if __name__ == '__main__':
    main()