import { z } from 'zod';

const createRentalOrderValidationSchema = z.object({
  body: z
    .object({
      gearItemId: z.string().min(1, 'GearItem ID is required'),
      startDate: z
        .string()
        .min(1, 'Start date is required')
        .datetime({ message: 'Invalid date format' }),
      endDate: z
        .string()
        .min(1, 'End date is required')
        .datetime({ message: 'Invalid date format' }),
    })
    .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
      message: 'End date must be after start date',
      path: ['endDate'],
    }),
});

export const rentalOrderValidation = {
  createRentalOrderValidationSchema,
};