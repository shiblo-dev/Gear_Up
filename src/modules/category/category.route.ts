import { Router } from "express";
import { categoryController } from "./category.controller";
import { auth } from "../../middlewares/auth";

import { Role } from "../../../generated/prisma/enums";
import validateRequest from "../../middlewares/validateRequest";
import { categoryValidation } from "./category.validation";


const router = Router();


// Public
router.get(
    "/",
    categoryController.getAllCategories
);


router.get(
    "/:id",
    categoryController.getSingleCategory
);


// Admin only
router.post(
    "/",
    auth(Role.ADMIN),
    validateRequest(categoryValidation.createCategorySchema),
    categoryController.createCategory
);


router.patch(
    "/:id",
    auth(Role.ADMIN),
    validateRequest(categoryValidation.updateCategorySchema),
    categoryController.updateCategory
);


router.delete(
    "/:id",
    auth(Role.ADMIN),
    categoryController.deleteCategory
);



export const categoryRoutes = router;