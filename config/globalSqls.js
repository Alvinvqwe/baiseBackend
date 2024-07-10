const GLOBAL_SQLS = {
  USERS: {
    CHECK_USER: `SELECT * FROM Users WHERE email = $1`,
    GET_USER_BY_ID: `SELECT * FROM Users WHERE id = $1;`,
    GET_USER_BY_EMAIL: `SELECT * FROM Users WHERE email = $1;`,
    GET_USER_BY_USERNAME: `SELECT * FROM Users WHERE username = $1;`,
    ADD_USER: `
        INSERT INTO Users (username, email, email_verified, password_hash, phone_number, phone_verified, registration_date, login_count, last_login, registration_method, source_channel, registration_ip, last_login_ip, membership_level)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *;
      `,
    UPDATE_LOGIN: `UPDATE Users SET login_count = login_count + 1, last_login = $1, last_login_ip = $2 WHERE id = $3;`,
  },
  ADMIN_ACCOUNTS: {
    GET_ADMIN_ACCOUNT_BY_EMAIL: `SELECT * FROM AdminAccounts WHERE email = $1;`,
  },
  TAGS: {
    GET_ALL_TAGS: `SELECT t.name, COUNT(vt.tag_id) AS tag_count FROM Tags t LEFT JOIN videotags vt ON t.id = vt.tag_id GROUP BY t.name ORDER BY tag_count DESC;`,
    GET_TOP_TAGS: `SELECT t.name, COUNT(vt.tag_id) AS tag_count FROM Tags t LEFT JOIN videotags vt ON t.id = vt.tag_id GROUP BY t.name ORDER BY tag_count DESC LIMIT $1;`,
    GET_TAGS_BY_VID: `SELECT * FROM videotags WHERE video_id = $1;`,
    GET_TAGS_BY_NAME: `SELECT * FROM tags WHERE name = $1;`,
    ADD_TAG: `INSERT INTO tags (name) VALUES ($1) RETURNING id;`,
    ADD_LINK_TAG: `INSERT INTO videotags (video_id, tag_id) VALUES ($1, $2) RETURNING *;`,
  },
  VIDEOS: {
    UPLOAD_VIDEO: `
        INSERT INTO videos (title, descriptions, uploader_id, video_url, video_length, clarity, review_status, reviewer_id, access_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
      `,
    GET_PUBLIC_VIDEOS: `
        SELECT * FROM Videos WHERE access_type = 'public' LIMIT $1 OFFSET $2;
      `,
    GET_POPULAR_VIDEOS: `
        SELECT * FROM Videos ORDER BY views_ DESC LIMIT $1 OFFSET $2;
      `,
    GET_RECOMMENDED_VIDEOS: `
        SELECT * FROM Videos ORDER BY upload_date DESC LIMIT $1 OFFSET $2;
      `,
    GET_VIDEOS_BY_TAG: `
        SELECT v.* FROM Videos v
        JOIN VideoTags vt ON v.id = vt.video_id
        JOIN Tags t ON vt.tag_id = t.id
        WHERE t.name = $1 LIMIT $2 OFFSET $3;
      `,
    SEARCH_VIDEOS: `
        SELECT * FROM Videos WHERE title ILIKE '%' || $1 || '%' OR descriptions ILIKE '%' || $1 || '%' LIMIT $2 OFFSET $3;
      `,
    GET_PUBLIC_VIDEOS_BY_USER: `
        SELECT * FROM Videos WHERE uploader_id = $1 AND access_type = 'public' and review_status = 'approved' LIMIT $2 OFFSET $3;
      `,

    REVIEW_VIDEO: `
      UPDATE Videos SET review_status = $1, reviewer_id = $2 WHERE id = $3;
    `,

    GET_VIEWED_VIDEOS: `
        SELECT * FROM Videos ORDER BY views_ DESC;
      `,

    GET_LIKED_VIDEOS: `
        SELECT v.*, COUNT(vl.user_id) AS like_count
        FROM Videos v
        LEFT JOIN VideoLikes vl ON v.id = vl.video_id
        GROUP BY v.id
        ORDER BY like_count DESC;
      `,
    GET_FAVORITE_VIDEOS: `
        SELECT v.*, COUNT(vf.user_id) AS favorite_count
        FROM Videos v
        LEFT JOIN VideoFavorites vf ON v.id = vf.video_id
        GROUP BY v.id
        ORDER BY favorite_count DESC;
      `,

    GET_PENDING_VIDEOS: `
        SELECT * FROM Videos WHERE review_status = 'pending' LIMIT $1 OFFSET $2;
      `,

    GET_DOWNLOADED_VIDEOS: `
        SELECT * FROM Videos WHERE review_status = 'downloaded' desc LIMIT $1 OFFSET $2;
      `,

    GET_VIDEO_BY_ID: `
        SELECT * FROM Videos WHERE id = $1;
      `,

    DELETE_VIDEO_BY_ID: `
        DELETE FROM Videos WHERE id = $1 where uploader_id = $2;
      `,

    LIKE_VIDEO: `
      INSERT INTO VideoLikes (user_id, video_id) VALUES ($1, $2) RETURNING *;
    `,
    UNLIKE_VIDEO: `
      DELETE FROM VideoLikes WHERE user_id = $1 AND video_id = $2 RETURNING *;
    `,

    HEART_VIDEO: `
      INSERT INTO VideoFavorites (user_id, video_id) VALUES ($1, $2) RETURNING *;
    `,
    UNHEART_VIDEO: `
      DELETE FROM VideoFavorites WHERE user_id = $1 AND video_id = $2 RETURNING *;
    `,
    PENDING_VIDEOS: `
      SELECT * FROM Videos WHERE review_status = 'pending' and uploader_id = $1;
    `,
  },
};

module.exports = GLOBAL_SQLS;
