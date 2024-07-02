const { GoogleAuth } = require("google-auth-library");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const path = require("path");

// 加载服务账号密钥文件
const keyFilePath = path.join(__dirname, "../../config/ga4Auth.json");

// 初始化 GoogleAuth 和 Analytics 客户端
const auth = new GoogleAuth({
  keyFile: keyFilePath,
  scopes: "https://www.googleapis.com/auth/analytics.readonly",
});

const analyticsClient = new BetaAnalyticsDataClient({
  auth,
});

module.exports = {
  analyticsClient,
};
