import { Request, Response } from "express";
import AccountAdmin from "../../models/account-admin.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pathAdmin } from "../../configs/variable.config";

export const login = (req: Request, res: Response) => {
  res.render("admin/pages/account-login", {
    pageTitle: "Trang đăng nhập quản trị",
  });
};

export const loginPost = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberPassword } = req.body;

    const existAccount: any = await AccountAdmin.findOne({
      email: email,
      deleted: false,
    });

    if (!existAccount) {
      res.json({
        code: "error",
        message: "Email không tồn tại trong hệ thống!",
      });
      return;
    }

    // Giải mã mật khẩu
    const isPassword = await bcrypt.compare(
      password,
      `${existAccount.password}`,
    );

    if (!isPassword) {
      res.json({
        code: "error",
        message: "Mật khẩu không chính xác!",
      });
      return;
    }

    if (existAccount.status == "initial") {
      res.json({
        code: "error",
        message: "Tài khoản chưa được kích hoạt!",
      });
      return;
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        id: existAccount.id,
        email: existAccount.email,
      },
      `${process.env.JWT_SECRET}`,
      {
        expiresIn: rememberPassword ? "7d" : "1d", // 7 ngày hoặc 1 ngày
      },
    );

    res.cookie("tokenAdmin", token, {
      httpOnly: true, // Chỉ cho phép server truy cập cookie, JavaScript ở client không thể đọc được
      secure: `${process.env.NODE_ENV}` == "production", // nếu "" là http, nếu "production" là https
      sameSite: "strict", // Chỉ gửi cookie khi request từ cùng domain
      maxAge: rememberPassword ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 7 ngày hoặc 1 ngày
    });

    res.json({
      code: "success",
      message: "Đăng nhập thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("tokenAdmin");
  res.redirect(`/${pathAdmin}/account/login`);
};
