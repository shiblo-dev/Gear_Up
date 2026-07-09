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

  if (!items || items.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'At least one gear item is required to place a rental order');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid startDate or endDate');
  }

  if (end <= start) {
    throw new AppError(httpStatus.BAD_REQUEST, 'endDate must be after startDate');
  }

  // number of rental days (minimum 1)
  const rentalDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );

  // merge duplicate gearItemId entries so stock/availability is checked against the true total quantity
  const mergedItemsMap = new Map<string, number>();
  for (const item of items) {
    mergedItemsMap.set(
      item.gearItemId,
      (mergedItemsMap.get(item.gearItemId) ?? 0) + item.quantity,
    );
  }
  const mergedItems: TRentalOrderItemInput[] = Array.from(mergedItemsMap.entries()).map(
    ([gearItemId, quantity]) => ({ gearItemId, quantity }),
  );

  // fetch all gear items involved in a single query
  const gearItemIds = mergedItems.map((item) => item.gearItemId);

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
  const orderItemsData = mergedItems.map((item) => {
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

    // decrement stock for each gear item (merged quantities)
    for (const item of mergedItems) {
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