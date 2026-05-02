import { Router } from "express";
import * as roleController from "../../controllers/admin/role.controller";

const router = Router();

router.get("/create", roleController.create);

export default router;
