// Khởi tạo thư viện Notyf
var notyf = new Notyf({
  duration: 3000,
  position: { x: "right", y: "top" },
  dismissible: true,
});

const notifyData = sessionStorage.getItem("notify");
if (notifyData) {
  const { type, message } = JSON.parse(notifyData);
  if (type == "success") {
    notyf.success(message);
  } else if (type == "error") {
    notyf.error(message);
  }
  sessionStorage.removeItem("notify");
}

const drawNotify = (type, message) => {
  sessionStorage.setItem(
    "notify",
    JSON.stringify({
      type: type,
      message: message,
    }),
  );
};

// blogCreateCategoryForm
const blogCreateCategoryForm = document.querySelector(
  "#blogCreateCategoryForm",
);
if (blogCreateCategoryForm) {
  const validation = new JustValidate("#blogCreateCategoryForm");

  validation
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập tên danh mục bài viết!",
      },
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const parent = event.target.parent.value;
      const description = event.target.description.value;

      // Tạo formData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("parent", parent);
      formData.append("description", description);
      fetch(`/${pathAdmin}/blog/category/create`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            notyf.error(data.message);
          }

          if (data.code == "success") {
            drawNotify(data.code, data.message);
            window.location.reload();
          }
        });
    });
}
// End blogCreateCategoryForm
