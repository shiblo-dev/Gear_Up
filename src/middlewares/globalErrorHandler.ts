 import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
 import config from "../config";
import AppError from "../errors/AppError";
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message: string = err.message || "Internal Server Error";
  let errorSources: Array<{ path: string | number; message: string }> = [];

  // 1. AppError (Custom operational error)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // 2. Prisma Validation Error (Wrong types or missing fields)
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "You have provided incorrect field type or missing required fields";
  }
  // 3. Prisma Known Request Error
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.CONFLICT;
      const target = (err.meta?.target as string[])?.join(", ") || "field";
      message = `Duplicate entry: ${target} already exists!`;
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Foreign key constraint failed. Related record not found.";
    } else if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      message = "Requested record for operation was not found.";
    }
  }
  // 4. Prisma Connection/Initialization Error
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus.UNAUTHORIZED;
      message = "Database authentication failed. Check database credentials.";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus.SERVICE_UNAVAILABLE;
      message = "Database server is unreachable.";
    }
  }
  // 5. Prisma Unknown Request Error
  else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "An unknown error occurred during database query execution.";
  }

  // Final Structured JSON Response
  res.status(statusCode).json({
    success: false,
    message:err.stack || message,
  });
};