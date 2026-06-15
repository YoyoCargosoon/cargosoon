import axios from "axios";
import router from '@/router';
import { getLocal } from "@/utils/common";
import { ElMessage } from 'element-plus'

const instance = axios.create({
  baseURL: window.location.protocol + "//" + window.location.host + "/api",
  baseURL: "https://app.cargosoon.com/api",
  // baseURL: "https://testapp.cargosoon.online/api",
  timeout: 30000,
})

instance.interceptors.request.use(config => {
  const mes = getLocal('TOKEN')
  if (mes) {
    // const token = mes.token
    config.headers.token = mes
  }
  return config
}, e => Promise.reject(e)
)

instance.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      if (response.data.code != 0) {
        ElMessage.error(response.data.msg);
      } else {
        return Promise.resolve(response)
      }
    } else {
      ElMessage.error('System busy');
      return Promise.reject(response)
    }
  },
  (error) => {
    ElMessage.error('System busy');
    if (error.response.status) {
      switch (error.response.status) {
        case -1:
          router.replace({
            path: '/login'
          })
          break;
      }
    }
  }
)
export { instance as axios };

