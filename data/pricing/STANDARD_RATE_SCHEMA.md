# Standard Rate Schema

这份结构的目标是：

- 前台页面可以统一查价
- 后台价格数据仍然保持渠道独立
- 每周更新价格表时，只需要替换或追加对应渠道的数据

## 核心原则

不是把所有供应商价格揉成一张看不出来源的大表。

而是：

- 用一套统一字段
- 保留每条价格所属的独立渠道
- 保留原始来源文件和工作表，方便核对

## 建议拆成 3 层

### 1. `channel_master`

这一层定义“渠道本身是谁”。

适合放：

- 渠道编码
- 供应商名称
- 页面归属
- 服务模式
- 市场区域
- 是否支持 FBA
- 是否支持危险品
- 当前是否启用

比如：

- `YTHQ_US_SEA_DDP`
- `HMLX_US_FBA_SEA`
- `PEGGY_US_FCL`

### 2. `rate_card`

这一层是“实际价格行”。

每一行只表示一个独立价格规则，例如：

- 一个港口到港口整柜价
- 一个重量区间的空派价
- 一个 FBA 仓库对应的报价带
- 一个 DG 渠道的特殊价格

这一层是查价时最核心的数据表。

### 3. `schedule_card`

这一层专门给 `Sailing Schedule` 页面用。

适合放：

- 船司
- 船名航次
- 截单
- ETD
- ETA
- 仓位状态

## 为什么渠道必须独立

因为不同渠道之间通常会有这些差异：

- 计费单位不同
- 起运仓不同
- 时效不同
- 是否包税不同
- 是否支持 FBA / DG 不同
- 附加费规则不同
- 可服务国家和区域不同

如果不独立，后面会很难维护。

## 页面上的使用方式

### `Quote & Booking`

先按页面入口过滤：

- `ocean_fcl`
- `ddp`
- `fba_delivery`
- `dangerous_goods`

再按输入条件筛：

- 起运港 / 起运地
- 目的港 / 地址 / 国家
- Amazon 仓库代码
- 重量 / 体积 / 件数
- 柜型
- 品类 / 危险品等级

最后返回多个独立渠道结果，而不是只返回一个价格。

### `Sailing Schedule`

从 `schedule_card` 查：

- 起运港
- 目的港
- 船司
- 航次
- ETD / ETA

## 对现有页面的好处

这样改完以后：

- 页面结构不用再改
- 只是把模拟价格替换成真实渠道结果
- 同一个输入条件下，可以并排显示多个渠道价格
- 后面也容易加“推荐渠道”“最低价”“最快时效”“会员价”

## 当前对应文件

结构定义文件：

- [standard-rate-schema.json](/C:/Users/YOYO/Desktop/GitHub项目/cargosoon/data/pricing/standard-rate-schema.json)

本周价格源映射：

- [weekly-source-map-2026-06-25.json](/C:/Users/YOYO/Desktop/GitHub项目/cargosoon/data/pricing/weekly-source-map-2026-06-25.json)
