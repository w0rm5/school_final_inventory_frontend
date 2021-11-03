import request from "@/util/request";

export function login(data) {
  return request({
    url: "/login",
    method: "post",
    data
  });
}

export function listUser(data) {
  return request({
    url: "/user",
    method: "post",
    data
  });
}

export function registerUser(data) {
  return request({
    url: "/user/register",
    method: "post",
    data
  });
}

export function updateUser(data) {
  return request({
    url: "/user/update",
    method: "put",
    data
  });
}

export function resetPassword(data) {
  return request({
    url: "/user/reset-password",
    method: "put",
    data
  });
}

export function forceResetPassword(data) {
  return request({
    url: "/user/force-reset-password",
    method: "put",
    data
  });
}

export function getUserInfo() {
  return request({
    url: "/user/info",
    method: "get"
  });
}
