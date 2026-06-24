import { axios } from "./axios";

const toFormBody = (data = {}) => new URLSearchParams(data).toString()

// 库存管理
export const get_stock_list = (data)=>axios.post('/customer/api/warehouse/inventory/get_stock_list', toFormBody(data));
