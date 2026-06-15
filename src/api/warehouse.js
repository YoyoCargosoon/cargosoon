import { axios } from "./axios";
import qs from 'qs'

// 库存管理
export const get_stock_list = (data)=>axios.post('/customer/api/warehouse/inventory/get_stock_list',qs.stringify(data));
