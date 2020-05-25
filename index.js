const { nanoid } = require('nanoid')
const portfinder = require('portfinder')

const { Ctrl, ResultData, ResultFault } = require('tms-koa')
/**
 * 最大重试次数
 */
const TRY_LIMIT = parseInt(process.env.TMS_KOA_PORTFINDER_TRY_LIMIT) || 10

const RANGE_MIN = parseInt(process.env.TMS_KOA_PORTFINDER_RANGE_MIN) || 20000

const RANGE_MAX = parseInt(process.env.TMS_KOA_PORTFINDER_RANGE_MAX) || 30000
/**
 * 申请端口的起始位置
 */
let LatestApplyPort = RANGE_MAX
/**
 * 记录申请的端口
 * voucher => ports
 */
const APPLIED_PORTS_STACK = new Map()
/**
 * 所有申请的端口
 */
const APPLIED_PORTS_SET = new Set()
/**
 * 按顺序获得一个当前可用的端口
 */
async function getNextPort() {
  const expectedPort =
    LatestApplyPort === RANGE_MAX ? RANGE_MIN : LatestApplyPort + 1

  let tries = 1

  while (APPLIED_PORTS_SET.has(expectedPort)) {
    if (tries > TRY_LIMIT) throw Error(`重试次数已经超过限制[${TRY_LIMIT}]`)

    expectedPort = expectedPort === RANGE_MAX ? RANGE_MIN : expectedPort + 1

    tries++
  }
  const realPort = await portfinder.getPortPromise({
    port: expectedPort,
    stopPort: RANGE_MAX,
  })
  LatestApplyPort = realPort

  return realPort
}
/**
 * 申请指定数量的端口
 *
 * @param {Integer} quantity
 */
async function getBatchPorts(quantity) {
  const ports = []

  async function nextPort(step) {
    if (step < quantity) {
      let port = await getNextPort()

      if (APPLIED_PORTS_SET.has(port)) return nextPort(step)

      ports.push(port)

      return nextPort(++step)
    }

    return true
  }

  await nextPort(0)

  return ports
}

class Main extends Ctrl {
  /**
   * 测试接口，返回版本信息
   */
  version() {
    let pkg = require(__dirname + '/package.json')
    return new ResultData(pkg.version)
  }
  /**
   * 申请端口
   */
  async apply() {
    const { quantity } = this.request.query
    const applyQuantity = quantity === undefined ? 1 : parseInt(quantity)

    if (!applyQuantity) return new ResultFault('没有指定有效的端口申请数量')

    const ports = await getBatchPorts(applyQuantity)

    const voucher = nanoid()

    APPLIED_PORTS_STACK.set(voucher, ports)

    ports.forEach((port) => APPLIED_PORTS_SET.add(port))

    const result = { voucher }

    if (quantity === undefined) result.port = ports[0]
    else result.ports = ports

    return new ResultData(result)
  }
  /**
   * 释放端口
   */
  release() {
    const { voucher } = this.request.query

    APPLIED_PORTS_STACK.delete(voucher)

    return new ResultData('ok')
  }
}

module.exports = Main
