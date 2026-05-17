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

// Khởi tạo giỏ hàng
const existCart = JSON.parse(localStorage.getItem("cart"));
if (!existCart) {
  localStorage.setItem("cart", JSON.stringify([]));
}
// Hết Khởi tạo giỏ hàng

// Khởi tạo mảng sản phẩm so sánh
const existCompareList = JSON.parse(localStorage.getItem("compare"));
if (!existCompareList) {
  localStorage.setItem("compare", JSON.stringify([]));
}
// Hết Khởi tạo mảng sản phẩm so sánh

// mini-compare-quantity
const miniCompareQuantity = () => {
  const compareList = JSON.parse(localStorage.getItem("compare"));
  const listElementMiniCompareQuantity = document.querySelectorAll(
    "[mini-compare-quantity]",
  );
  listElementMiniCompareQuantity.forEach((item) => {
    item.innerHTML = compareList.length;
  });
};
miniCompareQuantity();
// End mini-compare-quantity

// shop_details_text
const shopDetailsText = document.querySelector(".shop_details_text");
if (shopDetailsText) {
  const elementStock = shopDetailsText.querySelector(".stock");
  const elementPriceNew = shopDetailsText.querySelector(".price-new");
  const elementPriceOld = shopDetailsText.querySelector(".price-old");
  const inputQuantity = shopDetailsText.querySelector(".input-quantity");
  const buttonPlus = shopDetailsText.querySelector(".plus");
  const buttonMinus = shopDetailsText.querySelector(".minus");
  const buttonAddCart = shopDetailsText.querySelector("[button-add-cart]");
  const buttonAddCompare = shopDetailsText.querySelector(
    "[button-add-compare]",
  );

  if (inputQuantity && !inputQuantity.value) {
    inputQuantity.value = 1;
  }

  const selected = {};

  let variantSelected = null; // Biến thể đã chọn

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
            elementStock.classList.remove("out_stock");
            inputQuantity.value = 1;
            variantSelected = variantMatched;
          } else {
            elementStock.innerHTML = `Hết hàng`;
            elementStock.classList.add("out_stock");
            inputQuantity.value = 0;
            variantSelected = null;
          }

          elementPriceNew.innerHTML =
            variantMatched.priceNew.toLocaleString("vi-VN");
          elementPriceOld.innerHTML =
            variantMatched.priceOld.toLocaleString("vi-VN");

          // Gán lại số lượng tối đa được phép đặt
          inputQuantity.max = variantMatched.stock;
        }
      }
    });
  });

  // Tăng số lượng
  buttonPlus.addEventListener("click", () => {
    const quantity = parseInt(inputQuantity.value);
    const max = parseInt(inputQuantity.max);
    if (quantity < max) {
      inputQuantity.value = quantity + 1;
    }
  });

  // Giảm số lượng
  buttonMinus.addEventListener("click", () => {
    const quantity = parseInt(inputQuantity.value);
    const min = parseInt(inputQuantity.min);
    if (quantity > min) {
      inputQuantity.value = quantity - 1;
    }
  });

  /// Thêm vào giỏ hàng
  buttonAddCart.addEventListener("click", () => {
    const productId = buttonAddCart.getAttribute("product-id");
    const quantity = parseInt(inputQuantity.value);
    if (productId && quantity > 0) {
      const dataItem = {
        productId: productId,
        quantity: quantity,
        checked: true,
      };
      const cart = JSON.parse(localStorage.getItem("cart"));

      if (productVariants && productVariants.length > 0 && variantSelected) {
        dataItem.variant = variantSelected.attributeValue;

        // Tìm xem có sản phẩm trùng productId và trùng các attributeValue hay không
        const existItem = cart.find((item) => {
          if (item.productId !== dataItem.productId) {
            return false;
          }

          // So sánh toàn bộ các thuộc tính trong variant
          const oldAttrs = item.variant;
          const newAttrs = dataItem.variant;

          // Số lượng thuộc tính phải trùng
          if (oldAttrs.length !== newAttrs.length) {
            return false;
          }

          // Kiểm tra từng attrId và value
          return oldAttrs.every((attr) => {
            const match = newAttrs.find(
              (a) => a.attrId === attr.attrId && a.value === attr.value,
            );
            return match ? true : false;
          });
        });

        if (existItem) {
          existItem.quantity = dataItem.quantity;
          notyf.success("Đã cập nhật số lượng trong giỏ hàng!");
        } else {
          cart.unshift(dataItem);
          notyf.success("Đã thêm vào giỏ hàng!");
        }
      } else {
        // Tìm xem có sản phẩm trùng productId hay không
        const existItem = cart.find(
          (item) => item.productId === dataItem.productId,
        );

        if (existItem) {
          existItem.quantity = dataItem.quantity;
          notyf.success("Đã cập nhật số lượng trong giỏ hàng!");
        } else {
          cart.unshift(dataItem);
          notyf.success("Đã thêm vào giỏ hàng!");
        }
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      miniCartQuantity();
      drawCart();
    }
  });

  /// Thêm vào so sánh
  buttonAddCompare.addEventListener("click", () => {
    const productId = buttonAddCompare.getAttribute("product-id");
    if (productId) {
      const dataItem = {
        productId: productId,
      };

      const compareList = JSON.parse(localStorage.getItem("compare"));

      if (compareList.length < 5) {
        if (productVariants && productVariants.length > 0 && variantSelected) {
          dataItem.variant = variantSelected.attributeValue;

          // Tìm xem có sản phẩm trùng productId và trùng các attributeValue hay không
          const existItem = compareList.find((item) => {
            if (item.productId !== dataItem.productId) {
              return false;
            }

            // So sánh toàn bộ các thuộc tính trong variant
            const oldAttrs = item.variant;
            const newAttrs = dataItem.variant;

            // Số lượng thuộc tính phải trùng
            if (oldAttrs.length !== newAttrs.length) {
              return false;
            }

            // Kiểm tra từng attrId và value
            return oldAttrs.every((attr) => {
              const match = newAttrs.find(
                (a) => a.attrId === attr.attrId && a.value === attr.value,
              );
              return match ? true : false;
            });
          });

          if (existItem) {
            notyf.success("Sản phẩm đã tồn tại trong trang so sánh!");
          } else {
            compareList.push(dataItem);
            notyf.success("Đã thêm vào trang so sánh!");
          }
        } else {
          // Tìm xem có sản phẩm trùng productId hay không
          const existItem = compareList.find(
            (item) => item.productId === dataItem.productId,
          );

          if (existItem) {
            notyf.success("Sản phẩm đã tồn tại trong trang so sánh!");
          } else {
            compareList.push(dataItem);
            notyf.success("Đã thêm vào trang so sánh!");
          }
        }

        localStorage.setItem("compare", JSON.stringify(compareList));
      } else {
        notyf.error("Số lượng sản phẩm so sánh đã đủ!");
      }
    }
  });
}
// End shop_details_text

// mini-cart-quantity
const miniCartQuantity = () => {
  const cart = JSON.parse(localStorage.getItem("cart"));
  const listElementMiniCartQuantity = document.querySelectorAll(
    "[mini-cart-quantity]",
  );
  listElementMiniCartQuantity.forEach((item) => {
    item.innerHTML = cart.length;
  });
};
miniCartQuantity();
// End mini-cart-quantity

// Xóa item trong giỏ hàng
const eventRemoveItemInCart = () => {
  const listButtonRemoveItem = document.querySelectorAll(
    "[button-remove-item]",
  );
  listButtonRemoveItem.forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest("[cart-item]");
      const productId = item.getAttribute("product-id");
      let variant = item.getAttribute("variant");
      console.log(productId);
      console.log(variant);

      if (variant) {
        variant = JSON.parse(decodeURIComponent(variant));
      }

      let cart = JSON.parse(localStorage.getItem("cart"));
      cart = cart.filter((cartItem) => {
        // So sánh productId
        const sameProduct = cartItem.productId == productId;

        // So sánh giống variant
        const variantItemInCart = cartItem.variant
          ? JSON.stringify(cartItem.variant)
          : "[]";
        const variantItemRemove = variant ? JSON.stringify(variant) : "[]";
        const sameVariant = variantItemInCart == variantItemRemove;

        return !(sameProduct && sameVariant);
      });

      localStorage.setItem("cart", JSON.stringify(cart));
      drawCart();
      miniCartQuantity();
    });
  });
};
// Hết Xóa item trong giỏ hàng

// Check item trong giỏ hàng
const eventCheckItemInCart = () => {
  const listInputCheckItem = document.querySelectorAll(
    "[cart-table] .cart_page_checkbox input",
  );
  listInputCheckItem.forEach((input) => {
    input.addEventListener("change", () => {
      const checked = input.checked;
      const item = input.closest("[cart-item]");
      const productId = item.getAttribute("product-id");
      let variant = item.getAttribute("variant");

      if (variant) {
        variant = JSON.parse(decodeURIComponent(variant));
      }

      const cart = JSON.parse(localStorage.getItem("cart"));
      const itemUpdate = cart.find((cartItem) => {
        // So sánh productId
        const sameProduct = cartItem.productId == productId;

        // So sánh giống variant
        const variantItemInCart = cartItem.variant
          ? JSON.stringify(cartItem.variant)
          : "[]";
        const variantItemRemove = variant ? JSON.stringify(variant) : "[]";
        const sameVariant = variantItemInCart == variantItemRemove;

        return sameProduct && sameVariant;
      });

      itemUpdate.checked = checked;
      localStorage.setItem("cart", JSON.stringify(cart));
      drawCart();
    });
  });
};
// Hết Check item trong giỏ hàng

// Cập nhập số lượng item trong giỏ hàng
const eventQuantityInCart = () => {
  const listBoxQuantity = document.querySelectorAll(
    "[cart-table] .cart_page_quantity",
  );
  listBoxQuantity.forEach((box) => {
    const inputQuantity = box.querySelector("input");
    const buttonPlus = box.querySelector(".plus");
    const buttonMinus = box.querySelector(".minus");

    const item = box.closest("[cart-item]");
    const productId = item.getAttribute("product-id");
    let variant = item.getAttribute("variant");
    if (variant) {
      variant = JSON.parse(decodeURIComponent(variant));
    }

    const cart = JSON.parse(localStorage.getItem("cart"));
    const itemUpdate = cart.find((cartItem) => {
      const sameProduct = cartItem.productId == productId;
      const variantItemInCart = cartItem.variant
        ? JSON.stringify(cartItem.variant)
        : "[]";
      const variantItemRemove = variant ? JSON.stringify(variant) : "[]";
      const sameVariant = variantItemInCart == variantItemRemove;
      return sameProduct && sameVariant;
    });

    if (itemUpdate) {
      // Nếu số lượng không đủ thì in ra thông báo
      const quantity = parseInt(inputQuantity.value);
      const max = parseInt(inputQuantity.max);
      if (quantity > max) {
        const itemAlert = document.createElement("div");
        itemAlert.style.color = "red";
        itemAlert.style.fontSize = "12px";
        itemAlert.innerHTML = `Chỉ còn ${max} sản phẩm`;
        box.appendChild(itemAlert);
      }

      // Tăng số lượng
      buttonPlus.addEventListener("click", () => {
        const quantity = parseInt(inputQuantity.value);
        const max = parseInt(inputQuantity.max);
        if (quantity < max) {
          inputQuantity.value = quantity + 1;
          itemUpdate.quantity = parseInt(inputQuantity.value);
          localStorage.setItem("cart", JSON.stringify(cart));
          drawCart();
        }
      });

      // Giam số lượng
      buttonMinus.addEventListener("click", () => {
        const quantity = parseInt(inputQuantity.value);
        if (quantity > 1) {
          inputQuantity.value = quantity - 1;
          itemUpdate.quantity = parseInt(inputQuantity.value);
          localStorage.setItem("cart", JSON.stringify(cart));
          drawCart();
        }
      });
    }
  });
};
// Hết Cập nhập số lượng item trong giỏ hàng

// Vẽ giỏ hàng
const drawCart = () => {
  const cart = JSON.parse(localStorage.getItem("cart"));
  if (cart.length > 0) {
    fetch(`/cart/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cart),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code == "error") {
          localStorage.setItem("cart", JSON.stringify([]));
        }

        if (data.code == "success") {
          localStorage.setItem("cart", JSON.stringify(data.cart));

          let subTotal = 0;
          let htmlMiniCart = "";
          let htmlCartTable = "";
          let htmlCartSummary = "";

          data.cart.forEach((item) => {
            const { detail } = item;
            let priceOld = 0;
            let priceNew = 0;
            let stock = 0;
            let htmlVariant = "";
            let htmlVariantSummary = "";

            if (item.variant) {
              // Tìm đúng biến thể khớp trong danh sách
              const variantMatched = detail.variants.find((variantItem) => {
                return variantItem.attributeValue.every((attr) => {
                  const selected = item.variant.find(
                    (v) => v.attrId === attr.attrId,
                  );
                  return selected && selected.value === attr.value;
                });
              });
              priceOld = variantMatched.priceOld;
              priceNew = variantMatched.priceNew;
              stock = variantMatched.stock;

              detail.attributeList.forEach((attr) => {
                const variant = item.variant.find((v) => v.attrId === attr._id);
                htmlVariant += `
                  <span>
                    <b>${attr.name}:</b> ${variant.label}
                  </span>
                `;

                htmlVariantSummary += `
                  <p>${attr.name}: ${variant.label}</p>
                `;
              });
            } else {
              priceOld = detail.priceOld;
              priceNew = detail.priceNew;
              stock = detail.stock;
            }

            if (item.checked) {
              subTotal += priceNew * item.quantity;
            }

            htmlMiniCart += `
              <li
                cart-item
                product-id=${item.productId}
                ${item.variant ? `variant="${encodeURIComponent(JSON.stringify(item.variant))}"` : ""}
              >
                <a class="cart_img" href="/product/detail/${detail.slug}">
                  <img class="img-fluid w-100" alt="${detail.name}" src="${domainCDN}${detail.images[0]}">
                </a>
                <div class="cart_text">
                  <a class="cart_title" href="/product/detail/${detail.slug}">
                    ${detail.name}
                  </a>
                  <p>
                    ${priceNew.toLocaleString("vi-VN")}đ
                    <del>${priceOld.toLocaleString("vi-VN")}đ</del>
                  </p>
                  <span>
                    <b>Số lượng:</b> ${item.quantity}
                  </span>
                  ${htmlVariant}
                </div>
                <a class="del_icon" href="javascript:;" button-remove-item>
                  <i class="fal fa-times" aria-hidden="true"></i>
                </a>
              </li>
            `;

            htmlCartTable += `
            <tr
                cart-item
                product-id=${item.productId}
                ${item.variant ? `variant="${encodeURIComponent(JSON.stringify(item.variant))}"` : ""}
              >
                <td class="cart_page_checkbox">
                  <div class="form-check">
                    <input class="form-check-input" value="" type="checkbox" ${item.checked ? "checked" : ""}/>
                  </div>
                </td>
                <td class="cart_page_img">
                  <div class="img">
                    <img class="img-fluid w-100" alt="${detail.name}" src="${domainCDN}${detail.images[0]}" />
                  </div>
                </td>
                <td class="cart_page_details">
                  <a class="title" href="/product/detail/${detail.slug}">${detail.name}</a>
                  <p>
                    ${priceNew.toLocaleString("vi-VN")}đ
                    <del>${priceOld.toLocaleString("vi-VN")}đ</del>
                  </p>
                  ${htmlVariant}
                </td>
                <td class="cart_page_price">
                  <h3>${priceNew.toLocaleString("vi-VN")}đ</h3>
                </td>
                <td class="cart_page_quantity">
                  <div class="details_qty_input">
                    <button class="minus">
                      <i class="fal fa-minus" aria-hidden="true"></i>
                    </button>
                    <input value="${item.quantity}" type="number" min="1" max="${stock}" readonly />
                    <button class="plus">
                      <i class="fal fa-plus" aria-hidden="true"></i>
                    </button>
                  </div>
                </td>
                <td class="cart_page_total">
                  <h3>${(priceNew * item.quantity).toLocaleString("vi-VN")}đ</h3>
                </td>
                <td class="cart_page_action">
                  <a href="javascript:;" button-remove-item>
                    <i class="fal fa-times" aria-hidden="true"></i> Xóa
                  </a>
                </td>
            </tr>
            `;

            if (item.checked) {
              htmlCartSummary += `
              <li>
                <a class="img" href="/product/detail/${detail.slug}">
                  <img class="img-fluid w-100" alt="${detail.name}" src="${domainCDN}${detail.images[0]}">
                </a>
                <div class="text">
                  <a class="title" href="/product/detail/${detail.slug}">
                    ${detail.name}
                  </a>
                  <p>${priceNew.toLocaleString("vi-VN")}đ × ${item.quantity}</p>
                  ${htmlVariantSummary}
                </div>
              </li>
            `;
            }
          });

          let discount = 0;
          let total = subTotal - discount;

          const ulMiniCart = miniCart.querySelector(".offcanvas-body ul");
          ulMiniCart.innerHTML = htmlMiniCart;

          const cartTable = document.querySelector("[cart-table]");
          if (cartTable) {
            cartTable.innerHTML = htmlCartTable;
          }

          const cartSummary = document.querySelector("[cart-summary]");
          if (cartSummary) {
            cartSummary.innerHTML = htmlCartSummary;
          }

          const listElementSubTotal = document.querySelectorAll("[sub-total]");
          listElementSubTotal.forEach((elementSubTotal) => {
            elementSubTotal.innerHTML = subTotal.toLocaleString("vi-VN");
          });

          const elementDiscount = document.querySelector("[discount]");
          if (elementDiscount) {
            elementDiscount.innerHTML = discount.toLocaleString("vi-VN");
          }

          const elementTotal = document.querySelector("[total]");
          if (elementTotal) {
            elementTotal.innerHTML = total.toLocaleString("vi-VN");
          }

          eventRemoveItemInCart();

          eventCheckItemInCart();

          eventQuantityInCart();
        }
      });
  } else {
    const ulMiniCart = miniCart.querySelector(".offcanvas-body ul");
    ulMiniCart.innerHTML = "Giỏ hàng trống.";

    const cartTable = document.querySelector("[cart-table]");
    if (cartTable) {
      cartTable.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">
            Giỏ hàng trống.
          </td>
        </tr>
      `;
    }

    const cartSummary = document.querySelector("[cart-summary]");
    if (cartSummary) {
      cartSummary.innerHTML = "";
    }

    const listElementSubTotal = document.querySelectorAll("[sub-total]");
    listElementSubTotal.forEach((elementSubTotal) => {
      elementSubTotal.innerHTML = 0;
    });
  }
};
// Hết Vẽ giỏ hàng

// Giỏ hàng
const miniCart = document.querySelector("[mini-cart]");
if (miniCart) {
  drawCart();
}
// Hết Giỏ hàng

// Input Check All
const inputCartCheckAll = document.querySelector("[input-cart-check-all]");
if (inputCartCheckAll) {
  inputCartCheckAll.addEventListener("change", () => {
    const checked = inputCartCheckAll.checked;
    const cart = JSON.parse(localStorage.getItem("cart"));
    cart.forEach((item) => (item.checked = checked));
    localStorage.setItem("cart", JSON.stringify(cart));
    drawCart();
  });
}
// End Input Check All
