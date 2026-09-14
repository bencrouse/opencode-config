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

- OpenCode
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
configuration.

Authenticate providers separately on each machine. Never copy
`~/.local/share/opencode/auth.json` or `mcp-auth.json` into this repository.

After changing configuration, agents, commands, skills, or plugins, quit and
restart OpenCode.

## Permission Gate

The permission gate classifies actions that OpenCode would otherwise ask you
about. It can approve an action, but it cannot override an explicit deny. If LM
Studio is unavailable, times out, or returns an invalid response, OpenCode falls
back to its normal permission prompt.

Start the LM Studio API server before OpenCode:

```sh
lms server start
```

The default endpoint is `http://127.0.0.1:1234/v1/chat/completions`, and the
default model is `qwen3.6-35b-a3b`. Override either when launching OpenCode:

```sh
OPENCODE_PERMISSION_GATE_ENDPOINT=http://127.0.0.1:1234/v1/chat/completions \
OPENCODE_PERMISSION_GATE_MODEL=another-model \
opencode
```

Classification decisions are written to `~/.config/opencode/auditor.log`.
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
opencode debug skill
```

`opencode debug config` validates the effective configuration but may include
project-local overrides when run inside another repository. Run it from this
checkout for the global baseline.

## Optional macOS Notifications

Install `terminal-notifier`:

```sh
brew install terminal-notifier
```

Then add `"./optional/notify.ts"` to the `plugin` array in
`config/opencode.jsonc`.

## Optional MCPs

Add these only on machines where they are useful, then authenticate locally:

```jsonc
{
  "mcp": {
    "ios-simulator": {
      "type": "local",
      "command": ["npx", "-y", "ios-simulator-mcp@1.6.0"],
      "enabled": true
    },
    "sentry": {
      "type": "remote",
      "url": "https://mcp.sentry.dev/mcp",
      "enabled": true
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

## License

Licensed under the Apache License, Version 2.0. See `LICENSE` and `NOTICE`.
