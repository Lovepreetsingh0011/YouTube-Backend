import { Router } from "express";
import { AuthMiddelware } from "../Middelware/Auth.Middelware.js";
import {
  AddLike,
  DisLike,
  GetLikedVideos,
  CheckIfVideoAlredyLiked,
} from "../Controler/Like.Controler.js";
const router = Router();

router.use(AuthMiddelware);
router.route("/AddLike").post(AddLike);
router.route("/DisLike/:id").post(DisLike);
router.route("/GetLikedVideos").post(GetLikedVideos);
router.route("/CheckIfVideoLiked").post(CheckIfVideoAlredyLiked);
export default router;
