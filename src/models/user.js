const bcrypt = require("bcryptjs");
const pool = require("../../config/db");
const jwtUtils = require("../utils/jwtUtils");
const GLOBAL_SQLS = require("../../config/globalSqls").USERS;
const GLOBAL_ADMIN_SQLS = require("../../config/globalSqls").ADMIN_ACCOUNTS;
const moment = require("moment");

const register = async ({
  username,
  email,
  password,
  registration_ip,
  registration_method,
}) => {
  const client = await pool.connect();
  try {
    //查询用户是否存在 , email, username
    const res = await client.query(GLOBAL_SQLS.CHECK_USER, [email, username]);
    if (res.rows.length > 0) {
      if (registration_method !== "credentials") {
        return { success: true, message: "用户已存在", data: res.rows };
      } else {
        return { success: false, message: "用户已存在", data: [] };
      }
    }
    // 注册
    var password_hash = "";
    var source_channel = "baisehub.com";
    if (registration_method === "credentials") {
      password_hash = await bcrypt.hash(password, 10);
    }
    const timestamp = Date.now();
    const formattedDate = moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
    const result = await client.query(GLOBAL_SQLS.ADD_USER, [
      username,
      email,
      false,
      password_hash,
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

module.exports = { register, login, adminLogin };
