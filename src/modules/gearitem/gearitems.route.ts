import { Router } from "express";
import { GearItemController } from "./gearitems.controller";
import validateRequest from "../../middlewares/validateRequest";
 import { GearItemValidation } from "./gearItem.validation";
import { auth } from "../../middlewares/auth";

const router = Router();

router.get("/", GearItemController.getAllGearItems);

router.get("/:id", GearItemController.getSingleGearItem);

 

export const GearItemRoutes = router;