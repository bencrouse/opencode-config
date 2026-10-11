import { Plugin } from "@opencode/plugin"

// Permission patterns are prefix-shaped, so `git diff *` can otherwise also
// approve `git diff ... && destructive-command`. Reject shell composition for
// commands that are auto-approved by opencode.jsonc; run each command on its own.
const SAFE_COMMANDS = [
  "git status",
  "git log",
  "git diff",
  "git show",
  "git blame",
  "git rev-parse",
  "git ls-files",
  "git branch",
  "git remote -v",
  "gh status",
  "gh auth status",
  "gh pr view",
  "gh pr list",
  "gh pr status",
  "gh pr checks",
  "gh pr diff",
  "gh issue view",
  "gh issue list",
  "gh repo view",
]

function isAutoApproved(command: string): boolean {
  return SAFE_COMMANDS.some((safe) => command === safe || command.startsWith(`${safe} `))
}

export function hasShellComposition(command: string): boolean {
  let quote: "single" | "double" | undefined

  for (let index = 0; index < command.length; index += 1) {
    const char = command[index]
    const next = command[index + 1]

    if (quote === "single") {
      if (char === "'") quote = undefined
      continue
    }

    if (char === "\\") {
      index += 1
      continue
    }

    if (quote === "double") {
      if (char === '"') {
        quote = undefined
      } else if (char === "`" || (char === "$" && next === "(")) {
        return true
      }
      continue
    }

    if (char === "'") {
      quote = "single"
      continue
    }
    if (char === '"') {
      quote = "double"
      continue
    }

    if (
      char === ";" ||
      char === "|" ||
      char === "&" ||
      char === ">" ||
      char === "<" ||
      char === "`" ||
      char === "\n" ||
      char === "\r" ||
      (char === "$" && next === "(")
    ) {
      return true
    }
  }

  return false
}

export function hasUnsafeReadOption(command: string): boolean {
  // Git's read-shaped commands can still write with --output, while gh's
  // --web opens an external application. Both should go through a prompt.
  return /(?:^|[\s"'])--(?:output(?:=|[\s"']|$)|web(?:[\s"']|$))/.test(command)
}

export default Plugin.define({
  id: "shell-operator-guard",
  async setup(ctx) {
    await ctx.tool.hook("execute.before", (event) => {
      if (event.tool !== "shell") return

      const input = event.input as { command?: string } | undefined
      const command = typeof input?.command === "string" ? input.command.trim() : ""
      if (!isAutoApproved(command)) return
      if (!hasShellComposition(command) && !hasUnsafeReadOption(command)) return

      throw new Error(
        "BLOCKED: an auto-approved read command cannot compose shell commands, redirect output, write with --output, or open --web. Run it separately so OpenCode prompts for permission.",
      )
    })
  },
})
