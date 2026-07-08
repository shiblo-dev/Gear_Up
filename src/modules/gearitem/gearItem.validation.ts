 import { z } from "zod";

const createGearItemValidation = z.object({

  body: z.object({

    name: z
      .string()
      .min(2, "Name is required"),

    description: z
      .string()
      .min(10),

    brand: z
      .string()
      .optional(),

    pricePerDay: z.coerce.number().positive(),

    stockQuantity: z.coerce.number().int().positive(),

    categoryId: z.string(),

  }),

});

const updateGearItemValidation = z.object({

  body: z.object({

    name: z.string().optional(),

    description: z.string().optional(),

    brand: z.string().optional(),

    pricePerDay: z.coerce.number().positive().optional(),

    stockQuantity: z.coerce.number().int().positive().optional(),

    categoryId: z.string().optional(),

    isAvailable: z.boolean().optional(),

  }),

});

export const GearItemValidation = {

  createGearItemValidation,

  updateGearItemValidation,

};