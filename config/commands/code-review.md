---
description: Review a diff for correctness and maintainability with independent finder and verifier passes. Effort: low, medium (default), or high.
---

Perform a read-only code review. Report findings and do not edit files.

The first argument may select `low`, `medium`, or `high`; default to `medium`.
Treat the remaining arguments as the review target or focus. Announce the tier
in one line.

## Scope

Determine the diff from the target. Without an explicit target, include both the
upstream branch diff and uncommitted changes. Identify applicable `AGENTS.md`
files and changed files before reviewing.

## Low

Review the diff directly without subagents. Read enclosing functions where
needed. Report at most four concrete correctness findings.

## Medium and high

Launch independent `code-review-finder` subagents in parallel. Give each the
diff command, changed files, applicable instructions, target, candidate cap,
and exactly one angle.

Medium uses four angles with up to four candidates each:

1. Line-by-line correctness and language pitfalls.
2. Removed behavior, guards, and error paths.
3. Cross-file callers, callees, contracts, and tests.
4. Reuse, simplification, efficiency, and project conventions.

High uses all medium angles plus four more, with up to six candidates each:

1. Concurrency, retries, partial failures, and cleanup symmetry.
2. Security boundaries, validation, and untrusted input.
3. Wrapper, adapter, cache, and state ownership correctness.
4. A fresh gap sweep focused on anything the other angles missed.

Deduplicate candidates by root cause. Send each remaining candidate to one
`code-review-verifier` subagent. Keep `CONFIRMED` findings. Keep `PLAUSIBLE`
findings only when the uncertain runtime state is realistic and material. Drop
`REFUTED` findings.

## Output

Findings come first, ordered by severity, with file and line references. For
each finding include the defect, failure scenario, verdict, and evidence. Then
briefly state assumptions and testing gaps. If no findings survive verification,
say so explicitly.
