const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobe = require("fluent-ffmpeg").ffprobe;
const path = require("path");
const fs = require("fs");
// const { v4: uuidv4 } = require("uuid");
const config = require("../../config/videoConfig");
const { createCanvas } = require("canvas");
const os = require("os");
const { promisify } = require("util");

const unlinkAsync = promisify(fs.unlink);
ffmpeg.setFfmpegPath(ffmpegPath);

// 获取视频总时长
function getVideoDuration(videoName) {
  return new Promise((resolve, reject) => {
    ffprobe(config.tempDir + "/" + videoName, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
}

/**
 * 转换视频格式
 *
 * @param {string} videoName - 输入视频文件
 * @param {string} format - 转换格式（"mp4" 或 "m3u8"）
 * @returns {Promise<string>} - 返回一个 Promise，处理完成后 resolve 输出视频路径
 */
function convertVideoFormat(videoName, format = config.videoType) {
  return new Promise((resolve, reject) => {
    const inputPath = path.join(config.tempDir, videoName);
    const inputExtension = path.extname(inputPath).slice(1).toLowerCase();
    const baseName = path.basename(videoName, path.extname(videoName));
    const outputPath = path.join(
      config.videoOutputDir,
      config.videoType,
      `${baseName}.${format}`
    ); // 生成新的路径

    // 如果输入文件的格式和目标格式相同，则拷贝文件到目标路径
    if (inputExtension === format) {
      fs.copyFile(inputPath, outputPath, (err) => {
        if (err) {
          return reject(err);
        }
        console.log(
          `输入文件已经是 ${format} 格式，文件已拷贝到 ${outputPath}。`
        );
        return resolve(outputPath);
      });
    } else {
      const command = ffmpeg(inputPath).output(outputPath);

      if (format === "m3u8") {
        command.outputOptions(["-hls_flags delete_segments"]);
      }

      command
        .on("end", () => resolve(outputPath))
        .on("error", (err) => reject(err))
        .run();
    }
  });
}

/**
 * 生成视频缩略图
 *
 * @param {string} fileName - 输入视频文件
 * @param {number} width - 缩略图宽度
 * @param {number} height - 缩略图高度
 * @param {string} type - 输出图片类型
 * @returns {Promise<string>} - 返回一个 Promise，处理完成后 resolve 缩略图路径
 */
function generateThumbnail(
  fileName,
  width = config.thumbnail.width,
  height = config.thumbnail.height,
  type = config.thumbnail.type
) {
  return new Promise((resolve, reject) => {
    const videoPath = path.join(
      config.videoOutputDir,
      config.videoType,
      fileName
    );
    const baseName = path.basename(fileName, path.extname(fileName));
    const finalImagePath = path.join(
      config.thumbnailOutputDir,
      `${baseName}.${type}`
    );

    ffmpeg(videoPath)
      .screenshots({
        timestamps: ["50%"],
        filename: `temp.${type}`,
        folder: config.thumbnailOutputDir,
        size: `${width}x${height}`,
      })
      .on("end", function () {
        const tempImagePath = path.join(
          config.thumbnailOutputDir,
          `temp.${type}`
        );
        if (fs.existsSync(tempImagePath)) {
          fs.renameSync(tempImagePath, finalImagePath);
        }
        resolve(finalImagePath);
      })
      .on("error", function (err) {
        reject(err);
      });
  });
}
/**
 * 在视频上添加固定和 bouncing 的 logo 或文本
 *
 * @param {string} videoName - 输入视频文件
 * @param {object} options - 配置选项
 * @param {object} options.fixed - 固定 logo 或文本的选项
 * @param {string} [options.fixed.logoPath] - 固定 logo 的文件路径
 * @param {string} [options.fixed.text] - 固定显示的文本
 * @param {number} [options.fixed.fontSize=48] - 固定文本的字体大小
 * @param {string} [options.fixed.fontFamily="Arial"] - 固定文本的字体
 * @param {string} [options.fixed.color="white"] - 固定文本的颜色
 * @param {number} [options.fixed.opacity=0.9] - 固定 logo 或文本的透明度
 * @param {number} [options.fixed.startX=10] - 固定 logo 或文本的起始 X 位置
 * @param {number} [options.fixed.startY=10] - 固定 logo 或文本的起始 Y 位置
 * @param {number} [options.fixed.scale=3] - 固定 logo 或文本的缩放比例
 * @param {string} [options.fixed.position="top-left"] - 固定 logo 或文本的位置（"top-left", "top-right", "bottom-left", "bottom-right"）
 * @param {object} options.bouncing - bouncing logo 或文本的选项
 * @param {string} [options.bouncing.logoPath] - bouncing logo 的文件路径
 * @param {string} [options.bouncing.text] - bouncing 显示的文本
 * @param {number} [options.bouncing.fontSize=48] - bouncing 文本的字体大小
 * @param {string} [options.bouncing.fontFamily="Arial"] - bouncing 文本的字体
 * @param {string} [options.bouncing.color="yellow"] - bouncing 文本的颜色
 * @param {number} [options.bouncing.opacity=1] - bouncing logo 或文本的透明度
 * @param {number} [options.bouncing.startX=10] - bouncing logo 或文本的起始 X 位置
 * @param {number} [options.bouncing.startY=10] - bouncing logo 或文本的起始 Y 位置
 * @param {number} [options.bouncing.scale=3] - bouncing logo 或文本的缩放比例
 * @param {boolean} [options.bouncing.enableMovement=true] - 是否启用 bouncing 效果
 * @param {number} [options.bouncing.movementSpeed=100] - bouncing 运动速度
 * @param {string} [options.bouncing.position="top-left"] - bouncing logo 或文本的位置（"top-left", "top-right", "bottom-left", "bottom-right"）
 *
 * @returns {Promise<string>} - 返回一个 Promise，处理完成后 resolve 输出视频路径
 */
function addLogosOrTexts(videoName, options = config.waterMarksOptions) {
  return new Promise((resolve, reject) => {
    const fixedOptions = options.fixed || {};
    const bouncingOptions = options.bouncing || {};

    const filters = [];
    const tempFixedPath = fixedOptions.text
      ? path.join(os.tmpdir(), `${Date.now()}_fixed_text.png`)
      : fixedOptions.logoPath;
    const tempBouncingPath = bouncingOptions.text
      ? path.join(os.tmpdir(), `${Date.now()}_bouncing_text.png`)
      : bouncingOptions.logoPath;

    // 生成文本
    const generateTextLogo = (text, fontSize, fontFamily, color, tempPath) => {
      return new Promise((resolve, reject) => {
        const canvas = createCanvas(1600, 400); // 增加 canvas 尺寸以适应更长的文本
        const ctx = canvas.getContext("2d");
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.fillText(text, 10, fontSize);
        const out = fs.createWriteStream(tempPath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on("finish", () => {
          console.log(`已生成文本 logo：${tempPath}`);
          resolve();
        });
        out.on("error", reject);
      });
    };

    const generateLogos = () => {
      const tasks = [];
      if (fixedOptions.text) {
        tasks.push(
          generateTextLogo(
            fixedOptions.text,
            fixedOptions.fontSize,
            fixedOptions.fontFamily,
            fixedOptions.color,
            tempFixedPath
          )
        );
      }
      if (bouncingOptions.text) {
        tasks.push(
          generateTextLogo(
            bouncingOptions.text,
            bouncingOptions.fontSize,
            bouncingOptions.fontFamily,
            bouncingOptions.color,
            tempBouncingPath
          )
        );
      }
      return Promise.all(tasks);
    };

    // 根据位置设置起始坐标
    const getPosition = (position, width, height) => {
      switch (position) {
        case "top-right":
          return { x: `main_w-overlay_w-${width}`, y: `${height}` };
        case "bottom-left":
          return { x: `${width}`, y: `main_h-overlay_h-${height}` };
        case "bottom-right":
          return {
            x: `main_w-overlay_w-${width}`,
            y: `main_h-overlay_h-${height}`,
          };
        default:
          return { x: `${width}`, y: `${height}` };
      }
    };

    // 添加过滤器
    const addFilters = () => {
      const fixedPos = getPosition(
        fixedOptions.position,
        fixedOptions.startX,
        fixedOptions.startY
      );
      if (fixedOptions.logoPath || fixedOptions.text) {
        filters.push(
          {
            filter: "scale",
            options: `iw/${fixedOptions.scale}:-1`,
            inputs: "1:v",
            outputs: "fixed_logo_scaled",
          },
          {
            filter: "format",
            options: "rgba",
            inputs: "fixed_logo_scaled",
            outputs: "fixed_logo_rgba",
          },
          {
            filter: "colorchannelmixer",
            options: `aa=${fixedOptions.opacity}`,
            inputs: "fixed_logo_rgba",
            outputs: "fixed_logo",
          },
          {
            filter: "overlay",
            options: `x=${fixedPos.x}:y=${fixedPos.y}`,
            inputs: ["0:v", "fixed_logo"],
            outputs: "main_with_fixed",
          }
        );
      } else {
        filters.push({
          filter: "null",
          inputs: "0:v",
          outputs: "main_with_fixed",
        });
      }

      const bouncingPos = getPosition(
        bouncingOptions.position,
        bouncingOptions.startX,
        bouncingOptions.startY
      );
      if (bouncingOptions.logoPath || bouncingOptions.text) {
        filters.push(
          {
            filter: "scale",
            options: `iw/${bouncingOptions.scale}:-1`,
            inputs: fixedOptions.logoPath || fixedOptions.text ? "2:v" : "1:v",
            outputs: "bouncing_logo_scaled",
          },
          {
            filter: "format",
            options: "rgba",
            inputs: "bouncing_logo_scaled",
            outputs: "bouncing_logo_rgba",
          },
          {
            filter: "colorchannelmixer",
            options: `aa=${bouncingOptions.opacity}`,
            inputs: "bouncing_logo_rgba",
            outputs: "bouncing_logo",
          },
          {
            filter: "overlay",
            options: bouncingOptions.enableMovement
              ? `x='if(lte(mod(t*${bouncingOptions.movementSpeed},(W-w)*2),(W-w)),mod(t*${bouncingOptions.movementSpeed},(W-w)),(W-w)*2-mod(t*${bouncingOptions.movementSpeed},(W-w)*2))':y='if(lte(mod(t*${bouncingOptions.movementSpeed},(H-h)*2),(H-h)),mod(t*${bouncingOptions.movementSpeed},(H-h)),(H-h)*2-mod(t*${bouncingOptions.movementSpeed},(H-h)*2))'`
              : `x=${bouncingPos.x}:y=${bouncingPos.y}`,
            inputs: ["main_with_fixed", "bouncing_logo"],
            outputs: "final",
          }
        );
      } else {
        filters.push({
          filter: "null",
          inputs: "main_with_fixed",
          outputs: "final",
        });
      }
    };

    // 处理视频
    const processVideo = () => {
      const inputPath = path.join(
        config.videoOutputDir,
        config.videoType,
        videoName
      );
      const outputPath = path.join(
        config.videoOutputDir,
        config.videoType,
        `processed_${videoName}`
      );
      const relativeOutputPath = path.relative(process.cwd(), outputPath);
      console.log("使用固定 logo 路径：", tempFixedPath);
      console.log("使用 bouncing 文本路径：", tempBouncingPath);
      console.log("输出路径：", relativeOutputPath);

      // 确保输出目录存在
      const outputDir = path.dirname(relativeOutputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log("创建输出目录：", outputDir);
      } else {
        console.log("输出目录已存在：", outputDir);
      }

      // 确保不存在同名文件
      if (fs.existsSync(relativeOutputPath)) {
        console.log("删除已有的输出文件：", relativeOutputPath);
        fs.unlinkSync(relativeOutputPath);
      }

      const inputs = [inputPath];
      if (fixedOptions.logoPath || fixedOptions.text)
        inputs.push(tempFixedPath);
      if (bouncingOptions.logoPath || bouncingOptions.text)
        inputs.push(tempBouncingPath);

      const ffmpegCommand = ffmpeg();
      inputs.forEach((input) => ffmpegCommand.input(input));
      ffmpegCommand
        .complexFilter(filters)
        .outputOptions("-map", "[final]")
        .on("start", (commandLine) => {
          console.log("FFmpeg 命令开始执行：", commandLine);
        })
        .on("end", async () => {
          console.log("视频处理完成：", relativeOutputPath);
          if (fixedOptions.text && fs.existsSync(tempFixedPath)) {
            await unlinkAsync(tempFixedPath);
          }
          if (bouncingOptions.text && fs.existsSync(tempBouncingPath)) {
            await unlinkAsync(tempBouncingPath);
          }
          resolve(relativeOutputPath);
        })
        .on("error", (err) => {
          console.error("FFmpeg 处理错误：", err.message);
          if (fixedOptions.text && fs.existsSync(tempFixedPath)) {
            unlinkAsync(tempFixedPath);
          }
          if (bouncingOptions.text && fs.existsSync(tempBouncingPath)) {
            unlinkAsync(tempBouncingPath);
          }
          reject(err);
        })
        .save(relativeOutputPath);
    };

    generateLogos().then(addFilters).then(processVideo).catch(reject);
  });
}

// function convertAndGenerateResolutions(videoName) {
//   const inputPath = path.join(config.videoOutputDir, videoName);
//   const baseName = path.basename(videoName, path.extname(videoName));
//   const resolutions = config.resolutions;
//   const outputDir = config.videoOutputDir;

//   return new Promise((resolve, reject) => {
//     // 获取视频信息
//     ffmpeg.ffprobe(inputPath, (err, metadata) => {
//       if (err) {
//         console.error("Error probing video:", err);
//         return reject(err);
//       }
//       const { width, height } = metadata.streams[0];

//       // 筛选出分辨率低于或等于当前视频分辨率的配置
//       const compatibleResolutions = resolutions.filter(
//         (res) => res.width <= width && res.height <= height
//       );

//       const tasks = compatibleResolutions.map((resolution) => {
//         const outputPath = path.join(
//           outputDir,
//           `${baseName}_${resolution.name}.${config.videoType}`
//         );
//         return new Promise((resolve, reject) => {
//           ffmpeg(inputPath)
//             .videoCodec("libx264")
//             .size(`${resolution.width}x${resolution.height}`)
//             .videoBitrate(resolution.bitrate)
//             .output(outputPath)
//             .on("end", () => {
//               console.log(`Successfully converted to ${resolution.name}`);
//               resolve(outputPath);
//             })
//             .on("error", (err) => {
//               console.error(
//                 `Error converting to ${resolution.name}: ${err.message}`
//               );
//               reject(err);
//             })
//             .run();
//         });
//       });

//       // 运行所有转换任务
//       Promise.all(tasks)
//         .then((outputPaths) => {
//           console.log("All resolutions converted.");
//           resolve(outputPaths);
//         })
//         .catch((err) => {
//           console.error("Error converting resolutions:", err);
//           reject(err);
//         });
//     });
//   });
// }

function getCompatibleResolutions(videoName, shouldConvert) {
  const inputPath = path.join(
    config.videoOutputDir,
    config.videoType,
    videoName
  );

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        console.error("Error probing video:", err);
        return reject(err);
      }
      const { width, height } = metadata.streams[0];
      const currentResolution = config.resolutions.find(
        (res) => res.width === width && res.height === height
      );

      const compatibleResolutions = config.resolutions.filter(
        (res) => res.width <= width && res.height <= height
      );

      if (shouldConvert) {
        resolve({
          current: currentResolution
            ? currentResolution.name
            : `${width}x${height}`,
          resolutions: compatibleResolutions,
        });
      } else {
        resolve({
          current: currentResolution
            ? currentResolution.name
            : `${width}x${height}`,
          resolutions: compatibleResolutions.map((res) => res.name),
        });
      }
    });
  });
}

function convertVideoResolutions(videoName, resolutions) {
  const inputPath = path.join(
    config.videoOutputDir,
    config.videoType,
    videoName
  );
  const baseName = path.basename(videoName, path.extname(videoName));
  const outputDir = path.join(config.videoOutputDir, config.videoType);

  const tasks = resolutions.map((resolution) => {
    const outputPath = path.join(
      outputDir,
      `${baseName}_${resolution.name}.${config.videoType}`
    );
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec("libx264")
        .size(`${resolution.width}x${resolution.height}`)
        .videoBitrate(resolution.bitrate)
        .output(outputPath)
        .on("end", () => {
          console.log(`Successfully converted to ${resolution.name}`);
          resolve(outputPath);
        })
        .on("error", (err) => {
          console.error(
            `Error converting to ${resolution.name}: ${err.message}`
          );
          reject(err);
        })
        .run();
    });
  });

  return Promise.all(tasks);
}

function convertAndGenerateResolutions(videoName, shouldConvert = false) {
  return getCompatibleResolutions(videoName, shouldConvert)
    .then(({ current, resolutions }) => {
      if (!shouldConvert) {
        return { current, resolutions };
      }

      return convertVideoResolutions(videoName, resolutions).then(
        (outputPaths) => ({
          current,
          resolutions: outputPaths,
        })
      );
    })
    .catch((err) => {
      console.error("Error processing video:", err);
      throw err;
    });
}

// 生成视频剪辑
async function generateClips(videoName) {
  const videoPath = path.join(
    config.videoOutputDir,
    config.videoType,
    videoName
  );
  const outputPath = config.shortClipsDir;
  const tempOutputPath = path.join(
    outputPath,
    "tmp",
    path.basename(videoPath, path.extname(videoPath)) // + "_" + uuidv4()
  );

  if (!fs.existsSync(tempOutputPath)) {
    fs.mkdirSync(tempOutputPath, { recursive: true });
  }

  try {
    const duration = await getVideoDuration(videoName);
    console.log(duration);
    const percents = [0, 20, 40, 60, 80];
    const clipsInfo = percents.map((percent, index) => ({
      startTime: (duration * percent) / 100,
      duration: 2,
      outputPath_: path.join(tempOutputPath, `clip_${index}.mp4`),
    }));

    const clipsPaths = await Promise.all(
      clipsInfo.map(
        ({ startTime, duration, outputPath_ }) =>
          new Promise((resolve, reject) => {
            ffmpeg(videoPath)
              .setStartTime(startTime)
              .setDuration(duration)
              .size(`${config.thumbnail.width}x${config.thumbnail.height}`)
              .output(outputPath_)
              .on("end", () => {
                console.log(`Generated clip: ${outputPath_}`); // 打印生成的剪辑路径
                resolve(outputPath_); // 解析生成的剪辑路径
              })
              .on("error", (err) => {
                console.error(
                  `Error generating clip: ${outputPath_}, Error: ${err.message}`
                ); // 打印错误信息
                reject(err); // 拒绝生成的剪辑路径
              })
              .run();
          })
      )
    );

    const fileListPath = path.resolve(tempOutputPath, "fileList.txt");
    const finalOutputPath = path.resolve(
      outputPath,
      path.basename(videoPath, path.extname(videoPath)) + "_clips.mp4"
    );
    const fileListContent = clipsPaths
      .map((clipPath) => `file '${path.resolve(clipPath)}'`)
      .join("\n");
    fs.writeFileSync(fileListPath, fileListContent);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(fileListPath)
        .inputOptions(["-f concat", "-safe 0"])
        .outputOptions("-c copy")
        .output(finalOutputPath)
        .on("end", () => {
          console.log(`Generated clip: ${finalOutputPath}`); // 打印生成的剪辑路径
          resolve(finalOutputPath); // 解析生成的剪辑路径
        })
        .on("error", (err) => {
          console.error(
            `Error generating clip: ${finalOutputPath}, Error: ${err.message}`
          ); // 打印错误信息
          reject(err); // 拒绝生成的剪辑路径
        })
        .run();
    });

    fs.rmSync(tempOutputPath, { recursive: true });

    return finalOutputPath;
  } catch (error) {
    throw new Error("Error processing video: " + error.message);
  }
}

module.exports = {
  convertVideoFormat, // 转换视频格式
  getVideoDuration, // 获取视频总时长
  generateThumbnail, // 生成视频缩略图
  generateClips, // 生成视频剪辑
  convertAndGenerateResolutions, // 转换视频分辨率并生成分辨率列表
  addLogosOrTexts, // 添加固定和 bouncing 的 logo 或文本
};
