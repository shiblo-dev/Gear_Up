import { z } from "zod";
import { Role } from "../../../generated/prisma/enums";

const registerUserValidationSchema = z.object({
    body: z.object({
        name: z.string({ error: "Name is required" }).min(1, "Name cannot be empty"),
        email: z.email({ error: "Valid email is required" }),
        password: z.string({ error: "Password is required" }).min(6, "Password must be at least 6 characters"),
        role: z.enum([Role.CUSTOMER, Role.PROVIDER], {
            error: "Role must be either CUSTOMER or PROVIDER"
        })
    })
});

const loginUserValidationSchema = z.object({
    body: z.object({
        email: z.email({ error: "Valid email is required" }),
        password: z.string({ error: "Password is required" }).min(1, "Password cannot be empty")
    })
});

export const authValidation = {
    registerUserValidationSchema,
    loginUserValidationSchema
};