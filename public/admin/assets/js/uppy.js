import {
  Uppy,
  Dashboard,
  XHRUpload,
} from "https://releases.transloadit.com/uppy/v5.2.1/uppy.min.mjs";
const uppy = new Uppy();

uppy.use(Dashboard, {
  target: "#uppy-upload",
  inline: true,
  width: "100%",
});

uppy.use(XHRUpload, {
  endpoint: `/${pathAdmin}/file-manager/upload`, // backend nhận được file tại đường dẫn này
  fieldName: "files",
  bundle: true,
});

uppy.on("complete", (result) => {
  if (result.successful.length > 0) {
    drawNotify("success", `Upload thành công ${result.successful.length} file`);
  }
  if (result.failed.length > 0) {
    drawNotify("success", `Upload thất bại ${result.successful.length} file`);
  }
  window.location.reload();
});
