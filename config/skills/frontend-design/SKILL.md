---
name: frontend-design
description: Guidance for distinctive, intentional visual design when building new UI or substantially reshaping an existing one. Use for aesthetic direction, typography, layout, and avoiding templated defaults.
metadata:
  opencode/autoinvoke: false
license: Complete terms in LICENSE.txt
---

# Frontend Design

## Modification Notice

This file is a modified version of the Apache-2.0-licensed frontend-design
skill previously used in Ben Crouse's local OpenCode configuration. It was
condensed and reorganized for this portable repository.

Approach new design work as a design lead responsible for a visual identity
that could not be mistaken for another product. Make deliberate choices about
palette, typography, layout, copy, and motion that arise from the subject and
audience rather than current design trends.

## Ground The Direction

Identify the concrete subject, audience, and page's single job. Draw from the
subject's materials, instruments, artifacts, and language. Use real content
where possible; placeholder copy makes design decisions feel generic.

The hero should express the page's thesis. Typography should carry personality,
with distinct but complementary display, body, and utility roles where needed.
Structural devices such as numbering, labels, and dividers must encode real
information rather than decorate the page.

## Process

Before building, establish a compact direction:

- A named palette of four to six colors with hex values.
- Typefaces and roles, including weights, widths, and scale.
- A layout concept, explored with short prose or ASCII wireframes.
- One signature element that is specific to the brief.
- A motion approach, including a deliberate choice to use little or none.

Critique the direction against the brief. Replace anything that could have been
produced for an unrelated product. Spend boldness in one place and keep the
surrounding work disciplined.

## Build Quality

Match implementation complexity to the vision. Minimal work needs precise
spacing and typography; maximal work needs enough execution to support the
idea. Ensure responsive behavior, visible keyboard focus, reduced-motion
support, and clear mobile hierarchy.

Use interface copy to improve understanding. Prefer active voice, plain verbs,
consistent action names, and specific recovery guidance. Empty and error states
should help the user take the next action.

Critique the implementation in the browser. Remove one unnecessary decorative
element before considering the design finished.
