import { NAMESPACE } from "@/constants";
import { initGrpcClient } from "./client";

export interface ActivityRow {
  username: string;
  gameId: number;
  score: number;
  reward: number;
  to: string;
  timestamp: number;
}

async function fetch(limit: number, offset: number): Promise<ActivityRow[]> {
  const client = initGrpcClient();
  const query = `SELECT
    c.username,
    g.moonrocks,
    r.reward,
    s.player,
    s.game_id,
    s.score,
    s.timestamp
FROM "${NAMESPACE}-LeaderboardScore" AS s
LEFT JOIN controllers AS c ON s.player = c.address
LEFT JOIN "${NAMESPACE}-Game" AS g ON LTRIM(REPLACE(s.game_id, '0x', ''), '0') = LTRIM(REPLACE(g.id, '0x', ''), '0')
LEFT JOIN "${NAMESPACE}-Claimed" AS r ON r.game_id = g.id
ORDER BY timestamp DESC
LIMIT ${limit}
OFFSET ${offset};`;

  const rows = await client.executeSql(query);

  return rows.map((row) => {
    const gameId = Number(row.game_id) || 0;
    const score = Number(parseInt(String(row.moonrocks), 10));
    const reward = Number(BigInt(String(row.reward || "0x0")) / 10n ** 18n);
    return {
      username: String(row.username || ""),
      gameId,
      score,
      reward,
      to: `/game/${gameId}`,
      timestamp: Number(row.timestamp) || 0,
    };
  });
}

export const Activities = {
  keys: () => ["activities"] as const,
  fetch,
};
