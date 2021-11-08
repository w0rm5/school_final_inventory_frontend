import request from "@/util/request";

export function listSuppliers() {
  return request({
    url: "/supplier",
    method: "get"
  });
}

export function getSupplierById(id) {
  return request({
    url: "/supplier/" + id,
    method: "get"
  });
}

export function checkSupplierName(name) {
  return request({
    url: "/supplier/check-name/" + name,
    method: "get"
  });
}

export function upsertSupplier(data) {
  return request({
    url: "/supplier/upsert",
    method: "post",
    data
  });
}

export function deleteSupplierById(id) {
  return request({
    url: "/supplier/" + id,
    method: "delete"
  });
}
