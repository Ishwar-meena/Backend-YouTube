import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment } from "../controllers/comment.controller.js";
const router = Router();

router.use(verifyJWT)

router.route("/add-comment").post(addComment)
router.route("/delete-comment").delete(deleteComment)

export default router;