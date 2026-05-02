import { Request, Response } from "express";
import { permissionList } from "../../configs/variable.config";

export const create = (req: Request, res: Response) => {
  res.render("admin/pages/role-create", {
    pageTitle: "Tạo nhóm quyền",
    permissionList: permissionList,
  });
};
