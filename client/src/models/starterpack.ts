import { getChecksumAddress } from "starknet";
import type { RawStarterpack } from "@/models";

export const STARTERPACK = "Starterpack";

export class Starterpack {
  id: string;
  reissuable: boolean;
  referral_percentage: number;
  price: bigint;
  payment_token: string;
  payment_receiver: string | null;

  constructor(
    id: string,
    reissuable: boolean,
    referral_percentage: number,
    price: bigint,
    payment_token: string,
    payment_receiver: string | null,
  ) {
    this.id = id;
    this.reissuable = reissuable;
    this.referral_percentage = referral_percentage;
    this.price = price;
    this.payment_token = payment_token;
    this.payment_receiver = payment_receiver;
  }

  static from(data: RawStarterpack): Starterpack | null {
    return Starterpack.parse(data);
  }

  static parse(data: RawStarterpack): Starterpack | null {
    // Validate required fields
    if (
      !data?.id?.value ||
      data?.reissuable?.value === undefined ||
      !data?.referral_percentage?.value ||
      !data?.price?.value ||
      !data?.payment_token?.value
    ) {
      console.warn("Starterpack.parse: Missing required fields", data);
      return null;
    }

    // Parse optional payment_receiver
    let paymentReceiver: string | null = null;
    if (data.payment_receiver?.value) {
      const optionValue = data.payment_receiver.value;
      if (
        typeof optionValue === "object" &&
        "option" in optionValue &&
        optionValue.option === "Some" &&
        "value" in optionValue
      ) {
        paymentReceiver = getChecksumAddress(optionValue.value as string);
      }
    }

    return new Starterpack(
      data.id.value,
      data.reissuable.value,
      Number(data.referral_percentage.value),
      BigInt(data.price.value),
      getChecksumAddress(data.payment_token.value),
      paymentReceiver,
    );
  }
}
