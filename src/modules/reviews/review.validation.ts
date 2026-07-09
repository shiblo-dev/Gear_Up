import { z } from "zod";

const createReviewSchema = z.object({
  body: z.object({
    gearItemId: z.string().min(1, "Gear item ID is required"),
    rating: z
      .number()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
    comment: z.string().optional(),
  }),
});

export const ReviewValidation = {
  createReviewSchema,
};