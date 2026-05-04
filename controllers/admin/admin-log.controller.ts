import { Request, Response } from "express";
import AdminLog from "../../models/admin-log.model";
import AccountAdmin from "../../models/account-admin.model";
import moment from "moment";

export const list = async (req: Request, res: Response) => {
  const find: {
    deleted: boolean;
  } = {
    deleted: false,
  };

  let page = 1;
  const limitItems = 10;
  if (req.query.page && parseInt(`${req.query.page}`) > 0) {
    page = parseInt(`${req.query.page}`);
  }
  const totalRecord = await AdminLog.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    totalRecord: totalRecord,
    totalPage: totalPage,
    skip: skip,
  };

  const adminLogList: any = await AdminLog.find(find)
    .limit(limitItems)
    .skip(skip)
    .sort({
      createdAt: "desc",
    });

  for (const item of adminLogList) {
    let adminName = "Super Admin";

    if (item.adminId && item.adminId.length === 24) {
      const adminInfo: any = await AccountAdmin.findOne({
        _id: item.adminId,
      });

      if (adminInfo) {
        adminName = adminInfo.fullName;
      }
    }

    item.adminName = adminName;

    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
  }

  res.render("admin/pages/admin-log-list", {
    pageTitle: "Lịch sử hoạt động",
    pagination: pagination,
    adminLogList: adminLogList,
  });
};
