import express,{ Application, Request, Response } from "express";
import config from "./config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.route";
import { categoryRoutes } from "./modules/category/category.route";
import { GearItemRoutes } from "./modules/gearitem/gearitems.route";
import { rentalOrderRoutes } from "./modules/rentalOrder/rentalOrder.route";
const app : Application = express();

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))


app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());


app.get("/",(req : Request, res : Response) => {
    res.send("Hello, World!");
});
app.use("/api/users",userRoutes);
app.use("/api/auth",authRoutes);
app.use(
    "/api/categories",
    categoryRoutes
);
app.use("/api/gear", GearItemRoutes);
app.use("/api/rentals", rentalOrderRoutes);




 app.use(notFound)
app.use(globalErrorHandler)

export default app;