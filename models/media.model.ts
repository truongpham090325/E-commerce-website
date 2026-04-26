import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    forder: String,
    fileName: String,
    minitype: String,
    size: Number,
  },
  {
    timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
  },
);

const Media = mongoose.model("Media", schema, "media");

export default Media;
