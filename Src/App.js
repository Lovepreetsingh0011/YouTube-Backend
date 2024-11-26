import express from "express";
import cors from "cors";
import { URl1, URL2 } from "./Constants.js";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [URl1, URL2],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("Public"));

// Routes
import userroute from "./Route/User.Route.js";
import videoroute from "./Route/Video.Route.js";
import subscriptionroute from "./Route/Subscription.Route.js";

app.use("/api/v1/Users", userroute);
app.use("/api/v1/Videos", videoroute);
app.use("/api/v1/Subscriptions", subscriptionroute);

export { app };
