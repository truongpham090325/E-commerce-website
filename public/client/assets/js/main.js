// pagination
const pagination = document.querySelector(".pagination");
if (pagination) {
  const url = new URL(window.location.href);

  const listItem = pagination.querySelectorAll(".page-item [page]");
  listItem.forEach((item) => {
    item.addEventListener("click", () => {
      const value = item.getAttribute("page");
      if (value) {
        url.searchParams.set("page", value);
      } else {
        url.searchParams.delete("page");
      }
      window.location.href = url.href;
    });
  });
}
// End pagination

// formSearch
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
}
// End formSearch

// button-share
const listButtonShare = document.querySelectorAll("[button-share]");
if (listButtonShare.length > 0) {
  listButtonShare.forEach((button) => {
    button.href = button.href + window.location.href;
  });
}
// End button-share

// filter-product-status
const listFilterProductStatus = document.querySelectorAll(
  "[filter-product-status]",
);
if (listFilterProductStatus.length > 0) {
  const url = new URL(window.location.href);

  listFilterProductStatus.forEach((input) => {
    const name = input.value;

    input.addEventListener("change", () => {
      const value = input.checked;

      if (value) {
        url.searchParams.set(name, value);
      } else {
        url.searchParams.delete(name);
      }
      window.location.href = url.href;
    });

    // Hiển thị giá trị mặc định
    const valueCurrent = url.searchParams.get(name);
    if (valueCurrent) {
      input.checked = valueCurrent;
    }
  });
}
// End filter-product-status

// button-slug
const listButtonSlug = document.querySelectorAll("[button-slug]");
if (listButtonSlug.length > 0) {
  const url = new URL(window.location.href);

  listButtonSlug.forEach((button) => {
    button.addEventListener("click", () => {
      const slug = button.getAttribute("button-slug");
      if (slug) {
        url.pathname = `/product/category/${slug}`;
        window.location.href = url.href;
      }
    });
  });
}
// End button-slug

// filter-attribute
const listFilterAttribute = document.querySelectorAll("[filter-attribute]");
if (listFilterAttribute.length > 0) {
  const url = new URL(window.location.href);

  listFilterAttribute.forEach((filterAttribute) => {
    const id = filterAttribute.getAttribute("filter-attribute");
    const listInput = filterAttribute.querySelectorAll(
      'input[type="checkbox"]',
    );

    listInput.forEach((input) => {
      input.addEventListener("change", () => {
        const listInputChecked = filterAttribute.querySelectorAll(
          'input[type="checkbox"]:checked',
        );
        const listValue = [];
        listInputChecked.forEach((inputChecked) => {
          listValue.push(inputChecked.value);
        });

        if (listInputChecked.length > 0) {
          url.searchParams.set(`attribute_${id}`, listValue.join(","));
        } else {
          url.searchParams.delete(`attribute_${id}`);
        }
        window.location.href = url.href;
      });
    });

    // Hiển thị giá trị mặc định
    const listhValueCurrent = url.searchParams.get(`attribute_${id}`);
    if (listhValueCurrent) {
      const listValue = listhValueCurrent.split(",");
      listInput.forEach((input) => {
        if (listValue.includes(input.value)) {
          input.checked = true;
        }
      });
    }
  });
}
// End filter-attribute

// form-search-product
const formSearchProduct = document.querySelector("[form-search-product]");
if (formSearchProduct) {
  const url = new URL(window.location.href);

  // Hiển thị giá trị mặc định
  const categoryCurrent = url.pathname.split("/").pop();
  if (categoryCurrent && categoryCurrent != "category") {
    formSearchProduct.category.value = categoryCurrent;
  }

  formSearchProduct.addEventListener("submit", (event) => {
    event.preventDefault();

    const category = event.target.category.value;
    const keyword = event.target.keyword.value;

    if (category) {
      url.pathname = `/product/category/${category}`;
    } else {
      url.pathname = `/product/category`;
    }

    url.searchParams.delete("category");

    if (keyword) {
      url.searchParams.set("keyword", keyword);
    } else {
      url.searchParams.delete("keyword");
    }

    window.location.href = url.href;
  });

  // Tìm kiếm bằng giọng nói
  const buttonVoice = document.querySelector("[button-voice]");
  if (buttonVoice) {
    buttonVoice.addEventListener("click", () => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      const voice = new SpeechRecognition();
      voice.lang = "vi-VN";
      voice.start();

      voice.onresult = (event) => {
        const value = event.results[0][0].transcript;
        if (value) {
          formSearchProduct.keyword.value = value;
          formSearchProduct.requestSubmit();
        }
      };
    });
  }
  // Hết tìm kiếm bằng giọng nói
}
// End form-search-product
