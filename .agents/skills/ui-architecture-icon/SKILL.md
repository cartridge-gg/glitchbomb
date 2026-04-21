---
name: ui-architecture-icon
description: Add SVG icons to the Glitchbomb game client — convert SVG, create component, export, update storybook. Use when adding, modifying, or removing icon components.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Adding an Icon

## Step 1: Identify the Category

| Category   | Location          | Pattern                                | When to Use          |
| ---------- | ----------------- | -------------------------------------- | -------------------- |
| `regulars` | `icons/regulars/` | Simple, no variants                    | General UI icons     |
| `bombs`    | `icons/bombs/`    | Simple, no variants                    | Bomb/damage icons    |
| `states`   | `icons/states/`   | Prop-based variants (`solid` / `line`) | Toggle/nav icons     |
| `exotics`  | `icons/exotics/`  | Simple, no variants                    | Logos, orbs, special |

## Step 2: Create the Icon Component

### Template for `regulars` / `bombs` / `exotics` (simple icon)

File: `client/src/components/icons/<category>/<icon-name>.tsx`

```tsx
import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const MyIconIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        {/* SVG paths here */}
      </svg>
    ),
  ),
);

MyIconIcon.displayName = "MyIconIcon";
```

### Template for `states` (prop-based variants)

```tsx
import { forwardRef, memo } from "react";
import { iconVariants, type StateIconProps } from "..";

export const MyIconIcon = memo(
  forwardRef<SVGSVGElement, StateIconProps>(
    ({ className, size, variant, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        {(() => {
          switch (variant) {
            case "solid":
              return <path d="..." fill="currentColor" />;
            case "line":
              return <path d="..." fill="currentColor" />;
          }
        })()}
      </svg>
    ),
  ),
);

MyIconIcon.displayName = "MyIconIcon";
```

## Step 3: Convert SVG for React

When pasting SVG from a design tool:

1. **Keep** the `<svg>` wrapper with `width="24" height="24" viewBox="0 0 24 24" fill="none"`
2. **Replace** the `<svg>` attributes with the template's (className, ref, etc.)
3. **Convert** kebab-case attributes to camelCase:
   - `fill-rule` → `fillRule`
   - `clip-rule` → `clipRule`
   - `flood-opacity` → `floodOpacity`
   - `color-interpolation-filters` → `colorInterpolationFilters`
   - `filter-units` → `filterUnits`
   - `stroke-width` → `strokeWidth`
   - `stroke-linecap` → `strokeLinecap`
   - `stroke-linejoin` → `strokeLinejoin`
4. **Replace** hardcoded fill colors with `fill="currentColor"` (so color inherits from CSS)
5. **Remove** unnecessary `<defs>` blocks (filters, gradients) unless they are referenced by paths via `filter="url(#...)"` or `fill="url(#...")`
6. **Remove** `xmlns:xlink` and other unnecessary namespace attributes

## Step 4: Export from Index

Add to `client/src/components/icons/<category>/index.ts`:

```ts
export * from "./<icon-name>";
```

Keep the exports **sorted alphabetically** by file name.

## Step 5: Update Storybook

Edit `client/src/components/icons/<category>/index.stories.tsx`.

**IMPORTANT**: Before editing, read the existing storybook file to match the exact code style.

### For `regulars` / `bombs` / `exotics` — add to the icons array:

```tsx
const regularIcons = [
  // ... existing icons (alphabetical)
  { name: "MyIconIcon", component: Icons.MyIconIcon },
];
```

### For `states` — add to the state icons array:

```tsx
const stateIcons = [
  // ... existing state icons
  { name: "MyIconIcon", component: Icons.MyIconIcon },
];
```

---

## Naming Conventions

| What          | Convention       | Example                                 |
| ------------- | ---------------- | --------------------------------------- |
| File          | `kebab-case.tsx` | `arrow-left.tsx`                        |
| Component     | `PascalCaseIcon` | `ArrowLeftIcon`                         |
| displayName   | Same as component| `ArrowLeftIcon.displayName = "ArrowLeftIcon"` |

## Icon Size Tokens

```ts
const size = {
  "4xs": "h-1 w-1",
  "3xs": "h-2 w-2",
  "2xs": "h-3 w-3",
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-6 w-6", // DEFAULT
  lg: "h-8 w-8",
  "lg+": "h-10 w-10",
  xl: "h-12 w-12",
  "2xl": "h-14 w-14",
  "3xl": "h-[72px] w-[72px]",
};
```

## Type Definitions

```ts
// client/src/components/icons/types.ts

// For icons WITHOUT variant prop
export type IconProps = Omit<
  SVGProps<SVGSVGElement> & VariantProps<typeof iconVariants>,
  "variant"
>;

// For icons WITH variant prop (solid/line)
export type StateIconProps = Omit<
  SVGProps<SVGSVGElement> & VariantProps<typeof iconVariants>,
  "variant"
> & { variant: "solid" | "line" };
```

## Checklist

- [ ] File created at correct path with correct naming
- [ ] `memo()` + `forwardRef<SVGSVGElement, IconProps>()` wrapping
- [ ] `iconVariants({ size, className })` for className
- [ ] `ref={forwardedRef}` on `<svg>`
- [ ] `{...props}` spread on `<svg>`
- [ ] `fill="currentColor"` on paths (not hardcoded colors)
- [ ] SVG attributes in camelCase (no kebab-case)
- [ ] Unnecessary `<defs>` removed
- [ ] `displayName` set
- [ ] Export added to category `index.ts` (alphabetical order)
- [ ] Storybook entry added to category `index.stories.tsx`
