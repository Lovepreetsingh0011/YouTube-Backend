import { Router } from "express";
import {
  Login,
  LoginEndPoint,
  LogOut,
  Register,
} from "../Controler/User.Controler.js";
import { Upload } from "../Middelware/Multer.js";
import { AuthMiddelware } from "../Middelware/Auth.Middelware.js";
const router = Router();

router.route("/Register").post(
  Upload.fields([
    { name: "Avatar", maxCount: 1 },
    { name: "CoverImage", maxCount: 1 },
  ]),
  Register
);

router.route("/Login").post(Login);
router.route("/LogOut").get(AuthMiddelware, LogOut);
router.route("/ReLogin").get(LoginEndPoint);

export default router;
