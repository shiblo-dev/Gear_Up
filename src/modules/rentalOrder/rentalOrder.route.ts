 import { Router } from "express";
import { auth } from "../../middlewares/auth";

import { Role } from "../../../generated/prisma/enums";
import validateRequest from "../../middlewares/validateRequest";
import { rentalOrderValidation } from "./rentalOrder.validation";
import { rentalOrderControllers } from "./rentalOrder.controller";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(rentalOrderValidation.createRentalOrderValidationSchema),
  rentalOrderControllers.createRentalOrder
);

router.get("/", auth(Role.CUSTOMER), rentalOrderControllers.getMyRentalOrders);

router.get(
  "/:id",
  auth(Role.CUSTOMER),
  rentalOrderControllers.getSingleRentalOrder
);

router.patch(
  "/:id/cancel",
  auth(Role.CUSTOMER),
  rentalOrderControllers.cancelRentalOrder
);
export const rentalOrderRoutes = router;