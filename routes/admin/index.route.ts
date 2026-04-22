import { Router } from "express";
import dashboardRoutes from "./dashboard.route";
import blogRoutes from "./blog.route";

const router = Router();

router.use("/dashboard", dashboardRoutes);
router.use("/blog", blogRoutes);

export default router;
