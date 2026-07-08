import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { gearItemService } from "./gearitems.service";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";



 const createGearItem = catchAsync(
  async (req: Request, res: Response) => {

    const providerId = req.user?.id;

    const result =
      await gearItemService.createGearItem(
        providerId as string,
        req.body
      );

    sendResponse(res, {

      success: true,

      statusCode: httpStatus.CREATED,

      message: "Gear item created successfully",

      data: result,

    });

  }
);
const getSingleGearItem = catchAsync(

  async (req: Request, res: Response) => {

    const result =
      await gearItemService.getSingleGearItem(
        req.params.id as string
      );

    sendResponse(res, {

      success: true,

      statusCode: httpStatus.OK,

      message: "Gear item retrieved successfully",

      data: result,

    });

  }

);
const getAllGearItems = catchAsync(

  async (req: Request, res: Response) => {

    const filters = {

      searchTerm: req.query.searchTerm,

      categoryId: req.query.categoryId,

      brand: req.query.brand,

      isAvailable:
        req.query.isAvailable === "true"
          ? true
          : req.query.isAvailable === "false"
          ? false
          : undefined,

      minPrice: req.query.minPrice,

      maxPrice: req.query.maxPrice,

    };

    const options = {

      page: Number(req.query.page),

      limit: Number(req.query.limit),

      sortBy: req.query.sortBy,

      sortOrder: req.query.sortOrder,

    };

    const result =
      await gearItemService.getAllGearItems(
        filters as any,
        options as any
      );

    sendResponse(res, {

      success: true,

      statusCode: httpStatus.OK,

      message: "Gear items retrieved successfully",

      data: result.data,

    });

  }

);
const updateGearItem = catchAsync(

  async (req: Request, res: Response) => {

    const result =
      await gearItemService.updateGearItem(

        req.params?.id as string,

        req.user?.id as string,

        req.user?.role as string,

        req.body

      );

    sendResponse(res, {

      success: true,

      statusCode: httpStatus.OK,

      message: "Gear item updated successfully",

      data: result,

    });

  }

);
const deleteGearItem = catchAsync(

  async (req: Request, res: Response) => {
const id = req.params.id;



if (!id || Array.isArray(id)) {
  throw new AppError(
    httpStatus.BAD_REQUEST,
    "Invalid gear id"
  );
}
    await gearItemService.deleteGearItem(

       id,

      req.user?.id!,

      req.user?.role!

    );

    sendResponse(res, {

      success: true,

      statusCode: httpStatus.OK,

      message: "Gear item deleted successfully",

      data: null,

    });

  }

);
export const GearItemController = {

  createGearItem,

  getAllGearItems,

  getSingleGearItem,

  updateGearItem,

  deleteGearItem,

};