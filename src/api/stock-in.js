import request from "@/util/request";

export function listStockIns(data) {
  return request({
    url: "/stock-in",
    method: "post",
    data
  });
}

export function createStockIn(data) {
  return request({
    url: "/stock-in/insert",
    method: "post",
    data
  });
}

export function getStockIn(id) {
  return request({
    url: "/stock-in/" + id,
    method: "get"
  });
}