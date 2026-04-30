---
name: figma-to-storybook
description: Implement UI components from Figma designs with visual QA — extract design from Figma MCP, create React component + Storybook story, screenshot via Playwright, compare with Figma, iterate until pixel-accurate. Use when implementing any component from a Figma design.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Playwright, Figma
---

# Figma → React/Storybook Visual QA Pipeline

## CRITICAL LESSONS (read first)

These rules exist because visual comparison by "looking at screenshots" fails systematically. The human eye rationalizes differences. Only computed values don't lie.

### 1. Structure before style — ALWAYS

Before touching colors, fonts, or visual polish:
- Extract **every dimension** from Figma (width, height, padding, gap, margin)
- Render the component in Storybook
- Run `getComputedStyle` on every element and compare against Figma values
- Fix dimensional mismatches FIRST

Wrapper components (Button, Card, etc.) inject their own padding/gap/height. These silently break your layout and no amount of color tweaking will fix it. Always verify with `getComputedStyle` that `padding`, `gap`, `height`, `width` match Figma exactly.

### 2. Never interpret colors — READ them

Do not guess colors from screenshots. Extract the exact fill value from Figma MCP data:
- `get_figma_data` returns `fills` with exact rgba values
- Cross-reference every color against `client/src/themes/default.css` tokens
- If the Figma says `#36F818`, that's `green-100` — don't eyeball it as "yellow"

### 3. Verify fonts at the leaf node

A global `* { font-family: "Rubik One" }` rule overrides CSS inheritance. Setting `font-secondary` on a parent does NOT propagate to children. You must:
- Put `font-secondary` on each `<span>` that renders text directly
- Or use `font-inherit` on children when the parent has the font class
- After rendering, verify with `getComputedStyle(span).fontFamily` — never trust the class name alone

### 4. Download Figma screenshots for EVERY component

Do not rely on mental models of what a component "should look like". For every component:
- `download_figma_images` to get the reference PNG
- `Read` the PNG to view it
- Only then compare against your Storybook screenshot

### 5. getComputedStyle is the source of truth

After rendering in Storybook, run Playwright `browser_evaluate` to extract computed values:

```javascript
() => {
  const el = document.querySelector('#storybook-root > *');
  const s = getComputedStyle(el);
  return {
    width: s.width, height: s.height,
    padding: s.padding, gap: s.gap,
    backgroundColor: s.backgroundColor,
    fontFamily: s.fontFamily, fontSize: s.fontSize,
    color: s.color,
  };
}
```

Compare each value against the Figma CSS. If they don't match, the component is wrong — regardless of how it "looks".

### 6. Dive deep into Figma nodes

`get_figma_data` with `depth: 3` may not be enough. For complex components:
- Get the parent node first to understand structure
- Then request child nodes individually for exact fills, text styles, effects
- Read the `globalVars.styles` section — it contains padding, gap, dimensions, fills, font specs

### 7. Check preset tokens BEFORE using colors

Every color must be verified against `client/src/themes/default.css`:
- Never hardcode `rgba(...)` if a token exists
- Never use Tailwind opacity modifiers (`bg-yellow/[0.08]`) — they don't work with the project's CSS variable format
- Use the preset token directly: `bg-green-800` not `bg-[rgba(54,248,24,0.08)]`

---

## Pipeline

### Step 1: Extract Design from Figma

#### Get component data

```
get_figma_data(fileKey, nodeId)
```

Read the full response:
- `nodes[].children` — component tree structure
- `globalVars.styles` — ALL layout, fill, text, and effect definitions
- `components` / `componentSets` — variant information

#### Get reference screenshot

```
download_figma_images(fileKey, nodes: [{nodeId, fileName}], localPath, pngScale: 2)
```

Save to `.agents/visual-qa/` for later comparison.

#### Build a spec from the Figma data

For EACH element in the component tree, extract from `globalVars.styles`:

| Property | Where to find it |
|---|---|
| Width, height | `layout_XXX.dimensions` |
| Padding | `layout_XXX.padding` |
| Gap | `layout_XXX.gap` |
| Direction | `layout_XXX.mode` (row/column) |
| Background | `fill_XXX` |
| Border | `strokes` + `strokeWeight` |
| Shadow | `effect_XXX.boxShadow` |
| Font | `textStyle` reference → font family, size, weight, line-height |
| Text color | `fills` on TEXT nodes |
| Border radius | `borderRadius` |

Write this spec down before coding. This is your verification checklist.

### Step 2: Implement the Component

#### Before writing code

1. Read 2-3 existing components in the same directory to match patterns
2. Check `client/src/components/ui/` for primitives you might wrap (Button, Card, etc.)
3. If wrapping a UI primitive, check its default styles — it WILL inject padding/gap/height

#### Color rules

1. Check `client/src/themes/default.css` for every color
2. Check `client/src/themes/preset.ts` for Tailwind mappings
3. Use tokens: `bg-green-800` not `bg-[rgba(54,248,24,0.08)]`
4. For backgrounds that need opacity: use the preset scale (green-800 = 8%, white-900 = 4%)
5. For box-shadows: use `shadow-[...]` Tailwind syntax, not `style={{}}`
6. For text-shadow: `style={{}}` is acceptable (no Tailwind equivalent)

#### Font rules

- `font-secondary` = VT323 — put it on each `<span>` directly
- `font-inherit` — use on child elements when parent has the font set
- Titles (scene headers) use the default body font (Rubik One) — do NOT add `font-secondary`
- Always verify rendered font with `getComputedStyle(el).fontFamily`

#### HTML semantics

- Use `<div>` for containers (not `<p>` — may become interactive later)
- Use `<span>` for text inside containers
- Use `<strong>` for emphasized text (e.g., username in a row)
- Wrapper `<div>` for layout, `<span>` for inline text

#### Wrapping UI primitives (DANGER ZONE)

When using `Button`, `Card`, or other UI components:
- They inject default padding, gap, height, font
- You MUST override with explicit classes: `p-0 gap-0 h-10`
- After rendering, verify computed values match Figma — don't trust that your overrides worked

### Step 3: Create Storybook Story

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MyComponent } from "./my-component";

const meta = {
  title: "Elements/MyComponent",
  component: MyComponent,
  parameters: { layout: "centered" },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { /* ... */ } };
```

#### Layout by component type

| Type | `layout` | Decorator |
|---|---|---|
| Element | `"centered"` | None |
| Container | `"padded"` | `<div className="flex h-full w-full">` |
| Scene | `"fullscreen"` | `<div className="flex h-screen w-full p-4 md:p-6">` |

#### Story data

- Use realistic mock data (not "Lorem ipsum")
- Include enough items to test scrolling/overflow
- Add stories for edge cases: Empty, SingleItem, ManyItems
- Use `fn()` from `storybook/test` for callbacks

### Step 4: Verify with Computed Styles (MANDATORY)

This is the step that prevents multi-iteration drift. Do NOT skip it.

#### 1. Navigate to Storybook

```
browser_navigate("http://localhost:PORT/iframe.html?id=STORY-ID&viewMode=story")
```

#### 2. Extract computed styles

```javascript
browser_evaluate(() => {
  const root = document.getElementById('storybook-root');
  const el = root?.firstElementChild;
  if (!el) return 'no element';
  const s = getComputedStyle(el);
  // Check EVERY child element too
  const children = [...el.querySelectorAll('*')].slice(0, 10).map(c => ({
    tag: c.tagName,
    class: c.className?.split?.(' ')?.slice(0,3)?.join(' '),
    width: getComputedStyle(c).width,
    height: getComputedStyle(c).height,
    padding: getComputedStyle(c).padding,
    bg: getComputedStyle(c).backgroundColor,
    font: getComputedStyle(c).fontFamily,
    color: getComputedStyle(c).color,
  }));
  return {
    root: { width: s.width, height: s.height, padding: s.padding, gap: s.gap, bg: s.backgroundColor },
    children,
  };
})
```

#### 3. Compare against Figma spec

Go through your spec from Step 1. For EACH property:
- Figma says X → Computed says Y → Match? ✅ or ❌
- If ❌, fix the code and re-verify

DO NOT proceed to screenshot comparison until computed styles match.

### Step 5: Visual Comparison

Only after computed styles pass:

1. `browser_take_screenshot` — save to `.agents/visual-qa/`
2. `Read` both the Figma reference and Storybook screenshot
3. Compare element by element:

| Priority | What to check |
|---|---|
| 1 | Dimensions match (width, height, padding) |
| 2 | Colors match (backgrounds, text, borders) |
| 3 | Typography match (font family, size, weight) |
| 4 | Spacing match (gaps, margins) |
| 5 | Border radius and shadows |
| 6 | Icon sizes and alignment |

#### Acceptable differences
- Font rendering / anti-aliasing (±1px)
- Sub-pixel rounding
- Placeholder icons vs real icons

#### Unacceptable differences
- Wrong dimensions or spacing
- Wrong colors
- Wrong font family
- Missing elements
- Broken alignment
- Wrapper component injecting unwanted styles

### Step 6: Final Validation

- [ ] All computed styles match Figma spec
- [ ] Visual screenshot comparison passes
- [ ] All story variants render correctly
- [ ] `pnpm build` passes
- [ ] `pnpm lint:check:ts` passes
- [ ] Exports added to index.ts

---

## Quick Reference

### Figma MCP Tools

| Tool | Use |
|------|-----|
| `get_figma_data` | Component tree + all style definitions |
| `download_figma_images` | Reference PNGs for comparison |

### Project tokens

| Token | Value | Use |
|---|---|---|
| `green-100` | `#36F818` (100%) | Primary accent, text, icons |
| `green-600` | 24% opacity | Scene borders |
| `green-700` | 16% opacity | Button icon backgrounds |
| `green-800` | 8% opacity | Card backgrounds (earned/completed) |
| `green-900` | 4% opacity | Subtle backgrounds |
| `white-100` | 100% | Primary text |
| `white-400` | 48% | Labels, muted text |
| `white-900` | 4% | Default card backgrounds |
| `yellow` | `#FFF121` | Highlight text |
| `font-secondary` | VT323 | Pixel font for body text |
| `font-primary` | Rubik One | Titles, bold values |

### Key Directories

| Path | Content |
|------|---------|
| `client/src/components/elements/` | Reusable UI elements |
| `client/src/components/containers/` | Layout containers |
| `client/src/components/scenes/` | Full page scenes |
| `client/src/components/icons/` | Icon components |
| `client/src/components/ui/` | Base UI primitives (Button, etc.) |
| `client/src/themes/default.css` | Color tokens (CSS variables) |
| `client/src/themes/preset.ts` | Tailwind theme config |
| `client/.storybook/` | Storybook config |
