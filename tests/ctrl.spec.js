const { ResultData } = require('tms-koa')
jest.mock('tms-koa')

describe('#index.js', function () {
  const Ctrl = require('@/index')
  it('申请后释放端口', async () => {
    const ctrl = new Ctrl()
    /**
     * 申请端口
     */
    const quantity = 2
    ctrl.request = { query: { quantity } }
    await ctrl.apply()

    expect(ResultData).toHaveBeenCalledTimes(1)
    const { voucher, ports } = ResultData.mock.calls[0][0]
    expect(voucher).toMatch(/.*/)
    expect(ports).toHaveLength(quantity)
    /**
     * 释放端口
     */
    ctrl.request = { query: { voucher } }
    ctrl.release()

    expect(ResultData).toHaveBeenCalledTimes(2)
    expect(ResultData.mock.calls[1][0]).toBe('ok')
  })
})
