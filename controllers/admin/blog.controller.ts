import { Request, Response } from "express";
import CategoryBlog from "../../models/category-blog.model";
import { buildCategoryTree } from "../../helpers/category.helper";
import slugify from "slugify";

export const category = async (req: Request, res: Response) => {
  const categoryList: any = await CategoryBlog.find({
    deleted: false,
  });

  for (const item of categoryList) {
    if (item.parent) {
      const categoryParent = await CategoryBlog.findOne({
        _id: item.parent,
      });

      item.parentName = categoryParent?.name;
    }
  }

  res.render("admin/pages/blog-category", {
    pageTitle: "Quản lý danh mục bài viết",
    categoryList: categoryList,
  });
};

export const createCategory = async (req: Request, res: Response) => {
  const categoryList = await CategoryBlog.find({});

  const categoryTree = buildCategoryTree(categoryList);

  res.render("admin/pages/blog-create-category", {
    pageTitle: "Tạo danh mục bài viết",
    categoryList: categoryTree,
  });
};

export const createCategoryPost = async (req: Request, res: Response) => {
  try {
    const existSlug = await CategoryBlog.findOne({
      slug: req.body.slug,
    });
    if (existSlug) {
      res.json({
        code: "error",
        message: "Đường dẫn đã tồn tại!",
      });
      return;
    }

    req.body.search = slugify(`${req.body.name}`, {
      replacement: " ",
      lower: true,
    });

    const newRecord = new CategoryBlog(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Tạo danh mục bài viết thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "success",
      message: "Tạo danh mục bài viết thất bại!",
    });
  }
};
