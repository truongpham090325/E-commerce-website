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

// suggest product
const input = formSearchProduct.querySelector("input[name='keyword']");
const boxSuggest = formSearchProduct.querySelector(".inner-suggest");
const boxSuggestLisst = formSearchProduct.querySelector(".inner-list");
let timeout;

input.addEventListener("input", () => {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    const keyword = input.value;
    if (keyword) {
      fetch(`/product/suggest?keyword=${keyword}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "success") {
            const htmls = data.list.map((item) => {
              return `
                <a class="inner-item" href="/product/detail/${item.slug}">
                  <img class="inner-image" src="${domainCDN}${item.images[0]}">
                  <div class="inner-info" bis_skin_checked="1">
                    <div class="inner-name" bis_skin_checked="1">
                      ${item.name}
                    </div>
                    <div class="inner-prices" bis_skin_checked="1">
                      <div class="inner-price-new" bis_skin_checked="1">${item.priceNew.toLocaleString("vi-VN")}đ</div>
                      <div class="inner-price-old" bis_skin_checked="1">${item.priceOld.toLocaleString("vi-VN")}đ</div>
                    </div>
                  </div>
                </a>
              `;
            });

            boxSuggestLisst.innerHTML = htmls.join("");
            if (data.list.length > 0) {
              boxSuggest.style.display = "block";
            } else {
              boxSuggest.style.display = "none";
            }
          }
        });
    } else {
      boxSuggest.style.display = "none";
    }
  }, 500);
});
// End suggest product

// shop_details_text
const shopDetailsText = document.querySelector(".shop_details_text");
if (shopDetailsText) {
  const elementStock = shopDetailsText.querySelector(".stock");
  const elementPriceNew = shopDetailsText.querySelector(".price-new");
  const elementPriceOld = shopDetailsText.querySelector(".price-old");

  const selected = {};

  const listElementLiVariant = shopDetailsText.querySelectorAll(
    ".details_single_variant li",
  );

  listElementLiVariant.forEach((li) => {
    li.addEventListener("click", () => {
      const attributeId = li.getAttribute("attribute-id");
      const variant = li.getAttribute("variant");

      // Xóa class active cho item cũ
      li.closest("ul")
        .querySelectorAll("li")
        .forEach((li) => li.classList.remove("active"));

      // Thêm class active cho thuộc tính đã chọn
      li.classList.add("active");

      // Lưu lựa chọn
      selected[attributeId] = variant;

      // Kiểm tra xem đã chọn đủ thuộc tính chưa
      const selectedValues = Object.values(selected);
      if (selectedValues.length > 0) {
        // Lọc variant có đủ attributeValue trùng khớp
        const variantMatched = productVariants.find((variantItem) => {
          return variantItem.attributeValue.every(
            (attr) => selected[attr.attrId] == attr.value,
          );
        });

        if (variantMatched) {
          if (variantMatched.stock > 0) {
            elementStock.innerHTML = `Còn hàng (${variantMatched.stock})`;
          } else {
            elementStock.innerHTML = `Hết hàng`;
            elementStock.classList.add("out_stock");
          }

          elementPriceNew.innerHTML =
            variantMatched.priceNew.toLocaleString("vi-VN");
          elementPriceOld.innerHTML =
            variantMatched.priceOld.toLocaleString("vi-VN");
        }
      }
    });
  });
}
// End shop_details_text
