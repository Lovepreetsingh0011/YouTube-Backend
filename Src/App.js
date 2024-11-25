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

export { app };
