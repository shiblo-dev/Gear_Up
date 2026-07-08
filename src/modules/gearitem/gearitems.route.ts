 import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { GearItemValidation } from "./gearItem.validation";
import { GearItemController } from "./gearitems.controller";
import validateRequest from "../../middlewares/validateRequest";

const router = Router();

router.post(
  "/gear",
  auth(Role.PROVIDER),
  GearItemController.createGearItem
);

router.get(
  "/",
  GearItemController.getAllGearItems
);

router.get(
  "/:id",
  GearItemController.getSingleGearItem
);

router.put(
  "/gear/:id",
  auth(Role.PROVIDER),
  GearItemController.updateGearItem
);

router.delete(
  "/gear/:id",
  auth(Role.PROVIDER),
  GearItemController.deleteGearItem
);

export const GearItemRoutes = router;