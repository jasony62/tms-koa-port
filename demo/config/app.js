module.exports = {
  port: 3000,
  name: 'tms-koa-protfinder-demo',
  router: {
    controllers: {
      prefix: '', // 接口调用url的前缀
      plugins_npm: [{ id: 'tms-koa-portfinder', alias: 'portfinder' }],
    },
  },
}
