import { getChecksumAddress } from "starknet";
import type { RawConfig } from "@/models";

export const CONFIG = "Config";

export class Config {
  id: string;
  vrf: string;
  token: string;
  registry: string;

  constructor(id: string, vrf: string, token: string, registry: string) {
    this.id = id;
    this.vrf = vrf;
    this.token = token;
    this.registry = registry;
  }

  static from(data: RawConfig): Config | null {
    return Config.parse(data);
  }

  static parse(data: RawConfig): Config | null {
    // Validate all required fields exist
    if (
      !data?.id?.value ||
      !data?.vrf?.value ||
      !data?.token?.value ||
      !data?.registry?.value
    ) {
      console.warn("Config.parse: Missing required fields", data);
      return null;
    }
    return new Config(
      data.id.value,
      getChecksumAddress(data.vrf.value),
      getChecksumAddress(data.token.value),
      getChecksumAddress(data.registry.value)
    );
  }
}
