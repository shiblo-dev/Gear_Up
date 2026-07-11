 import httpStatus from "http-status";
import Stripe from "stripe";
 import AppError from "../../errors/AppError";
import { RentalStatus, PaymentStatus,Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import stripe from "../../lib/stripe";

const createPaymentSession = async (rentalOrderId: string, customerId: string) => {
  // 1. Order খুঁজে বের করো এবং validate করো
  const order = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
    include: { payment: true },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  if (order.customerId !== customerId) {
    throw new AppError(httpStatus.FORBIDDEN, "This is not your order");
  }

  if (order.status !== RentalStatus.CONFIRMED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Order must be CONFIRMED before payment. Current status: ${order.status}`
    );
  }

  if (order.payment) {
    if (
      order.payment.status === PaymentStatus.COMPLETED ||
      order.payment.status === PaymentStatus.PENDING
    ) {
      throw new AppError(httpStatus.BAD_REQUEST, "Payment already exists for this order");
    }

    // Previous attempt FAILED (e.g. session expired or card declined) — clear it
    // so the customer can retry. One-to-one relation means we must delete first.
    await prisma.payment.delete({ where: { id: order.payment.id } });
  }


  const amountInCents = Math.round(Number(order.totalAmount) * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Rental Order #${order.id}` },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    metadata: {
      rentalOrderId: order.id,
      customerId,
    },
  });

  // 3. Payment record তৈরি করো PENDING status এ
  const payment = await prisma.payment.create({
    data: {
      transactionId: session.id,
      amount: order.totalAmount,
      status: PaymentStatus.PENDING,
      rentalOrderId: order.id,
    },
  });

  return { checkoutUrl: session.url, payment };
};

const handleWebhookEvent = async (event: Stripe.Event) => {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const rentalOrderId = session.metadata?.rentalOrderId;

    if (!rentalOrderId) return;

    await prisma.$transaction([
      prisma.payment.update({
        where: { transactionId: session.id },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
        },
      }),
      prisma.rentalOrder.update({
        where: { id: rentalOrderId },
        data: { status: RentalStatus.PAID },
      }),
    ]);
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;

    await prisma.payment.update({
      where: { transactionId: session.id },
      data: { status: PaymentStatus.FAILED },
    });
  }
};

const getUserPayments = async (customerId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      rentalOrder: { customerId },
    },
    include: {
      rentalOrder: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return payments;
};

const getPaymentById = async (paymentId: string, customerId: string, role: Role) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { rentalOrder: true },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

 if (role !== Role.ADMIN && payment.rentalOrder.customerId !== customerId) {

  return payment;
}};

export const paymentService = {
  createPaymentSession,
  handleWebhookEvent,
  getUserPayments,
  getPaymentById,
};