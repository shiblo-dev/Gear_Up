import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";

const loginUser = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const payload = req.body;
 const result = await authService.loginUser(payload)
});
export const authController = {
    loginUser,

}