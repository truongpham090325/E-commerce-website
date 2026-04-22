import express from "express";
import path from "path";
import adminRoutes from "./routes/admin/index.route";
import clientRoutes from "./routes/client/index.route";
import { pathAdmin } from "./configs/variable.config";
const app = express();
const port = 3000;

// Thiết lập thư mục views và view engine Pug
app.set("views", path.join(__dirname, "views")); // Thư mục chứa file Pug
app.set("view engine", "pug"); // Thiết lập Pug làm view engine

// Thiết lập thư mục chứa file tĩnh
app.use(express.static(path.join(__dirname, "public")));

// Tạo biến toàn cục trong file Pug
app.locals.pathAdmin = pathAdmin;

app.use(`/${pathAdmin}`, adminRoutes);
app.use("/", clientRoutes);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
