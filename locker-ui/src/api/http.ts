import {
  ChargePreviewResponse,
  LockerApiResponse,
  RetrievePackageRequest,
  RetrievePackageResponse,
  StorePackageRequest,
  StorePackageResponse,
} from "../types/locker";

const API_URL = "http://localhost:5000";

export const getLockers = async (): Promise<LockerApiResponse> => {
  const res = await fetch(`${API_URL}/lockers`);
  if (!res.ok) {
    throw new Error("Failed to fetch lockers");
  }

  return res.json() as Promise<LockerApiResponse>;
};

export const storePackage = async (
  payload: StorePackageRequest,
): Promise<StorePackageResponse> => {
  const res = await fetch(`${API_URL}/lockers/store`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = (await res.json()) as StorePackageResponse & {
    message?: string;
  };

  if (!res.ok) {
    throw new Error(result.message || "Failed to store package");
  }

  return result;
};

export const retrievePackage = async (
  payload: RetrievePackageRequest,
): Promise<RetrievePackageResponse> => {
  const res = await fetch(`${API_URL}/lockers/retrieve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = (await res.json()) as RetrievePackageResponse & {
    message?: string;
  };

  if (!res.ok) {
    throw new Error(result.message || "Failed to retrieve package");
  }

  return result;
};

export const checkCharge = async (
  payload: RetrievePackageRequest,
): Promise<ChargePreviewResponse> => {
  const res = await fetch(`${API_URL}/lockers/check-charge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = (await res.json()) as ChargePreviewResponse & {
    message?: string;
  };

  if (!res.ok) {
    throw new Error(result.message || "Failed to check charge");
  }

  return result;
};
