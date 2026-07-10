 import { Router } from "express";
import { auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
 import { ProviderController } from "./provider.controller";
import { ProviderValidation } from "./provider.validation";
import { Role } from "../../../generated/prisma/enums";
import { GearItemValidation } from "../gearitem/gearItem.validation";
 
const router = Router();

router.post(
  "/gear",
  auth(Role.PROVIDER),
  validateRequest(GearItemValidation.createGearItemValidation),
  ProviderController.createGear
);

router.put(
  "/gear/:id",
  auth(Role.PROVIDER),
  validateRequest(GearItemValidation.updateGearItemValidation),
  ProviderController.updateGear
);

router.delete(
  "/gear/:id",
  auth(Role.PROVIDER),
  ProviderController.deleteGear
);

router.get(
  "/orders",
  auth(Role.PROVIDER),
  ProviderController.getProviderOrders
);

router.patch(
  "/orders/:id",
  auth(Role.PROVIDER),
  validateRequest(ProviderValidation.updateOrderStatusValidation),
  ProviderController.updateOrderStatus
);

export const providerRoutes = router;