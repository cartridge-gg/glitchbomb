# Prompt Template — Figma → Component Integration

Copy, fill the `{{placeholders}}`, and use as delegation prompt.

---

## TASK

Implement the `{{COMPONENT_NAME}}` component from Figma into `{{TARGET_PATH}}` (e.g. `elements/my-component.tsx`).

## FIGMA SOURCE

- File key: `jgDDJCC5bTblajtAUyCcQ5`
- Desktop node: `{{DESKTOP_NODE_ID}}`
- Mobile node: `{{MOBILE_NODE_ID}}` (if applicable)
- Architecture reference: `{{NUMS_REFERENCE_PATH}}` (e.g. `/Users/bal7hazar/git/nums/client/src/components/elements/my-component.tsx`)

## DELIVERABLES

1. `client/src/components/{{TARGET_PATH}}.tsx` — component
2. `client/src/components/{{TARGET_PATH}}.stories.tsx` — stories
3. Update `client/src/components/{{LAYER}}/index.ts` exports (layer = elements | containers | scenes)

## PROCESS (follow in order, do NOT skip steps)

### Phase 1 — Extract spec from Figma

1. Run `get_figma_data(fileKey, nodeId)` on the desktop node
2. Run `download_figma_images` to get the reference PNG into `.agents/visual-qa/`
3. Read the reference PNG to see what you're building
4. From `globalVars.styles`, build a WRITTEN spec for every element:
   - Dimensions (width, height)
   - Padding, gap
   - Background color (exact rgba → map to preset token)
   - Text color (exact hex/rgba → map to preset token)
   - Font (family, size, weight, line-height)
   - Border radius, shadows, outlines
5. Cross-reference EVERY color against `client/src/themes/default.css` — use tokens, never hardcode

### Phase 2 — Read architecture reference

1. Read the nums reference file at `{{NUMS_REFERENCE_PATH}}`
2. Read its `.stories.tsx` counterpart
3. Read 2-3 existing gbomb components in the same layer for pattern matching
4. Note: adapt the ARCHITECTURE (props, structure) from nums, but use VISUAL STYLE from Figma

### Phase 3 — Implement

Follow these rules strictly:

**Colors:**
- Verify every color in `client/src/themes/default.css` before using
- Use preset tokens: `bg-green-800` not `bg-[rgba(54,248,24,0.08)]`
- Tailwind opacity modifiers (`bg-yellow/[0.08]`) do NOT work with this project's CSS variables

**Fonts:**
- `font-secondary` (VT323) goes on each `<span>` directly — NOT on parent containers
- Global `* { font-family: Rubik One }` overrides inheritance
- Use `font-inherit` on nested children when parent has the font class
- Scene titles use default body font (Rubik One) — do NOT add `font-secondary`

**Wrapping UI primitives (Button, Card, etc.):**
- They inject default padding, gap, height
- ALWAYS override explicitly: `p-0 gap-0 h-10` (or whatever Figma specifies)
- Verify with `getComputedStyle` that overrides actually applied

**HTML:**
- `<div>` for containers, `<span>` for text, `<strong>` for emphasis
- No `<p>` for containers that might become interactive

**Style:**
- No `style={{}}` except for `textShadow` (no Tailwind equivalent)
- Shadows use `shadow-[...]` Tailwind syntax
- Borders that should be inside the box use `outline outline-N -outline-offset-N`

### Phase 4 — Verify computed styles (MANDATORY before screenshot)

After rendering in Storybook, run this via Playwright `browser_evaluate`:

```javascript
() => {
  const root = document.getElementById('storybook-root');
  const el = root?.firstElementChild;
  if (!el) return 'no element';
  const s = getComputedStyle(el);
  const children = [...el.querySelectorAll('*')].slice(0, 15).map(c => ({
    tag: c.tagName,
    width: getComputedStyle(c).width,
    height: getComputedStyle(c).height,
    padding: getComputedStyle(c).padding,
    gap: getComputedStyle(c).gap,
    bg: getComputedStyle(c).backgroundColor,
    font: getComputedStyle(c).fontFamily?.split(',')[0],
    color: getComputedStyle(c).color,
  }));
  return {
    root: { width: s.width, height: s.height, padding: s.padding, gap: s.gap, bg: s.backgroundColor },
    children,
  };
}
```

Compare each value against your Phase 1 spec. Fix ALL mismatches before continuing.

### Phase 5 — Visual comparison

1. Take Storybook screenshot
2. Read both Figma reference PNG and Storybook PNG
3. Compare element by element: dimensions → colors → fonts → spacing → shadows
4. Fix discrepancies, re-verify computed styles, re-screenshot

### Phase 6 — Finalize

- Run `pnpm build` from project root
- Run `pnpm lint:check:ts` from project root
- Verify exports in `index.ts`

## MUST NOT DO

- Do NOT use `style={{}}` (except textShadow)
- Do NOT hardcode colors without checking preset tokens
- Do NOT skip the `getComputedStyle` verification step
- Do NOT use `as any` or `@ts-ignore`
- Do NOT assume wrapper components (Button, Card) have no default styles
- Do NOT compare screenshots without first verifying computed values
- Do NOT interpret colors from screenshots — read them from Figma data

## CONTEXT

- Build: `pnpm build` from `/Users/bal7hazar/git/gbomb`
- Lint: `pnpm lint:check:ts` from `/Users/bal7hazar/git/gbomb`
- Storybook: `pnpm storybook` from `client/`
- Preset tokens: `client/src/themes/preset.ts`
- CSS variables: `client/src/themes/default.css`
- Visual QA output: `.agents/visual-qa/`
