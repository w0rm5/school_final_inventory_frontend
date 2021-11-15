import request from "@/util/request";

export function getStockInReports(data) {
  return request({
    url: "/report/stock-in",
    method: "post",
    responseType: "blob",
    data
  });
}

export function getStockOutReports(data) {
  return request({
    url: "/report/stock-out",
    method: "post",
    responseType: "blob",
    data
  });
}