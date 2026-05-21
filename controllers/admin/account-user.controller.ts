import { Request, Response } from "express";
import slugify from "slugify";
import AccountUser from "../../models/account-user.model";

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

  // Phân trang
  let page = 1;
  const limitItems = 10;
  if (req.query.page && parseInt(`${req.query.page}`) > 0) {
    page = parseInt(`${req.query.page}`);
  }
  const totalRecord = await AccountUser.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    totalRecord: totalRecord,
    totalPage: totalPage,
    skip: skip,
  };
  // Hết phân trang

  const accountUserList: any = await AccountUser.find(find)
    .limit(limitItems)
    .skip(skip)
    .sort({
      createdAt: "desc",
    });

  res.render("admin/pages/account-user-list", {
    pageTitle: "Danh sách tài khoản người dùng",
    accountUserList: accountUserList,
    pagination: pagination,
  });
};
