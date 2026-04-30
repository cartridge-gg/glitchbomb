# Plan — Migration des routes gbomb vers le pattern nums

**Branche**: `feat/update-everything` (déjà active, contient des changements WIP non liés à scope)
**Date**: 2026-04-29
**Auteur**: Sisyphus (planning phase)

## Objectif

Aligner le système de routing du client gbomb sur celui du projet `../nums` :

| Avant (gbomb)                | Après (gbomb, aligné nums) |
|------------------------------|----------------------------|
| `/`                          | `/`                        |
| `/play?game=<id>` (search)   | `/game/:id` (path param)   |
| (n/a)                        | `/game` (loading state)    |
| `/play?game=<offlineId>` (mobile) | `/practice` (no ID, état interne) |
| (n/a)                        | `/tutorial` (no ID, état interne) |
| `/support`                   | `/support`                 |

Effets de bord requis :
- Drop complet du concept **mobile** (`utils/mobile.ts`, `isMobile`, `mobilePath`, branches `if (isMobile)`).
- Drop complet du flag **`?view=true`** (mort dans le code source actuel).

## Décisions arrêtées (validées par l'utilisateur)

| # | Sujet                  | Décision                                                                 |
|---|------------------------|--------------------------------------------------------------------------|
| 1 | Mode pratique          | `/practice` (no ID) — état lu depuis offline store, pas depuis l'URL    |
| 2 | `?view=true`           | Drop pur et simple                                                       |
| 3 | Routes additionnelles  | Tout porter (`/game`, `/game/:id`, `/practice`, `/tutorial`)             |
| 4 | Mobile feature         | Retirer COMPLÈTEMENT (suppression de `utils/mobile.ts` + toutes branches) |

## Décisions internes (Sisyphus, justifiées)

| # | Sujet                            | Décision                                                                                                         | Justification |
|---|----------------------------------|------------------------------------------------------------------------------------------------------------------|---------------|
| 5 | Persistance offline store        | Retirer la persistance `localStorage`. État de pratique 100% en mémoire.                                          | Mirror nums (PracticeProvider in-memory). La persistance était gated par `isMobile`, qu'on supprime → simplification cohérente. |
| 6 | "Active practice game"           | Ajouter un champ `activeGameId` dans `OfflineState`. `/practice` lit/met à jour ce champ.                         | Permet à `/practice` de fonctionner sans param URL tout en réutilisant l'engine offline existant. |
| 7 | Tutorial route                   | `/tutorial` utilise le même flow `/practice` avec un flag (orbs forcés via `TutorialProvider`).                   | Aligne avec nums où `/tutorial` rend `<Game />`. Réutilise infrastructure existante. |
| 8 | Branches `isMobile` → quel côté ?| Conserver le côté **desktop** systématiquement (nums = desktop only).                                            | Préserve le flow blockchain principal, simplifie. Les comportements "mobile-only" disparaissent (offline store toujours actif maintenant pour /practice, controller policies desktop, etc.). |
| 9 | `window.location.href` toast     | Remplacer par `useNavigate()` du custom router pour cohérence.                                                    | Mirror nums (pas de full reload). Préserve les search params (`?ref`). |
| 10 | Storybook URLs                  | Les 11 URLs hardcodées dans `home.stories.tsx` deviennent `/game/<id>` (sans `?view=true`).                       | Cohérence visuelle avec la nouvelle nomenclature. |

## Plan d'implémentation par phases

### Phase 1 — Foundation : nouvelles routes

**Fichiers**: `client/src/app.tsx`

- Remplacer le bloc `<Route path="/play" element={<Game />} />` par :
  ```tsx
  <Route path="/" element={<Home />} />
  <Route path="/game/:id" element={<Game />} />
  <Route path="/game" element={<LoadingScene />} />
  <Route path="/practice" element={<Game />} />
  <Route path="/tutorial" element={<Game />} />
  ```
- Créer `client/src/components/scenes/loading.tsx` (LoadingScene minimaliste, mirror nums).

**Validation**: TypeScript build passe (les autres fichiers vont casser temporairement — c'est OK à ce stade, on cleanup en phase 5).

### Phase 2 — Mode detection dans game.tsx

**Fichiers**: `client/src/pages/game.tsx`

Remplacer la logique actuelle :
```ts
const [searchParams] = useSearchParams();
const gameId = searchParams.get("game");
```

Par :
```ts
import { useLocation, useParams } from "react-router-dom";
const { id: idParam } = useParams<{ id: string }>();
const { pathname } = useLocation();

const isPracticeMode = pathname === "/practice" || pathname === "/tutorial";
const isTutorialMode = pathname === "/tutorial";

const onchainGameId = useMemo(() => {
  if (isPracticeMode) return null;
  return idParam && !Number.isNaN(Number.parseInt(idParam, 10))
    ? Number.parseInt(idParam, 10)
    : null;
}, [idParam, isPracticeMode]);

// Pour pratique : lire activeGameId depuis offline store
const offlineState = useOfflineStore();
const practiceGameId = isPracticeMode ? offlineState.activeGameId : null;
const gameId = onchainGameId ?? practiceGameId;
```

- Drop tous les usages de `?view=true` (`view` flag).
- Drop tous les `mobilePath(...)` wrappers → utiliser le path direct.
- Le "play again" en pratique navigue vers `/practice` (pas `/practice/:newId`).
- Le "play again" en blockchain navigue vers `/game/${newId}`.
- Le retour home reste `navigate("/")`.

### Phase 3 — Refactor offline store (drop persistance, ajout activeGameId)

**Fichiers**: `client/src/offline/store.ts`, `client/src/offline/types.ts`

Modifications de `types.ts` :
```ts
export interface OfflineState {
  version: number;
  nextGameId: number;
  activeGameId: number | null;  // NEW
  games: Record<number, OfflineGame>;
  pulls: OfflineOrbPulled[];
  plDataPoints: OfflinePLDataPoint[];
}
```

Modifications de `store.ts` :
- Drop `import { isMobile } from "@/utils/mobile";`
- Drop le bloc `loadState()` (plus de `localStorage`).
- Drop `saveState()` (idem).
- `defaultState()` retourne `activeGameId: null`.
- `createOfflineGame()` met à jour `activeGameId` avec le nouveau ID.
- `resetOfflineState()` reset `activeGameId: null`.
- L'init de `state` devient simplement `let state: OfflineState = defaultState();`.
- Garder le reste (engine, sélecteurs) identique.

### Phase 4 — Update navigation calls (6 fichiers)

| Fichier | Avant | Après |
|---------|-------|-------|
| `pages/home.tsx` l.209 | `mobilePath('/play?game=${g.id}&view=true')` | `\`/game/${g.id}\`` |
| `pages/home.tsx` l.219 | `mobilePath('/play?game=${g.id}&view=true')` | `\`/game/${g.id}\`` |
| `pages/home.tsx` l.243 | `navigate(mobilePath('/play?game=${id}'))` | `navigate(\`/game/${id}\`)` |
| `pages/home.tsx` l.253-261 | `if (!isMobile) resetOfflineState(); ...createOfflineGame(); navigate(mobilePath('/play?game=${offlineGameId}'))` | `resetOfflineState(); createOfflineGame(); navigate('/practice')` (et `/tutorial` si tutoriel pas complété) |
| `pages/index.tsx` l.233 | `navigate(mobilePath('/play?game=${newGame.id}'))` | `navigate(\`/game/${newGame.id}\`)` |
| `pages/game.tsx` l.691-698 (`handlePlayAgain`) | Pratique: `navigate(mobilePath('/play?game=${newGameId}'))` après `createOfflineGame()`. Onchain: `navigate(mobilePath('/'))` | Pratique: `createOfflineGame()` (qui set `activeGameId`) puis `navigate('/practice')`. Onchain: `navigate('/')` (inchangé sémantiquement, l'utilisateur passe par le purchase flow depuis home, voir Note ci-dessous). |

**Note sur le flow onchain "Play again"** : le comportement actuel est *retour home*, où l'utilisateur initie un nouvel achat via `openPurchaseScene()` (modal). C'est le `useEffect` de `pages/index.tsx` (l.217-235) qui détecte la nouvelle partie dans `ownedGames` et navigue vers `/game/<newId>`. Cette détection est **conservée et migrée** (Phase 4, ligne `pages/index.tsx l.233`) — pas de nouveau code à créer pour cette boucle.
| `components/elements/game-started-toast.tsx` l.63 | `window.location.href = '/play?game=${gameId}&view=true'` | `navigate(\`/game/${gameId}\`)` (via `usePreserveSearchNavigate`) |
| `components/elements/activity-ticker.tsx` l.100 | `navigate(mobilePath('/play?game=${item.dataset.gameId}&view=true'))` | `navigate(\`/game/${item.dataset.gameId}\`)` |
| `components/scenes/home.stories.tsx` × 11 | `to: '/play?game=XXXX&view=true'` | `to: '/game/XXXX'` |

### Phase 5 — Drop mobile feature complète

**Fichiers à modifier (8)** :
1. `client/src/utils/mobile.ts` → **DELETE FILE**
2. `client/src/offline/store.ts` → drop import + branches (déjà fait phase 3)
3. `client/src/components/modules/connection.tsx` :
   - Drop import isMobile.
   - Choix : conserver la branche desktop (`controller?.openProfile("inventory")`).
4. `client/src/pages/home.tsx` :
   - Drop import.
   - Ligne 68 (`if (!isMobile) return onchainGames; ...`) → garder uniquement la version onchain : `const ownedGames = useMemo(() => onchainGames, [onchainGames]);` (les parties pratiques sortent de l'affichage liste).
   - Ligne 253 (`if (!isMobile) resetOfflineState()`) → toujours reset (desktop comportement).
5. `client/src/pages/index.tsx` :
   - Drop import.
   - Ligne 104 (`if (!isMobile) return onchainGames; ...`) → idem que home : `const ownedGames = useMemo(() => onchainGames, [onchainGames]);`.
   - Ligne 299 (`if (isMobile) ...`) → drop la branche mobile.
   - Ligne 420 (`{!isMobile && showPurchase && ...}`) → drop le gating, le purchase modal s'affiche partout : `{showPurchase && ...}`.
6. `client/src/components/containers/game-cards.tsx` :
   - Drop import.
   - Ligne 223 (`isMobile ? "---" : formatMaxPayout(game.stake)`) → toujours afficher : `formatMaxPayout(game.stake)`.
   - Ligne 247 (`if (isMobile) {...}`) → drop la branche mobile.
7. `client/src/app.tsx` :
   - Drop import.
   - Lignes 100-101 → policies + preset desktop par défaut : `policies: buildPolicies(), preset: "glitch-bomb"`.
8. `client/src/components/scenes/home.tsx` :
   - Drop import.
   - Lignes 114, 125 (branches `isMobile`) → garder le comportement desktop.

### Phase 6 — Validation

**Validation automatisée (bloquante avant commit)** :
| Outil | Commande | Critère de succès |
|-------|----------|-------------------|
| LSP diagnostics | `mcp_Lsp_diagnostics` sur chaque fichier touché | Zero error / warning |
| Lint TS | `pnpm lint:check:ts` | Exit code 0 |
| Format TS | `pnpm format:check:ts` | Exit code 0 |
| Build TS+Vite | `pnpm build` | Exit code 0 |
| Tests Jest | `pnpm test:ts` | All pass (ou pre-existing failures explicites) |

**Validation Storybook (semi-automatisée via dev server)** :
| Scénario | Tool | Étapes | Résultat attendu |
|----------|------|--------|------------------|
| Stories home se chargent | `pnpm storybook` (port 6006) | Ouvrir `Scenes/Home/*` | Pas d'erreur console, liens visibles |
| Liens stories pointent vers `/game/<id>` | Inspect DOM dans Storybook | Hover un game card → vérifier `href` | href = `/game/<id>` (pas `/play?game=`) |

**Smoke tests dev server (manuels par l'utilisateur après mes modifs)** :
| Scénario | Tool | Étapes utilisateur |
|----------|------|--------------------|
| Home → Play active game | `pnpm dev` (port 1337) | 1. Ouvrir `localhost:1337/` 2. Cliquer "Play" sur partie active 3. Inspecter URL | URL = `/game/<id>` |
| Home → Practice | dev server | Cliquer "Practice" | URL = `/practice` (ou `/tutorial` si tuto incomplet) |
| Game over → Play again (practice) | dev server | Aller au game over en pratique → cliquer "Play again" | URL reste `/practice`, nouvelle partie créée |
| Game over → Play again (onchain) | dev server | Aller au game over onchain → cliquer "Play again" | URL = `/` (retour home, comportement existant) |
| Achat → game | dev server | Home → "New Game" → compléter purchase | URL = `/game/<newId>` après purchase |
| Activity ticker click | dev server | Home → cliquer item dans ticker | URL = `/game/<id>` |
| `?ref=` préservation | dev server | Ouvrir `localhost:1337/?ref=alice` → naviguer vers `/practice` puis `/` | URL conserve `?ref=alice` |

**Note** : les "Smoke tests dev server" demandent un account Cartridge connecté + chain Sepolia. Ils sont à la charge de l'utilisateur après le merge des modifs. Le minimum bloquant côté Sisyphus est la "Validation automatisée" + Storybook check.

### Phase 7 — Commit strategy

Commits atomiques (par phase) :
1. `feat(client): add new route structure (/game/:id, /practice, /tutorial)` — Phase 1
2. `refactor(client): switch game.tsx to path params and mode detection` — Phase 2
3. `refactor(offline): drop localStorage persistence + add activeGameId` — Phase 3
4. `refactor(client): migrate all navigation calls to new routes` — Phase 4 (le plus gros)
5. `refactor(client): remove mobile feature` — Phase 5
6. `chore(client): update storybook URLs` — Phase 5 (sub-commit)

## Risques et points d'attention

| Risque | Mitigation |
|--------|------------|
| Liens externes (réseaux sociaux, Discord) pointant vers `/play?game=X` | Pas connus / probablement aucun (jeu interne). Si présent → ajouter une redirection `/play?game=X` → `/game/X` en bonus. |
| `?ref=` parameter perdu après navigation | Déjà géré par `mergeSearch()` dans `lib/router.tsx` qui préserve les search params lors des navigations internes. Vérifier que `usePreserveSearchNavigate` est bien utilisé partout (pas `useNavigate` direct). |
| Storybook stories qui hardcodent `/play?game=X` | Phase 4 met à jour les 11 occurrences. |
| Service worker `?v=` | Indépendant des routes, no change. |
| Tests qui vérifient `?game=X` | Aucun trouvé par les agents (Jest). Storybook mis à jour. |
| Controller flow différent en mobile (`isMobile`) | Phase 5 conserve la branche desktop = comportement uniforme. Si certains comportements mobile étaient utiles (preset différent), ils sont perdus — accepté par l'utilisateur. |
| Offline store sans persistance = parties pratique perdues au refresh | Accepté (mirror nums). UX acceptable car /practice est éphémère par design. |
| Rebase/merge avec les changements WIP existants sur la branche | Plan touche certains fichiers déjà modifiés WIP (`game.tsx`, `home.tsx`, `index.tsx`, `offline/store.ts`). Procéder fichier par fichier en lisant la version courante avant édition. |

## Hors-scope (à ne PAS faire)

- ❌ Refactor du contexte `EntitiesContext` (séparer `games` / `entities` comme nums).
- ❌ Ajout des providers manquants (PostHog, Vault, Merkledrops, etc.).
- ❌ Refonte du `ModalProvider` vers le pattern useState individuel de nums.
- ❌ Changement de version de `react-router-dom` (rester sur 6.22.3).
- ❌ Création d'un fichier de constantes de routes (nums n'en a pas).
- ❌ Toute modification du backend / contrats Cairo / Torii.

## Estimation

- ~15-18 fichiers source à modifier
- 1 fichier à supprimer (`utils/mobile.ts`)
- 1 fichier à créer (`components/scenes/loading.tsx`)
- Total: 6 commits atomiques, ~2-3h de travail si validation passe au premier coup
