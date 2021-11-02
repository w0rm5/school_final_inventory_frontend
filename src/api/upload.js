import axios from "axios";
import store from "@/store";
import serverConfig from "@/util/serverConfig";
import { BToast } from 'bootstrap-vue'
import { toastTitles } from "@/util/enum"

const request = axios.create({
  baseURL: serverConfig.api_url,
  timeout: 15000
});

request.interceptors.request.use(
  config => {
    config.headers["Content-Type"] = "multipart/form-data";
    config.headers["x-access-token"] = store.getters.token;
    return config;
  },
  error => {
    return Promise.reject(error.response.data);
  }
);

request.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    let toast = new BToast()
    toast.$bvToast.toast(error.response.data.message, {
      title: toastTitles[error.response.data.meta],
      variant: "danger",
      toaster: "b-toaster-top-center"
    })
    return Promise.reject(error.response.data);
  }
);

export function singleUpload(data) {
  return request({
    url: "/file/upload",
    method: "post",
    data
  });
}

export function multiUpload(data) {
  return request({
    url: "/file/uploads",
    method: "post",
    data
  });
}

export function getFile(name) {
  return request({
    url: "/file/" + name,
    method: "get"
  });
}

export function deleteFile(name) {
  return request({
    url: "/file/" + name,
    method: "delete"
  });
}