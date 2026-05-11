import { Router } from "express";
import homeRoutes from "./home.route";
import blogRoutes from "./blog.route";
import productRoutes from "./product.route";

import * as categoryMiddleware from "../../middlewares/client/category.middleware";
import * as attributeMiddleware from "../../middlewares/client/attribute.middleware";

const router = Router();

router.use(categoryMiddleware.getAllCategory);
router.use(attributeMiddleware.getAttributeProduct);

router.use("/", homeRoutes);
router.use("/blog", blogRoutes);
router.use("/product", productRoutes);

export default router;
