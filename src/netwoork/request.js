import axios from "axios";
import { Message, Loading } from "element-ui";
import router from "../router/index";
import qs from "qs";

let loadingCount = 0;
let loading;
let options = {
  target: ".loading-class",
  lock: true,
  text: "加载中……",
  background: "rgba(0, 0, 0, 0)",
};

export var baseUrl = configBaseUrlFn().baseUrlVariable;
export var baseImgUrl = configBaseUrlFn().baseImgUrl; //图片服务器地址

// 隐藏Loading
function hideLoading() {
  if (loadingCount <= 0) {
    return;
  }
  loadingCount -= 1;
  if (loadingCount === 0) {
    loading.close();
  }
}
// 展示Loading
function showLoading() {
  if (loadingCount === 0) {
    loading = Loading.service(options);
  }
  loadingCount += 1;
}

function configBaseUrlFn() {
  // let base = "";
  // // if (location.hostname.indexOf("ai.dev.youbanban.com") != -1) {
  //   //测试环境
  //   base = {
  //     baseUrlVariable: "https://mb.dev.youbanban.com/strawberry", //账号信息接口
  //     baseImgUrl: "https://img.dev.youbanban.com/imgs/view/grapefruit/img/", //图片地址
  //   };
  // } else if (location.hostname.indexOf("www.youbanban.com") != -1) {
  //   //正式环境
  //   base = {
  //     baseUrlVariable: "https://www.youbanban.com/strawberry",
  //     baseImgUrl: "https://img.youbanban.com/imgs/view/grapefruit/img/", //图片地址
  //   };
  // } else {
  //   //开发环境
  //   base = {
  //     // baseUrlVariable: "http://192.168.70.223:9830/strawberry",
  //     baseUrlVariable: "https://mb.dev.youbanban.com/strawberry",
  //     baseImgUrl: "https://img.dev.youbanban.com/imgs/view/grapefruit/img/", //图片地址
  //   };
  // }
  let base = {
    baseUrlVariable: "http://127.0.0.1:8888/api/private/v1/",
    baseImgUrl: "", //图片地址
  }
  return base;
}
// jiudianmenpiaoapi: require("@/" + baseImgUrl + "jiudianmenpiaoapi.png"),
axios.defaults.baseURL = baseUrl;
// 开发环境可用跨域设置
// axios.defaults.baseURL = 'api';

axios.defaults.timeout = 20000;

// 拦截请求，如果token 不存在就返回登陆页面
var isRedirect = true;
//http request拦截器
axios.interceptors.request.use(
  (config) => {
    // console.log(config)
    showLoading();
    // 在发送请求之前做些什么
    if (config.tokenFlag) {
      if (!localStorage.getItem("token")) {
        // 判断是否存在token，如果不存在的话，则跳转到登陆页面
        if (isRedirect) {
          isRedirect = false;
          router.replace({
            path: "/login",
          });
          localStorage.clear();
        }
      }
      else {
        config.headers["Authorization"] = localStorage.getItem("token");
      }
    }
    if (config.method === "get") {
      // 如果是get请求，且params是数组类型如arr=[1,2]，则转换成arr=1&arr=2
      config.paramsSerializer = function (params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      };
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

//http response拦截器
axios.interceptors.response.use(
  (response) => {
    hideLoading();
    if (response.data.error) {
      Message.error({ message: response.data.error.message });
      if (response.data.error.code === "2001") {
        // token失效
        Message.closeAll();
        Message.error({ message: response.data.error.message });
        localStorage.clear();
        router.replace({
          path: "/login",
        });
      } else if (response.data.error.code === "2002") {
        // token无效
        Message.closeAll();
        Message.error({ message: "登录失效，请重新登录" });
        router.replace({
          path: "/login",
        });
      } else if (response.data.error.code === "7008") {
        //无权访问
        Message.closeAll();
        Message.error({ message: "无权访问，请重新登录" });
        router.replace({
          path: "/login",
        });
      }
    }
    return response;
  },
  (error) => {
    // console.log(error)
    // console.log(error.code)
    // console.log(error.config)
    // console.log(error.config._retry)

    if (
      error.code === "ECONNABORTED" &&
      error.message.indexOf("timeout") !== -1
    ) {
      // eslint-disable-next-line
      Message.error({ message: "连接超时" });

      // return Promise.reject('请检查网络再重新连接')
    }
    hideLoading();
    if (error.response) {
      switch (error.response.status) {
        case 401:
          //401，刷新token失败，跳转登录页重新登录
          router
            .replace({
              path: "/login",
              query: {
                redirect: router.currentRoute.fullPath,
              }, //携带当前页面路由，以在登录页面完成登录后返回当前页面
            })
            .catch((error) => { });
          Message.error({ message: "请重新登录" });
          localStorage.clear();
          break;
        case 403:
          Message.error({ message: "无权限" });
          break;
        case 404:
          Message.error({ message: "服务器异常" });
          break;
      }
    }
    return Promise.reject(error.response); // 返回接口返回的错误信息
  }
);

/**
 * post方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 * @param {Boolean} tokenFlag [是否需要token]
 * @param {Object} query [请求时URL后携带的参数]
 * @param {String} paramsType [请求的参数类型]
 */
export function post(url, data, tokenFlag, query, paramsType) {
  return new Promise((resolve, reject) => {
    let contentType;
    if (paramsType == "formData") {
      contentType = "application/x-www-form-urlencoded";
    } else {
      data = JSON.stringify(data);
      contentType = "application/json;charset=utf-8";
    }
    axios({
      method: "post",
      url: url,
      data: data,
      params: query,
      tokenFlag: tokenFlag,

      headers: {
        "Content-Type": contentType,
      },
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        if (err) {
          reject(err.data);
        }
      });
  });
}

/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 * @param {Boolean} tokenFlag [是否需要token]
 */
export function get(url, params, tokenFlag) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params: params,
        tokenFlag: tokenFlag,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        if (err) {
          reject(err.data);
        }
      });
  });
}

/**
 * put方法，对应put请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 * @param {Boolean} tokenFlag [是否需要token]
 * @param {Object} query [请求时URL后携带的参数]
 * @param {String} paramsType [请求的参数类型]
 */
export function put(url, data, tokenFlag, query, paramsType) {
  return new Promise((resolve, reject) => {
    let contentType;
    if (paramsType == "formData") {
      contentType = "application/x-www-form-urlencoded";
    } else {
      data = JSON.stringify(data);
      contentType = "application/json;charset=utf-8";
    }
    axios({
      method: "put",
      url: url,
      data: data,
      params: query,
      tokenFlag: tokenFlag,

      headers: {
        "Content-Type": contentType,
      },
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        if (err) {
          reject(err.data);
        }
      });
  });
}

/**
 * delete方法，对应delete请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 * @param {Boolean} tokenFlag [是否需要token]
 */
export function fun_delete(url, params, tokenFlag) {
  return new Promise((resolve, reject) => {
    axios
      .delete(url, {
        params: params,
        tokenFlag: tokenFlag,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        if (err) {
          reject(err.data);
        }
      });
  });
}

// 下载
export function download(url, params, tokenFlag) {
  return new Promise((resolve, reject) => {
    axios({
      method: "get",
      url: url,
      params: params,
      tokenFlag: tokenFlag,
      responseType: "blob", // important
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err.data);
      });
  });
}
