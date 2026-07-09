import httpStatus from "http-status";
 import AppError from "../../errors/AppError";
import { RentalStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

// Provider role হিসেবে যেসব status transition allowed
const ALLOWED_TRANSITIONS: Record<string, RentalStatus[]> = {
  PLACED: [RentalStatus.CONFIRMED, RentalStatus.CANCELLED],
  PAID: [RentalStatus.PICKED_UP],
  PICKED_UP: [RentalStatus.RETURNED],
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
  getProviderOrders,
  updateOrderStatus,
};