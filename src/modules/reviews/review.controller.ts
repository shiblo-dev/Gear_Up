import { Request, Response } from "express";
import httpStatus from "http-status";
import { ReviewService } from "./review.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await ReviewService.createReview(userId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

const getReviewsByGearItem = catchAsync(async (req: Request, res: Response) => {
  const { gearItemId } = req.params;
  const result = await ReviewService.getReviewsByGearItem(gearItemId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getReviewsByGearItem,
};