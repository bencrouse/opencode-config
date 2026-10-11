# OpenCode Config

Portable personal OpenCode configuration with reusable agents, commands,
skills, browser MCPs, and conservative permission defaults.

## Included

- Chrome and WebKit browser MCPs with inspection tools auto-approved.
- Browser QA, code-review finder/verifier, and code-simplifier agents.
- `/code-review`, `/fix-quality`, `/cleanup-comments`, `/grill-me`, and `/tldr`.
- Frontend design, interface polish, and decision-framework skills.
- A shell guard that prevents auto-approved read commands from hiding chained
  commands, substitutions, or redirections.
- An intent-aware permission gate backed by the local LM Studio model
  `qwen3.6-35b-a3b`.
- Type checking and tests for custom plugins.

The config intentionally excludes credentials, session state, logs,
organization-specific MCPs, iOS tooling, and project-specific database or Git
workflows.

## Install

Requirements:

- OpenCode 2.0.26 or newer
- Node.js 24.15 or newer and npm
- Git
- Chrome for the Chrome MCP
- LM Studio with `qwen3.6-35b-a3b` loaded and its API server enabled

```sh
git clone <repository-url> ~/Code/opencode-config
~/Code/opencode-config/install.sh
```

The installer creates `~/.config/opencode` as a symlink to this checkout's
`config/` directory and runs `npm ci`. It refuses to overwrite an existing
configuration. Plugin dependencies are also installed in `config/` for OpenCode's
local plugin resolver.

Authenticate providers separately on each machine. Never copy
credentials or databases into this repository. V2 stores provider credentials
in its SQLite database.

After changing configuration, agents, commands, skills, or plugins, reload
the server configuration with `opencode reload`.
Restart the TUI after changing terminal plugins. Restarting only the TUI does
not reload the shared server's configuration.
If a reload still reports old plugin exports after editing plugin code, run
`opencode service restart` to clear the server's imported-module cache.

## Permission Gate

The permission gate classifies actions that OpenCode would otherwise ask you
about. It can approve an action, but it cannot override an explicit deny. If LM
Studio is unavailable, times out, or returns an invalid response, OpenCode falls
back to its normal permission prompt.

Start the LM Studio API server before OpenCode:

```sh
lms server start
```

The plugin is vendored from [opencode-permission-gate](https://github.com/bencrouse/opencode-permission-gate)
at the commit recorded in `config/plugins/permission-gate/permissions-check.ts`.
Its source matches upstream apart from the provenance comment. The adjacent
`permissions-check.LICENSE` retains its MIT license.

The default endpoint is `http://127.0.0.1:1234/v1/chat/completions`. This config
selects `qwen3.6-35b-a3b` and 30-second extraction and classification timeouts
via plugin options in `config/opencode.jsonc`, rather than modifying upstream
defaults. Override those options there, or set environment variables when
starting the OpenCode server:

```sh
OPENCODE_PERMISSION_GATE_ENDPOINT=http://127.0.0.1:1234/v1/chat/completions \
OPENCODE_PERMISSION_GATE_MODEL=another-model \
OPENCODE_PERMISSION_GATE_CLASSIFY_TIMEOUT_MS=45000 \
OPENCODE_PERMISSION_GATE_EXTRACT_TIMEOUT_MS=45000 \
opencode
```

Classification decisions are written to `~/.config/opencode/auditor.log`.
V2 evaluates the classifier only for `ask` decisions; configured allows and denies
are unchanged. Intent records persist in plugin storage so boundaries survive
compaction and server reloads. Missing context or classifier failures still prompt.
Review that log while establishing confidence in the model's decisions. This
experimental classifier reduces prompt fatigue; it is not a security boundary.

## Existing Config

If `~/.config/opencode` already exists, compare and back it up before replacing
it:

```sh
mv ~/.config/opencode ~/.config/opencode.backup
~/Code/opencode-config/install.sh
```

Do not move a running OpenCode session's configuration until you are ready to
restart it.

## Validate

```sh
npm ci
npm run check
opencode debug config
opencode debug agents
opencode plugin list
opencode mcp list
```

`opencode debug config` validates the effective configuration but may include
project-local overrides when run inside another repository. Run it from this
checkout for the global baseline.

## Optional macOS Notifications

Install `terminal-notifier`:

```sh
brew install terminal-notifier
```

Then add `"./optional/notify.ts"` to the `plugins` array in
`config/opencode.jsonc`.

## Optional MCPs

Add these only on machines where they are useful, then authenticate locally:

```jsonc
{
  "mcp": {
    "servers": {
      "ios-simulator": {
        "type": "local",
        "command": ["npx", "-y", "ios-simulator-mcp@1.6.0"],
        "disabled": false
      },
      "sentry": {
        "type": "remote",
        "url": "https://mcp.sentry.dev/mcp",
        "disabled": false
      }
    }
  }
}
```

Organization-specific MCPs should generally live in a private branch or a
separate local config rather than a public repository.

## Project-Specific Config

Keep commands tied to one repository under that project's `.opencode/`
directory. Database reset/migration commands and hard-coded branch workflows do
not belong in this global configuration.

## V2 Migration Notes

Supported V1 config and Markdown agent definitions remain compatible and are
intentionally retained. Custom plugins use `@opencode/plugin` and V2 hooks.
The compaction reserve uses `buffer`; V2 has no equivalent for V1 pruning.
V2 accepts `lsp: true` but currently does not run language servers. Use each
project's lint/typecheck/compiler commands for diagnostics.

The installer registers Herdr's terminal integration when `herdr` is available.
Generated Herdr files are excluded from Git. Reinstall them after a Herdr update
with `herdr integration install opencode`, then restart the TUI.

## License

Licensed under the Apache License, Version 2.0. See `LICENSE` and `NOTICE`.
