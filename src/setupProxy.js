const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api/skinport",
    createProxyMiddleware({
      target: "https://api.skinport.com/",
      changeOrigin: true,
      pathRewrite: {
        "^/api/skinport": "/v1/items",
      },
    })
  );
};