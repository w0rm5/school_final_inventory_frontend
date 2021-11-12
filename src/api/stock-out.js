import request from "@/util/request";

export function listStockOuts(data) {
  return request({
    url: "/stock-out",
    method: "post",
    data
  });
}

export function createStockOut(data) {
  return request({
    url: "/stock-out/insert",
    method: "post",
    data
  });
}

export function getStockOutById(id) {
  return request({
    url: "/stock-out/" + id,
    method: "get"
  });
}
export function getStockOutByTransNum(trans_no) {
  return request({
    url: "/stock-out/trans-no/" + trans_no,
    method: "get"
  });
}
