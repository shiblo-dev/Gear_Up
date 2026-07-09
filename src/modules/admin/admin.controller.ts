import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminService } from "./admin.service ";


const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await AdminService.updateUserStatus(id as string, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const getAllGear = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllGear();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Gear listings retrieved successfully",
    data: result,
  });
});

const getAllRentals = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllRentals();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rental orders retrieved successfully",
    data: result,
  });
});

export const AdminController = {
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals,
};