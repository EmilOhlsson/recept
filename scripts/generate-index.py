#!/usr/bin/env/python3

import os

blacklist = ['.', '..', '.git', 'scripts']

print('# Emils receptsamling')
print('''En liten receptsamling, mest för att det ska gå snabbare på ICA''')
for directory, subdirectories, files in os.walk('.'):
    subdirectories.sort()
    for bl in blacklist:
        if bl in subdirectories: subdirectories.remove(bl)
    if directory == '.': continue
    print(f'## {directory}')
    for recept in sorted(files):
        print(f' * [{recept}]({os.path.basename(directory)}/{recept})')
