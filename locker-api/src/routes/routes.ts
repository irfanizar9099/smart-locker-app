import {
  getAllLockers,
  retrievePackage,
  storePackage,
  checkCharge,
} from "../controllers/lockerController";
import { Router } from "express";

const router = Router();

router.get("/", getAllLockers);
router.post("/store", storePackage);
router.post("/retrieve", retrievePackage);
router.post("/check-charge", checkCharge);

export default router;
