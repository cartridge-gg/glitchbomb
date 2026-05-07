import {
  ClauseBuilder,
  KeysClause,
  MemberClause,
  OrComposeClause,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import { NAMESPACE } from "@/constants";
import type { RawGame } from "@/models";
import { Game as GameModel } from "@/models/game";

const ENTITIES_LIMIT = 10_000;

function modelKey(modelName: string): string {
  return `${NAMESPACE}-${modelName}`;
}

function allQuery() {
  const clauses = new ClauseBuilder().keys(
    [`${NAMESPACE}-${GameModel.getModelName()}`],
    [undefined],
    "FixedLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
}

function byIdQuery(gameId: number) {
  const clauses = KeysClause(
    [`${NAMESPACE}-${GameModel.getModelName()}`],
    [`0x${gameId.toString(16).padStart(16, "0")}`],
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(1);
}

/**
 * Fetch entities filtered to the given game ids using an `OR` composition of
 * `MemberClause(id, Eq, ...)`. Used for the initial fetch of player-owned
 * games so we don't load the whole entity table.
 *
 * Caller must ensure `gameIds.length > 0`; with an empty list the SDK builder
 * produces an invalid clause.
 */
function byIdsQuery(gameIds: number[]) {
  const clauses = OrComposeClause(
    gameIds.map((id) =>
      MemberClause(
        `${NAMESPACE}-${GameModel.getModelName()}`,
        "id",
        "Eq",
        `0x${id.toString(16).padStart(16, "0")}`,
      ),
    ),
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys()
    .withLimit(ENTITIES_LIMIT);
}

function parse(entities: torii.Entity[]): GameModel[] {
  const games: GameModel[] = [];
  const key = modelKey(GameModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      const parsed = GameModel.parse(entity.models[key] as unknown as RawGame);
      if (parsed) games.push(parsed);
    }
  }
  return games;
}

function parseOne(
  entities: torii.Entity[],
  gameId: number,
): GameModel | undefined {
  const key = modelKey(GameModel.getModelName());
  for (const entity of entities) {
    if (!entity.models[key]) continue;
    const parsed = GameModel.parse(entity.models[key] as unknown as RawGame);
    if (parsed && parsed.id === gameId) return parsed;
  }
  return undefined;
}

export const Game = {
  keys: {
    all: () => ["games"] as const,
    byId: (id: number) => ["game", id] as const,
    /** Cache key for the player-owned subset; `idsKey` is a stable joined list. */
    byIds: (idsKey: string) => ["games", "owned", idsKey] as const,
  },
  allQuery,
  byIdQuery,
  byIdsQuery,
  parse,
  parseOne,
};
