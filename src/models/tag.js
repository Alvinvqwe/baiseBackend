const pool = require("../../config/db");
const GLOBAL_SQLS = require("../../config/globalSqls").TAGS;

const getTags = async () => {
  const { rows } = await pool.query(GLOBAL_SQLS.GET_ALL_TAGS);
  return rows;
};

const getTopTags = async (limit = 10) => {
  const client = await pool.connect();
  try {
    const result = await client.query(GLOBAL_SQLS.GET_TOP_TAGS, [limit]);
    return { success: true, message: "success", data: result.rows };
  } catch (err) {
    return { success: false, message: "failed", data: err };
  } finally {
    client.release();
  }
};

const getTagsByVid = async (id) => {
  const { rows } = await pool.query(GLOBAL_SQLS.GET_TAGS_BY_VID, [id]);
  return rows[0];
};

const getTagsByName = async (name) => {
  const { rows } = await pool.query(GLOBAL_SQLS.GET_TAGS_BY_NAME, [name]);
  return rows[0];
};

const addTag = async (name) => {
  const { rows } = await pool.query(GLOBAL_SQLS.ADD_TAG, [name]);
  return rows[0];
};

const addLinkTag = async (videoId, tagId) => {
  const { rows } = await pool.query(GLOBAL_SQLS.ADD_LINK_TAG, [videoId, tagId]);
  return rows[0];
};

module.exports = {
  getTags,
  getTopTags,
  getTagsByVid,
  getTagsByName,
  addTag,
  addLinkTag,
};
