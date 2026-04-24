import { Router } from "express";
import dashboardRoutes from "./dashboard.route";
import blogRoutes from "./blog.route";
import helperRoutes from "./helper.route";

const router = Router();

router.use("/dashboard", dashboardRoutes);
router.use("/blog", blogRoutes);
router.use("/helper", helperRoutes);

export default router;
