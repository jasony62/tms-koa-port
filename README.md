# tms-koa-portfinder

tms-koa 的控制器插件，用于分配本地端口资源。

服务直接需要通过打开端口传递数据，例如：打开 RTP 端口接收媒体流，因此需要实现一种端口提供机制。`tms-koa-portfinder`提供了让远程服务在本地申请可用端口的接口。

# 环境变量

| 名称                         | 说明                     | 必填 | 默认  |
| ---------------------------- | ------------------------ | ---- | ----- |
| TMS_KOA_PORTFINDER_RANGE_MIN | 端口取值范围的最小值     | 否   | 20000 |
| TMS_KOA_PORTFINDER_RANGE_MAX | 端口取值范围的最大值     | 否   | 30000 |
| TMS_KOA_PORTFINDER_TRY_LIMIT | 获取端口后的最大尝试次数 | 否   | 10    |

# API

| 接口名称      | 接口功能 |
| ------------- | -------- |
| /port/apply   | 申请端口 |
| /port/release | 释放端口 |

## 申请端口

| 描述     | 定义        |
| -------- | ----------- |
| 接口名   | /port/apply |
| 请求方式 | GET         |

### GET 参数

| 参数名称 | 类型   | 必选 | 描述                         |
| -------- | ------ | ---- | ---------------------------- |
| quantity | Number | 否   | 要申请的端口数量。默认值=1。 |

### 输出参数

| 参数名称 | 类型          | 描述                                   |
| -------- | ------------- | -------------------------------------- |
| port     | Number        | 可用的端口。如果不指定 quantity 参数。 |
| ports    | Array<Number> | 可用的端口。如果指定 quantity 参数。   |
| voucher  | String        | 申请凭证，用于执行后续操作。           |

### 示例

> curl "http://localhost:3000/portfinder/apply"

```
{"msg":"正常","code":0,"result":{"voucher":"mFiW9j34npWlzRAYGaEZ1","port":20000}}
```

> curl "http://localhost:3000/portfinder/apply?quantity=2"

```
{"msg":"正常","code":0,"result":{"voucher":"axhJejuJsyfKaGtlK8aM0","ports":[20001,20002]}}
```

## 释放端口

| 描述     | 定义          |
| -------- | ------------- |
| 接口名   | /port/release |
| 请求方式 | GET           |

### GET 参数

| 参数名称 | 类型   | 必选 | 描述                   |
| -------- | ------ | ---- | ---------------------- |
| voucher  | String | 否   | 申请端口时返回的凭证。 |

### 示例

> curl "http://localhost:3000/portfinder/release?voucher=axhJejuJsyfKaGtlK8aM0"

```
{"msg":"正常","code":0,"result":"ok"}
```

# 运行 demo

进入 demo 目录，运行：

> node server.js
