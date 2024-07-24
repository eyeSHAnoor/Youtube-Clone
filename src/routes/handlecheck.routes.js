import { Router } from "express";
import { toddleHandlecheck } from "../controllers/handlecheck.controller.js";

const router = Router();

router.route("/").get(toddleHandlecheck);
export default router;
