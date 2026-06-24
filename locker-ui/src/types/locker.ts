export interface Locker {
  id: number;
  name: string;
  size: "SMALL" | "MEDIUM" | "LARGE";
  status: "AVAILABLE" | "OCCUPIED";
}

export interface LockerApiResponse {
  success: boolean;
  data: Locker[];
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface StorePackageRequest {
  lockerId?: number;
  packageSize: "SMALL" | "MEDIUM" | "LARGE";
  customerInfo: CustomerInfo;
}

export interface StorePackageResponse {
  success: boolean;
  data: {
    lockerId: number;
    pickupCode: string;
  };
  message?: string;
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

export type PaymentMethod = "CREDIT_CARD" | "DEBIT_CARD" | "QR_PAY" | "CASH";

export interface ChargePreviewResponse {
  success: boolean;
  data: {
    lockerId: number;
    storedAt: string;
    storedDays: number;
    storageCharge: number;
    chargeCalculation: ChargeCalculation[];
  };
  message?: string;
}

export interface RetrievePackageResponse {
  success: boolean;
  data: {
    lockerId: number;
    packageRetrieved: true;
    lockerOpened: true;
    storedAt: string;
    storedDays: number;
    storageCharge: number;
    chargeCalculation: ChargeCalculation[];
  };
  message?: string;
}
