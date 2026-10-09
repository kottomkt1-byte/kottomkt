#!/usr/bin/env python3
"""Query Codex's actual skill loader; no model turn or website changes."""
import argparse
import json
from pathlib import Path
import queue
import subprocess
import tempfile
import threading

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[2])
parser.add_argument('--output', type=Path)
parser.add_argument('--include-kotto', action='store_true')
args = parser.parse_args()
repo = args.repo.resolve()
names = {'copywriting', 'copy-editing', 'product-marketing', 'humanizer', 'grammar-checker', 'style-guide', 'kotto-korean-copywriter', 'frontend-design', 'astra-frontend-design', 'ui-ux-pro-max', 'playwright'}
if args.include_kotto:
    names.add('kotto-korean-copywriter')

with tempfile.TemporaryDirectory(prefix='codex-skill-check-') as state:
    # Keep CODEX_HOME and authentication intact; redirect only disposable DB/logs.
    command = ['codex', '-c', f'sqlite_home={json.dumps(state)}',
               '-c', f'log_dir={json.dumps(state)}', 'app-server', '--stdio']
    with tempfile.TemporaryFile(mode='w+') as stderr:
        process = subprocess.Popen(command, cwd=repo, stdin=subprocess.PIPE,
                                   stdout=subprocess.PIPE, stderr=stderr,
                                   text=True, bufsize=1)
        lines = queue.Queue()

        def receive():
            for line in process.stdout:
                lines.put(line)
            lines.put(None)

        threading.Thread(target=receive, daemon=True).start()

        def rpc(identifier, method, params):
            process.stdin.write(json.dumps({'id': identifier, 'method': method,
                                            'params': params}) + '\n')
            process.stdin.flush()
            while True:
                line = lines.get(timeout=30)
                if line is None:
                    raise RuntimeError('Codex app-server exited before responding')
                response = json.loads(line)
                if response.get('id') == identifier:
                    if 'error' in response:
                        raise RuntimeError(json.dumps(response['error']))
                    return response['result']

        try:
            initialized = rpc(1, 'initialize', {
                'clientInfo': {'name': 'skill-discovery-check', 'version': '1.0'},
                'capabilities': {'experimentalApi': True}})
            process.stdin.write('{"method":"initialized","params":{}}\n')
            process.stdin.flush()
            result = rpc(2, 'skills/list', {
                'cwds': [str(repo)],
                'forceReload': True})
            entry = next(e for e in result['data'] if e['cwd'] == str(repo))
            found = {s['name']: s for s in entry['skills'] if s['name'] in names}
            success = (set(found) == names and not entry['errors']
                       and all(s['enabled'] and s['scope'] == 'repo'
                               and Path(s['path']).resolve() ==
                               repo / '.agents/skills' / name / 'SKILL.md'
                               for name, s in found.items()))
            for e in result['data']:
                e['skills'] = [s for s in e['skills'] if s['name'] in names]
            report = {'passed': success, 'initialize': initialized, 'result': result}
            if args.output:
                args.output.write_text(json.dumps(report, indent=2) + '\n')
            print(json.dumps({'passed': success, 'repo': str(repo),
                              'skills': found, 'errors': entry['errors']}, indent=2))
            if not success:
                raise SystemExit(1)
        except (RuntimeError, queue.Empty, BrokenPipeError) as error:
            stderr.seek(0)
            print(json.dumps({'passed': False, 'reason': str(error),
                              'server_stderr': stderr.read()}, indent=2))
            raise SystemExit(2)
        finally:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
