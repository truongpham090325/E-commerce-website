import { Router } from "express";
import * as orderController from "../../controllers/admin/order.controller";

const router = Router();

router.get("/list", orderController.list);

router.patch("/delete/:id", orderController.deletePatch);

router.get("/trash", orderController.trash);

router.patch("/undo/:id", orderController.undoPatch);

router.delete("/destroy/:id", orderController.destroyDelete);

router.get("/edit/:id", orderController.edit);

router.patch("/edit/:id", orderController.editPatch);

export default router;
