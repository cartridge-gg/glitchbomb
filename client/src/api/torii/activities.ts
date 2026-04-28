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

function parseHexDigit(char: string): number {
  if (char >= "0" && char <= "9") return Number.parseInt(char, 16);
  if (char >= "a" && char <= "f") return char.charCodeAt(0) - 87;
  return 0;
}

function parseHexScore(scoreHex: string): number {
  const s = scoreHex.toLowerCase();
  return parseHexDigit(s[s.length - 2]) * 16 + parseHexDigit(s[s.length - 1]);
}

async function fetch(limit: number, offset: number): Promise<ActivityRow[]> {
  const client = initGrpcClient();
  const query = `SELECT
    c.username,
    g.slots,
    g.reward,
    s.player,
    s.game_id,
    s.score,
    s.timestamp
FROM "${NAMESPACE}-LeaderboardScore" AS s
JOIN controllers AS c ON s.player = c.address
JOIN "${NAMESPACE}-Game" AS g ON LTRIM(REPLACE(s.game_id, '0x', ''), '0') = LTRIM(REPLACE(g.id, '0x', ''), '0')
ORDER BY timestamp DESC
LIMIT ${limit}
OFFSET ${offset};`;

  const rows = await client.executeSql(query);

  return rows.map((row) => {
    const gameId = Number(row.game_id) || 0;
    const score = parseHexScore(String(row.score || "0"));
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
