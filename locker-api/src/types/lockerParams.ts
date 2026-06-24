export type LockerSize = "SMALL" | "MEDIUM" | "LARGE";

export type LockerStatus = "AVAILABLE" | "OCCUPIED";

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface StoredPackage {
  size: LockerSize;
  customerInfo: CustomerInfo;
  pickupCode: string;
  storedAt: Date;
}

export interface Locker {
  id: number;
  name: string;
  size: LockerSize;
  status: LockerStatus;
  assignedPackage: StoredPackage | null;
}

export interface StorePackageRequest {
  lockerId?: number;
  packageSize: LockerSize;
  customerInfo: CustomerInfo;
}

export interface RetrievePackageRequest {
  lockerId: number;
  pickupCode: string;
}

export interface ChargeCalculation {
  days: number;
  ratePerDay: number;
  subtotal: number;
}

export interface RetrievePackageResult {
  lockerId: number;
  packageRetrieved: true;
  lockerOpened: true;
  storedAt: Date;
  storedDays: number;
  storageCharge: number;
  chargeCalculation: ChargeCalculation[];
}
