 import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

// 1. Create Token
const createToken = (
  payload: Record<string, unknown>,  
  secret: string,
  expiresIn: SignOptions["expiresIn"]
): string => {
  return jwt.sign(payload, secret, {
    expiresIn,
  } as SignOptions);
};

// 2. Verify Token
const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret) as JwtPayload;
    return {
      success: true,
      data: verifiedToken,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Invalid or Expired Token",
    };
  }
};

export const jwtUtils = {
  createToken,
  verifyToken,
};