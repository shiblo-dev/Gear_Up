import express from "express";
import validateRequest from "../../middlewares/validateRequest";

import { AdminValidation } from "./admin.validation";
import { AdminController } from "./admin.controller";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.get("/users", auth("ADMIN"), AdminController.getAllUsers);

router.patch(
  "/users/:id",
  auth("ADMIN"),
  validateRequest(AdminValidation.updateUserStatusSchema),
  AdminController.updateUserStatus
);

router.get("/gear", auth("ADMIN"), AdminController.getAllGear);

router.get("/rentals", auth("ADMIN"), AdminController.getAllRentals);

export const AdminRoutes = router;