import { z } from "zod";

const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "SUSPENDED"], {
      message: "Status must be either ACTIVE or SUSPENDED",
    }),
  }),
});

export const AdminValidation = {
  updateUserStatusSchema,
};