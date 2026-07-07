
export interface RegisterUserPayload {
    name: string;
    email: string;
    role: string;
    password: string;
}
export interface ILoginUser {
    email: string;
    password: string;
}