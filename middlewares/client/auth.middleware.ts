import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import AccountUser from "../../models/account-user.model";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.tokenUser;

  if (token) {
    const decoded = jwt.verify(
      token,
      `${process.env.JWT_SECRET}`,
    ) as jwt.JwtPayload;

    const existAccount = await AccountUser.findOne({
      _id: decoded.id,
      email: decoded.email,
      status: "active",
      deleted: false,
    });

    if (existAccount) {
      res.locals.accountUser = {
        id: existAccount.id,
        email: existAccount.email,
        fullName: existAccount.fullName,
        phone: existAccount.phone,
      };
    }
  }

  next();
};
