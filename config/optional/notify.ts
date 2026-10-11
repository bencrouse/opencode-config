import { Plugin } from "@opencode/plugin"
import { execFile } from "node:child_process"

// Optional macOS notifications. Add this file to the `plugins` list in
// opencode.jsonc after installing terminal-notifier.
function setup(ctx: Plugin.Context) {
  const shortDir = ctx.location.directory.split("/").filter(Boolean).pop() ?? ""
  const controller = new AbortController()

  async function notify(message: string) {
    try {
      await new Promise<void>((resolve) => execFile("terminal-notifier", [
        "-title", "opencode", "-subtitle", shortDir, "-message", message,
      ], { timeout: 5000, signal: controller.signal }, () => resolve()))
    } catch {
      // A missing notifier must never interrupt the session.
    }
  }

  void (async () => {
    for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
      if (event.location?.directory !== ctx.location.directory) continue
      if (event.type === "session.execution.succeeded" || event.type === "session.execution.failed") {
        await notify("Needs your input")
      }
    }
  })().catch(() => {})
  return () => controller.abort()
}

export default Plugin.define({ id: "macos-notify", setup })
