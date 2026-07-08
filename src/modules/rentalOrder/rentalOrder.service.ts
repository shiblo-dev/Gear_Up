import httpStatus from 'http-status';

import { TCreateRentalOrder } from './rentalOrder.interface';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';

const createRentalOrderIntoDB = async (
  customerId: string,
  payload: TCreateRentalOrder,
) => {
  const gearItem = await prisma.gearItem.findUnique({
    where: { id: payload.gearItemId },
  });

  if (!gearItem) {
    throw new AppError(httpStatus.NOT_FOUND, 'GearItem not found');
  }

  if (!gearItem.isAvailable) {
    throw new AppError(httpStatus.BAD_REQUEST, 'GearItem is not available for rent');
  }

  const overlappingOrder = await prisma.rentalOrder.findFirst({
    where: {
      gearItemId: payload.gearItemId,
      status: { in: ['PLACED', 'CONFIRMED', 'PAID', 'PICKED_UP'] },
      startDate: { lte: new Date(payload.endDate) },
      endDate: { gte: new Date(payload.startDate) },
    },
  });

  if (overlappingOrder) {
    throw new AppError(
      httpStatus.CONFLICT,
      'GearItem is already booked for the selected date range',
    );
  }

  const days = Math.ceil(
    (new Date(payload.endDate).getTime() - new Date(payload.startDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const totalPrice = days * Number(gearItem.pricePerDay);;

  const result = await prisma.rentalOrder.create({
    data: {
      customerId,
      gearItemId  : payload.gearItemId ,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      totalPrice,
      status: 'PLACED',
    },
    include: {
      gearItem: true,
    },
  });

  return result;
};

const getMyRentalOrdersFromDB = async (customerId: string) => {
  const result = await prisma.rentalOrder.findMany({
    where: { customerId },
    include: { gearItem: true },
    orderBy: { createdAt: 'desc' },
  });

  return result;
};

const getSingleRentalOrderFromDB = async (id: string, customerId: string) => {
  const result = await prisma.rentalOrder.findUnique({
    where: { id },
    include: { gearItem: true },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rental order not found');
  }

  if (result.customerId !== customerId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not allowed to view this order');
  }

  return result;
};

export const rentalOrderServices = {
  createRentalOrderIntoDB,
  getMyRentalOrdersFromDB,
  getSingleRentalOrderFromDB,
};