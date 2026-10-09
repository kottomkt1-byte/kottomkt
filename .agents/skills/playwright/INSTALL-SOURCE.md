# Installation provenance

- Original: https://github.com/openai/skills/tree/main/skills/public/playwright
- Pinned upstream commit: `49f948faa9258a0c61caceaf225e179651397431`
- Classification: OpenAI official public skill.
- Installed complete `skills/public/playwright` directory, including scripts, references, agents, assets, NOTICE and LICENSE. Upstream content is unchanged; this provenance file was added locally.
- Script review: `scripts/playwright_cli.sh` checks for npx and delegates to `npx --yes --package @playwright/cli playwright-cli`; no sudo, credential extraction, or destructive filesystem command. This command downloads and executes the Playwright CLI package; npm/network and a browser are required. Upstream wrapper follows the registry version, so it is not a locked CLI dependency.
- Runtime verification: invoked using `bash`, opened the real C prototype in system Chromium, refreshed the accessibility snapshot, clicked the observed Place button ref, and saved a screenshot. Initial stale references after Vite hot reload were resolved with a fresh snapshot.
- Cloud read-only default caches require writable `npm_config_cache` and `XDG_CACHE_HOME` paths. HOME and CODEX_HOME were not changed. Browser config uses `/usr/bin/chromium` with the container's `--no-sandbox` launch setting.
- The official FFmpeg download endpoint was blocked by network policy. Final screen recordings use actual Chromium CDP frames encoded by the already installed `/usr/bin/ffmpeg`; no claim that the CLI video recorder succeeded.
