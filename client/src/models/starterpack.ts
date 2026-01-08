import { getChecksumAddress } from "starknet";
import type { RawStarterpack } from "@/models";

export const STARTERPACK = "Starterpack";

export class Starterpack {
	id: string;
	reissuable: boolean;
	referral_percentage: number;
	price: bigint;
	payment_token: string;

	constructor(
		id: string,
		reissuable: boolean,
		referral_percentage: number,
		price: bigint,
		payment_token: string,
	) {
		this.id = id;
		this.reissuable = reissuable;
		this.referral_percentage = referral_percentage;
		this.price = price;
		this.payment_token = payment_token;
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
			price: BigInt(data.price.value),
			payment_token: getChecksumAddress(data.payment_token.value),
		};
		return new Starterpack(
			props.id,
			props.reissuable,
			props.referral_percentage,
			props.price,
			props.payment_token,
		);
	}
}
