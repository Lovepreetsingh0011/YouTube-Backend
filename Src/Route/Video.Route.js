import { Router } from "express";
import { AuthMiddelware } from "../Middelware/Auth.Middelware.js";
import { Upload } from "../Middelware/Multer.js";
import {
  DeleteVideo,
  UpdateDetails,
  UploadVideo,
} from "../Controler/Video.Controler.js";
const router = Router();

router
  .route("/VideoUpload")
  .post(
    AuthMiddelware,
    Upload.fields([{ name: "VideoFile" }, { name: "ThumbNail" }]),
    UploadVideo
  );
router.route("/UpdateDetails/:id").put(AuthMiddelware, UpdateDetails);
router.route("/DeleteVideo/:id").get(AuthMiddelware, DeleteVideo);
export default router;
