import { Router } from "express";
import {
  GetChanelProfile,
  GetHistory,
  Login,
  LoginEndPoint,
  LogOut,
  AddWatchHistory,
  Register,
  UpdateAvatar,
  UpdateCoverImage,
  UpdateDetails,
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
router.route("/UpdateDetails").post(AuthMiddelware, UpdateDetails);
router
  .route("/UpdateAvatar")
  .post(Upload.single("Avatar"), AuthMiddelware, UpdateAvatar);
router
  .route("/UpdateCoverImage")
  .post(Upload.single("CoverImage"), AuthMiddelware, UpdateCoverImage);

router
  .route("/GetChanelProfile/:UserName")
  .get(AuthMiddelware, GetChanelProfile);
router.route("/GetHistory").get(AuthMiddelware, GetHistory);
router.route("/AddWatchHistory/:id").get(AuthMiddelware, AddWatchHistory);
export default router;
