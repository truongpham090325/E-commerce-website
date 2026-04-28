import { list } from "./../../../IT-jobs-backend/controllers/city.controller";
import { Router } from "express";
import * as fileManagerController from "../../controllers/admin/file-manager.controller";
import multer from "multer";

const router = Router();

const upload = multer();

router.get("/", fileManagerController.fileManager);

router.post("/upload", upload.array("files"), fileManagerController.uploadPost);

router.patch("/change-file-name", fileManagerController.changeFileNamePatch);

router.delete("/delete-file", fileManagerController.deleteFileDel);

router.post("/folder/create", fileManagerController.createFolderPost);

export default router;
