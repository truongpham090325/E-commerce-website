import { Request, Response } from "express";
import Order from "../../models/order.model";
import slugify from "slugify";

export const list = async (req: Request, res: Response) => {
  const find: {
    deleted: boolean;
    fullName?: String;
  } = {
    deleted: false,
  };

  if (req.query.keyword) {
    const keyword = slugify(`${req.query.keyword}`, {
      replacement: " ",
      lower: true,
    });

    find.fullName = keyword;
  }

  // Phân trang
  const limitItems = 10;
  let page = 1;
  if (req.query.page) {
    const currentPage = parseInt(`${req.query.page}`);
    if (currentPage > 0) {
      page = currentPage;
    }
  }
  const totalRecord = await Order.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage,
  };
  // Hết Phân trang

  const recordList = await Order.find(find).limit(limitItems).skip(skip).sort({
    createdAt: "desc",
  });

  res.render("admin/pages/order-list", {
    pageTitle: "Quản lý đơn hàng",
    recordList: recordList,
    pagination: pagination,
  });
};

export const deletePatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const orderDetail = await Order.findOne({
      _id: id,
    });

    if (!orderDetail) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    await Order.updateOne(
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
      message: "Xóa đơn hàng thành công!",
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
  const orderList: any = await Order.find({
    deleted: true,
  });

  res.render("admin/pages/order-trash", {
    pageTitle: "Thùng rác đơn hàng",
    orderList: orderList,
  });
};

export const undoPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const orderDetail = await Order.findOne({
      _id: id,
    });

    if (!orderDetail) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    await Order.updateOne(
      {
        _id: id,
      },
      {
        deleted: false,
      },
    );

    res.json({
      code: "success",
      message: "Khôi phục đơn hàng thành công!",
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

    const orderDetail = await Order.findOne({
      _id: id,
    });

    if (!orderDetail) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    await Order.deleteOne({
      _id: id,
    });

    res.json({
      code: "success",
      message: "Đã xóa vĩnh viễn đơn hàng!",
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
