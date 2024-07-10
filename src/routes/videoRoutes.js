const Router = require("koa-router");
const videoService = require("../models/video");
const tagService = require("../models/tag");
const videoUtil = require("../utils/videoUtils");
const path = require("path");
const { userAuth, adminAuth } = require("../middlewares/auth");
const config = require("../../config/videoConfig");
const fs = require("fs");

const router = new Router({
  prefix: "/video",
});

router.get("/tags", userAuth, async (ctx) => {
  const res = await tagService.getTopTags();
  ctx.body = res;
});

// upload video
// login required
router.post("/upload", async (ctx) => {
  // if (
  //   !ctx.state.user ||
  //   ctx.state.user.role !== "user" ||
  //   ctx.state.user.role !== "admin"
  // ) {
  //   ctx.status = 401;
  //   ctx.body = { error: "Unauthorized" };
  // }
  const { title, description, tags } = ctx.request.body;
  const file = ctx.request.files.file;
  const { access_type } = ctx.request.body;
  if (!file || !title || !description || !tags || !access_type) {
    ctx.status = 400;
    ctx.body = { error: "Missing required fields" };
    return;
  }
  const duration = await videoUtil.getVideoDuration(file.newFilename);
  await videoUtil.convertVideoFormat(file.newFilename);
  await videoUtil.generateThumbnail(file.newFilename);
  await videoUtil.generateClips(file.newFilename);
  const { current } = await videoUtil.convertAndGenerateResolutions(
    file.newFilename,
    false
  );
  const baseName = path.basename(
    file.newFilename,
    path.extname(file.newFilename)
  );
  //console.log(ctx.state.user);
  // var res = {};
  // if (ctx.state.user && ctx.state.user.role === "user") {
  //   //video insert sql
  //   await videoService.addVideo(
  //     title,
  //     description,
  //     ctx.state.user.id,
  //     baseName,
  //     duration,
  //     current,
  //     "pending",
  //     null,
  //     access_type
  //   );
  // } else if (ctx.state.user && ctx.state.user.role === "admin") {
  //   await videoUtil.addLogosOrTexts(file.newFilename);
  //   // const { resolutions } = await videoUtil.convertAndGenerateResolutions(
  //   //   file.newFilename,
  //   //   true
  //   // );
  //   //video insert sql
  //   console.log(
  //     title,
  //     description,
  //     ctx.state.user.id,
  //     baseName,
  //     duration,
  //     current,
  //     "approved",
  //     ctx.state.user.id,
  //     access_type
  //   );
  //   res = await videoService.addVideo(
  //     title,
  //     description,
  //     ctx.state.user.id,
  //     baseName,
  //     duration,
  //     current,
  //     "approved",
  //     ctx.state.user.id,
  //     access_type
  //   );
  // }
  //await videoUtil.addLogosOrTexts(file.newFilename);
  console.log(
    title,
    description,
    1,
    baseName,
    duration,
    current.split("x")[0] + "p",
    "approved",
    1,
    access_type
  );
  const res = await videoService.addVideo(
    title,
    description,
    1,
    baseName,
    duration,
    current.split("x")[0] + "p",
    "approved",
    1,
    access_type
  );
  if (!res.success) {
    ctx.status = 400;
    ctx.body = res;
    return;
  }

  for (const item of JSON.parse(tags)) {
    let tag = await tagService.getTagsByName(item);
    if (!tag) {
      tag = await tagService.addTag(item);
    }
    console.log(tag, res);
    await tagService.addLinkTag(res.data[0].id, tag.id);
  }
  ctx.body = { success: true, message: "上传成功", data: [] };
});

// audit video
// admin login required
router.post("/admin/review", adminAuth, async (ctx) => {
  const { vid, reviewrId, status } = ctx.request.body;
  const res = await videoService.reviewVideo(vid, reviewrId, status);
  ctx.body = res;
});

// 获取视频列表
// login not required
router.post("/", async (ctx) => {
  const { type, limit, offset } = ctx.request.body;
  switch (type) {
    case "reccomended":
      ctx.body = await videoService.getRecommendedVideos(limit, offset);
      break;
    case "hottest":
      ctx.body = await videoService.getPopularVideos(limit, offset);
      break;
    case "tag":
      const { tag } = ctx.request.body;
      ctx.body = await videoService.getVideosByTag(tag, limit, offset);
      break;
    case "keyword":
      const { keyword } = ctx.request.body;
      ctx.body = await videoService.searchVideos(keyword, limit, offset);
      break;
    case "user":
      const { uid } = ctx.request.body;
      ctx.body = await videoService.getPublicVideosByUser(uid, limit, offset);
      break;
    default:
      //randoms
      ctx.body = await videoService.getPublicVideos(limit, offset);
      break;
  }
});

// 获取视频列表
// admin login required
router.post("/admin", adminAuth, async (ctx) => {
  const { type, limit, offset } = ctx.request.body;
  switch (type) {
    case "viewed ranking":
      ctx.body = await videoService.getViewedVideos(limit, offset);
      break;
    case "liked ranking":
      ctx.body = await videoService.getLikedVideos(limit, offset);
      break;
    case "pendings":
      ctx.body = await videoService.getPendingVideos(limit, offset);
      break;
    case "downloaded ranking":
      ctx.body = await videoService.getDownloadedVideos(limit, offset);
      break;
    case "hearts ranking":
      ctx.body = await videoService.getFavoriteVideos(limit, offset);
      break;
    default:
      //published
      break;
  }
});

// 获取视频详情
router.get("/:vid", async (ctx) => {
  const vid = ctx.params.vid;
  ctx.body = await videoService.getVideoById(vid);
});

// user login required
// video list by operation
router.post("/user", userAuth, async (ctx) => {
  const { type, vid } = ctx.request.body;
  switch (type) {
    case "liked":
      ctx.body = await videoService.userLikeVideo(vid, ctx.state.user.id);
      break;
    case "unliked":
      ctx.body = await videoService.userUnLikeVideo(vid, ctx.state.user.id);
      break;
    case "hearts":
      ctx.body = await videoService.userHeartVideo(vid, ctx.state.user.id);
      break;
    case "unhearts":
      ctx.body = await videoService.userUnHeartVideo(vid, ctx.state.user.id);
      break;
    case "pendings":
      ctx.body = await videoService.userPendingVideos(uid);
      break;
    case "delete":
      ctx.body = await videoService.userDeleteVideo(vid, uid);
      break;
    default:
      //published
      break;
  }
  ctx.body = videos;
});

router.get("/image/:url", async (ctx) => {
  const url = ctx.params.url;
  let imagePath = path.join(config.thumbnailOutputDir, url, ".jpg");
  ctx.type = "image/jpeg";
  ctx.body = fs.createReadStream(imagePath);
});

router.get("/shortClips/:url", async (ctx) => {
  const url = ctx.params.url;
  let shortClipsPath = path.join(config.shortClipsDir, url, ".mp4");
  ctx.type = "video/mp4";
  ctx.body = fs.createReadStream(shortClipsPath);
});

router.get("/:url", async (ctx) => {
  const url = ctx.params.url;
  let videoPath = path.join(
    config.videoOutputDir,
    config.videoType,
    url,
    ".mp4"
  );
  ctx.type = "video/mp4";
  ctx.body = fs.createReadStream(videoPath);
});

// router.get("/admin/tags", adminAuth, async (ctx) => {
//   ctx.body = await videoService.getTags();
// });

module.exports = router;
