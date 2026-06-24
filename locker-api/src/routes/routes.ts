import { Router } from "express";
import {
  checkCharge,
  getAllLockers,
  retrievePackage,
  storePackage,
} from "../controllers/lockerController";

const router = Router();

router.get("/", getAllLockers);
router.post("/store", storePackage);
router.post("/retrieve", retrievePackage);
router.post("/check-charge", checkCharge);

export default router;
