import request from "@/util/request";

export function listCategory() {
  return request({
    url: "/category",
    method: "get"
  });
}

export function getCategoryById(id) {
  return request({
    url: "/category/" + id,
    method: "get"
  });
}

export function upsertCategory(data) {
  return request({
    url: "/category",
    method: "post",
    data
  });
}

export function deleteCategoryById(id) {
  return request({
    url: "/category/" + id,
    method: "delete"
  });
}
