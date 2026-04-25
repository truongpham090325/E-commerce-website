import { Request, Response } from "express";
import CategoryBlog from "../../models/category-blog.model";
import { buildCategoryTree } from "../../helpers/category.helper";
import slugify from "slugify";
import { pathAdmin } from "../../configs/variable.config";

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
  const categoryList = await CategoryBlog.find({
    deleted: false,
  });

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

export const editCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const categoryDetail = await CategoryBlog.findOne({
      _id: id,
    });
    if (!categoryDetail) {
      res.redirect(`/${pathAdmin}/blog/category`);
      return;
    }

    const categoryList = await CategoryBlog.find({
      deleted: false,
    });

    const categoryTree = buildCategoryTree(categoryList);

    res.render("admin/pages/blog-edit-category", {
      pageTitle: "Chỉnh sửa danh mục bài viết",
      categoryList: categoryTree,
      categoryDetail: categoryDetail,
    });
  } catch (error) {
    console.log(error);
    res.redirect(`/${pathAdmin}/blog/category`);
  }
};

export const editCategoryPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const categoryDetail = await CategoryBlog.findOne({
      _id: id,
    });

    if (!categoryDetail) {
      res.json({
        code: "success",
        message: "Cập nhập danh mục bài viết thất bại!",
      });
      return;
    }

    const existSlug = await CategoryBlog.findOne({
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

    await CategoryBlog.updateOne(
      {
        _id: id,
        deleted: false,
      },
      req.body,
    );

    res.json({
      code: "success",
      message: "Cập nhập danh mục bài viết thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "success",
      message: "Cập nhập danh mục bài viết thất bại!",
    });
  }
};

export const deleteCategoryPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const categoryDetail = await CategoryBlog.findOne({
      _id: id,
    });

    if (!categoryDetail) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    await CategoryBlog.updateOne(
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
      message: "Xóa danh mục bài viết thành công!",
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
  const categoryList: any = await CategoryBlog.find({
    deleted: true,
  });

  for (const item of categoryList) {
    if (item.parent) {
      const categoryParent = await CategoryBlog.findOne({
        _id: item.parent,
      });

      item.parentName = categoryParent?.name;
    }
  }

  res.render("admin/pages/blog-trash-category", {
    pageTitle: "Thùng rác danh mục bài viết",
    categoryList: categoryList,
  });
};

export const undoCategoryPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const categoryDetail = await CategoryBlog.findOne({
      _id: id,
    });

    if (!categoryDetail) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    await CategoryBlog.updateOne(
      {
        _id: id,
      },
      {
        deleted: false,
      },
    );

    res.json({
      code: "success",
      message: "Khôi phục danh mục bài viết thành công!",
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

    const categoryDetail = await CategoryBlog.findOne({
      _id: id,
    });

    if (!categoryDetail) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    await CategoryBlog.deleteOne({
      _id: id,
    });

    res.json({
      code: "success",
      message: "Đã xóa vĩnh viễn danh mục bài viết!",
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
