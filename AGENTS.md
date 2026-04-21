<!-- SKILLS_INDEX_START -->
[Agent Skills Index]|root: ./agents|IMPORTANT: Prefer retrieval-led reasoning over pre-training for any tasks covered by skills.|skills|agent-browser:{agent-browser.md},create-a-plan:{create-a-plan.md},create-pr:{create-pr.md},figma-to-storybook:{figma-to-storybook.md}
<!-- SKILLS_INDEX_END -->
# Agent Instructions

This repository uses `AGENTS.md` as the canonical prompt for local coding agents.
`CLAUDE.md` and `AGENT.md` are symlinks to this file, so keep all global rules here.

## Purpose

Ship safe, reviewable changes with an agent workflow that is:
- plan-first
- incremental (small commits on a branch)
- validated locally (format/lint/test/build as needed)
- merged only when PR checks are green and feedback is addressed

## Repo Map

- `client/`: React + Vite + Storybook + Jest + Biome + ESLint
- `contracts/`: Cairo/Dojo contracts and tests (`scarb`, `sozo`)
- `.github/workflows/`: CI rules for TypeScript and Cairo
- `.agents/skills/create-pr/scripts/`: PR polling/triage/update helpers

## Mandatory Workflow For Every Task

1. Understand scope and constraints.
2. Create/update a short implementation plan before coding.
3. Make changes in small, reviewable increments.
4. Validate with the relevant checks.
5. Commit logically (do not batch unrelated edits).
6. Push branch and open/update PR to `main`.
7. Watch CI and reviews, fix issues, push follow-up commits.
8. Merge once ready, then clean up branch/worktree.

If execution becomes messy (many compounding issues), stop and restart from a clean approach instead of layering hacks.

## Branching, Worktrees, And Commits

- Do not commit directly to `main`.
- Prefer a dedicated branch per task (`feat/*`, `fix/*`, `chore/*`).
- Prefer a git worktree when parallel tasks are active.
- Commit progressively as milestones complete (code, then tests/stories, then cleanup).
- Keep each commit focused and reversible.
- Never rewrite or revert unrelated user changes.

Recommended cadence:
1. Commit foundation/refactor needed for the feature.
2. Commit feature behavior.
3. Commit tests/stories.
4. Commit final polish (docs, naming, small cleanup).

## Quality Gates (Run What Applies)

Install once:

```bash
pnpm install --frozen-lockfile
```

### TypeScript/UI changes (`client/**`)

```bash
pnpm format:check:ts
pnpm lint:check:ts
pnpm build
pnpm test:ts
```

If formatting is needed:

```bash
pnpm format:ts
```

### Cairo/contract changes (`contracts/**`, `Scarb.*`)

```bash
pnpm format:check:cairo
pnpm lint:check:cairo
cd contracts && scarb build && scarb test
```

If formatting is needed:

```bash
pnpm format:cairo
```

### Cross-cutting or uncertain impact

```bash
pnpm format:check
pnpm lint:check
pnpm test
pnpm build
```

## Testing And Storybook Rules

- Contract/gameplay logic changes must include or update Cairo tests under `contracts/src/tests`.
- UI component changes should update/create Storybook stories (`*.stories.tsx`) for each changed component.
- For non-trivial UI behavior, prefer at least one deterministic test path (Jest) when practical.
- Do not skip tests silently; if a test cannot run, document why in the PR.

## PR, CI, And Merge Protocol

After local checks pass:

1. Push the branch.
2. Create/update PR targeting `main`.
3. Ensure PR description summarizes the whole diff (not just latest commit).
4. Monitor CI and review changes continuously.

Preferred helpers:

```bash
./.agents/skills/create-pr/scripts/poll-pr.sh --triage-on-change --exit-when-green
./.agents/skills/create-pr/scripts/triage-pr.sh
```

If checks fail:
- inspect failing run/logs
- fix root cause
- commit and push
- re-run monitoring until green

Merge only when all are true:
- required CI checks pass
- review feedback is addressed (or explicitly resolved)
- no unresolved merge conflicts
- branch is ready for squash merge

Merge command:

```bash
gh pr merge --squash --delete-branch
```

After merge:
- remove temporary worktree/branch if used
- return local repo to a clean state

## Domain And Implementation Notes

- Curses are represented as bit flags (`u8`) in game state.
- Orb discards are tracked as a bitmap (`u64`), one bit per orb index.
- Sticky Bomb behavior is special-case; do not generalize to all bombs.
- In UI, prefer fluid sizing (`clamp`, viewport units) over brittle fixed breakpoints.
- Reuse established component composition patterns in `client/src/components`.

## Safety Rules

- Avoid destructive git commands (`reset --hard`, forced checkout) unless explicitly requested.
- Never discard user-authored local changes outside your scoped edits.
- Keep comments concise and meaningful; avoid redundant comments.
- Prefer simple, readable implementations over clever but fragile ones.
