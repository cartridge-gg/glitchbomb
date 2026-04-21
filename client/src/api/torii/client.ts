import { DEFAULT_CHAIN_ID, dojoConfigs } from "@/config";

function getToriiUrl(): string {
  return dojoConfigs[DEFAULT_CHAIN_ID].toriiUrl;
}

export async function executeSql(
  query: string,
): Promise<Record<string, unknown>[]> {
  const toriiUrl = getToriiUrl();
  const response = await fetch(`${toriiUrl}/sql`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: query,
  });

  if (!response.ok) {
    throw new Error(`Torii SQL query failed: ${response.statusText}`);
  }

  return response.json();
}
