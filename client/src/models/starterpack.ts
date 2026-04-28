import { getChecksumAddress } from "starknet";
import type { RawStarterpack } from "@/models";

const MODEL_NAME = "Starterpack";

export class Starterpack {
  id: string;
  reissuable: boolean;
  referral_percentage: number;
  multiplier: number;
  price: bigint;
  payment_token: string;

  constructor(
    id: string,
    reissuable: boolean,
    referral_percentage: number,
    multiplier: number,
    price: bigint,
    payment_token: string,
  ) {
    this.id = id;
    this.reissuable = reissuable;
    this.referral_percentage = referral_percentage;
    this.multiplier = multiplier;
    this.price = price;
    this.payment_token = payment_token;
  }

  static getModelName(): string {
    return MODEL_NAME;
  }

  static from(data: RawStarterpack): Starterpack | null {
    return Starterpack.parse(data);
  }

  static parse(data: RawStarterpack): Starterpack | null {
    // Validate required fields
    if (
      data?.id?.value === undefined ||
      data?.reissuable?.value === undefined ||
      data?.referral_percentage?.value === undefined ||
      data?.multiplier?.value === undefined ||
      data?.price?.value === undefined ||
      data?.payment_token?.value === undefined
    ) {
      console.warn("Starterpack.parse: Missing required fields", data);
      return null;
    }
    const props = {
      id: data.id.value,
      reissuable: data.reissuable.value,
      referral_percentage: Number(data.referral_percentage.value),
      multiplier: Number(data.multiplier.value),
      price: BigInt(data.price.value),
      payment_token: getChecksumAddress(data.payment_token.value),
    };
    return new Starterpack(
      props.id,
      props.reissuable,
      props.referral_percentage,
      props.multiplier,
      props.price,
      props.payment_token,
    );
  }

  static dedupe(packs: Starterpack[]): Starterpack[] {
    return packs.filter(
      (pack, index, self) => index === self.findIndex((p) => p.id === pack.id),
    );
  }
}
