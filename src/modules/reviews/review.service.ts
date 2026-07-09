
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";

type CreateReviewPayload = {
  gearItemId: string;
  rating: number;
  comment?: string;
};

const createReview = async (customerId: string, payload: CreateReviewPayload) => {
  const { gearItemId, rating, comment } = payload;

  // 1. Check gear item exists
  const gearItem = await prisma.gearItem.findUnique({
    where: { id: gearItemId },
  });

  if (!gearItem) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  // 2. Customer must have a RETURNED rental order containing this gear item
  const returnedRental = await prisma.rentalOrder.findFirst({
    where: {
      customerId,
      status: "RETURNED",
      items: {
        some: { gearItemId },
      },
    },
  });

  if (!returnedRental) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can only review gear items you have rented and returned"
    );
  }

  // 3. Prevent duplicate review by the same customer for the same gear item
  const existingReview = await prisma.review.findFirst({
    where: { customerId, gearItemId },
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already reviewed this gear item"
    );
  }

  // 4. Create the review
  const result = await prisma.review.create({
    data: {
      customerId,
      gearItemId,
      rating,
      comment,
    },
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
      gearItem: true,
    },
  });

  return result;
};

const getReviewsByGearItem = async (gearItemId: string) => {
  const gearItem = await prisma.gearItem.findUnique({
    where: { id: gearItemId },
  });

  if (!gearItem) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  const result = await prisma.review.findMany({
    where: { gearItemId },
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

export const ReviewService = {
  createReview,
  getReviewsByGearItem,
};