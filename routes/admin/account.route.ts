import { Router } from "express";
import * as accountController from "../../controllers/admin/account.controller";
import * as accountValidate from "../../validations/admin/account.validate";

const router = Router();

router.get("/login", accountController.login);

router.post("/login", accountValidate.loginPost, accountController.loginPost);

export default router;
