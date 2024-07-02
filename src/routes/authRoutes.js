const Router = require("koa-router");
const authService = require("../models/user");
const { adminAuth } = require("../middlewares/auth");

const router = new Router({
  prefix: "/auth",
});

function getClientIP(req) {
  let ip =
    req.headers["x-forwarded-for"] || // 判断是否有反向代理 IP
    req.ip ||
    req.connection.remoteAddress || // 判断 connection 的远程 IP
    req.socket.remoteAddress || // 判断后端的 socket 的 IP
    req.connection.socket.remoteAddress ||
    "";
  if (ip) {
    ip = ip.replace("::ffff:", "");
  }
  console.log(ip);
  return ip;
}

// 用户注册路由
// user 注册/不同平台/注册源
router.post("/register", async (ctx) => {
  const ip = getClientIP(ctx.request);
  const { username, email, password, type } = ctx.request.body;
  console.log(ctx.request.body);
  const res = await authService.register({
    username: username,
    email: email,
    password: password,
    registration_ip: ip,
    registration_method: type,
  });
  // console.log(res);
  ctx.body = res;
});

// 通用登录函数
// user 登录，不同平台
router.post("/login", async (ctx) => {
  console.log(ctx.request.body);
  try {
    const { type } = ctx.request.body;
    if (type !== "credentials") {
      const { email, username } = ctx.request.body;
      // 判断是否存在，否则先注册
      const res = await authService.register({
        username: username,
        email: email,
        password: "",
        registration_ip: getClientIP(ctx.request),
        registration_method: type,
      });
      if (!res.success) {
        return res;
      }
    }
    const { email, password } = ctx.request.body;
    const result = await authService.login(email, password, type);
    // console.log(result);
    if (result.success) {
      ctx.state.user = result.data[0];
      ctx.state.user.role = "user";
    }
    ctx.body = result;
  } catch (error) {
    ctx.status = 401;
    console.log(error);
    ctx.body = { error: error.message };
  }
});

router.post("/admin/login", async (ctx) => {
  const { email, password } = ctx.request.body;
  const result = await authService.adminLogin(email, password);
  // console.log(result);
  if (result.success) {
    ctx.state.user = result.data[0];
    ctx.state.user.role = "admin";
  }
  ctx.body = result;
});

module.exports = router;
