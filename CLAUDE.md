# Project Memory

## Coding Patterns
- Curses use bit flags in `game.curses` (`u8`), with each curse as a distinct power-of-two bit.
- Orbs expose `apply` (mutates game state and returns earnings) and `cost` (chip price) functions.
- Orb discards are tracked via a `u64` bitmap (`game.discards`), one bit per orb index.

## Gameplay/Mechanics Notes
- Sticky Bomb is a specific orb; it should not affect all bombs.
- Sticky Bomb should not be marked discarded; it remains pullable and should not increment `pulled_bombs_count` when still pullable.

## Design/Implementation Guidance
- Prefer simple, readable logic over clever complexity.
- Avoid overloading `game.discards` to mean conflicting states; model sticky behavior explicitly.
- If sticky behavior complicates counts, consider helpers like `pullable_non_sticky_orbs_count` or separate checks for bag regeneration.
