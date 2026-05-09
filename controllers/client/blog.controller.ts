import { Request, Response } from "express";
import CategoryBlog from "../../models/category-blog.model";
import Blog from "../../models/blog.model";
import AccountAdmin from "../../models/account-admin.model";
import moment from "moment";
import slugify from "slugify";

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

    const find: {
      category: string;
      deleted: boolean;
      status: string;
      search?: RegExp;
    } = {
      category: categoryDetail.id,
      deleted: false,
      status: "published",
    };

    // Phân trang
    const limitItems = 9;
    let page = 1;
    if (req.query.page) {
      const currentPage = parseInt(`${req.query.page}`);
      if (currentPage > 0) {
        page = currentPage;
      }
    }
    const totalRecord = await Blog.countDocuments(find);
    const totalPage = Math.ceil(totalRecord / limitItems);
    const skip = (page - 1) * limitItems;
    const pagination = {
      totalPage: totalPage,
      currentPage: page,
    };
    // Hết Phân trang

    // Tìm kiếm
    if (req.query.keyword) {
      const keyword = slugify(`${req.query.keyword}`, {
        replacement: " ",
        lower: true, // Chữ thường
      });
      const keywordRegex = new RegExp(keyword, "i");
      find.search = keywordRegex;
    }
    // Hết Tìm kiếm

    const blogList: any = await Blog.find(find).limit(limitItems).skip(skip);

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
      pagination: pagination,
    });
  } catch (error) {
    res.redirect("/");
  }
};
