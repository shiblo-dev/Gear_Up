 import { Request, Response } from "express";
import httpStatus from "http-status";

export const notFound = (req: Request, res: Response): void => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    statusCode: httpStatus.NOT_FOUND,
    message: "API Route Not Found!",
    errorDetails: {
      path: req.originalUrl,
      method: req.method,
      dateTime: new Date().toISOString(),
    },
  });
};