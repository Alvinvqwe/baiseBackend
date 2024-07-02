const jwt = require("jsonwebtoken");
const pool = require("../../config/db");
const SECRET_KEY = process.env.JWT_SECRET;

const authenticateAdmin = async (ctx, next) => {
  const token = ctx.headers.authorization?.split(" ")[1];
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: "Authorization token is missing" };
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT * FROM adminaccounts WHERE id = $1",
        [decoded.id]
      );

      if (res.rows.length === 0) {
        ctx.status = 401;
        ctx.body = { error: "Invalid token" };
        return;
      }

      ctx.state.user = res.rows[0];
      ctx.state.role = decoded.role;

      await next();
    } finally {
      client.release();
    }
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: "Invalid token" };
  }
};

const authAdmin_ = async (ctx, next) => {
  if (!ctx.state.user && ctx.state.user.role !== "admin") {
    ctx.status = 401;
    ctx.body = { error: "Authorization token is missing" };
    return;
  } else {
    ctx.state.user.role = "admin";
  }
  // if (!ctx.state.user || ctx.state.user.role !== "admin") {
  //   ctx.status = 403;
  //   ctx.body = { error: "Forbidden" };
  //   return;
  // }
  await next();
};

const userAuth = async (ctx, next) => {
  // 假设 ctx.state.user 由前端会话管理系统设置
  if (!ctx.state.user || ctx.state.user.role !== "user") {
    ctx.status = 403;
    ctx.body = { error: "Forbidden" };
    return;
  }
  await next();
};

const adminAuth = async (ctx, next) => {
  // await authAdmin_(ctx, next);
  if (!ctx.state.user && ctx.state.user.role !== "admin") {
    ctx.status = 403;
    ctx.body = { error: "Forbidden" };
    return;
  }
  await next();
};

module.exports = { userAuth, adminAuth };
