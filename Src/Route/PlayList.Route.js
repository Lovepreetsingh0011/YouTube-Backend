import { Router } from "express";
import { AuthMiddelware } from "../Middelware/Auth.Middelware.js";
import {
  AddVideosInPlayList,
  CreatePlayList,
  DeletePlayList,
  RemoveVideoFromPlaylist,
  GetUserPlayLists,
  GetUserPlayListById,
} from "../Controler/PlayList.Controler.js";
const router = Router();

router.use(AuthMiddelware);

router.route("/AddPlaylist").post(CreatePlayList);
router.route("/AddVideosInPlaylist/:PlayListId").post(AddVideosInPlayList);
router.route("/RemoveVideos/:PlayListId").post(RemoveVideoFromPlaylist);
router.route("/DeletePlayList/:PlayListid").post(DeletePlayList);
router.route("/GetUserPlayLists").post(GetUserPlayLists);
router.route("/GetPlayListById/:id").get(GetUserPlayListById);
export default router;
