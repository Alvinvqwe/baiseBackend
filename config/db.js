const { Pool } = require("pg");

// 数据库配置
const pool = new Pool({
  user: "postgres", // 你的数据库用户名
  host: "217.146.82.143", // 数据库服务器地址
  database: "baise", // 数据库名
  password: "baisehubadmin", // 数据库密码
  port: 5431, // 端口，默认是 5432
  max: 20, // 连接池中最大连接数
  idleTimeoutMillis: 30000, // 空闲连接自动关闭的时间（毫秒）
  connectionTimeoutMillis: 2000, // 连接超时时间（毫秒）
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
