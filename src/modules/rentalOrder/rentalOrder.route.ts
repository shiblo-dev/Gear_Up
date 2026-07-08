import { Router } from 'express';

import validateRequest from '../../middlewares/validateRequest';
import { rentalOrderControllers } from './rentalOrder.controller';
import { auth } from '../../middlewares/auth';
import { rentalOrderValidation } from './rentalOrder.validation';

const router = Router();

router.post(
  '/',
  auth('CUSTOMER'),
  validateRequest(rentalOrderValidation.createRentalOrderValidationSchema),
  rentalOrderControllers.createRentalOrder,
);

router.get('/', auth('CUSTOMER'), rentalOrderControllers.getMyRentalOrders);

router.get('/:id', auth('CUSTOMER'), rentalOrderControllers.getSingleRentalOrder);

export const rentalOrderRoutes = router;