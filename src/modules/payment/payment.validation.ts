import { z } from "zod";

const createPaymentValidation = z.object({
  body: z.object({
    rentalOrderId: z.string().min(1, "Rental order ID is required"),
  }),
});

export const PaymentValidation = {
  createPaymentValidation,
};