const jwtUtils = require("../utils/jwtUtils");
// const pool = require("../../config/db");

const userAuth = async (ctx, next) => {
  // console.log(ctx.headers, ctx.headers["authorization"]);
  const authHeader = ctx.headers["authorization"];
  if (!authHeader) {
    ctx.status = 401;
    ctx.body = { error: "Authorization header missing" };
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: "Token missing" };
    return;
  }
  try {
    const decoded = jwtUtils.verifyToken(token);
    // console.log(decoded);
    ctx.state.user = decoded;
    ctx.state.user.role = "user";
    await next();
  } catch (err) {
    ctx.status = 403;
    ctx.body = { error: "Invalid token" };
  }
};

const adminAuth = async (ctx, next) => {
  const authHeader = ctx.headers["authorization"];
  if (!authHeader) {
    ctx.status = 401;
    ctx.body = { error: "Authorization header missing" };
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: "Token missing" };
    return;
  }
  try {
    const decoded = jwtUtils.verifyToken(token);
    console.log(decoded);
    ctx.state.user.role = "admin";
    await next();
  } catch (err) {
    ctx.status = 403;
    ctx.body = { error: "Invalid token" };
  }
};

module.exports = { userAuth, adminAuth };
