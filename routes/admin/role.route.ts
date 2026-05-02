import { Router } from "express";
import * as roleController from "../../controllers/admin/role.controller";
import * as roleValidate from "../../validations/admin/role.validate";
import multer from "multer";

const router = Router();

const upload = multer();

router.get("/create", roleController.create);

router.post(
  "/create",
  upload.none(),
  roleValidate.createPost,
  roleController.createPost,
);

export default router;
