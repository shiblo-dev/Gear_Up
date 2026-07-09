import express from "express";
import validateRequest from "../../middlewares/validateRequest";

import { ReviewValidation } from "./review.validation";
import { ReviewController } from "./review.controller";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("CUSTOMER"),
  validateRequest(ReviewValidation.createReviewSchema),
  ReviewController.createReview
);
 
router.get("/gear/:gearItemId", ReviewController.getReviewsByGearItem);

export const ReviewRoutes = router;