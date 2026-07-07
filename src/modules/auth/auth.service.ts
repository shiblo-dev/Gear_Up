import { ILoginUser } from "./auth.interface";

const loginUser = async (payload : ILoginUser) => {
    const { email, password } = payload;


}

export const authService = {
    loginUser,

}