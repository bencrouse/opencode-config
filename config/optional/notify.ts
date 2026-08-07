import type { Plugin } from "@opencode-ai/plugin"

// Optional macOS notifications. Add this file to the `plugin` list in
// opencode.jsonc after installing terminal-notifier.
export default (async ({ $, directory, worktree }) => {
  const shortDir = (worktree ?? directory ?? process.cwd()).split("/").filter(Boolean).pop() ?? ""

  async function notify(message: string) {
    try {
      await $`terminal-notifier -title opencode -subtitle ${shortDir} -message ${message}`.quiet()
    } catch {
      // A missing notifier must never interrupt the session.
    }
  }

  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") await notify("Needs your input")
    },
  }
}) satisfies Plugin
