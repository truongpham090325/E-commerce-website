import { Router } from "express";
import homeRoutes from "./home.route";
import blogRoutes from "./blog.route";
import * as categoryMiddleware from "../../middlewares/client/category.middleware";

const router = Router();

router.use(categoryMiddleware.getAllCategory);

router.use("/", homeRoutes);
router.use("/blog", blogRoutes);

export default router;
