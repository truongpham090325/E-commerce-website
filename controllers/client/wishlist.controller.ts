import { Request, Response } from "express";

export const wishlist = (req: Request, res: Response) => {
  res.render("client/pages/wishlist", {
    pageTitle: "Yêu thích sản phẩm",
  });
};
