import assert = require("assert");

import { LockerService } from "../services/lockerService";
import { LockerRepository } from "../repositories/lockerRepository";
import { Locker, LockerSize } from "../types/lockerParams";
import { PickupCodeGenerator } from "../services/codeGenerator";
import {
  StorageChargeCalculator,
  TieredStorageChargeCalculator,
} from "../services/storageCalculator";

class FakeLockerRepository implements LockerRepository {
  constructor(private readonly lockers: Locker[]) {}

  getAll(): Locker[] {
    return this.lockers;
  }

  findById(id: number): Locker | undefined {
    return this.lockers.find((locker) => locker.id === id);
  }
}

class FixedCodeGenerator implements PickupCodeGenerator {
  generate(): string {
    return "PU-TEST-0001";
  }
}

const createLocker = (
  id: number,
  size: LockerSize,
  status: "AVAILABLE" | "OCCUPIED" = "AVAILABLE",
): Locker => ({
  id,
  name: `${size[0]}-${id}`,
  size,
  status,
  assignedPackage: null,
});

const run = (name: string, fn: () => void): void => {
  try {
    fn();
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}`);
    throw error;
  }
};

run("stores package in explicitly selected locker", () => {
  const lockers = [createLocker(1, "SMALL"), createLocker(5, "SMALL")];

  const service = new LockerService(
    new FakeLockerRepository(lockers),
    new TieredStorageChargeCalculator(),
    new FixedCodeGenerator(),
  );

  const result = service.storePackageInLocker({
    lockerId: 5,
    packageSize: "SMALL",
    customerInfo: { name: "A", email: "a@x.com", phone: "0123456789" },
  });

  assert.ok(result);
  assert.equal(result!.lockerId, 5);
  assert.equal(lockers[1].status, "OCCUPIED");
});

run("falls back to smallest-fit locker when no lockerId provided", () => {
  const lockers = [
    createLocker(1, "SMALL", "OCCUPIED"),
    createLocker(2, "MEDIUM"),
    createLocker(3, "LARGE"),
  ];

  const service = new LockerService(
    new FakeLockerRepository(lockers),
    new TieredStorageChargeCalculator(),
    new FixedCodeGenerator(),
  );

  const result = service.storePackageInLocker({
    packageSize: "SMALL",
    customerInfo: { name: "B", email: "b@x.com", phone: "0123456789" },
  });

  assert.ok(result);
  assert.equal(result!.lockerId, 2);
});

run("returns null when selected locker is occupied", () => {
  const lockers = [createLocker(7, "MEDIUM", "OCCUPIED")];

  const service = new LockerService(
    new FakeLockerRepository(lockers),
    new TieredStorageChargeCalculator(),
    new FixedCodeGenerator(),
  );

  const result = service.storePackageInLocker({
    lockerId: 7,
    packageSize: "SMALL",
    customerInfo: { name: "C", email: "c@x.com", phone: "0123456789" },
  });

  assert.equal(result, null);
});

run("tiered charge calculator uses 5/10/15 day rates", () => {
  const calculator: StorageChargeCalculator =
    new TieredStorageChargeCalculator();
  const start = new Date("2026-01-01T00:00:00.000Z");
  const end = new Date("2026-01-13T00:00:00.000Z");

  const charges = calculator.calculate(start, end);

  assert.equal(charges.storedDays, 12);
  assert.deepEqual(charges.chargeCalculation, [
    { days: 5, ratePerDay: 5, subtotal: 25 },
    { days: 5, ratePerDay: 10, subtotal: 50 },
    { days: 2, ratePerDay: 15, subtotal: 30 },
  ]);
  assert.equal(charges.storageCharge, 105);
});
