import { Router } from "express";
import * as blogController from "../../controllers/client/blog.controller";

const router = Router();

router.get("/category/:slug", blogController.blogByCategory);

export default router;
