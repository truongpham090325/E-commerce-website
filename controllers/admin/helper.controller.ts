import { Request, Response } from "express";
import slugify from "slugify";
import { generateRandomString } from "../../helpers/generate.helper";
import mongoose from "mongoose";

export const generateSlug = async (req: Request, res: Response) => {
  try {
    const { string, modelName } = req.body;
    let slug = slugify(string, {
      lower: true, // Chữ thường
      strict: true, // Loại bỏ ký tự đặc biệt
    });

    const Model = mongoose.model(modelName);

    const existSlug = await Model.findOne({
      slug: slug,
    });

    if (existSlug) {
      const stringRandom = generateRandomString(4);
      slug = `${slug}-${stringRandom}`;
    }

    res.json({
      code: "success",
      message: "Tạo đường dẫn thành công!",
      slug: slug,
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Tạo đường dẫn thất bại!",
    });
  }
};
