#!/usr/bin/env python3
"""Inspect only the publishable build; never read environment values or secrets."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib
import json
import re

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
files=sorted(p for p in DIST.rglob('*') if p.is_file())
forbidden=[];patterns=[];broken=[]
secret_patterns=[r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
 r'gh[pousr]_[A-Za-z0-9]{30,}',r'AKIA[0-9A-Z]{16}',r'sk_live_[A-Za-z0-9]{20,}']

def check_link(source,url):
    parsed=urlsplit(url)
    if parsed.scheme or parsed.netloc or not parsed.path:return
    target=(DIST if parsed.path.startswith('/') else source.parent)/unquote(parsed.path.lstrip('/'))
    if not target.resolve().is_relative_to(DIST.resolve()) or not target.exists():
        broken.append({'source':str(source.relative_to(DIST)),'resource':url})

class Resources(HTMLParser):
    def handle_starttag(self,tag,attrs):
        for key,value in attrs:
            if key in ('href','src','poster') and value:check_link(self.source,value)

for file in files:
    relative=file.relative_to(DIST)
    if any(x.startswith('.') or x in ('node_modules','reports','qa') for x in relative.parts) or file.suffix in ('.pem','.key','.map'):
        forbidden.append(str(relative))
    if file.suffix in ('.html','.js','.css','.json','.txt'):
        body=file.read_text(errors='replace')
        if any(re.search(p,body) for p in secret_patterns):patterns.append(str(relative))
        if file.suffix=='.html':
            parser=Resources();parser.source=file;parser.feed(body)
        if file.suffix=='.css':
            for url in re.findall(r'url\([\"\']?([^\)\"\']+)',body):check_link(file,url)

report={'passed':not(forbidden or patterns or broken),'files':len(files),
 'totalBytes':sum(p.stat().st_size for p in files),'forbiddenFiles':forbidden,
 'credentialPatternFiles':patterns,'brokenLocalResources':broken,
 'scope':'Static build file/resource inspection and common credential signatures. Not a guarantee of all possible secret formats.',
 'privacy':'Only approved public business email and prototype content. No customer records, API configuration, root site files or repository skill files packaged.',
 'manifest':[{'path':str(p.relative_to(DIST)),'bytes':p.stat().st_size,
  'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]}
(ROOT/'reports/dist-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='manifest'},ensure_ascii=False,indent=2))
raise SystemExit(0 if report['passed'] else 1)
