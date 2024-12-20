import { Router } from "express";
import { AuthMiddelware } from "../Middelware/Auth.Middelware.js";
import { Upload } from "../Middelware/Multer.js";
import {
  AddViewsOfVideo,
  DeleteVideo,
  GetAllVideos,
  GetVideosById,
  GetVideoWithDetails,
  UpdateDetails,
  UploadVideo,
  GetUserVideos,
} from "../Controler/Video.Controler.js";
const router = Router();
router.use(AuthMiddelware);
router
  .route("/VideoUpload")
  .post(
    Upload.fields([{ name: "VideoFile" }, { name: "ThumbNail" }]),
    UploadVideo
  );
router.route("/UpdateDetails/:id").put(UpdateDetails);
router.route("/DeleteVideo/:id").get(DeleteVideo);
router.route("/GetAllVideos").get(GetAllVideos);
router.route("/GetVideoById/:id").get(GetVideosById);
router.route("/GetVideoDetails/:Videoid").get(GetVideoWithDetails);
router.route("/AddView/:Videoid").get(AddViewsOfVideo);
router.route("/GetUserVideos").get(GetUserVideos);

export default router;
