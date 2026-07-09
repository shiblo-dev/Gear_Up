import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { ProviderController } from "./provider.controller";
import { Role } from "../../../generated/prisma/enums";


const router = Router();

router.post(
  "/gear",
  auth(Role.PROVIDER),
  ProviderController.createGear
);

router.put(
  "/gear/:id",
  auth(Role.PROVIDER),
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
  ProviderController.updateOrderStatus
);

export default router;