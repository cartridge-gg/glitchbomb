import { getChecksumAddress } from "starknet";
import type { RawConfig } from "@/models";

export const CONFIG = "Config";

export class Config {
  id: string;
  vrf: string;
  token: string;
  registry: string;
  owner: string;
  fee_receiver: string;
  entry_price: bigint;

  constructor(
    id: string,
    vrf: string,
    token: string,
    registry: string,
    owner: string,
    fee_receiver: string,
    entry_price: bigint,
  ) {
    this.id = id;
    this.vrf = vrf;
    this.token = token;
    this.registry = registry;
    this.owner = owner;
    this.fee_receiver = fee_receiver;
    this.entry_price = entry_price;
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
      !data?.registry?.value ||
      !data?.owner?.value ||
      !data?.fee_receiver?.value ||
      !data?.entry_price?.value
    ) {
      console.warn("Config.parse: Missing required fields", data);
      return null;
    }
    return new Config(
      data.id.value,
      getChecksumAddress(data.vrf.value),
      getChecksumAddress(data.token.value),
      getChecksumAddress(data.registry.value),
      getChecksumAddress(data.owner.value),
      getChecksumAddress(data.fee_receiver.value),
      BigInt(data.entry_price.value),
    );
  }
}
