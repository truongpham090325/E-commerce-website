import axios from "axios";
import { Request, Response } from "express";
import FormData from "form-data";
import Media from "../../models/media.model";

export const fileManager = (req: Request, res: Response) => {
  res.render("admin/pages/file-manager", {
    pageTitle: "Quản lý file",
  });
};

export const uploadPost = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });

    const response = await axios.post(
      "http://localhost:5000/file-manager/upload",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    if (response.data.code == "success") {
      await Media.insertMany(response.data.saveLinks);
      res.json({
        code: "success",
        message: "Upload thành công!",
      });
    } else {
      res.json({
        code: "error",
        message: "Upload thất bại!",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Upload thất bại!",
    });
  }
};
