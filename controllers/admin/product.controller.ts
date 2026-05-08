import { Request, Response } from "express";
import CategoryProduct from "../../models/category-product.model";
import { buildCategoryTree } from "../../helpers/category.helper";
import slugify from "slugify";
import { pathAdmin } from "../../configs/variable.config";
import Product from "../../models/product.model";
import AttributeProduct from "../../models/attribute-product.model";
import { Parser } from "json2csv";

export const category = async (req: Request, res: Response) => {
  const find: {
    deleted: boolean;
    search?: RegExp;
  } = {
    deleted: false,
  };

  if (req.query.keyword) {
    const keyword = slugify(`${req.query.keyword}`, {
      replacement: " ",
      lower: true,
    });

    const keywordExp = new RegExp(keyword, "i");
    find.search = keywordExp;
  }

  let page = 1;
  const limitItems = 10;
  if (req.query.page && parseInt(`${req.query.page}`) > 0) {
    page = parseInt(`${req.query.page}`);
  }
  const totalRecord = await CategoryProduct.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    totalRecord: totalRecord,
    totalPage: totalPage,
    skip: skip,
  };

  const categoryList: any = await CategoryProduct.find(find)
    .limit(limitItems)
    .skip(skip)
    .sort({
      createdAt: "desc",
    });

  for (const item of categoryList) {
    if (item.parent) {
      const categoryParent = await CategoryProduct.findOne({
        _id: item.parent,
      });

      item.parentName = categoryParent?.name;
    }
  }

  res.render("admin/pages/product-category", {
    pageTitle: "Quản lý danh mục sản phẩm",
    categoryList: categoryList,
    pagination: pagination,
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

export const editCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const categoryDetail = await CategoryProduct.findOne({
      _id: id,
      deleted: false,
    });

    if (!categoryDetail) {
      res.redirect(`/${pathAdmin}/product/category`);
      return;
    }
    const categoryList = await CategoryProduct.find({
      deleted: false,
    });
    const categoryTree = buildCategoryTree(categoryList);

    res.render("admin/pages/product-edit-category", {
      pageTitle: "Chỉnh sửa danh mục sản phẩm",
      categoryList: categoryTree,
      categoryDetail: categoryDetail,
    });
  } catch (error) {
    console.log(error);
    res.redirect(`/${pathAdmin}/product/category`);
  }
};

export const editCategoryPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const categoryDetail = await CategoryProduct.findOne({
      _id: id,
    });

    if (!categoryDetail) {
      res.json({
        code: "error",
        message: "Cập nhập danh mục sản phẩm thất bại!",
      });
      return;
    }

    const existSlug = await CategoryProduct.findOne({
      _id: { $ne: id },
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

    await CategoryProduct.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Cập nhập danh mục sản phẩm thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "success",
      message: "Cập nhập danh mục sản phẩm thất bại!",
    });
  }
};

export const deleteCategoryPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const categoryDetail = await CategoryProduct.findOne({
      _id: id,
    });

    if (!categoryDetail) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    await CategoryProduct.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
        deletedAt: Date.now(),
      },
    );

    res.json({
      code: "success",
      message: "Xóa danh mục sản phẩm thành công!",
    });
    return;
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

export const trashCategory = async (req: Request, res: Response) => {
  const categoryList: any = await CategoryProduct.find({
    deleted: true,
  });

  for (const item of categoryList) {
    if (item.parent) {
      const categoryParent = await CategoryProduct.findOne({
        _id: item.parent,
      });

      item.parentName = categoryParent?.name;
    }
  }

  res.render("admin/pages/product-trash-category", {
    pageTitle: "Thùng rác danh mục sản phẩm",
    categoryList: categoryList,
  });
};

export const undoCategoryPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const categoryDetail = await CategoryProduct.findOne({
      _id: id,
    });

    if (!categoryDetail) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    await CategoryProduct.updateOne(
      {
        _id: id,
      },
      {
        deleted: false,
      },
    );

    res.json({
      code: "success",
      message: "Khôi phục danh mục sản phẩm thành công!",
    });
    return;
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

export const destroyCategoryDelete = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const categoryDetail = await CategoryProduct.findOne({
      _id: id,
    });

    if (!categoryDetail) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    await CategoryProduct.deleteOne({
      _id: id,
    });

    res.json({
      code: "success",
      message: "Đã xóa vĩnh viễn danh mục sản phẩm!",
    });
    return;
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

export const create = async (req: Request, res: Response) => {
  const categoryList = await CategoryProduct.find({
    deleted: false,
  });

  const categoryTree = buildCategoryTree(categoryList);

  const attributeList = await AttributeProduct.find({
    deleted: false,
  });

  res.render("admin/pages/product-create", {
    pageTitle: "Tạo sản phẩm",
    categoryList: categoryTree,
    attributeList: attributeList,
  });
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const existSlug = await Product.findOne({
      slug: req.body.slug,
    });
    if (existSlug) {
      res.json({
        code: "error",
        message: "Đường dẫn đã tồn tại!",
      });
      return;
    }

    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      // Nếu không truyền position thì lấy position lớn nhất + 1
      const recordMaxPosition = await Product.findOne({}).sort({
        position: "desc",
      });

      if (recordMaxPosition && recordMaxPosition.position) {
        req.body.position = recordMaxPosition.position + 1;
      } else {
        req.body.position = 1;
      }
    }

    if (req.body.priceOld) {
      req.body.priceOld = parseInt(req.body.priceOld);
    }

    if (req.body.priceNew) {
      req.body.priceNew = parseInt(req.body.priceNew);
    } else {
      req.body.priceNew = parseInt(req.body.priceOld);
    }

    if (req.body.stock) {
      req.body.stock = parseInt(req.body.stock);
    } else {
      req.body.stock = 0;
    }

    req.body.category = JSON.parse(req.body.category);

    req.body.images = JSON.parse(req.body.images);

    req.body.attributes = JSON.parse(req.body.attributes);

    req.body.variants = JSON.parse(req.body.variants);

    req.body.tags = JSON.parse(req.body.tags);

    req.body.search = slugify(`${req.body.name}`, {
      replacement: " ",
      lower: true,
    });

    const newRecord = new Product(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Tạo sản phẩm thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Tạo sản phẩm thất bại!",
    });
  }
};

export const attribute = async (req: Request, res: Response) => {
  const find: {
    deleted: boolean;
    search?: RegExp;
  } = {
    deleted: false,
  };

  if (req.query.keyword) {
    const keyword = slugify(`${req.query.keyword}`, {
      replacement: " ",
      lower: true,
    });

    const keywordExp = new RegExp(keyword, "i");
    find.search = keywordExp;
  }

  let page = 1;
  const limitItems = 10;
  if (req.query.page && parseInt(`${req.query.page}`) > 0) {
    page = parseInt(`${req.query.page}`);
  }
  const totalRecord = await AttributeProduct.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    totalRecord: totalRecord,
    totalPage: totalPage,
    skip: skip,
  };

  const attributeList: any = await AttributeProduct.find(find)
    .limit(limitItems)
    .skip(skip)
    .sort({
      createdAt: "desc",
    });

  res.render("admin/pages/product-attribute", {
    pageTitle: "Quản lý thuộc tính sản phẩm",
    pagination: pagination,
    attributeList: attributeList,
  });
};

export const createAttribute = async (req: Request, res: Response) => {
  res.render("admin/pages/product-create-attribute", {
    pageTitle: "Tạo thuộc tính sản phẩm",
  });
};

export const createAttributePost = async (req: Request, res: Response) => {
  try {
    req.body.options = JSON.parse(req.body.options);

    req.body.search = slugify(`${req.body.name}`, {
      replacement: " ",
      lower: true,
    });

    const newRecord = new AttributeProduct(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Tạo thuộc tính thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

export const editAttribute = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const attributeDetail = await AttributeProduct.findOne({
      _id: id,
    });

    if (!attributeDetail) {
      res.redirect(`/${pathAdmin}/product/attribute`);
      return;
    }

    res.render("admin/pages/product-edit-attribute", {
      pageTitle: "Chỉnh sửa thuộc tính sản phẩm",
      attributeDetail: attributeDetail,
    });
  } catch (error) {
    console.log(error);
    res.redirect(`/${pathAdmin}/product/attribute`);
  }
};

export const editAttributePatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const attributeDetail = await AttributeProduct.findOne({
      _id: id,
    });

    if (!attributeDetail) {
      res.json({
        code: "error",
        message: "Dữ liệu không hợp lệ!",
      });
      return;
    }

    req.body.options = JSON.parse(req.body.options);

    req.body.search = slugify(`${req.body.name}`, {
      replacement: " ",
      lower: true,
    });

    await AttributeProduct.updateOne(
      {
        _id: id,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Cập nhập thuộc tính thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

export const deleteAttributePatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const attributeDetail = await AttributeProduct.findOne({
      _id: id,
    });

    if (!attributeDetail) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    await AttributeProduct.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
        deletedAt: Date.now(),
      },
    );

    res.json({
      code: "success",
      message: "Xóa thuộc tính thành công!",
    });
    return;
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

export const trashAttribute = async (req: Request, res: Response) => {
  const attributeList: any = await AttributeProduct.find({
    deleted: true,
  });

  res.render("admin/pages/product-trash-attribute", {
    pageTitle: "Thùng rác thuộc tính sản phẩm",
    attributeList: attributeList,
  });
};

export const undoAttributePatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const attributeDetail = await AttributeProduct.findOne({
      _id: id,
    });

    if (!attributeDetail) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    await AttributeProduct.updateOne(
      {
        _id: id,
      },
      {
        deleted: false,
      },
    );

    res.json({
      code: "success",
      message: "Khôi phục thuộc tính thành công!",
    });
    return;
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

export const destroyAttributeDelete = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const attributeDetail = await AttributeProduct.findOne({
      _id: id,
    });

    if (!attributeDetail) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    await AttributeProduct.deleteOne({
      _id: id,
    });

    res.json({
      code: "success",
      message: "Đã xóa vĩnh viễn thuộc tính sản phẩm!",
    });
    return;
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

export const list = async (req: Request, res: Response) => {
  const find: {
    deleted: boolean;
    search?: RegExp;
  } = {
    deleted: false,
  };

  if (req.query.keyword) {
    const keyword = slugify(`${req.query.keyword}`, {
      replacement: " ",
      lower: true,
    });

    const keywordExp = new RegExp(keyword, "i");
    find.search = keywordExp;
  }

  let page = 1;
  const limitItems = 10;
  if (req.query.page && parseInt(`${req.query.page}`) > 0) {
    page = parseInt(`${req.query.page}`);
  }
  const totalRecord = await Product.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    totalRecord: totalRecord,
    totalPage: totalPage,
    skip: skip,
  };

  const productList = await Product.find(find).limit(limitItems).skip(skip);

  res.render("admin/pages/product-list", {
    pageTitle: "Danh sách sản phẩm",
    pagination: pagination,
    productList: productList,
  });
};

export const edit = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const productDetail = await Product.findOne({
      _id: id,
    });

    if (!productDetail) {
      res.redirect(`/${pathAdmin}/product/list`);
      return;
    }

    const categoryList = await CategoryProduct.find({
      deleted: false,
    });
    const categoryTree = buildCategoryTree(categoryList);

    const attributeList = await AttributeProduct.find({
      deleted: false,
    });

    const attributeNameList: string[] = [];
    productDetail.attributes.forEach((attrId) => {
      const attributeInfo = attributeList.find((item) => item.id === attrId);
      if (attributeInfo) {
        attributeNameList.push(`${attributeInfo.name}`);
      }
    });

    res.render("admin/pages/product-edit", {
      pageTitle: "Chỉnh sửa sản phẩm",
      productDetail: productDetail,
      categoryList: categoryTree,
      attributeList: attributeList,
      attributeNameList: attributeNameList,
    });
  } catch (error) {
    console.log(error);
    res.redirect(`/${pathAdmin}/product/list`);
  }
};

export const editPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const productDetail = await Product.findOne({
      _id: id,
      deleted: false,
    });

    if (!productDetail) {
      res.json({
        code: "error",
        message: "Dữ liệu không hợp lệ!",
      });
      return;
    }

    const existSlug = await Product.findOne({
      _id: { $ne: id },
      slug: req.body.slug,
    });
    if (existSlug) {
      res.json({
        code: "error",
        message: "Đường dẫn đã tồn tại!",
      });
      return;
    }

    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      // Nếu không truyền position thì lấy position lớn nhất + 1
      const recordMaxPosition = await Product.findOne({}).sort({
        position: "desc",
      });

      if (recordMaxPosition && recordMaxPosition.position) {
        req.body.position = recordMaxPosition.position + 1;
      } else {
        req.body.position = 1;
      }
    }

    if (req.body.priceOld) {
      req.body.priceOld = parseInt(req.body.priceOld);
    }

    if (req.body.priceNew) {
      req.body.priceNew = parseInt(req.body.priceNew);
    } else {
      req.body.priceNew = parseInt(req.body.priceOld);
    }

    if (req.body.stock) {
      req.body.stock = parseInt(req.body.stock);
    } else {
      req.body.stock = 0;
    }

    req.body.category = JSON.parse(req.body.category);

    req.body.images = JSON.parse(req.body.images);

    req.body.attributes = JSON.parse(req.body.attributes);

    req.body.variants = JSON.parse(req.body.variants);

    req.body.tags = JSON.parse(req.body.tags);

    req.body.search = slugify(`${req.body.name}`, {
      replacement: " ",
      lower: true,
    });

    await Product.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Cập nhập sản phẩm thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Cập nhập sản phẩm thất bại!",
    });
  }
};

export const deletePatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const productDetail = await Product.findOne({
      _id: id,
    });

    if (!productDetail) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    await Product.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
        deletedAt: Date.now(),
      },
    );

    res.json({
      code: "success",
      message: "Xóa sản phẩm thành công!",
    });
    return;
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

export const trash = async (req: Request, res: Response) => {
  const productList: any = await Product.find({
    deleted: true,
  });

  res.render("admin/pages/product-trash", {
    pageTitle: "Thùng rác sản phẩm",
    productList: productList,
  });
};

export const undoPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const productDetail = await Product.findOne({
      _id: id,
    });

    if (!productDetail) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    await Product.updateOne(
      {
        _id: id,
      },
      {
        deleted: false,
      },
    );

    res.json({
      code: "success",
      message: "Khôi phục sản phẩm thành công!",
    });
    return;
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

export const destroyDelete = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const productDetail = await Product.findOne({
      _id: id,
    });

    if (!productDetail) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    await Product.deleteOne({
      _id: id,
    });

    res.json({
      code: "success",
      message: "Đã xóa vĩnh viễn sản phẩm!",
    });
    return;
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!",
    });
  }
};

export const exportCSV = async (req: Request, res: Response) => {
  try {
    const productList = await Product.find().lean();

    // Chuyển JSON sang CSV
    const parser = new Parser();
    let csv = parser.parse(productList);

    // Sửa lỗi tiếng việt
    csv = "\ufeff" + csv;

    res.header("Content-Type", "text/csv");
    res.attachment("products.csv");

    res.send(csv);
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Lỗi Export!",
    });
  }
};
