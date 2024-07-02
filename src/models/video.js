const pool = require("../../config/db");
const GLOBAL_SQLS = require("../../config/globalSqls").VIDEOS;

const addVideo = async (
  title,
  descriptions,
  uploaderId,
  videoUrl,
  videoLength,
  clarity,
  status,
  reviewerId,
  access_type
) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.UPLOAD_VIDEO, [
      title,
      descriptions,
      uploaderId,
      videoUrl,
      videoLength,
      clarity,
      status,
      reviewerId,
      access_type,
    ]);
    return { success: true, message: "上传成功", data: result.rows };
  } catch (err) {
    return { success: false, message: "上传失败", data: err };
  } finally {
    client.release();
  }
};

const reviewVideo = async (vid, reviewerId, status) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.REVIEW_VIDEO, [
      status,
      reviewerId,
      vid,
    ]);
    return { success: true, message: "approved", data: result.rows };
  } catch (err) {
    return { success: false, message: "review failed", data: err };
  } finally {
    client.release();
  }
};

const getPublicVideos = async (limit, offset) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.GET_PUBLIC_VIDEOS, [
      limit,
      offset,
    ]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const getPopularVideos = async (limit, offset) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.GET_POPULAR_VIDEOS, [
      limit,
      offset,
    ]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const getRecommendedVideos = async (limit, offset) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.GET_RECOMMENDED_VIDEOS, [
      limit,
      offset,
    ]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const getVideosByTag = async (tag, limit, offset) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.GET_VIDEOS_BY_TAG, [
      tag,
      limit,
      offset,
    ]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const searchVideos = async (keyword, limit, offset) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.SEARCH_VIDEOS, [
      keyword,
      limit,
      offset,
    ]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const getPublicVideosByUser = async (uid, limit, offset) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.GET_PUBLIC_VIDEOS_BY_USER, [
      uid,
      limit,
      offset,
    ]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const getViewedVideos = async (limit, offset) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.GET_VIEWED_VIDEOS, [
      limit,
      offset,
    ]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const getLikedVideos = async (limit, offset) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.GET_LIKED_VIDEOS, [
      limit,
      offset,
    ]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const getFavoriteVideos = async (limit, offset) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.GET_FAVORITE_VIDEOS, [
      limit,
      offset,
    ]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const getPendingVideos = async (limit, offset) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.GET_PENDING_VIDEOS, [
      limit,
      offset,
    ]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const getDownloadedVideos = async (limit, offset) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.GET_DOWNLOADED_VIDEOS, [
      limit,
      offset,
    ]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const getVideoById = async (vid) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.GET_VIDEO_BY_ID, [vid]);
    if (result.rows.length === 0) {
      return { success: false, message: "not found", data: [] };
    }
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const userDeleteVideo = async (vid, uid) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.DELETE_VIDEO_BY_ID, [
      vid,
      uid,
    ]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const userLikeVideo = async (vid, uid) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.LIKE_VIDEO, [uid, vid]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const userUnLikeVideo = async (vid, uid) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.UNLIKE_VIDEO, [uid, vid]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const userHeartVideo = async (vid, uid) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.HEART_VIDEO, [uid, vid]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const userUnHeartVideo = async (vid, uid) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.UNHEART_VIDEO, [uid, vid]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const userPendingVideos = async (uid) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.PENDING_VIDEOS, [uid]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

module.exports = {
  getPublicVideos,
  getPopularVideos,
  getRecommendedVideos,
  getVideosByTag,
  searchVideos,
  getPublicVideosByUser,
  userDeleteVideo,
  getLikedVideos,
  getFavoriteVideos,
  getPendingVideos,
  reviewVideo,
  addVideo,
  getViewedVideos,
  getDownloadedVideos,
  getVideoById,
  userLikeVideo,
  userUnLikeVideo,
  userHeartVideo,
  userUnHeartVideo,
  userPendingVideos,
};
