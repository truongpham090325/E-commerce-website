import { Router } from "express";
import * as fileManagerController from "../../controllers/admin/file-manager.controller";
import multer from "multer";

const router = Router();

const upload = multer();

router.get("/", fileManagerController.fileManager);

router.post("/upload", upload.array("files"), fileManagerController.uploadPost);

export default router;
