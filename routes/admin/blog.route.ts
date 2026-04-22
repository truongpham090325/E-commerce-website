import { Router } from "express";
import * as blogController from "../../controllers/admin/blog.controller";
import * as blogValidate from "../../validates/admin/blog.validate";
import multer from "multer";

const router = Router();

const upload = multer();

router.get("/category", blogController.category);

router.get("/category/create", blogController.createCategory);

router.post(
  "/category/create",
  upload.none(),
  blogValidate.createCategoryPost,
  blogController.createCategoryPost,
);
export default router;
