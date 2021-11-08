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
  
  export function getStockOut(id) {
    return request({
      url: "/stock-out/" + id,
      method: "get"
    });
  }