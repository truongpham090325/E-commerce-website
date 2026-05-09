import { Request, Response } from "express";

export const blogByCategory = (req: Request, res: Response) => {
  console.log(req.params.slug);

  res.render("client/pages/blog-by-category", {
    pageTitle: "Danh sách bài viết theo danh mục",
  });
};
