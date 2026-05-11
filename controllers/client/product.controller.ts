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
    priceNew?: {
      $gte: Number;
      $lte: Number;
    };
    discount?: {
      $gt: Number;
    };
    stock?: {
      $gt: Number;
    };
    $or?: any;
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

  // Sắp xếp
  const sort: any = {};
  if (req.query.sort) {
    const [sortKey, sortValue] = `${req.query.sort}`.split("-");

    switch (sortKey) {
      case "position":
        sort.position = sortValue;
        break;
      case "price":
        sort.priceNew = sortValue;
        sort.priceOld = sortValue;
        break;
      case "createdAt":
        sort.createdAt = sortValue;
        break;
      case "discount":
        sort.discount = sortValue;
        break;
      default:
        sort.position = "desc";
        break;
    }
  } else {
    sort.position = "desc";
  }
  // Hết Sắp xếp

  // Mức giá
  if (req.query.price) {
    const [priceMin, priceMax] = `${req.query.price}`.split("-");

    find.priceNew = {
      $gte: parseInt(priceMin),
      $lte: parseInt(priceMax),
    };
  }
  // Hết Mức giá

  // Giảm giá
  if (req.query.onSale && req.query.onSale == "true") {
    find.discount = {
      $gt: 0,
    };
  }
  // Hết Giảm giá

  // Còn hàng
  if (req.query.inStock && req.query.inStock == "true") {
    find.stock = {
      $gt: 0,
    };
  }
  // Hết Còn hàng

  // Thuộc tính
  const attributeFilters: any[] = [];

  Object.keys(req.query).forEach((key) => {
    if (key.startsWith("attribute_")) {
      const attrId = key.replace("attribute_", "");
      const values = `${req.query[key]}`.split("-");

      attributeFilters.push({
        variants: {
          $elemMatch: {
            status: true,
            attributeValue: {
              $elemMatch: {
                attrId: attrId,
                value: { $in: values },
              },
            },
          },
        },
      });

      if (attributeFilters.length > 0) {
        find.$or = attributeFilters;
      }
    }
  });
  // Hết Thuộc tính

  const productList: any = await Product.find(find)
    .sort(sort)
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
