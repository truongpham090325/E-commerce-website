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

  search.addEventListener("submit", (event) => {
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
