const MASK_64 = (1n << 64n) - 1n;

function splitmix64(seed: bigint): bigint {
  let z = (seed + 0x9e3779b97f4a7c15n) & MASK_64;
  z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK_64;
  z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & MASK_64;
  return (z ^ (z >> 31n)) & MASK_64;
}

function cryptoRandomU64(): bigint | null {
  if (typeof window === "undefined") return null;
  if (!window.crypto?.getRandomValues) return null;
  const buffer = new BigUint64Array(1);
  window.crypto.getRandomValues(buffer);
  return buffer[0] ?? 0n;
}

export function createSeed(): bigint {
  const value = cryptoRandomU64();
  if (value !== null) return value;
  return BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
}

export class Random {
  private seed: bigint;
  private nonce: bigint;
  private useCrypto: boolean;

  constructor(seed: bigint) {
    this.seed = seed & MASK_64;
    this.nonce = 0n;
    this.useCrypto = cryptoRandomU64() !== null;
  }

  nextSeed(): bigint {
    if (this.useCrypto) {
      const value = cryptoRandomU64();
      if (value !== null) return value;
    }
    this.nonce += 1n;
    this.seed = splitmix64(this.seed + this.nonce);
    return this.seed;
  }

  nextInt(maxExclusive: number): number {
    if (maxExclusive <= 0) return 0;
    const value = this.nextSeed() % BigInt(maxExclusive);
    return Number(value);
  }

  between(min: number, max: number): number {
    if (min >= max) return min;
    const range = max - min + 1;
    return min + this.nextInt(range);
  }
}

export function shuffle<T>(items: T[], random: Random): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = random.nextInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
