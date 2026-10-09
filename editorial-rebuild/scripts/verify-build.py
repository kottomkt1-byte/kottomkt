"""Check the public build's local links, assets, source integrity, and boundaries."""
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / 'dist'
failures = []

class Links(HTMLParser):
    def handle_starttag(self, tag, attributes):
        for key, value in attributes:
            if key in ('src', 'href') and value:
                parsed = urlsplit(value)
                if parsed.scheme or parsed.netloc or not parsed.path:
                    continue
                target = BUILD / unquote(parsed.path).lstrip('/')
                if not target.resolve().is_relative_to(BUILD.resolve()) or not target.is_file():
                    failures.append({'page': self.page, 'missingLocalTarget': value})

manifest = {}
for path in sorted(BUILD.rglob('*')):
    if not path.is_file():
        continue
    relative = str(path.relative_to(BUILD))
    content = path.read_bytes()
    manifest[relative] = hashlib.sha256(content).hexdigest()
    if any(part.startswith('.') for part in path.relative_to(BUILD).parts) or path.suffix in ('.map','.json','.ts','.py'):
        failures.append({'unexpectedPublicFile':relative})
    if path.suffix in ('.html','.css','.js'):
        source = content.decode()
        if re.search(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:sk_live_|sk_test_)[A-Za-z0-9]{16,}', source):
            failures.append({'possibleSecretFile':relative})
    if path.suffix == '.html':
        parser = Links(); parser.page = relative; parser.feed(content.decode())

evidence = list((BUILD/'evidence').glob('*.png'))
entries = json.loads((ROOT/'reports/visual-update-original-images.json').read_text())['assets']
for path in evidence:
    expected = next(item['sha256'] for item in entries if item['filename'] == path.name)
    if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        failures.append({'changedEvidence':path.name})
if len(evidence) != 30:
    failures.append({'evidenceCount':len(evidence)})
pages = len(list(BUILD.glob('*.html')))
if pages != 12:
    failures.append({'htmlPages':pages})
report = {'htmlPages':pages,'files':len(manifest),'originalImages':len(evidence),'failures':failures,'manifest':manifest}
(ROOT/'reports/build-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({key:value for key,value in report.items() if key!='manifest'}))
raise SystemExit(bool(failures))
