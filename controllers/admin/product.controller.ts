import { Request, Response } from "express";
import CategoryProduct from "../../models/category-product.model";
import { buildCategoryTree } from "../../helpers/category.helper";
import slugify from "slugify";

export const category = async (req: Request, res: Response) => {
  res.render("admin/pages/product-category", {
    pageTitle: "Quản lý danh mục sản phẩm",
  });
};

export const createCategory = async (req: Request, res: Response) => {
  const categoryList = await CategoryProduct.find({});
  const categoryTree = buildCategoryTree(categoryList);

  res.render("admin/pages/product-create-category", {
    pageTitle: "Tạo danh mục sản phẩm",
    categoryList: categoryTree,
  });
};

export const createCategoryPost = async (req: Request, res: Response) => {
  try {
    const existSlug = await CategoryProduct.findOne({
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

    const newRecord = new CategoryProduct(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Tạo danh mục sản phẩm thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "success",
      message: "Tạo danh mục sản phẩm thất bại!",
    });
  }
};
