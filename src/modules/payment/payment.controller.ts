import { Request, Response } from "express";
import httpStatus from "http-status";
import Stripe from "stripe";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

import AppError from "../../errors/AppError";
import { paymentService } from "./payment.service";
import stripe from "../../lib/stripe";
import config from "../../config";

const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const { rentalOrderId } = req.body;

  const result = await paymentService.createPaymentSession(rentalOrderId, req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Payment session created successfully",
    data: result,
  });
});

// Stripe webhook — raw body লাগবে, এটা normal JSON route না
const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
     event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe_webhook_secret
    );
  } catch (err) {
    throw new AppError(httpStatus.BAD_REQUEST, "Webhook signature verification failed");
  }

  await paymentService.handleWebhookEvent(event);

  res.status(httpStatus.OK).json({ received: true });
});

const getUserPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getUserPayments(req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payments retrieved successfully",
    data: result,
  });
});

const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await paymentService.getPaymentById(id, req.user!.id, req.user!.role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment details retrieved successfully",
    data: result,
  });
});

export const PaymentController = {
  createPaymentSession,
  handleStripeWebhook,
  getUserPayments,
  getPaymentDetails,
};