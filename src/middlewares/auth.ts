import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
 import config from "../config";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import AppError from "../errors/AppError"; // custom error class (যদি থাকে)
import { Role, UserStatus } from "../../generated/prisma/enums";

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Extract token from Cookie or Headers
    const token = req.cookies?.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : req.headers.authorization;

    if (!token) {
      throw new AppError(401, "You are not logged in. Please log in to access this resource.");
    }

    // 2. Verify token
    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret as string);

    if (!verifiedToken.success) {
      throw new AppError(401, verifiedToken.error || "Invalid or expired token.");
    }

    const { email, name, id, role } = verifiedToken.data as JwtPayload;

    // 3. Role Authorization check
    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(403, "Forbidden. You don't have permission to access this resource.");
    }

    // 4. DB Check (Fixed: only pass unique identifier to findUnique)
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(404, "User not found. Please log in again.");
    }

    // 5. User status check
    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError(403, "Your account has been SUSPENDED. Please contact support.");
    }

    // 6. Attach user to Request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  });
};