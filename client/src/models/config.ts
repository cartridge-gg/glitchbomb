import { getChecksumAddress } from "starknet";
import type { RawConfig } from "@/models";

const MODEL_NAME = "Config";

export class Config {
  constructor(
    public world_resource: string,
    public vrf: string,
    public quote: string,
    public team_address: string,
    public ekubo_router: string,
    public ekubo_positions: string,
    public target_supply: bigint,
    public burn_percentage: number,
    public vault_percentage: number,
    public average_weigth: number,
    public average_score: number,
    public last_updated: number,
    public pool_fee: bigint,
    public pool_tick_spacing: bigint,
    public pool_extension: string,
    public pool_sqrt: bigint,
    public base_price: bigint,
  ) {}

  static getModelName(): string {
    return MODEL_NAME;
  }

  static from(data: RawConfig): Config | null {
    return Config.parse(data);
  }

  static parse(data: RawConfig): Config | null {
    if (
      !data?.world_resource?.value ||
      !data?.vrf?.value ||
      !data?.quote?.value
    ) {
      console.warn("Config.parse: Missing required fields", data);
      return null;
    }
    return new Config(
      data.world_resource.value,
      getChecksumAddress(data.vrf.value),
      getChecksumAddress(data.quote.value),
      data?.team_address?.value
        ? getChecksumAddress(data.team_address.value)
        : "0x0",
      data?.ekubo_router?.value
        ? getChecksumAddress(data.ekubo_router.value)
        : "0x0",
      data?.ekubo_positions?.value
        ? getChecksumAddress(data.ekubo_positions.value)
        : "0x0",
      data?.target_supply?.value ? BigInt(data.target_supply.value) : 0n,
      data?.burn_percentage?.value ? Number(data.burn_percentage.value) : 0,
      data?.vault_percentage?.value ? Number(data.vault_percentage.value) : 0,
      data?.average_weigth?.value ? Number(data.average_weigth.value) : 0,
      data?.average_score?.value ? Number(data.average_score.value) : 0,
      data?.last_updated?.value ? Number(data.last_updated.value) : 0,
      data?.pool_fee?.value ? BigInt(data.pool_fee.value) : 0n,
      data?.pool_tick_spacing?.value
        ? BigInt(data.pool_tick_spacing.value)
        : 0n,
      data?.pool_extension?.value
        ? getChecksumAddress(data.pool_extension.value)
        : "0x0",
      data?.pool_sqrt?.value ? BigInt(data.pool_sqrt.value) : 0n,
      data?.base_price?.value ? BigInt(data.base_price.value) : 0n,
    );
  }
}
