import { axios } from "./axios";

const toFormBody = (data = {}) => new URLSearchParams(data).toString()

// nologin chat
export const getNoLoginId = (data) => axios.post('/customer/api/polymerization/save_ip', toFormBody(data));

// 获取通知
export const getNotice = (params) => axios.get('/customer/api/user/home/get_msg_notice', { params })

// 已读通知
export const setNotice = (data) => axios.post('/customer/api/user/home/notice_msg_read', toFormBody(data));

// 订单评分列表
export const assessmentList = (params) => axios.get('/customer/api/order/freight/get_order_rating_list', { params });
