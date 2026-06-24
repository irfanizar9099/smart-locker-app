import {
  Locker,
  LockerSize,
  RetrievePackageRequest,
  RetrievePackageResult,
  StorePackageRequest,
  StoredPackage,
} from "../types/lockerParams";
import { InMemoryLockerRepository } from "../repositories/inMemoryLockerRepository";
import { LockerRepository } from "../repositories/lockerRepository";
import {
  RandomPickupCodeGenerator,
  PickupCodeGenerator,
} from "./codeGenerator";
import {
  StorageChargeCalculator,
  TieredStorageChargeCalculator,
  StorageChargeDetails,
} from "./storageCalculator";

const lockerSizeOrder: Record<LockerSize, number> = {
  SMALL: 1,
  MEDIUM: 2,
  LARGE: 3,
};

export class LockerService {
  private readonly pendingLockerAssignments = new Set<number>();

  constructor(
    private readonly repository: LockerRepository,
    private readonly chargeCalculator: StorageChargeCalculator,
    private readonly codeGenerator: PickupCodeGenerator,
  ) {}

  getAllLockers(): Locker[] {
    return this.repository.getAll();
  }

  storePackageInLocker(
    payload: StorePackageRequest,
  ): { lockerId: number; pickupCode: string } | null {
    const targetLocker = payload.lockerId
      ? this.findSelectedLockerForStore(payload)
      : this.findSmallestFitLocker(payload.packageSize);

    if (!targetLocker) {
      return null;
    }

    this.pendingLockerAssignments.add(targetLocker.id);

    try {
      const assignedPackage: StoredPackage = {
        size: payload.packageSize,
        customerInfo: payload.customerInfo,
        pickupCode: this.codeGenerator.generate(),
        storedAt: new Date(),
      };

      targetLocker.status = "OCCUPIED";
      targetLocker.assignedPackage = assignedPackage;

      return {
        lockerId: targetLocker.id,
        pickupCode: assignedPackage.pickupCode,
      };
    } finally {
      this.pendingLockerAssignments.delete(targetLocker.id);
    }
  }

  checkStorageChargePreview(payload: RetrievePackageRequest): {
    lockerId: number;
    storedAt: Date;
    storedDays: number;
    storageCharge: number;
    chargeCalculation: StorageChargeDetails["chargeCalculation"];
  } | null {
    const locker = this.getOccupiedLockerByCode(payload);
    if (!locker) {
      return null;
    }

    const storedPackage = locker.assignedPackage as StoredPackage;
    const charges = this.chargeCalculator.calculate(
      storedPackage.storedAt,
      new Date(),
    );

    return {
      lockerId: locker.id,
      storedAt: storedPackage.storedAt,
      storedDays: charges.storedDays,
      storageCharge: charges.storageCharge,
      chargeCalculation: charges.chargeCalculation,
    };
  }

  retrievePackageFromLocker(
    payload: RetrievePackageRequest,
  ): RetrievePackageResult | null {
    const locker = this.getOccupiedLockerByCode(payload);
    if (!locker) {
      return null;
    }

    const storedPackage = locker.assignedPackage as StoredPackage;
    locker.status = "AVAILABLE";
    locker.assignedPackage = null;

    const charges = this.chargeCalculator.calculate(
      storedPackage.storedAt,
      new Date(),
    );

    return {
      lockerId: locker.id,
      packageRetrieved: true,
      lockerOpened: true,
      storedAt: storedPackage.storedAt,
      storedDays: charges.storedDays,
      storageCharge: charges.storageCharge,
      chargeCalculation: charges.chargeCalculation,
    };
  }

  private findSelectedLockerForStore(
    payload: StorePackageRequest,
  ): Locker | null {
    const locker = this.repository.findById(payload.lockerId as number);
    if (!locker) {
      return null;
    }

    if (locker.status !== "AVAILABLE") {
      return null;
    }

    if (this.pendingLockerAssignments.has(locker.id)) {
      return null;
    }

    if (!this.canFitPackage(locker.size, payload.packageSize)) {
      return null;
    }

    return locker;
  }

  private findSmallestFitLocker(packageSize: LockerSize): Locker | null {
    const locker = this.repository
      .getAll()
      .filter(
        (currentLocker) =>
          currentLocker.status === "AVAILABLE" &&
          !this.pendingLockerAssignments.has(currentLocker.id),
      )
      .filter((currentLocker) =>
        this.canFitPackage(currentLocker.size, packageSize),
      )
      .sort(
        (left, right) =>
          lockerSizeOrder[left.size] - lockerSizeOrder[right.size],
      )[0];

    return locker ?? null;
  }

  private getOccupiedLockerByCode(
    payload: RetrievePackageRequest,
  ): Locker | null {
    const locker = this.repository.findById(payload.lockerId);

    if (!locker || locker.status !== "OCCUPIED" || !locker.assignedPackage) {
      return null;
    }

    if (locker.assignedPackage.pickupCode !== payload.pickupCode) {
      return null;
    }

    return locker;
  }

  private canFitPackage(
    lockerSize: LockerSize,
    packageSize: LockerSize,
  ): boolean {
    return lockerSizeOrder[lockerSize] >= lockerSizeOrder[packageSize];
  }
}

const lockerService = new LockerService(
  new InMemoryLockerRepository(),
  new TieredStorageChargeCalculator(),
  new RandomPickupCodeGenerator(),
);

export const getAllLockers = (): Locker[] => lockerService.getAllLockers();

export const storePackageInLocker = (
  payload: StorePackageRequest,
): { lockerId: number; pickupCode: string } | null =>
  lockerService.storePackageInLocker(payload);

export const checkStorageChargePreview = (payload: RetrievePackageRequest) =>
  lockerService.checkStorageChargePreview(payload);

export const retrievePackageFromLocker = (
  payload: RetrievePackageRequest,
): RetrievePackageResult | null =>
  lockerService.retrievePackageFromLocker(payload);
