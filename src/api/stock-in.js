import request from "@/util/request";

export function listStockIns(data) {
  return request({
    url: "/stock-in",
    method: "post",
    data
  });
}