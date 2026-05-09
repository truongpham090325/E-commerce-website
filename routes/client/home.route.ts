import { Router } from "express";
import * as homeController from "../../controllers/client/home.controller";
import * as categoryMiddleware from "../../middlewares/client/category.middleware";

const router = Router();

router.get("/", categoryMiddleware.getAllCategory, homeController.home);

export default router;
