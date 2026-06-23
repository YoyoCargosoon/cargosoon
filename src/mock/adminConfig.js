export const adminRoleCatalog = [
  {
    code: 'super_admin',
    name: '超级管理员',
    dataScope: 'all',
    permissions: ['*'],
  },
  {
    code: 'price_operator',
    name: '价格运营',
    dataScope: 'all',
    permissions: [
      'dashboard.read',
      'price.read',
      'price.import',
      'price.mapping.edit',
      'quote.read',
      'feedback.read',
      'feedback.handle',
      'customer.read',
      'internal-chat.read',
      'internal-report.read',
    ],
  },
  {
    code: 'ops_staff',
    name: '运营成员',
    dataScope: 'all',
    permissions: [
      'dashboard.read',
      'price.read',
      'quote.read',
      'order.read',
      'recharge.read',
      'feedback.read',
      'customer.read',
      'internal-chat.read',
      'internal-report.read',
    ],
  },
]

export const adminMenus = [
  { label: '总览', routeName: 'admin-dashboard', icon: 'grid', permission: 'dashboard.read' },
  { label: '价格库', routeName: 'admin-pricing', icon: 'stack', permission: 'price.read' },
  { label: '查价记录', routeName: 'admin-quotes', icon: 'spark', permission: 'quote.read' },
  { label: '订单管理', routeName: 'admin-orders', icon: 'boxes', permission: 'order.read' },
  { label: '充值管理', routeName: 'admin-recharges', icon: 'wallet', permission: 'recharge.read' },
  { label: '反馈工单', routeName: 'admin-feedback', icon: 'bubble', permission: 'feedback.read' },
  { label: '客户视图', routeName: 'admin-customers', icon: 'users', permission: 'customer.read' },
  { label: '内部沟通', routeName: 'admin-internal-chat', icon: 'bubble', permission: 'internal-chat.read' },
  { label: '汇总报告', routeName: 'admin-internal-report', icon: 'grid', permission: 'internal-report.read' },
]
