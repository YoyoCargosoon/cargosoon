export const sourceEntryLabels = {
  ai: 'AI 助手',
  fcl_page: 'FCL/DDP 页面',
  ddp_page: 'DDP 页面',
  admin_manual: '后台录入',
}

export const feedbackTypeLabels = {
  'price issue': '价格问题',
  'ux issue': '体验问题',
  bug: '功能异常',
  suggestion: '建议',
  other: '其他',
}

export const statusLabels = {
  active: '启用中',
  archived: '已归档',
  open: '待处理',
  processing: '处理中',
  resolved: '已解决',
  closed: '已关闭',
  paid: '已支付',
  'pending confirmation': '待确认',
  'in transit': '运输中',
}

export const priorityLabels = {
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级',
}

export const eventLabels = {
  quote_requested: '发起查价',
  quote_returned: '返回报价',
  order_created: '创建订单',
  order_status_changed: '订单状态变更',
  recharge_created: '发起充值',
  recharge_paid: '充值成功',
  feedback_submitted: '提交反馈',
  feedback_status_changed: '反馈状态变更',
  page_viewed: '浏览页面',
  page_left: '离开页面',
  quote_search: '查价',
  order_create: '下单',
  feedback_submit: '提交反馈',
}

export const formatLabel = (value, dictionary) => dictionary[value] || value || '-'
