import { Request, Response } from "express";
import AccountUser from "../../models/account-user.model";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import jwt from "jsonwebtoken";

export const register = (req: Request, res: Response) => {
  res.render("client/pages/register", {
    pageTitle: "Đăng ký tài khoản",
  });
};

export const registerPost = async (req: Request, res: Response) => {
  try {
    const existEmail = await AccountUser.findOne({
      email: req.body.email,
    });

    if (existEmail) {
      res.json({
        code: "error",
        message: "Email đã được sử dụng!",
      });
      return;
    }

    const existPhone = await AccountUser.findOne({
      phone: req.body.phone,
    });

    if (existPhone) {
      res.json({
        code: "error",
        message: "Số điện thoại đã được sử dụng!",
      });
      return;
    }

    // Mã hóa mật khẩu
    req.body.password = await bcrypt.hash(req.body.password, 10);

    req.body.search = slugify(
      `${req.body.fullName} ${req.body.email} ${req.body.phone}`,
      {
        replacement: " ",
        lower: true,
      },
    );

    const newRecord = new AccountUser(req.body);
    await newRecord.save();

    const tokenUser = jwt.sign(
      {
        id: newRecord.id,
        email: newRecord.email,
      },
      `${process.env.JWT_SECRET}`,
      {
        expiresIn: "3d",
      },
    );

    res.cookie("tokenUser", tokenUser, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    res.json({
      code: "success",
      message: "Đăng ký thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};
