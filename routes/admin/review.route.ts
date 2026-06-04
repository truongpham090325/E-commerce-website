import { Router } from "express";
import * as reviewController from "../../controllers/admin/review.controller";

const router = Router();

router.get("/list", reviewController.list);

router.patch("/change-status/:id/:status", reviewController.changeStatusPatch);

router.delete("/destroy/:id", reviewController.destroyDelete);

export default router;
