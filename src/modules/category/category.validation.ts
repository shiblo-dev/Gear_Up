import { z } from "zod";

const createCategorySchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(1, "Category name is required")
            .max(100, "Category name cannot exceed 100 characters")
            .trim(),
    }),
});

const updateCategorySchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(1, "Category name is required")
            .max(100, "Category name cannot exceed 100 characters")
            .trim()
            .optional(),
    }),
});

export const categoryValidation = {
    createCategorySchema,
    updateCategorySchema,
};