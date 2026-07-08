import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { rentalOrderServices } from './rentalOrder.service';

const createRentalOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user?.id;
    const result = await rentalOrderServices.createRentalOrderIntoDB(customerId as string, req.body);

    res.status(httpStatus.CREATED).json({
      success: true,
      message: 'Rental order placed successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getMyRentalOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user?.id! as string;
    const result = await rentalOrderServices.getMyRentalOrdersFromDB(customerId);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Rental orders retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getSingleRentalOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const customerId = req.user?.id as string;
    const result = await rentalOrderServices.getSingleRentalOrderFromDB(id as string, customerId );

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Rental order retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const rentalOrderControllers = {
  createRentalOrder,
  getMyRentalOrders,
  getSingleRentalOrder,
};