import { Router } from "express";
import * as accountAdminController from "../../controllers/admin/account-admin.controller";
import * as accountAdminValidate from "../../validations/admin/account-admin.validate";
import multer from "multer";

const router = Router();

const upload = multer();

router.get("/create", accountAdminController.create);

router.post(
  "/create",
  upload.none(),
  accountAdminValidate.createPost,
  accountAdminController.createPost,
);

router.get("/list", accountAdminController.list);

router.get("/edit/:id", accountAdminController.edit);

router.patch(
  "/edit/:id",
  upload.none(),
  accountAdminValidate.editPatch,
  accountAdminController.editPatch,
);

router.patch("/delete/:id", accountAdminController.deletePatch);

router.get("/trash", accountAdminController.trash);

router.patch("/undo/:id", accountAdminController.undoPatch);

router.delete("/destroy/:id", accountAdminController.destroyDelete);

export default router;
