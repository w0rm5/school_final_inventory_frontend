import axios from "axios";
import store from "@/store";
import serverConfig from "./serverConfig";
import { BToast } from 'bootstrap-vue'
import { toastTitles } from "./enum"

const service = axios.create({
  baseURL: serverConfig.api_url,
  timeout: 15000
});

service.interceptors.request.use(
  config => {
    config.headers["Content-Type"] = "application/json";
    config.headers["x-access-token"] = store.getters.token;

    // if (config.method === 'post') {
    //   config.data = JSON.stringify(config.data)
    // }

    return config;
  },
  error => {
    return Promise.reject(error.response.data);
  }
);

service.interceptors.response.use(
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

export default service;
