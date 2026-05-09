import { Request, Response } from "express";
import CategoryBlog from "../../models/category-blog.model";
import Blog from "../../models/blog.model";
import AccountAdmin from "../../models/account-admin.model";
import moment from "moment";

export const blogByCategory = async (req: Request, res: Response) => {
  try {
    const categoryDetail = await CategoryBlog.findOne({
      slug: req.params.slug,
      deleted: false,
      status: "active",
    });

    if (!categoryDetail) {
      res.redirect("/");
      return;
    }

    const blogList: any = await Blog.find({
      category: categoryDetail.id,
      deleted: false,
      status: "published",
    });

    for (const item of blogList) {
      if (item.updatedBy) {
        const accountAdmin = await AccountAdmin.findOne({
          _id: item.updatedBy,
        });

        if (accountAdmin) {
          item.authorName = accountAdmin.fullName;
          item.date = moment(item.createdAt).format("DD/MM/YYYY");
        }
      } else {
        const accountAdmin = await AccountAdmin.findOne({
          _id: item.createdBy,
        });

        if (accountAdmin) {
          item.authorName = accountAdmin.fullName;
          item.date = moment(item.createdAt).format("DD/MM/YYYY");
        }
      }
    }

    res.render("client/pages/blog-by-category", {
      pageTitle: "Danh sách bài viết theo danh mục",
      categoryDetail: categoryDetail,
      blogList: blogList,
    });
  } catch (error) {
    res.redirect("/");
  }
};
