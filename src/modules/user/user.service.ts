import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { RegisterUserPayload } from "./user.interface";
import { Role } from "../../../generated/prisma/enums";

const registerUserIntoDB = async (payload: RegisterUserPayload) =>{
    const { name, email,role, password } = payload;
    const isUserExist = await prisma.user.findUnique({
        where: { email }
    })
    if (isUserExist) {
        throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds))

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            role: payload.role.toUpperCase() as Role,
            password: hashedPassword,

        }
    });

    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: createdUser.email || email,
            role: payload.role.toUpperCase() as Role,
        },
        omit: {
            password: true
        }
    })

    return user;
}


export const userService = {
    registerUserIntoDB,
}