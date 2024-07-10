const Router = require("koa-router");
const authService = require("../models/user");
const { adminAuth, userAuth } = require("../middlewares/auth");
const bcrypt = require("bcryptjs");
const jwtUtils = require("../utils/jwtUtils");
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
  // console.log(ip);
  return ip;
}

// 用户注册路由
// user 注册/不同平台/注册源
router.post("/register", async (ctx) => {
  const ip = getClientIP(ctx.request);
  const { username, email, password, type } = ctx.request.body;
  const checkedUserResult = await authService.checkUser(
    email,
    username,
    type,
    ip
  );
  if (checkedUserResult.success) {
    checkedUserResult.success = false;
    ctx.body = checkedUserResult;
    // console.log(checkedUserResult);
    return;
  }
  const res = await authService.register({
    username: username,
    email: email,
    password: password,
    registration_ip: ip,
    registration_method: type,
  });
  ctx.body = res;
});

// 通用登录函数
// user 登录，不同平台
// 第三方平台登录，userService 判断是否存在，否则先注册 (封装函数)
// 照常登录，但要更新最后登录时间，登录ip
router.post("/login", async (ctx) => {
  // console.log(ctx.request.body, ctx.headers);
  const { type } = ctx.request.body;
  const loginIp = getClientIP(ctx.request);
  try {
    if (type !== "credentials") {
      const { email, username } = ctx.request.body;
      const checkedUserResult = await authService.checkUser(
        email,
        username,
        type,
        loginIp,
        true
      );
      if (!checkedUserResult.success) {
        ctx.body = checkedUserResult;
        return;
      }
    }
    const { email, password } = ctx.request.body;
    const result = await authService.login(email, password, type);
    if (!result.success) {
      ctx.body = result;
      return;
    }
    const accessToken = jwtUtils.generateToken({
      userId: result.data[0].id,
      email: result.data[0].email,
    });
    result.data[0].accessToken_key = accessToken;
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

router.get("/test", userAuth, async (ctx) => {
  ctx.body = ctx.state.user;
});

module.exports = router;
