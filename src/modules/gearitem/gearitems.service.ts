
import {
  GearFilterRequest,
  PaginationOptions,
} from "./gearItem.interface";
import httpStatus from "http-status";

import {
  GearSearchableFields,
} from "./gearItem.constant";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";

const createGearItem = async (
  providerId: string,
  payload: Prisma.GearItemCreateInput
) => {

  const category = await prisma.category.findUnique({
    where: {
      id: payload.category.connect?.id,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const result = await prisma.gearItem.create({
    data: {
      name: payload.name,
      description: payload.description,
      brand: payload.brand,
      pricePerDay: payload.pricePerDay,
      stockQuantity: payload.stockQuantity,
      provider: {
        connect: {
          id: providerId,
        },
      },
      category: payload.category,
    },

    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return result;
}
const getAllGearItems = async (
  filters: GearFilterRequest,
  options: PaginationOptions
) => {

  const {
    searchTerm,
    minPrice,
    maxPrice,
    ...filterData
  } = filters;

  const andConditions: Prisma.GearItemWhereInput[] = [];

  /**
   * Search
   */

  if (searchTerm) {

    andConditions.push({

      OR: GearSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),

    });

  }

  /**
   * Filter
   */

  if (Object.keys(filterData).length) {

    andConditions.push({

      AND: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),

    });

  }

  /**
   * Price Range
   */

  if (minPrice || maxPrice) {

    andConditions.push({

      pricePerDay: {

        gte: minPrice ? Number(minPrice) : undefined,

        lte: maxPrice ? Number(maxPrice) : undefined,

      },

    });

  }

  /**
   * Pagination
   */

  const page = Number(options.page) || 1;

  const limit = Number(options.limit) || 10;

  const skip = (page - 1) * limit;

  /**
   * Sorting
   */

  const sortBy = options.sortBy || "createdAt";

  const sortOrder = options.sortOrder || "desc";

  const whereCondition: Prisma.GearItemWhereInput =

    andConditions.length > 0
      ? { AND: andConditions }
      : {};

  const result = await prisma.gearItem.findMany({

    where: whereCondition,

    skip,

    take: limit,

    orderBy: {
      [sortBy]: sortOrder,
    },

    include: {

      category: true,

      provider: {

        select: {
          id: true,
          name: true,
        },

      },

    },

  });

  const total = await prisma.gearItem.count({

    where: whereCondition,

  });

  return {

    meta: {

      page,

      limit,

      total,

    },

    data: result,

  };

};
const getSingleGearItem = async (id: string) => {

  const result = await prisma.gearItem.findUnique({

    where: {
      id,
    },

    include: {

      category: true,

      provider: {

        select: {
          id: true,
          name: true,
          email: true,
        },

      },

      reviews: true,

    },

  });

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Gear item not found"
    );
  }

  return result;
};
const updateGearItem = async (
  id: string,
  providerId: string,
  role: string,
  payload: Prisma.GearItemUpdateInput
) => {

  const gear = await prisma.gearItem.findUnique({

    where: {
      id,
    },

  });

  if (!gear) {

    throw new AppError(
      httpStatus.NOT_FOUND,
      "Gear item not found"
    );

  }

  /**
   * Provider can update only own gear
   */

  if (
    role !== "ADMIN" &&
    gear.providerId !== providerId
  ) {

    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this gear."
    );

  }

  const result = await prisma.gearItem.update({

    where: {
      id,
    },

    data: payload,

    include: {

      category: true,

      provider: true,

    },

  });

  return result;
};
const deleteGearItem = async (
  id: string,
  providerId: string,
  role: string
) => {

  const gear = await prisma.gearItem.findUnique({

    where: {
      id,
    },

  });

  if (!gear) {

    throw new AppError(
      httpStatus.NOT_FOUND,
      "Gear item not found"
    );

  }

  /**
   * Ownership Check
   */

  if (
    role !== "ADMIN" &&
    gear.providerId !== providerId
  ) {

    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this gear."
    );

  }

  await prisma.gearItem.delete({

    where: {
      id,
    },

  });

  return null;
};

export const gearItemService = {
  createGearItem,
  getAllGearItems,
  getSingleGearItem,
  updateGearItem,
  deleteGearItem,
};
 