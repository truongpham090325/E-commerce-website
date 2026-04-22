import { Request, Response } from "express";
import CategoryBlog from "../../models/category-blog.model";

export const category = (req: Request, res: Response) => {
  res.render("admin/pages/blog-category", {
    pageTitle: "Quản lý danh mục bài viết",
  });
};

export const createCategory = (req: Request, res: Response) => {
  res.render("admin/pages/blog-create-category", {
    pageTitle: "Tạo danh mục bài viết",
  });
};

export const createCategoryPost = async (req: Request, res: Response) => {
  const newRecord = new CategoryBlog(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "Tạo danh mục bài viết thành công!",
  });
};
