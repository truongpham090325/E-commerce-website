import { Request, Response } from "express";

export const productByCategory = (req: Request, res: Response) => {
  console.log(req.params.slug);

  res.render("client/pages/product-by-category", {
    pageTitle: "Danh sách sản phẩm theo danh mục",
  });
};
