import { Router } from "express";
import * as dashboardController from "../../controllers/client/dashboard.controller";
import * as dashboardValidate from "../../validations/client/dashboard.validate";

const router = Router();

router.get("/profile", dashboardController.profile);

router.get("/profile/edit", dashboardController.profileEdit);

router.patch(
  "/profile/edit",
  dashboardValidate.profileEditPatch,
  dashboardController.profileEditPatch,
);

router.get("/change-password", dashboardController.changePassword);

router.post(
  "/change-password",
  dashboardValidate.changePasswordPost,
  dashboardController.changePasswordPost,
);

export default router;
