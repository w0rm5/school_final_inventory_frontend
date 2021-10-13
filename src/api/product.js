import request from "@/util/request";

export function listProducts(data) {
  return request({
    url: "/product",
    method: "post",
    data
  });
}
