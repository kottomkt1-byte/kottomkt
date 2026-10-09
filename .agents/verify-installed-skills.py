#!/usr/bin/env python3
"""Check pinned installed files and run a read-only UIUX search; not catalog proof."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

base = Path(__file__).resolve().parent
sources = json.loads((base / 'skill-sources.json').read_text())
for name, source in sources.items():
    folder = base / 'skills' / name
    for relative, expected in source['files'].items():
        path = folder / relative
        if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise SystemExit(f'FAIL: missing or changed {path}')
    text = (folder / 'SKILL.md').read_text()
    if not text.startswith('---\n') or f'\nname: {name}\n' not in text:
        raise SystemExit(f'FAIL: invalid skill name for {name}')
    print(f'PASS: {name}, {len(source["files"])} pinned files')

result = subprocess.run([
    sys.executable, '-B', str(base / 'skills/ui-ux-pro-max/scripts/search.py'),
    'keyboard focus modal', '--domain', 'ux', '--max-results', '1', '--json'
], check=True, capture_output=True, text=True)
data = json.loads(result.stdout)
if data.get('domain') != 'ux' or data.get('count', 0) < 1:
    raise SystemExit('FAIL: expected a real UX search result')
if data['results'][0].get('Issue') != 'Focus States':
    raise SystemExit('FAIL: unexpected top search result for pinned dataset')
print('PASS: UIUX offline search returned Focus States')
print('Catalog recognition is a separate check: verify-skill-discovery.py')
