---
name: make-interfaces-feel-better
description: UI polish and design-engineering guidance for typography, surfaces, interaction feedback, animation, and visual details. Use when polishing an interface or when the user says it feels visually off.
---

# Make Interfaces Feel Better

Preserve the existing design system and product language. Treat these as
heuristics, not universal rules, and verify changes in the browser on desktop
and mobile.

## Typography

- Use a deliberate type scale, line height, and measure before adding decoration.
- Consider balanced wrapping for short headings and pretty wrapping for short
  body copy when browser support and layout make it appropriate.
- Use tabular numbers for updating numeric values when proportional digits cause
  visible movement.
- Check actual font rendering rather than applying smoothing mechanically.

## Surfaces

- Make nested corner radii visually concentric when surfaces are closely nested.
- Prefer optical alignment for asymmetric icons and mixed icon/text controls.
- Use borders, shadows, or contrast according to the surface's purpose; do not
  replace structural dividers with elevation effects.
- Give interactive controls adequate hit areas without overlapping neighbors.
- Add neutral image outlines only when images disappear into their background.

## Interaction

- Make hover, focus, active, loading, success, and disabled states intentional.
- Keep state transitions interruptible and avoid motion that delays interaction.
- Use restrained press feedback where it suits the control and product tone.
- Keep focus indicators visible and respect reduced-motion preferences.

## Animation

- Prefer CSS transitions for interactive state changes and keyframes for
  one-shot sequences.
- Animate semantic pieces rather than a large container only when sequencing
  improves comprehension.
- Make exits quieter than entrances and avoid animating on initial load unless
  the entrance is intentional.
- Transition only properties that need animation. Add `will-change` only after
  observing a compositing problem.

## Review

Inspect the running interface before changing it. Prioritize information
architecture, layout, interaction, and then visual polish. Report specific
before/after changes with file references, but use the format best suited to the
size of the change.
