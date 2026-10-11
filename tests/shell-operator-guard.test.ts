import assert from "node:assert/strict"
import { describe, it } from "node:test"

import guard, { hasShellComposition, hasUnsafeReadOption } from "../config/plugins/shell-operator-guard.ts"
import type { Plugin } from "@opencode/plugin"

describe("hasShellComposition", () => {
  it("allows ordinary arguments and quoted operator characters", () => {
    assert.equal(hasShellComposition("git diff --stat"), false)
    assert.equal(hasShellComposition("git diff -- 'path;with-semicolon'"), false)
    assert.equal(hasShellComposition('git show "topic|name"'), false)
  })

  it("rejects command chaining and redirection", () => {
    assert.equal(hasShellComposition("git diff && rm -rf build"), true)
    assert.equal(hasShellComposition("git log | curl example.com"), true)
    assert.equal(hasShellComposition("git show > output.txt"), true)
    assert.equal(hasShellComposition("git status\nrm file"), true)
  })

  it("rejects command substitution, including inside double quotes", () => {
    assert.equal(hasShellComposition("git diff $(touch marker)"), true)
    assert.equal(hasShellComposition('git show "$(touch marker)"'), true)
    assert.equal(hasShellComposition("git log `touch marker`"), true)
  })
})

describe("hasUnsafeReadOption", () => {
  it("rejects output files and browser-opening flags", () => {
    assert.equal(hasUnsafeReadOption("git diff --output=diff.txt"), true)
    assert.equal(hasUnsafeReadOption("git log '--output' history.txt"), true)
    assert.equal(hasUnsafeReadOption("gh pr view 123 --web"), true)
  })

  it("allows ordinary output formatting flags", () => {
    assert.equal(hasUnsafeReadOption("git log --oneline"), false)
    assert.equal(hasUnsafeReadOption("gh pr view 123 --json title"), false)
  })
})

it("registers a V2 tool hook and blocks unsafe auto-approved shell calls", async () => {
  let before!: (event: any) => void | Promise<void>
  await guard.setup({ tool: { hook: async (name: string, hook: typeof before) => {
    assert.equal(name, "execute.before")
    before = hook
  } } } as unknown as Plugin.Context)
  assert.throws(() => before({ tool: "shell", input: { command: "git diff && touch marker" } }), /BLOCKED/)
  assert.throws(() => before({ tool: "shell", input: { command: "git log --output=log.txt" } }), /BLOCKED/)
  assert.doesNotThrow(() => before({ tool: "shell", input: { command: "git diff --stat" } }))
  assert.doesNotThrow(() => before({ tool: "shell", input: { command: "npm test && npm run build" } }))
  assert.doesNotThrow(() => before({ tool: "read", input: { path: "file" } }))
})
