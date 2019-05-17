import axios from 'axios'
import { message } from 'antd'
import {ipcRenderer} from '@/config/Electron.js'
import errorMsg from "@/utils/errorMsg.js";

let baseUrl = ''

export default (res) => {
  return new Promise((resolve, reject) => {
    const getGatewayResult = (arg) => {
      const success = () => {
        baseUrl = arg.data.url
        const getDataEvent = (arg) => {
          if (arg.data) {
            let obj = {
              method: 'POST',
              url: res.url,
              data: arg.data || {},
            }
            const instance = axios.create({
              baseURL: baseUrl,
              headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Accept': 'application/json, text/plain'
              },
              transformResponse: [function (data) {
                //  响应前对数据进行更改
              }]
            })
            instance.interceptors.request.use(
              config => {
                // config.headers['authToken'] = getCookieToken()
                return config
              },
              error => {
                return Promise.reject(error)
              }
            )
            instance.interceptors.response.use(
              response => {
                let data
                // IE9时response.data是undefined，因此需要使用response.request.responseText(Stringify后的字符串)
                if (response.data === undefined) {
                  data = JSON.parse(response.request.responseText)
                } else {
                  data = response.data
                }
                return Promise.resolve(data)
              },
              error => {
                if (error && error.response) {
                  error.message = ''
                  switch (error.response.status) {
                    case 400:
                      error.message = '请求错误'
                      break
                    case 401:
                      error.message = '未授权，请登录'
                      break
                    case 403:
                      error.message = '拒绝访问'
                      break
                    case 404:
                      error.message = `请求地址出错: ${error.response.config.url}`
                      break
                    case 408:
                      error.message = '请求超时'
                      break
                    case 500:
                      error.message = '服务器内部错误'
                      break
                    case 501:
                      error.message = '服务未实现'
                      break
                    case 502:
                      error.message = '网关错误'
                      break
                    case 503:
                      error.message = '服务不可用'
                      break
                    case 504:
                      error.message = '网关超时'
                      break
                    case 505:
                      error.message = 'HTTP版本不受支持'
                      break
                    default:
                      error.message = '请求失败'
                      break
                  }
                }
                message.error(error.message)
                return Promise.reject(error)
              }
            )
            instance(obj).catch(error => {
              reject(error)
            }).then(res => {
              if (res && parseInt(res.code) === 200) {
                const getDataEventLast = (arg) => {
                  if (arg.data) {
                    resolve(arg.data)
                  } else {
                    message.error(arg.errorMsg)
                    reject(arg.errorMsg)
                  }
                }
                if (res.data) {
                  const o = ipcRenderer.sendSync("decrypt-data", res.data);
                  getDataEventLast(o)
                } else {
                  resolve();
                }
              } else {
                message.error((res && res.msg) || '请求失败')
                reject(res)
              }
            })
          } else {
            message.error((arg && arg.errorMsg) || '数据加密失败')
            reject(res)
          }
        }
        const d = ipcRenderer.sendSync("encrypt-data", res.data);
        getDataEvent(d)
      }
      const fail = () => {
        baseUrl = ''
      }
      errorMsg(arg, success, fail)
    }

    const data = ipcRenderer.sendSync("get-gateway");
    getGatewayResult(data)
  })
}
