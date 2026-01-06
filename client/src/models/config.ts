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

  static from(data: RawConfig): Config {
    return Config.parse(data);
  }

  static parse(data: RawConfig): Config {
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
