import { Router } from "express";
import { AuthMiddelware } from "../Middelware/Auth.Middelware.js";
import {
  Subcribe,
  SubscribersOrSubscribeTo,
  UnSubscribe,
  CheckIsSubcribe,
} from "../Controler/SubsCription.Controler.js";
const router = Router();

router.use(AuthMiddelware);
router.route("/Subscribe").post(Subcribe);
router.route("/UnSubscribe").post(UnSubscribe);
router.route("/GetSubOrSubToDetails").get(SubscribersOrSubscribeTo);
router.route("/CheckIsSubcribe").post(CheckIsSubcribe);
export default router;
