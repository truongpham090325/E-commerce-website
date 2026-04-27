// Khởi tạo TinyMCE
const initialTinyMCE = () => {
  tinymce.init({
    selector: "[textarea-mce]",
    plugins:
      "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
    toolbar:
      "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",
  });
};
initialTinyMCE();
// Hết Khởi tạo TinyMCE

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
    .addField("#slug", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập tên đường dẫn!",
      },
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const slug = event.target.slug.value;
      const parent = event.target.parent.value;
      const status = event.target.status.value;
      const description = tinymce.get("description").getContent();

      // Tạo formData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("slug", slug);
      formData.append("parent", parent);
      formData.append("status", status);
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

// blogEditCategoryForm
const blogEditCategoryForm = document.querySelector("#blogEditCategoryForm");
if (blogEditCategoryForm) {
  const validation = new JustValidate("#blogEditCategoryForm");

  validation
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập tên danh mục bài viết!",
      },
    ])
    .addField("#slug", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập tên đường dẫn!",
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const name = event.target.name.value;
      const slug = event.target.slug.value;
      const parent = event.target.parent.value;
      const status = event.target.status.value;
      const description = tinymce.get("description").getContent();

      // Tạo formData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("slug", slug);
      formData.append("parent", parent);
      formData.append("status", status);
      formData.append("description", description);

      fetch(`/${pathAdmin}/blog/category/edit/${id}`, {
        method: "PATCH",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            notyf.error(data.message);
          }

          if (data.code == "success") {
            notyf.success(data.message);
          }
        });
    });
}
// End blogEditCategoryForm

// btn-generate-slug
const btnGenerateSlug = document.querySelector("[btn-generate-slug]");
if (btnGenerateSlug) {
  btnGenerateSlug.addEventListener("click", () => {
    const modelName = btnGenerateSlug.getAttribute("btn-generate-slug");
    const from = btnGenerateSlug.getAttribute("from");
    const to = btnGenerateSlug.getAttribute("to");
    const string = document.querySelector(`[name="${from}"]`).value;

    const dataFinal = {
      string: string,
      modelName: modelName,
    };

    fetch(`/${pathAdmin}/helper/generate-slug`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(dataFinal),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code == "error") {
          notyf.error(data.message);
        }

        if (data.code == "success") {
          document.querySelector(`[name="${to}"]`).value = data.slug;
        }
      });
  });
}
// End btn-generate-slug

// button-api
const listButtonApi = document.querySelectorAll("[button-api]");
if (listButtonApi.length > 0) {
  listButtonApi.forEach((button) => {
    button.addEventListener("click", () => {
      const method = button.getAttribute("data-method");
      const api = button.getAttribute("data-api");

      if (method == "DELETE") {
        Swal.fire({
          title: "Bạn có chắc muốn xóa không?",
          text: "Hành động không thể khôi phục!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "yellow",
          cancelButtonColor: "red",
          confirmButtonText: "Đồng ý!",
          cancelButtonText: "Hủy bỏ",
        }).then((result) => {
          if (result.isConfirmed) {
            fetch(api, {
              method: method,
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
          }
        });
      } else {
        fetch(api, {
          method: method || "GET",
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
      }
    });
  });
}
// End button-api

// form-search
const formSearch = document.querySelector("[form-search]");
if (formSearch) {
  const url = new URL(window.location.href);

  formSearch.addEventListener("submit", (event) => {
    event.preventDefault();

    const value = event.target.keyword.value;
    if (value) {
      url.searchParams.set("keyword", value);
    } else {
      url.searchParams.delete("keyword");
    }
    window.location.href = url.href;
  });

  // Hiển thị giá trị mặc định
  const valueCurrent = url.searchParams.get("keyword");
  if (valueCurrent) {
    formSearch.keyword.value = valueCurrent;
  }
}
// End form-search

// pagination
const pagination = document.querySelector("[pagination]");
if (pagination) {
  const url = new URL(window.location.href);
  pagination.addEventListener("change", () => {
    const value = pagination.value;
    if (value) {
      url.searchParams.set("page", value);
    } else {
      url.searchParams.delete("page");
    }
    window.location.href = url.href;
  });

  // Hiển thị giá trị mặc định
  const valueCurrent = url.searchParams.get("page");
  if (valueCurrent) {
    pagination.value = valueCurrent;
  }
}
// End pagination

// button-copy
const listButtonCopy = document.querySelectorAll("[button-copy]");
if (listButtonCopy.length > 0) {
  listButtonCopy.forEach((button) => {
    button.addEventListener("click", () => {
      const content = button.getAttribute("data-content");
      window.navigator.clipboard.writeText(content);
      notyf.success("Đã copy!");
    });
  });
}
// End button-copy

// modalPreviewFile
const modalPreviewFile = document.querySelector("#modalPreviewFile");
if (modalPreviewFile) {
  const innerPreview = modalPreviewFile.querySelector(".inner-preview");

  // Sự kiện đóng modal
  modalPreviewFile.addEventListener("hide.bs.modal", (event) => {
    innerPreview.innerHTML = "";
  });

  // Sự kiện mở modal
  modalPreviewFile.addEventListener("show.bs.modal", (event) => {
    const buttonClicked = event.relatedTarget;
    const file = buttonClicked.getAttribute("data-file");
    const mimetype = buttonClicked.getAttribute("data-mimetype");

    // Hiển thị file theo đúng định dạng
    if (mimetype.includes("image")) {
      innerPreview.innerHTML = `
        <img src="${file}" width="100%" />
      `;
    } else if (mimetype.includes("audio")) {
      innerPreview.innerHTML = `
        <audio controls width="100%">
          <source src="${file}"></source/>
        </audio>
      `;
    } else if (mimetype.includes("video")) {
      innerPreview.innerHTML = `
        <video controls width="100%">
          <source src="${file}"></source/>
        </video>
      `;
    } else if (mimetype.includes("application")) {
      innerPreview.innerHTML = `
        <iframe src=${file} width="100%" height="500px"></iframe>
      `;
    }
  });
}
// End modalPreviewFile
