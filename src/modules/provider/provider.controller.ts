import { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { gearItemService } from "../gearitem/gearitems.service";

const createGear = catchAsync(async (req: Request, res: Response) => {
  const result = await gearItemService.createGearItem(
    req.user!.id,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Gear added successfully",
    data: result,
  });
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await gearItemService.updateGearItem(
    id,
    req.user!.id,
    req.user!.role,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear updated successfully",
    data: result,
  });
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  await gearItemService.deleteGearItem(
    id,
    req.user!.id,
    req.user!.role
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear deleted successfully",
    data: null,
  });
});

const getProviderOrders = catchAsync(async (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Coming Soon",
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Coming Soon",
  });
});

export const ProviderController = {
  createGear,
  updateGear,
  deleteGear,
  getProviderOrders,
  updateOrderStatus,
};