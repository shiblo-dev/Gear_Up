import { z } from "zod";
import { RentalStatus } from "../../../generated/prisma/enums";

const updateOrderStatusValidation = z.object({
  body: z.object({
    status: z.enum(RentalStatus, {
      message: "Invalid status value",
    }),
  }),
});

export const ProviderValidation = {
  updateOrderStatusValidation,
};