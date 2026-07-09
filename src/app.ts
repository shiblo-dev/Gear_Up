import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config";

// Middlewares
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

// Routes
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.route";
import { categoryRoutes } from "./modules/category/category.route";
import { GearItemRoutes } from "./modules/gearitem/gearitems.route";
import { rentalOrderRoutes } from "./modules/rentalOrder/rentalOrder.route";
 import { PaymentController } from "./modules/payment/payment.controller";
import { paymentRoutes } from "./modules/payment/payment.route";
import { ReviewRoutes } from "./modules/reviews/review.route";

const app: Application = express();

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhook
);

app.use(
  cors({
    origin: [config.app_url as string, "http://localhost:3000"], // local & prod URL support
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "GearUp Rental API is running smoothly Server! 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/gear", GearItemRoutes);
app.use("/api/rentals", rentalOrderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use(notFound);
app.use(globalErrorHandler);

export default app;