 import { z } from 'zod';

const createRentalOrderValidationSchema = z.object({
  body: z
    .object({
      startDate: z
        .string()
        .min(1, 'Start date is required')
        .datetime({ message: 'Invalid date format' }),
      endDate: z
        .string()
        .min(1, 'End date is required')
        .datetime({ message: 'Invalid date format' }),
      items: z
        .array(
          z.object({
            gearItemId: z.string().min(1, 'GearItem ID is required'),
            quantity: z.number().int().positive('Quantity must be at least 1'),
          }),
        )
        .min(1, 'At least one gear item is required'),
    })
    .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
      message: 'End date must be after start date',
      path: ['endDate'],
    }),
});

export const rentalOrderValidation = {
  createRentalOrderValidationSchema,
};