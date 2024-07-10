const path = require("path");

module.exports = {
  tempDir: path.resolve(__dirname, "/Users/mac/baiseVideos/temp"),
  shortClipsDir: path.resolve(__dirname, "/Users/mac/baiseVideos/shortClips"),
  thumbnailOutputDir: path.resolve(
    __dirname,
    "/Users/mac/baiseVideos/thumbnail"
  ),
  videoOutputDir: path.resolve(__dirname, "/Users/mac/baiseVideos/video"),
  resolutions: [
    { name: "360p", width: 640, height: 360, bitrate: "800k" },
    { name: "480p", width: 854, height: 480, bitrate: "1200k" },
    { name: "720p", width: 1280, height: 720, bitrate: "2500k" },
    { name: "1080p", width: 1920, height: 1080, bitrate: "5000k" },
    { name: "1440p", width: 2560, height: 1440, bitrate: "8000k" },
    { name: "2160p", width: 3840, height: 2160, bitrate: "20000k" },
  ],
  videoType: "mp4",
  thumbnail: {
    width: 320,
    height: 200,
    type: "jpg",
  },
  waterMarksOptions: {
    fixed: {
      logoPath: path.resolve(__dirname, "../public/logo.png"),
      opacity: 0.8,
      startX: 10,
      startY: 10,
      scale: 5,
      position: "top-right",
    },
    bouncing: {
      text: "更多精彩视频, 欢迎访问 BaiseHub.com!",
      fontSize: 48,
      color: "yellow",
      opacity: 1,
      enableMovement: true,
      movementSpeed: 100,
      startX: 10,
      startY: 10,
      position: "top-left",
    },
  },
};
