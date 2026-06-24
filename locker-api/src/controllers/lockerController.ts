import {
  checkStorageChargePreview,
  getAllLockers as getAllLockersFromService,
  retrievePackageFromLocker,
  storePackageInLocker,
} from "../services/lockerService";
import { Request, Response } from "express";
import {
  LockerSize,
  RetrievePackageRequest,
  StorePackageRequest,
} from "../types/lockerParams";

type ErrorResponse = {
  success: false;
  message: string;
};

const supportedSizes = new Set<LockerSize>(["SMALL", "MEDIUM", "LARGE"]);

const sendError = (
  res: Response,
  status: number,
  message: string,
): Response<ErrorResponse> => {
  return res.status(status).json({ success: false, message });
};

const parseLockerId = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
};

const parseStorePayload = (body: unknown): StorePackageRequest | null => {
  if (!body || typeof body !== "object") {
    return null;
  }

  const payload = body as Partial<StorePackageRequest>;
  const lockerId = parseLockerId(payload.lockerId);

  if (
    !payload.packageSize ||
    !supportedSizes.has(payload.packageSize) ||
    !payload.customerInfo?.name ||
    !payload.customerInfo?.email ||
    !payload.customerInfo?.phone
  ) {
    return null;
  }

  return {
    lockerId,
    packageSize: payload.packageSize,
    customerInfo: {
      name: payload.customerInfo.name,
      email: payload.customerInfo.email,
      phone: payload.customerInfo.phone,
    },
  };
};

const parseRetrievePayload = (body: unknown): RetrievePackageRequest | null => {
  if (!body || typeof body !== "object") {
    return null;
  }

  const payload = body as Partial<RetrievePackageRequest>;
  const lockerId = parseLockerId(payload.lockerId);

  if (!lockerId || !payload.pickupCode || payload.pickupCode.trim() === "") {
    return null;
  }

  return {
    lockerId,
    pickupCode: payload.pickupCode.trim(),
  };
};

// api - get all lockers
export const getAllLockers = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: getAllLockersFromService().map((locker) => ({
      id: locker.id,
      name: locker.name,
      size: locker.size,
      status: locker.status,
    })),
  });
};

// api - store package in locker
export const storePackage = (req: Request, res: Response): void => {
  const payload = parseStorePayload(req.body);
  if (!payload) {
    sendError(
      res,
      400,
      "Valid packageSize, customer name/email/phone, and optional numeric lockerId are required",
    );
    return;
  }

  const allocation = storePackageInLocker(payload);
  if (!allocation) {
    sendError(res, 409, "No suitable locker available");
    return;
  }

  res.status(201).json({
    success: true,
    data: allocation,
  });
};

export const retrievePackage = (req: Request, res: Response): void => {
  const payload = parseRetrievePayload(req.body);
  if (!payload) {
    sendError(res, 400, "Locker ID and pickup code are required");
    return;
  }

  const retrieval = retrievePackageFromLocker(payload);
  if (!retrieval) {
    sendError(res, 404, "Invalid locker ID or pickup code");
    return;
  }

  res.status(200).json({
    success: true,
    data: retrieval,
  });
};

export const checkCharge = (req: Request, res: Response): void => {
  const payload = parseRetrievePayload(req.body);
  if (!payload) {
    sendError(res, 400, "Locker ID and pickup code are required");
    return;
  }

  const chargePreview = checkStorageChargePreview(payload);
  if (!chargePreview) {
    sendError(res, 404, "Invalid locker ID or pickup code");
    return;
  }

  res.status(200).json({
    success: true,
    data: chargePreview,
  });
};
