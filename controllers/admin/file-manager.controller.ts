import axios from "axios";
import { Request, Response } from "express";
import FormData from "form-data";
import Media from "../../models/media.model";
import moment from "moment";
import { formatFileSize } from "../../helpers/format.helper";

export const fileManager = async (req: Request, res: Response) => {
  const find = {};

  // Phân trang
  let page = 1;
  const limitItems = 10;
  if (req.query.page && parseInt(`${req.query.page}`) > 0) {
    page = parseInt(`${req.query.page}`);
  }
  const totalRecord = await Media.countDocuments(find);
  const totalPage = Math.ceil(totalRecord / limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    totalRecord: totalRecord,
    totalPage: totalPage,
    skip: skip,
  };
  // Hết Phân trang

  const listFile: any = await Media.find(find)
    .sort({
      createdAt: "desc",
    })
    .limit(limitItems)
    .skip(skip);

  for (const item of listFile) {
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.sizeFormat = formatFileSize(item.size);
  }

  res.render("admin/pages/file-manager", {
    pageTitle: "Quản lý file",
    listFile: listFile,
    pagination: pagination,
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

export const changeFileNamePatch = async (req: Request, res: Response) => {
  try {
    const { fileId, fileName } = req.body;

    if (!fileId || !fileName) {
      res.json({
        code: "error",
        message: "Thiếu thông tin cần thiết!",
      });
      return;
    }

    const record = await Media.findOne({
      _id: fileId,
    });

    if (!record) {
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!",
      });
      return;
    }

    const formData = new FormData();
    formData.append("folder", record.folder);
    formData.append("oldFileName", record.fileName);
    formData.append("newFileName", fileName);

    const response = await axios.patch(
      "http://localhost:5000/file-manager/change-file-name",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    if (response.data.code == "error") {
      res.json({
        code: "error",
        message: response.data.message,
      });
      return;
    }

    // Cập nhập lại trường fileName trong CSDL
    await Media.updateOne(
      {
        _id: fileId,
      },
      {
        fileName: fileName,
      },
    );

    res.json({
      code: "success",
      message: "Đã đổi tên file!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};
