import { ChargeCalculation } from "../types/lockerParams";

export interface StorageChargeDetails {
  storedDays: number;
  storageCharge: number;
  chargeCalculation: ChargeCalculation[];
}

export interface StorageChargeCalculator {
  calculate(storedAt: Date, retrievedAt: Date): StorageChargeDetails;
}

export class TieredStorageChargeCalculator implements StorageChargeCalculator {
  constructor(private readonly baseRate: number = 5) {}

  calculate(storedAt: Date, retrievedAt: Date): StorageChargeDetails {
    const msElapsed = retrievedAt.getTime() - storedAt.getTime();
    const storedDays = Math.max(
      1,
      Math.ceil(msElapsed / (1000 * 60 * 60 * 24)),
    );

    const breakdown: ChargeCalculation[] = [];
    let remaining = storedDays;

    const tiers: Array<{ limit: number; rate: number }> = [
      { limit: 5, rate: this.baseRate },
      { limit: 5, rate: this.baseRate * 2 },
      { limit: Infinity, rate: this.baseRate * 3 },
    ];

    for (const tier of tiers) {
      if (remaining <= 0) {
        break;
      }

      const days = Math.min(remaining, tier.limit);
      breakdown.push({
        days,
        ratePerDay: tier.rate,
        subtotal: days * tier.rate,
      });
      remaining -= days;
    }

    const storageCharge = breakdown.reduce(
      (sum, part) => sum + part.subtotal,
      0,
    );

    return {
      storedDays,
      storageCharge,
      chargeCalculation: breakdown,
    };
  }
}
