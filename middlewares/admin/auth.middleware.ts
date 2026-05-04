import { NextFunction, Request, Response } from "express";
import { pathAdmin } from "../../configs/variable.config";
import jwt, { JwtPayload } from "jsonwebtoken";
import AccountAdmin from "../../models/account-admin.model";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.tokenAdmin;
    if (!token) {
      res.redirect(`/${pathAdmin}/account/login`);
      return;
    }

    const decoded = jwt.verify(
      token,
      `${process.env.JWT_SECRET}`,
    ) as JwtPayload;
    const existAccount = await AccountAdmin.findOne({
      _id: decoded.id,
      email: decoded.email,
      deleted: false,
      status: "active",
    });

    if (!existAccount) {
      res.redirect(`/${pathAdmin}/account/login`);
      return;
    }

    res.locals.accountAdmin = {
      fullName: existAccount.fullName,
      email: existAccount.email,
      avatar: existAccount.avatar,
    };

    next();
  } catch (error) {
    console.log(error);
    res.redirect(`/${pathAdmin}/account/login`);
  }
};
