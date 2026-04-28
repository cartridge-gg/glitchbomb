import { ClauseBuilder, ToriiQueryBuilder } from "@dojoengine/sdk";
import type * as torii from "@dojoengine/torii-wasm";
import { NAMESPACE } from "@/constants";
import {
  Config as ConfigModel,
  type RawConfig,
  type RawStarterpack,
  Starterpack as StarterpackModel,
} from "@/models";

function modelKey(modelName: string): string {
  return `${NAMESPACE}-${modelName}`;
}

function query() {
  const config: `${string}-${string}` = `${NAMESPACE}-${ConfigModel.getModelName()}`;
  const starterpack: `${string}-${string}` = `${NAMESPACE}-${StarterpackModel.getModelName()}`;
  const clauses = new ClauseBuilder().keys(
    [config, starterpack],
    [undefined],
    "FixedLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
}

function parse(entities: torii.Entity[]): ConfigModel | undefined {
  const key = modelKey(ConfigModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      return (
        ConfigModel.parse(entity.models[key] as unknown as RawConfig) ??
        undefined
      );
    }
  }
  return undefined;
}

function parseStarterpacks(entities: torii.Entity[]): StarterpackModel[] {
  const packs: StarterpackModel[] = [];
  const key = modelKey(StarterpackModel.getModelName());
  for (const entity of entities) {
    if (entity.models[key]) {
      const parsed = StarterpackModel.parse(
        entity.models[key] as unknown as RawStarterpack,
      );
      if (parsed) packs.push(parsed);
    }
  }
  return StarterpackModel.dedupe(packs).sort((a, b) =>
    Number(a.price - b.price),
  );
}

export const Config = {
  keys: {
    all: () => ["config"] as const,
    starterpacks: () => ["starterpacks"] as const,
  },
  query,
  parse,
};

export const Starterpack = {
  parse: parseStarterpacks,
};
