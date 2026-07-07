import { Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();


router.get(
  "/admin/users",
  auth(Role.ADMIN),
  userController.getAllUsers
);
router.patch(
  "/admin/users/:id",
  auth(Role.ADMIN),
  userController.updateUserStatus
);



export const userRoutes = router;