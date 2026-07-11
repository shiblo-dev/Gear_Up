import {
  GearFilterRequest,
  PaginationOptions,
} from "./gearItem.interface";
import httpStatus from "http-status";
import { GearSearchableFields } from "./gearItem.constant";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";



const getAllGearItems = async (
  filters: GearFilterRequest,
  options: PaginationOptions
) => {
  const { searchTerm, minPrice, maxPrice, ...filterData } = filters;

  const andConditions: Prisma.GearItemWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: GearSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push({
      AND: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }

  if (minPrice || maxPrice) {
    andConditions.push({
      pricePerDay: {
        gte: minPrice ? Number(minPrice) : undefined,
        lte: maxPrice ? Number(maxPrice) : undefined,
      },
    });
  }

  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || "desc";

  const whereCondition: Prisma.GearItemWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.gearItem.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      category: true,
      provider: { select: { id: true, name: true } },
    },
  });

  const total = await prisma.gearItem.count({ where: whereCondition });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getSingleGearItem = async (id: string) => {
  const result = await prisma.gearItem.findUnique({
    where: { id },
    include: {
      category: true,
      provider: { select: { id: true, name: true, email: true } },
      reviews: true,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  return result;
};
export const gearItemService = {
  
  getAllGearItems,
  getSingleGearItem,

};