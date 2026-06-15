import { axios } from "./axios";

// 货物跟踪列表
export const trackList = (params)=>axios.get('/customer/api/track/first/get_list',{params});

// 货物跟踪详情
export const trackDetail = (params)=>axios.get('/customer/api/track/first/get_track_row',{params});

// 推荐价格
export const transportPrice = (params)=>axios.get('/customer/api/polymerization/get_transport_price',{params});

// 始发地
export const getStart = (params)=>axios.get('/customer/api/polymerization/get_start',{params});

// 目的地国家
export const shipFromTo = (params)=>axios.get('/customer/api/polymerization/get_sel',{params});

// 获取聊天推荐价格
export const getRecommendedPrice = (params)=>axios.get('/customer/api/polymerization/getRecommendedPrice',{params});