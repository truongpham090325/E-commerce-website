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
      googleId: "",
      facebookId: "",
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
      googleId: "",
      facebookId: "",
    });

    if (existPhone) {
      res.json({
        code: "error",
        message: "Số điện thoại đã được sử dụng!",
      });
      return;
    }

    req.body.status = "active";

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

export const login = (req: Request, res: Response) => {
  res.render("client/pages/login", {
    pageTitle: "Đăng nhập tài khoản",
  });
};

export const loginPost = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberPassword } = req.body;

    const existAccount = await AccountUser.findOne({
      email: email,
      googleId: "",
      facebookId: "",
    });

    if (!existAccount) {
      res.json({
        code: "error",
        message: "Tài khoản không tồn tại!",
      });
      return;
    }

    const isPassword = await bcrypt.compare(
      password,
      `${existAccount.password}`,
    );
    if (!isPassword) {
      res.json({
        code: "error",
        message: "Mật khâu không chính xác!",
      });
      return;
    }

    if (existAccount.status != "active") {
      res.json({
        code: "error",
        message: "Tài khoản không hoạt động!",
      });
      return;
    }

    const tokenUser = jwt.sign(
      {
        id: existAccount.id,
        email: existAccount.email,
      },
      `${process.env.JWT_SECRET}`,
      {
        expiresIn: rememberPassword ? "7d" : "3d",
      },
    );

    res.cookie("tokenUser", tokenUser, {
      httpOnly: true,
      maxAge: rememberPassword
        ? 7 * 24 * 60 * 60 * 1000
        : 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
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

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("tokenUser");
  res.redirect("/auth/login");
};

export const callbackGoogle = async (req: Request, res: Response) => {
  const user = req.user as any;

  const tokenUser = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    `${process.env.JWT_SECRET}`,
    {
      expiresIn: "1d",
    },
  );

  res.cookie("tokenUser", tokenUser, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    sameSite: "lax",
  });

  res.redirect("/");
};

export const callbackFacebook = async (req: Request, res: Response) => {
  const user = req.user as any;

  const tokenUser = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    `${process.env.JWT_SECRET}`,
    {
      expiresIn: "1d",
    },
  );

  res.cookie("tokenUser", tokenUser, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    sameSite: "lax",
  });

  res.redirect("/");
};
