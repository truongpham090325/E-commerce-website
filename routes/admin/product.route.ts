import { Router } from "express";
import * as productController from "../../controllers/admin/product.controller";
import * as productValidate from "../../validations/admin/product.validate";
import multer from "multer";

const router = Router();

const upload = multer();

router.get("/category", productController.category);

router.get("/category/create", productController.createCategory);

router.post(
  "/category/create",
  upload.none(),
  productValidate.createCategoryPost,
  productController.createCategoryPost,
);

router.get("/category/edit/:id", productController.editCategory);

router.patch(
  "/category/edit/:id",
  upload.none(),
  productValidate.createCategoryPost,
  productController.editCategoryPatch,
);

export default router;
