 import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { RentalStatus } from '../../../generated/prisma/enums';
import { Prisma } from '../../../generated/prisma/client';


type TRentalOrderItemInput = {
  gearItemId: string;
  quantity: number;
};

type TCreateRentalOrderInput = {
  startDate: string;
  endDate: string;
  items: TRentalOrderItemInput[];
};

const createRentalOrderIntoDB = async (customerId: string, payload: TCreateRentalOrderInput) => {
  const { startDate, endDate, items } = payload;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // number of rental days (minimum 1)
  const rentalDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );

  // fetch all gear items involved in a single query
  const gearItemIds = items.map((item) => item.gearItemId);

  const gearItems = await prisma.gearItem.findMany({
    where: { id: { in: gearItemIds } },
  });

  if (gearItems.length !== gearItemIds.length) {
    throw new AppError(httpStatus.NOT_FOUND, 'One or more gear items were not found');
  }

  // check each gear item isn't already booked for an overlapping date range
  const activeStatuses: RentalStatus[] = [
    RentalStatus.PLACED,
    RentalStatus.CONFIRMED,
    RentalStatus.PAID,
    RentalStatus.PICKED_UP,
  ];

  for (const gearItemId of gearItemIds) {
    const overlappingItem = await prisma.rentalOrderItem.findFirst({
      where: {
        gearItemId,
        rentalOrder: {
          status: { in: activeStatuses },
          startDate: { lte: end },
          endDate: { gte: start },
        },
      },
      include: { gearItem: true },
    });

    if (overlappingItem) {
      throw new AppError(
        httpStatus.CONFLICT,
        `${overlappingItem.gearItem.name} is already booked for the selected date range`,
      );
    }
  }

  // validate availability + stock, and build order items with calculated subtotal
  const orderItemsData = items.map((item) => {
    const gearItem = gearItems.find((g) => g.id === item.gearItemId);

    if (!gearItem) {
      throw new AppError(httpStatus.NOT_FOUND, `Gear item ${item.gearItemId} not found`);
    }

    if (!gearItem.isAvailable) {
      throw new AppError(httpStatus.BAD_REQUEST, `${gearItem.name} is not currently available`);
    }

    if (gearItem.stockQuantity < item.quantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `${gearItem.name} does not have enough stock. Available: ${gearItem.stockQuantity}`,
      );
    }

    const pricePerDay = Number(gearItem.pricePerDay);
    const subtotal = pricePerDay * item.quantity * rentalDays;

    return {
      gearItemId: gearItem.id,
      quantity: item.quantity,
      pricePerDay: gearItem.pricePerDay,
      subtotal: new Prisma.Decimal(subtotal),
    };
  });

  const totalAmount = orderItemsData.reduce(
    (sum, item) => sum + Number(item.subtotal),
    0,
  );

  // create rental order + nested items in a single transaction
  const result = await prisma.$transaction(async (tx) => {
    const rentalOrder = await tx.rentalOrder.create({
      data: {
        customerId,
        startDate: start,
        endDate: end,
        totalAmount: new Prisma.Decimal(totalAmount),
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            gearItem: true,
          },
        },
      },
    });

    // decrement stock for each gear item
    for (const item of items) {
      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    return rentalOrder;
  });

  return result;
};

const getMyRentalOrdersFromDB = async (customerId: string) => {
  const result = await prisma.rentalOrder.findMany({
    where: { customerId },
    include: {
      items: {
        include: {
          gearItem: true,
        },
      },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return result;
};

const getSingleRentalOrderFromDB = async (id: string, customerId: string) => {
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          gearItem: true,
        },
      },
      payment: true,
    },
  });

  if (!rentalOrder) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rental order not found');
  }

  if (rentalOrder.customerId !== customerId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to view this rental order');
  }

  return rentalOrder;
};

export const rentalOrderServices = {
  createRentalOrderIntoDB,
  getMyRentalOrdersFromDB,
  getSingleRentalOrderFromDB,
};