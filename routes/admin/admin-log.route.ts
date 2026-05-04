import { Router } from "express";
import * as adminLogController from "../../controllers/admin/admin-log.controller";

const router = Router();

router.get("/list", adminLogController.list);

export default router;
