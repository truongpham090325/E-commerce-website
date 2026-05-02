import { Request, Response } from "express";
import { permissionList } from "../../configs/variable.config";
import Role from "../../models/role.model";
import slugify from "slugify";

export const create = (req: Request, res: Response) => {
  res.render("admin/pages/role-create", {
    pageTitle: "Tạo nhóm quyền",
    permissionList: permissionList,
  });
};

export const createPost = async (req: Request, res: Response) => {
  try {
    req.body.permissions = JSON.parse(req.body.permissions);

    req.body.search = slugify(`${req.body.name}`, {
      replacement: " ",
      lower: true,
    });

    const newRecord = new Role(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Tạo nhóm quyền thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không thể tạo nhóm quyền!",
    });
  }
};
