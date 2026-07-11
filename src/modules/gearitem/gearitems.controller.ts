import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { gearItemService } from "./gearitems.service";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";




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

export const GearItemController = {
 

  getAllGearItems,

  getSingleGearItem,



};