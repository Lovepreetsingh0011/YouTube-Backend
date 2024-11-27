import { Router } from "express";
import { AuthMiddelware } from "../Middelware/Auth.Middelware.js";
import {
  AddComment,
  DeleteComment,
  GetAllComments,
} from "../Controler/Comment.Controler.js";
const router = Router();
router.use(AuthMiddelware);
router.route("/AddComment").post(AddComment);
router.route("/DeleteComment/:Commentid").post(DeleteComment);
router.route("/GetAllComments/:id").get(GetAllComments);

export default router;
