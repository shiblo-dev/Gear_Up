import { Router } from "express";
import { auth } from "../../middlewares/auth";

import { Role } from "../../../generated/prisma/enums";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "./payment.validation";
import { PaymentController } from "./payment.controller";

const router = Router();

router.post(
  "/create",
  auth(Role.CUSTOMER),
  validateRequest(PaymentValidation.createPaymentValidation),
  PaymentController.createPaymentSession
);

router.get("/", auth(Role.CUSTOMER), PaymentController.getUserPayments);

router.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), PaymentController.getPaymentDetails);

export const paymentRoutes = router;