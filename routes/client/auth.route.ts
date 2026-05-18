import { Router } from "express";
import * as authController from "../../controllers/client/auth.controller";
import * as authValidate from "../../validations/client/auth.middleware";

const router = Router();

router.get("/register", authController.register);

router.post(
  "/register",
  authValidate.registerPost,
  authController.registerPost,
);

router.get("/login", authController.login);

router.post("/login", authValidate.loginPost, authController.loginPost);

router.get("/logout", authController.logout);

export default router;
