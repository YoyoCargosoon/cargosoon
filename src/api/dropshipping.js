import { axios } from "./axios";

// 推荐商品
export const getCommend = (data)=>axios.post('/shipping/Goods/ProductSearchOfferRecommend',data);

// 获取code
export const getCode = (params)=>axios.get('/customer/api/polymerization/getCode',{params});

// 获取汇率
export const getRate = (data)=>axios.post('/shipping/Order/getExchangeRate',data);

// 专区商品
export const specialArea = (params)=>axios.get('/shipping/Goods/GoodsSpecialAreaList',{params});

// 获取类目
export const getCategory = (data)=>axios.post('/shipping/Category/CategoryTranslationGetById',data);