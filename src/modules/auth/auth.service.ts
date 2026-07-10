 import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { JwtPayload, SignOptions } from "jsonwebtoken";

import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { ILoginUser, RegisterUserPayload } from "./auth.interface";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import config from "../../config";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
    const { name, email, role, password } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: { email }
    });

    if (isUserExist) {
        throw new AppError(httpStatus.CONFLICT, "User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            role: role.toUpperCase() as Role,
            password: hashedPassword
        }
    });

    const user = await prisma.user.findUnique({
        where: { id: createdUser.id },
        omit: { password: true }
    });

    return user;
};

const loginUser = async (payload: ILoginUser) => {
    const { email, password } = payload;

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "No user found with this email");
    }

    if (user.status === UserStatus.SUSPENDED) {
        throw new AppError(httpStatus.FORBIDDEN, "Your account has been SUSPENDED. Please contact support.");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Password is incorrect");
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions["expiresIn"]
    );
    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions["expiresIn"]
    );

    return {
        accessToken,
        refreshToken
    };
};

const getMyProfileFromDB = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        omit: { password: true }
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return user;
};

const refreshToken = async (token: string) => {
    if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, "No refresh token provided");
    }

    const verifiedRefreshToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret);

    if (!verifiedRefreshToken.success) {
        throw new AppError(httpStatus.UNAUTHORIZED, verifiedRefreshToken.error);
    }

    const { id } = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUnique({
        where: { id }
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.status === UserStatus.SUSPENDED) {
        throw new AppError(httpStatus.FORBIDDEN, "Your account has been SUSPENDED. Please contact support.");
    }

    const jwtPayload = {
        id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions["expiresIn"]
    );

    return { accessToken };
};

export const authService = {
    registerUserIntoDB,
    loginUser,
    getMyProfileFromDB,
    refreshToken
};