#!/usr/bin/env python3
"""Verify installed copy skills against pinned files, independently of Codex discovery."""
import hashlib
import json
from pathlib import Path
import re

base = Path(__file__).resolve().parent
root = base.parent / 'skills'
sources = json.loads((base / 'sources.json').read_text())
for name, record in sources.items():
    folder = root / name
    expected = record['files']
    actual = {str(p.relative_to(folder)) for p in folder.rglob('*') if p.is_file()}
    if actual != set(expected):
        raise SystemExit(f'FAIL {name}: missing={set(expected)-actual}, extra={actual-set(expected)}')
    for relative, digest in expected.items():
        path = folder / relative
        if path.is_symlink() or hashlib.sha256(path.read_bytes()).hexdigest() != digest:
            raise SystemExit(f'FAIL: changed file or symlink: {path}')
        if path.stat().st_mode & 0o022:
            raise SystemExit(f'FAIL: group/world-writable file: {path}')
    skill = folder / 'SKILL.md'
    text = skill.read_text()
    header = text.split('---', 2)[1]
    if not text.startswith('---\n') or not re.search(r'^name: ' + re.escape(name) + r'$', header, re.M):
        raise SystemExit(f'FAIL: metadata for {name}')
    if not re.search(r'^description: .+', header, re.M):
        raise SystemExit(f'FAIL: missing description for {name}')
    for reference in re.findall(r'\]\(([^)]+)\)', text):
        if reference.startswith(('#', 'https://', 'http://')):
            continue
        if name == 'style-guide' and reference == 'URL':
            continue  # Literal upstream Markdown syntax example, not an asset.
        if not (folder / reference.split('#')[0]).exists():
            raise SystemExit(f'FAIL: missing reference {name}: {reference}')
    print(f'PASS: {name}, {len(expected)} files, metadata and linked resources')
print('This verifies files, not model behavior. Run verify-discovery.py --include-kotto for the Codex catalog.')
