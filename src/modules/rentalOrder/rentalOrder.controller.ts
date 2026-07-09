 import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { rentalOrderServices } from './rentalOrder.service';

const createRentalOrder = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id as string;
  const result = await rentalOrderServices.createRentalOrderIntoDB(customerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Rental order placed successfully',
    data: result,
  });
});

const getMyRentalOrders = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id as string;
  const result = await rentalOrderServices.getMyRentalOrdersFromDB(customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Rental orders retrieved successfully',
    data: result,
  });
});

const getSingleRentalOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const customerId = req.user?.id as string;
  const result = await rentalOrderServices.getSingleRentalOrderFromDB(id as string, customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Rental order retrieved successfully',
    data: result,
  });
});


export const rentalOrderControllers = {
  createRentalOrder,
  getMyRentalOrders,
  getSingleRentalOrder,
 
};