import assert from "node:assert/strict"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { it } from "node:test"

process.env.OPENCODE_PERMISSION_GATE_LOG_PATH = join(tmpdir(), `opencode-permission-gate-test-${process.pid}.log`)

const { default: permissionGate } = await import("../config/plugins/permissions-check.ts")

it("approves an asked permission only when the classifier allows it", async () => {
  const originalFetch = globalThis.fetch
  const replies: unknown[] = []
  let requests = 0

  globalThis.fetch = async () => {
    requests += 1
    const content =
      requests === 1
        ? { task: "run the tests", constraints: [], authorizations: [] }
        : { decision: "allow", category: "none", reason: "routine local test run" }

    return new Response(
      JSON.stringify({
        choices: [{ message: { content: JSON.stringify(content) } }],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    )
  }

  try {
    const hooks = await permissionGate({
      client: {
        postSessionIdPermissionsPermissionId: async (request: unknown) => {
          replies.push(request)
        },
      },
      directory: "/tmp/project",
      worktree: "/tmp/project",
    } as any)

    await hooks["chat.message"]?.(
      { sessionID: "session-allow" } as any,
      {
        message: { role: "user" },
        parts: [{ type: "text", text: "Run the tests" }],
      } as any,
    )

    await new Promise((resolve) => setImmediate(resolve))

    await hooks.event?.({
      event: {
        type: "permission.asked",
        properties: {
          id: "permission-1",
          sessionID: "session-allow",
          permission: "bash",
          patterns: ["npm test"],
          metadata: { command: "npm test" },
          always: ["npm test"],
        },
      },
    } as any)

    assert.equal(requests, 2)
    assert.deepEqual(replies, [
      {
        path: { id: "session-allow", permissionID: "permission-1" },
        body: { response: "once" },
      },
    ])
  } finally {
    globalThis.fetch = originalFetch
  }
})

it("leaves the normal prompt in place when the classifier does not allow", async () => {
  const originalFetch = globalThis.fetch
  const replies: unknown[] = []

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                decision: "ask",
                category: "undeclared-dependency",
                reason: "requires user approval",
              }),
            },
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    )

  try {
    const hooks = await permissionGate({
      client: {
        postSessionIdPermissionsPermissionId: async (request: unknown) => {
          replies.push(request)
        },
      },
      directory: "/tmp/project",
      worktree: "/tmp/project",
    } as any)

    await hooks.event?.({
      event: {
        type: "permission.asked",
        properties: {
          id: "permission-2",
          sessionID: "session-ask",
          permission: "bash",
          patterns: ["npm install left-pad"],
          metadata: { command: "npm install left-pad" },
          always: ["npm install left-pad"],
        },
      },
    } as any)

    assert.deepEqual(replies, [])
  } finally {
    globalThis.fetch = originalFetch
  }
})
