// errorHandling.js
module.exports = async (ctx, next) => {
  try {
    await next(); // 执行下一个中间件
  } catch (err) {
    ctx.status = err.statusCode || err.status || 500; // 设置HTTP状态码
    ctx.body = {
      message: err.message, // 返回错误消息
      // 可选：添加更多错误详情，根据生产环境和开发环境决定是否显示堆栈
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    };
    ctx.app.emit("error", err, ctx); // 触发应用级错误事件，可以用于日志记录等
  }
};
