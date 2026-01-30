# Project Memory

## Coding Patterns
- Curses use bit flags in `game.curses` (`u8`), with each curse as a distinct power-of-two bit.
- Orbs expose `apply` (mutates game state and returns earnings) and `cost` (chip price) functions.
- Orb discards are tracked via a `u64` bitmap (`game.discards`), one bit per orb index.
- Prefer fluid sizing with `clamp()` and viewport units like `svh` over fixed breakpoints.
- `clamp()` is the standard approach for responsive padding, gaps, and typography across the UI.
- `useViewportSize` is used to drive responsive sizing for scene elements.
- `cva` variants are used for component styling (e.g., `gameSceneVariants`, `pullerVariants`).
- `framer-motion` (AnimatePresence/motion) is used for transitions and visibility states.
- Use `cn` for conditional class merging.
- Favor component composition (GameScene composed of Distribution, Puller, Multiplier, Outcome).
- Memoize computed values with `useMemo` and handlers with `useCallback` to avoid rerenders.
- `useRef` is used to track animation-related state like last pull ids.
- UI components are often composed from smaller reusable pieces; reuse existing cards/panels when possible.

## Gameplay/Mechanics Notes
- Sticky Bomb is a specific orb; it should not affect all bombs.
- Sticky Bomb should not be marked discarded; it remains pullable and should not increment `pulled_bombs_count` when still pullable.

## Design/Implementation Guidance
- Prefer simple, readable logic over clever complexity.
- Avoid overloading `game.discards` to mean conflicting states; model sticky behavior explicitly.
- If sticky behavior complicates counts, consider helpers like `pullable_non_sticky_orbs_count` or separate checks for bag regeneration.
- Keep no vertical gap between the header and main game content across viewports.
- Scale UI elements smoothly; prioritize core gameplay elements on short viewports.
- Keep curse/multiplier indicators visible and consistently positioned relative to the puller.
- Ensure text remains readable at the smallest supported sizes using `clamp()`.
- Favor progressive enhancement for responsiveness; refactor existing UI to use fluid sizing when issues appear.
- iOS safe areas often need explicit styling on `html`, `body`, and `#root` with `height: 100%`, `min-height: 100vh`, `min-height: 100svh`, and `min-height: 100dvh`, plus `viewport-fit=cover` in the meta tag.
- Use CSS variables like `--safe-area-top` and `--safe-area-bottom` to control safe area painting, especially when colors change per route.
- Route-aware safe area styling should live inside the `BrowserRouter` and use `useLocation` for per-route logic.
- If `env(safe-area-inset-*)` returns 0 in some scroll/layout states, use fallbacks like `max(env(...), <fallback>)` or fixed heights.
- Mind `z-index` layering when safe area overlays are used so they sit correctly over content.

## Responsive Pitfalls
- Avoid relying on fixed height breakpoints for layout; prefer fluid scaling.
- When updating layout strategy, recheck all affected components for sizing and positioning.
- Be careful to merge inline `style` props (e.g., sizePx) so sizing changes apply correctly.
- Avoid introducing unintended gaps between stacked sections (especially header/content and puller/footer).
- Be cautious with `flex-center` on containers that should stretch; it can unintentionally shrink widths.
