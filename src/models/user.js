const bcrypt = require("bcryptjs");
const pool = require("../../config/db");
const jwtUtils = require("../utils/jwtUtils");
const GLOBAL_SQLS = require("../../config/globalSqls").USERS;
const GLOBAL_ADMIN_SQLS = require("../../config/globalSqls").ADMIN_ACCOUNTS;
const moment = require("moment");

// 检查邮箱是否存在，不存在则注册
const checkUser = async (
  email,
  username,
  type,
  loginIp,
  registered = false
) => {
  const client = await pool.connect();
  try {
    var res = await client.query(GLOBAL_SQLS.CHECK_USER, [email]);
    console.log(res.rows);
    if (res.rows.length > 0) {
      return { success: true, message: "用户已存在", data: res.rows };
    }
    // 注册用户，返回用户信息
    if (!registered) return { success: false, message: "用户不存在", data: [] };
    res = await register({
      username: username,
      email: email,
      password: "baisehub",
      registration_ip: loginIp,
      registration_method: type,
    });
    return res;
  } catch (error) {
    console.log(error);
    return { success: false, message: "用户查询失败", data: [] };
  } finally {
    client.release();
  }
};

const updateLoginIp = async (userId, loginIp) => {
  const client = await pool.connect();
  const timestamp = Date.now();
  const formattedDate = moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
  try {
    const result = await client.query(GLOBAL_SQLS.UPDATE_LOGIN, [
      formattedDate,
      loginIp,
      userId,
    ]);
    return { success: true, message: "更新成功", data: result.rows };
  } finally {
    client.release();
  }
};

const register = async ({
  username,
  email,
  password,
  registration_ip,
  registration_method,
}) => {
  const client = await pool.connect();
  try {
    // 注册
    var source_channel = "baisehub.com";
    const timestamp = Date.now();
    const formattedDate = moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
    const result = await client.query(GLOBAL_SQLS.ADD_USER, [
      username,
      email,
      false,
      password,
      null,
      false,
      formattedDate,
      0,
      formattedDate,
      registration_method,
      source_channel,
      registration_ip,
      registration_ip,
      "free",
    ]);
    return { success: true, message: "注册成功", data: result.rows };
  } catch (error) {
    console.log(error);
    return { success: false, message: "注册失败", data: [] };
  } finally {
    client.release();
  }
};

const login = async (email, password, type) => {
  const client = await pool.connect();
  try {
    const res = await client.query(GLOBAL_SQLS.GET_USER_BY_EMAIL, [email]);
    if (res.rows.length === 0) {
      return { success: false, message: "用户不存在", data: [] };
    }
    const user = res.rows[0];
    if (type === "credentials") {
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isPasswordValid) {
        return { success: false, message: "密码错误", data: [] };
      }
    }
    const updateLoginResult = await updateLoginIp(user.id, user.last_login_ip);
    if (!updateLoginResult.success) {
      return updateLoginResult;
    }
    return { success: true, message: "登录成功", data: [user] };
  } finally {
    client.release();
  }
};

const adminLogin = async (email, password) => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      GLOBAL_ADMIN_SQLS.GET_ADMIN_ACCOUNT_BY_EMAIL,
      [email]
    );
    if (res.rows.length === 0) {
      return { success: false, message: "用户不存在", data: [] };
    }
    const user = res.rows[0];
    //const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (user.password_hash !== password) {
      return { success: false, message: "密码错误", data: [] };
    }

    return { success: true, message: "登录成功", data: [user] };
  } finally {
    client.release();
  }
};

module.exports = { register, login, adminLogin, checkUser };
