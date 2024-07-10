// env
const Koa = require("koa");
const cors = require("@koa/cors");
const { koaBody } = require("koa-body");
const bodyParser = require("koa-bodyparser");
const Router = require("koa-router");

// sys configs
const vConfig = require("./config/videoConfig");
const errorHandlingMiddleware = require("./src/middlewares/errorHandling");

// baise
const ga4Routes = require("./src/routes/ga4Routes");
const authRoutes = require("./src/routes/authRoutes");
const videoRouter = require("./src/routes/videoRoutes");

const app = new Koa();
const session = require("koa-session");
const router = new Router({
  prefix: "/",
});

// 允许所有的跨域请求
app.use(
  cors({
    origin: "*",
  })
);
// 配置 koa-body 中间件
app.use(
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: vConfig.tempDir, // 上传目录
      keepExtensions: true,
      maxFileSize: 4096 * 1024 * 1024, // 限制文件大小
    },
  })
);
// 处理 POST 请求体
app.use(bodyParser());

// 使用错误处理中间件
app.use(errorHandlingMiddleware);

// 管理员路由
app.use(session(app));
// 公共路由
app.use(authRoutes.routes()).use(authRoutes.allowedMethods());
app.use(videoRouter.routes()).use(videoRouter.allowedMethods());

// ga4
app.use(ga4Routes.routes()).use(ga4Routes.allowedMethods());

// 监听
app.use(router.routes());
app.listen(7000, () => console.log("Server running on port 7000"));
