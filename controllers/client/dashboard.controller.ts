import { Request, Response } from "express";
import AccountUser from "../../models/account-user.model";
import slugify from "slugify";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserAddress from "../../models/user-address.model";

export const profile = (req: Request, res: Response) => {
  res.render("client/pages/dashboard-profile", {
    pageTitle: "Tài khoản cá nhân",
  });
};

export const profileEdit = (req: Request, res: Response) => {
  res.render("client/pages/dashboard-profile-edit", {
    pageTitle: "Chỉnh sửa thông tin cá nhân",
  });
};

export const profileEditPatch = async (req: Request, res: Response) => {
  try {
    const id = res.locals.accountUser.id;

    const existEmail = await AccountUser.findOne({
      _id: { $ne: id },
      email: req.body.email,
    });

    if (existEmail) {
      res.json({
        code: "error",
        message: "Email đã tồn tại!",
      });
      return;
    }

    if (req.body.phone) {
      const existPhone = await AccountUser.findOne({
        _id: { $ne: id },
        phone: req.body.phone,
      });

      if (existPhone) {
        res.json({
          code: "error",
          message: "Số điện thoại đã được sử dụng!",
        });
        return;
      }
    }

    req.body.search = slugify(
      `${req.body.fullName} ${req.body.email} ${req.body.phone}`,
      {
        replacement: " ",
        lower: true,
      },
    );

    await AccountUser.updateOne({ _id: id }, req.body);

    const tokenUser = jwt.sign(
      {
        id: id,
        email: req.body.email,
      },
      `${process.env.JWT_SECRET}`,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("tokenUser", tokenUser, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
      sameSite: "strict",
    });

    res.json({
      code: "success",
      message: "Cập nhập thông tin thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ! ",
    });
  }
};

export const changePassword = (req: Request, res: Response) => {
  res.render("client/pages/dashboard-change-password", {
    pageTitle: "Đổi mật khẩu",
  });
};

export const changePasswordPost = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const userId = res.locals.accountUser.id;

    const hashPassword = await bcrypt.hash(password, 10);

    await AccountUser.updateOne(
      {
        _id: userId,
      },
      {
        password: hashPassword,
      },
    );

    res.json({
      code: "success",
      message: "Đã đổi mật khẩu thành công!",
    });
  } catch (error) {
    console.error(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

export const address = async (req: Request, res: Response) => {
  const id = res.locals.accountUser.id;

  const addressList = await UserAddress.find({
    userId: id,
  }).sort({
    createdAt: "desc",
  });

  res.render("client/pages/dashboard-address", {
    pageTitle: "Danh sách địa chỉ",
    addressList: addressList,
  });
};

export const addressCreate = (req: Request, res: Response) => {
  res.render("client/pages/dashboard-address-create", {
    pageTitle: "Thêm địa chỉ",
  });
};

export const addressCreatePost = async (req: Request, res: Response) => {
  try {
    const id = res.locals.accountUser.id;

    req.body.userId = id;

    if (req.body.isDefault) {
      await AccountUser.findOneAndUpdate(
        {
          _id: id,
          isDefault: true,
        },
        {
          isDefault: false,
        },
      );
    }

    const newRecord = new UserAddress(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Thêm địa chỉ thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

export const addressChangeDefault = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const userId = res.locals.accountUser.id;

    // Tìm địa chỉ mặc định hiện tại để xóa
    await UserAddress.findOneAndUpdate(
      {
        userId: userId,
        isDefault: true,
      },
      {
        isDefault: false,
      },
    );

    // Đặt địa chỉ mới làm mặc định
    await UserAddress.findOneAndUpdate(
      {
        _id: id,
        userId: userId,
        isDefault: false,
      },
      {
        isDefault: true,
      },
    );

    res.json({
      code: "success",
      message: "Đã đặt địa chỉ làm mặc định!",
    });
  } catch (error) {
    console.log(error);
    res.redirect("/dashboard/address");
  }
};

export const addressDelete = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const userId = res.locals.accountUser.id;

    await UserAddress.deleteOne({
      _id: id,
      userId: userId,
    });

    res.json({
      code: "success",
      message: "Đã xóa địa chỉ!",
    });
  } catch (error) {
    console.log(error);
    res.redirect("/dashboard/address");
  }
};
