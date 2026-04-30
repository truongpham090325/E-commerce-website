import { Router } from "express";
import * as blogController from "../../controllers/admin/blog.controller";
import * as blogValidate from "../../validations/admin/blog.validate";
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

router.get("/category/edit/:id", blogController.editCategory);

router.patch(
  "/category/edit/:id",
  upload.none(),
  blogValidate.createCategoryPost,
  blogController.editCategoryPatch,
);

router.patch("/category/delete/:id", blogController.deleteCategoryPatch);

router.get("/category/trash", blogController.trashCategory);

router.patch("/category/undo/:id", blogController.undoCategoryPatch);

router.delete("/category/destroy/:id", blogController.destroyCategoryDelete);

router.get("/create", blogController.create);

router.post(
  "/create",
  upload.none(),
  blogValidate.createPost,
  blogController.createPost,
);

router.get("/list", blogController.list);

router.get("/edit/:id", blogController.edit);

router.patch(
  "/edit/:id",
  upload.none(),
  blogValidate.createPost,
  blogController.editPatch,
);

export default router;
