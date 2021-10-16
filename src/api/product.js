import request from "@/util/request";

export function listProducts(data) {
  return request({
    url: "/product",
    method: "post",
    data
  });
}

export function getProductByName(data) {
  return request({
    url: "/product/name",
    method: "post",
    data
  });
}

export function getProductById(id) {
  return request({
    url: "/product/" + id,
    method: "get"
  });
}

export function upsertProduct(data) {
  return request({
    url: "/product/upsert",
    method: "post",
    data
  });
}

export function updateProductSalePrice(id, data) {
  return request({
    url: "/product/" + id + "/update-sale-price",
    method: "put",
    data
  });
}