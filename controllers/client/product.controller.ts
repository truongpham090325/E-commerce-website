import { Request, Response } from "express";
import CategoryProduct from "../../models/category-product.model";
import Product from "../../models/product.model";

export const productByCategory = async (req: Request, res: Response) => {
  const categoryDetail: any = await CategoryProduct.findOne({
    slug: req.params.slug,
    deleted: false,
    status: "active",
  });

  const productList: any = await Product.find({
    category: categoryDetail.id,
    deleted: false,
    status: "active",
  }).sort({
    position: "desc",
  });

  for (const item of productList) {
    // giảm giá
    item.discount = Math.floor(
      ((item.priceOld - item.priceNew) / item.priceOld) * 100,
    );

    const colorSet = new Set();
    item.variants
      .filter((variant: any) => variant.status == true)
      .forEach((variant: any) => {
        variant.attributeValue.forEach((attr: any) => {
          if (attr.attrType == "color") {
            colorSet.add(attr.value);
          }
        });
      });

    item.colorList = [...colorSet];
  }

  res.render("client/pages/product-by-category", {
    pageTitle: "Danh sách sản phẩm theo danh mục",
    categoryDetail: categoryDetail,
    productList: productList,
  });
};
