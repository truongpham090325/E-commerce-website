import { Request, Response } from "express";
import CategoryProduct from "../../models/category-product.model";

export const productByCategory = async (req: Request, res: Response) => {
  const categoryDetail = await CategoryProduct.findOne({
    slug: req.params.slug,
    deleted: false,
    status: "active",
  });

  res.render("client/pages/product-by-category", {
    pageTitle: "Danh sách sản phẩm theo danh mục",
    categoryDetail: categoryDetail,
  });
};
