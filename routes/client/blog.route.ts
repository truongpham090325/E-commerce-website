import { Router } from "express";
import * as blogController from "../../controllers/client/blog.controller";
import * as blogMiddleware from "../../middlewares/client/blog.middleware";

const router = Router();

router.get(
  "/category/:slug",
  blogMiddleware.getPopularBlog,
  blogController.blogByCategory,
);

export default router;
