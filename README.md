# Glitch Bomb

An onchain luck-based game built on Starknet with the Dojo game engine. Players pull orbs from a bag to earn points, dodge bombs, and cash out GLITCH tokens based on their score.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Development](#development)
- [Contracts](#contracts)
- [Game Mechanics](#game-mechanics)
- [Reward Mechanism](#reward-mechanism)
- [Quality Gates](#quality-gates)
- [Deployment](#deployment)

## Overview

Glitch Bomb is a bag-builder game where players:

1. Purchase a game tier (stake 1-10) with USDC via Cartridge Controller
2. Start with 11 initial orbs in a bag
3. Pull orbs each turn to earn points, gain health, boost multipliers, or take bomb damage
4. Spend chips in the shop to add orbs, burn bad ones, or reroll options
5. Progress through levels by hitting point milestones
6. Cash out at any time to claim GLITCH token rewards based on score and stake

The game ends when health drops to 0 or the player cashes out.

## Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Starknet (Cairo 2.13) |
| Game Engine | Dojo 1.8.0 |
| Frontend | React 19, TypeScript 5.5, Vite 5.2 |
| Styling | Tailwind CSS, Radix UI, Framer Motion |
| Wallet | Cartridge Controller |
| Indexer | Torii (Dojo) |
| Testing | Jest (client), Sozo (contracts), Playwright (e2e) |
| Code Quality | Biome, ESLint, Husky |
| Monorepo | pnpm workspaces, Turborepo |

## Project Structure

```
glitchbomb/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # UI components (containers, elements, modules, ui)
│   │   ├── hooks/             # Custom React hooks (actions, games, tokens, etc.)
│   │   ├── models/            # TypeScript game models (Game, Orb, Starterpack)
│   │   ├── helpers/           # Payout calculations, packing utilities
│   │   ├── offline/           # Offline game engine and state management
│   │   ├── pages/             # Home and Game pages
│   │   ├── contexts/          # React context providers
│   │   └── config.ts          # Chain and manifest configuration
│   ├── public/                # Static assets
│   └── .env.development       # Environment variables
├── contracts/                 # Cairo/Dojo smart contracts
│   ├── src/
│   │   ├── models/            # On-chain data models (Game, Config, Starterpack)
│   │   ├── types/             # Orb, Curse, Effect, Power enums
│   │   ├── elements/          # Game mechanic implementations
│   │   │   ├── effects/       # earn, explode, heal, boost, moonrock, chips, immune, lose
│   │   │   ├── curses/        # demultiplier, double_draw, double_bomb, etc.
│   │   │   └── powers/        # burn, reroll
│   │   ├── helpers/           # Rewarder, deck, packer, bitmap, random
│   │   ├── systems/           # Contract entrypoints (Play, Setup, Collection)
│   │   └── tests/             # Cairo tests
│   └── Scarb.toml             # Cairo package configuration
├── .github/workflows/         # CI pipelines (TypeScript, Cairo, code review)
├── Scarb.toml                 # Workspace-level Scarb config
└── package.json               # Root monorepo config
```

## Prerequisites

- **Node.js** >= 20
- **pnpm** 9.15.0 (`corepack enable && corepack prepare pnpm@9.15.0`)
- **Scarb** 2.13.1 ([install guide](https://docs.swmansion.com/scarb/download.html))
- **Dojo / Sozo** 1.8.0 ([install guide](https://book.dojoengine.org/getting-started))

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url> glitchbomb
cd glitchbomb
pnpm install --frozen-lockfile
```

### 2. Environment configuration

The client ships with a `.env.development` file pre-configured for Sepolia testnet. Key variables:

```env
VITE_DEFAULT_CHAIN=SN_SEPOLIA

# RPC endpoints (via Cartridge)
VITE_SEPOLIA_RPC_URL=https://api.cartridge.gg/x/starknet/sepolia
VITE_MAINNET_RPC_URL=https://api.cartridge.gg/x/starknet/mainnet

# Torii indexer endpoints
VITE_SEPOLIA_TORII_URL=https://api.cartridge.gg/x/glitchbomb/torii
VITE_MAINNET_TORII_URL=https://api.cartridge.gg/x/gb-bal/torii

# VRF provider
VITE_SN_SEPOLIA_VRF=0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f
```

To target mainnet, set `VITE_DEFAULT_CHAIN=SN_MAIN`.

### 3. Build contracts

```bash
cd contracts
scarb build
```

### 4. Run the client

```bash
# Development (port 1337)
pnpm dev

# Production mode (port 13337)
pnpm prod
```

### 5. Storybook

```bash
pnpm storybook        # Dev server on port 6006
pnpm storybook:build  # Static build
```

## Development

### Client development

```bash
pnpm dev              # Start Vite dev server
pnpm build            # TypeScript check + production build
pnpm test:ts          # Run Jest tests
pnpm format:ts        # Auto-format with Biome
pnpm lint:check:ts    # Lint check
```

### Contract development

```bash
cd contracts
scarb build           # Compile Cairo contracts
scarb test            # Run Cairo tests (via sozo)
scarb fmt             # Format Cairo code
```

### Full checks

```bash
pnpm format:check     # Check formatting (TS + Cairo)
pnpm lint:check       # Lint all
pnpm test             # Run all tests
pnpm build            # Build everything
```

## Contracts

### Core Systems

| System | Description |
|---|---|
| **Play** | Main game loop: `enter`, `pull`, `buy`, `burn`, `refresh`, `cash_out`, `exit` |
| **Setup** | Admin configuration: VRF, token addresses, pricing, target supply |
| **Collection** | NFT/starterpack collection management |

### Models

- **Game** — Full game state: health, points, multiplier, bag contents, shop, curses, discards
- **Config** — Global settings: VRF address, token address, entry price, target supply
- **Starterpack** — Tier definitions: price, multiplier bonus, referral percentage

### Key Types

- **Orb** (21 variants) — Drawable items: bombs, health, multipliers, points, resources, curses
- **Curse** (6 variants) — Status effects: Demultiplier, DoubleDraw, DoubleBomb, NormalBomb, ScoreDecrease, StickyBomb
- **Effect** (8 variants) — Orb outcomes: Boost, Explode, Heal, Earn, Moonrock, Chips, Immune, Lose
- **Power** (3 variants) — Shop abilities: Burn (remove orb), Reroll (refresh shop)

### Contract Deployment

Contracts are deployed via `sozo`. The Sepolia manifest is at `manifest_sepolia.json`.

```bash
# Deploy to Sepolia (requires sozo configured)
sozo migrate

# Verify deployment
sozo inspect
```

## Game Mechanics

### Starting a Game

Players select a tier (stake 1-10) and purchase a starterpack with USDC. Higher stakes cost more but multiply token rewards.

**Initial bag (11 orbs):** 2x Bomb1, Bomb2, Bomb3, 3x Point5, Multiplier100, PointOrb1, PointBomb4, Health1

### Core Loop

1. **Pull** — Draw 1 orb (or 2 with DoubleDraw curse) from the bag
2. **Apply effects** — Points, damage, healing, multiplier boosts, resources
3. **Level up** — When points reach the milestone threshold, the shop opens
4. **Shop** — Spend chips to buy new orbs, burn unwanted ones, or reroll the shop
5. **Repeat** until health hits 0 (game over) or the player cashes out

### Health & Damage

- Start with 5 health (max 5)
- Bombs deal 1-3 damage, reduced by immunity charges
- Health orbs restore 1-3 health
- Game ends at 0 health

### Multiplier

- Base multiplier is 1x (stored as 100)
- Multiplier orbs boost by 0.5x, 1x, or 1.5x
- Demultiplier curse halves all future boosts
- All point-earning orbs are affected by the current multiplier

### Curses

Curses are stored as a bitmap (`u8`) and come in two forms:

| Curse | Type | Effect |
|---|---|---|
| DoubleDraw | Passive | Pull 2 orbs per turn instead of 1 |
| Demultiplier | Passive | Halves future multiplier boosts |
| DoubleBomb | Bag | Adds Bomb2 to the bag |
| NormalBomb | Bag | Adds Bomb1 to the bag |
| ScoreDecrease | Bag | Adds an orb that reduces score by a percentage |
| StickyBomb | Bag | Adds a special bomb (one pull per turn limit) |

### Shop & Powers

After each level-up, a shop of 6 random orbs appears. Players spend **chips** (earned from Chips orbs) to add orbs to their bag. Two one-time powers are available:

- **Burn** — Permanently remove an orb from the bag
- **Reroll** — Get a fresh set of 6 shop orbs (costs moonrocks)

### Bag & Discards

- Maximum bag capacity: 50 orbs
- Orbs are packed as 5-bit values in a `felt252`
- Pulled orbs are tracked in a `u64` discard bitmap
- The bag refills when all orbs have been pulled

## Reward Mechanism

### GLITCH Token Rewards

When a player cashes out, they receive GLITCH tokens based on their score. The reward follows a **progressive x^5 curve** — higher scores are exponentially more rewarding.

**Formula:**

```
reward = numerator / (510^5 - score^5) - numerator / 510^5
```

Where:
- `numerator` = 35,910,505,248,361,606,000,000 (adjusted by supply)
- `510` = MAX_SCORE (500) + OFFSET (10)

**Approximate rewards by score:**

| Score | Base Reward |
|---|---|
| 100 | ~500K tokens |
| 200 | ~4.3M tokens |
| 300 | ~30M tokens |
| 400 | ~440M tokens |
| 490 | ~4.7B tokens |
| 500 (max) | ~10B tokens |

### Stake Multiplier

Final payout = `baseReward(score) * stake`

A stake-10 game pays 10x the base reward compared to stake-1.

### Tier Pricing

Each tier costs USDC, calculated as:

```
price = stake * base_price * (1 - stake / 100)
```

Where `base_price` = 2 USDC. Higher stakes offer a slight volume discount per unit.

### Supply Adjustment

Rewards are dynamically adjusted based on circulating supply vs. target supply:

- **Below target** — Rewards increase (up to 2x the base numerator)
- **At target** — Base rewards
- **Above target** — Rewards decrease
- **At 2x target** — Rewards drop to 0

This creates a self-regulating emission curve.

### Moonrocks & Chips

- **Moonrocks** — Secondary currency earned from Moonrock orbs (15 or 40 per orb). Used to pay for shop rerolls. Players start with 100.
- **Chips** — Shop currency earned from Chips orbs (15 per orb). Used to buy orbs from the shop.

### Break-Even

The break-even score is the first score where the cumulative GLITCH reward value (at current market price via Ekubo DEX) exceeds the USDC cost of the starterpack.

## Quality Gates

### TypeScript / UI changes

```bash
pnpm format:check:ts
pnpm lint:check:ts
pnpm build
pnpm test:ts
```

### Cairo / Contract changes

```bash
pnpm format:check:cairo
pnpm lint:check:cairo
cd contracts && scarb build && scarb test
```

### Fix formatting

```bash
pnpm format:ts      # TypeScript
pnpm format:cairo   # Cairo
pnpm format         # Both
```

## Deployment

### Supported Networks

| Network | Chain ID | RPC | Torii |
|---|---|---|---|
| Sepolia (testnet) | `SN_SEPOLIA` | `api.cartridge.gg/x/starknet/sepolia` | `api.cartridge.gg/x/glitchbomb/torii` |
| Mainnet | `SN_MAIN` | `api.cartridge.gg/x/starknet/mainnet` | `api.cartridge.gg/x/gb-bal/torii` |

### Client Build

```bash
pnpm build   # Outputs to client/dist/
```

The client is a static SPA that can be deployed to any hosting provider (Vercel, Netlify, etc.). Vercel Analytics is integrated.

### Contract Deployment

Contracts are deployed using `sozo migrate` from the Dojo toolchain. The deployment manifest for Sepolia is stored at `manifest_sepolia.json` and contains all deployed contract addresses.

## License

See [LICENSE](LICENSE) for details.
