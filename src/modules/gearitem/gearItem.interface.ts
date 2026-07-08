import { Prisma } from "../../../generated/prisma/client";


export type GearFilterRequest = {
  searchTerm?: string;
  categoryId?: string;
  brand?: string;
  isAvailable?: boolean;
  minPrice?: string;
  maxPrice?: string;
};

export type PaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type GearWhereCondition = Prisma.GearItemWhereInput;