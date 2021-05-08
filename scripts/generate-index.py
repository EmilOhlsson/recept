#!/usr/bin/env python3

import os

def title(file_name):
    with open(file_name, 'r') as f:
        return f.readline().strip('#').strip()

skips = ['.', '..', '.git', 'scripts']

categories = []

for directory, subdirectories, files in os.walk('.'):
    for skip in skips:
        if skip in subdirectories: subdirectories.remove(skip)
    if os.path.basename(directory) in skips: continue
    group = {}
    name = title(os.path.join(directory, 'meta'))
    recipies = []
    for recept in files:
        if recept == 'meta': continue
        file_name = os.path.basename(directory) + '/' + recept
        recipies.append(f'[{title(file_name)}]({file_name})')
    categories.append((name, recipies))

# Build page
print('# Emils receptsamling')
print('''En liten receptsamling, mest för att det ska gå snabbare på ICA''')
for name, recipies in sorted(categories):
    print(f'## {name}')
    for link in sorted(recipies):
        print(f' * {link}')
    print()
