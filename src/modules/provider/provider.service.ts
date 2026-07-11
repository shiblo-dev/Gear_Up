import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { RentalStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const ALLOWED_TRANSITIONS: Record<string, RentalStatus[]> = {
  PLACED: [RentalStatus.CONFIRMED, RentalStatus.CANCELLED],
  PAID: [RentalStatus.PICKED_UP],
  PICKED_UP: [RentalStatus.RETURNED],
};

const createGearItem = async (providerId: string, payload: any) => {
  const { categoryId, ...rest } = payload;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  const result = await prisma.gearItem.create({
    data: {
      ...rest,
      provider: { connect: { id: providerId } },
      category: { connect: { id: categoryId } },
    },
  });

  return result;
};

const updateGearItem = async (
  id: string,
  providerId: string,
  role: string,
  payload: any
) => {
  const gearItem = await prisma.gearItem.findUnique({ where: { id } });

  if (!gearItem) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  if (gearItem.providerId !== providerId && role !== "ADMIN") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this gear item"
    );
  }

  const { categoryId, ...rest } = payload;

  const updateData: any = { ...rest };

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }

    updateData.category = { connect: { id: categoryId } };
  }

  const result = await prisma.gearItem.update({
    where: { id },
    data: updateData,
  });

  return result;
};

const deleteGearItem = async (
  id: string,
  providerId: string,
  role: string
) => {
  const gearItem = await prisma.gearItem.findUnique({ where: { id } });

  if (!gearItem) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear item not found");
  }

  if (gearItem.providerId !== providerId && role !== "ADMIN") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this gear item"
    );
  }

  const activeRental = await prisma.rentalOrderItem.findFirst({
    where: {
      gearItemId: id,
      rentalOrder: {
        status: {
          in: [RentalStatus.PLACED, RentalStatus.CONFIRMED, RentalStatus.PAID, RentalStatus.PICKED_UP],
        },
      },
    },
  });

  if (activeRental) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete gear item with active rentals"
    );
  }

  await prisma.gearItem.delete({ where: { id } });
};

const getProviderOrders = async (providerId: string) => {
  const orders = await prisma.rentalOrder.findMany({
    where: {
      items: {
        some: {
          gearItem: {
            providerId,
          },
        },
      },
    },
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
      items: {
        where: {
          gearItem: { providerId },
        },
        include: {
          gearItem: true,
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders;
};

const updateOrderStatus = async (
  orderId: string,
  providerId: string,
  newStatus: RentalStatus
) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { gearItem: true },
      },
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const isOwnedByProvider = order.items.some(
    (item) => item.gearItem.providerId === providerId
  );

  if (!isOwnedByProvider) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this order"
    );
  }

  const allowedNextStatuses = ALLOWED_TRANSITIONS[order.status];

  if (!allowedNextStatuses || !allowedNextStatuses.includes(newStatus)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot change status from ${order.status} to ${newStatus}`
    );
  }

  const updatedOrder = await prisma.rentalOrder.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  return updatedOrder;
};

export const providerService = {
  createGearItem,
  updateGearItem,
  deleteGearItem,
  getProviderOrders,
  updateOrderStatus,
};