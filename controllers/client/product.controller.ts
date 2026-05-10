import { Request, Response } from "express";
import CategoryProduct from "../../models/category-product.model";
import Product from "../../models/product.model";

export const productByCategory = async (req: Request, res: Response) => {
  const categoryDetail: any = await CategoryProduct.findOne({
    slug: req.params.slug,
    deleted: false,
    status: "active",
  });

  if (!categoryDetail) {
    res.redirect("/");
    return;
  }

  const find: {
    category: string;
    deleted: boolean;
    status: string;
    search?: RegExp;
  } = {
    category: categoryDetail.id,
    deleted: false,
    status: "active",
  };

  // Phân trang
  let limitItems = 20;
  if (req.query.limitItems && parseInt(`${req.query.limitItems}`) > 0) {
    limitItems = parseInt(`${req.query.limitItems}`);
  }

  let page = 1;
  if (req.query.page) {
    const currentPage = parseInt(`${req.query.page}`);
    if (currentPage > 0) {
      page = currentPage;
    }
  }
  const totalRecord = await Product.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    totalPage: totalPage,
    currentPage: page,
    totalRecord: totalRecord,
    skip: skip,
  };
  // Hết Phân trang

  const productList: any = await Product.find(find)
    .sort({
      position: "desc",
    })
    .limit(limitItems)
    .skip(skip);

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
    pagination: pagination,
  });
};
