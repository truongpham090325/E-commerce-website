import { Request, Response, NextFunction } from "express";
import Setting from "../../models/setting.model";

export const assetVersion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const settingAssetVersion = await Setting.findOne({
    key: "assetVersion",
  });
  const assetVersion = settingAssetVersion ? settingAssetVersion.data : "";
  res.locals.assetVersion = assetVersion;

  next();
};
