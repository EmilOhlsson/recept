#!/usr/bin/env/python3

import os

def title(file_name):
    with open(file_name, 'r') as f:
        return f.readline().strip('#').strip()

blacklist = ['.', '..', '.git', 'scripts']

print('# Emils receptsamling')
print('''En liten receptsamling, mest för att det ska gå snabbare på ICA''')
for directory, subdirectories, files in os.walk('.'):
    subdirectories.sort()
    for bl in blacklist:
        if bl in subdirectories: subdirectories.remove(bl)
    if directory == '.': continue
    metainfo = directory + '/meta'
    print(f'## {title(metainfo)}')
    for recept in sorted(files):
        if recept == 'meta': continue
        file_name = os.path.basename(directory) + '/' + recept
        print(f' * [{title(file_name)}]({file_name})')
    print()
