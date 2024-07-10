-- 用户表
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,                                  -- 用户ID，自增主键
    username VARCHAR(50),                            -- 用户名，必须唯一
    email VARCHAR(100) UNIQUE NOT NULL,                     -- 电子邮件地址，必须唯一
    email_verified BOOLEAN DEFAULT FALSE,                   -- 邮箱验证状态，默认未验证
    phone_number VARCHAR(20) UNIQUE,                        -- 用户注册手机号，必须唯一
    phone_verified BOOLEAN DEFAULT FALSE,                   -- 手机号验证状态，默认未验证
    password_hash VARCHAR(255),                             -- 密码哈希，用于安全存储密码

    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 注册时间，默认为当前时间戳
    login_count INT DEFAULT 0,                              -- 登录次数，默认为0
    last_login TIMESTAMP,                                   -- 上次登录时间
    registration_method VARCHAR(50),                        -- 注册方式（如：'Google', 'X', 'WeChat'）
    source_channel VARCHAR(50),                             -- 注册渠道
    registration_ip VARCHAR(45),                            -- 注册IP地址
    last_login_ip VARCHAR(45),                              -- 最后登录IP地址

    membership_level VARCHAR(20) DEFAULT 'free',            -- 会员等级（如：'free', 'silver', 'gold', 'platinum'）
    membership_start_date TIMESTAMP,                        -- 会员开始日期
    membership_end_date TIMESTAMP                           -- 会员结束日期
);

-- 索引可以加速用户名和电子邮件的查询效率，特别是在进行登录验证时
CREATE INDEX idx_users_username ON Users(username);
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_phone_number ON Users(phone_number);
CREATE INDEX idx_users_last_login ON Users(last_login);
CREATE INDEX idx_users_source_channel ON Users(source_channel);

-- 管理员账户表
CREATE TABLE AdminAccounts (
    id SERIAL PRIMARY KEY,                                -- 管理员ID，自增主键
    username VARCHAR(50) UNIQUE NOT NULL,                 -- 管理员用户名，必须唯一
    email VARCHAR(100) UNIQUE NOT NULL,                   -- 管理员电子邮件地址，必须唯一
    password_hash VARCHAR(255) NOT NULL,                  -- 管理员密码哈希，用于安全存储密码
    role_ VARCHAR(20) NOT NULL CHECK (role_ IN ('superadmin', 'admin', 'editor', 'viewer')),  -- 管理员角色
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,       -- 账户创建时间，默认为当前时间戳
    last_login TIMESTAMP                                  -- 管理员上次登录时间
);

-- 索引可以加速用户名和电子邮件的查询效率，特别是在进行登录验证时
CREATE INDEX idx_admin_username ON AdminAccounts (username);
CREATE INDEX idx_admin_email ON AdminAccounts (email);


-- 视频表
CREATE TABLE Videos (
    id SERIAL PRIMARY KEY,                                  -- 视频ID，自增主键
    title VARCHAR(255) NOT NULL,                            -- 视频标题，非空
    descriptions TEXT,                                      -- 视频描述
    uploader_id INT NOT NULL,                               -- 上传者用户ID，非空
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- 视频上传日期，默认为当前时间戳
    video_url VARCHAR(255) NOT NULL,                        -- 视频URL，非空
    video_length VARCHAR(255) NOT NULL,                     -- 视频长度，非空
    clarity VARCHAR(255) NOT NULL,                          -- 视频清晰度，非空
    download INT NOT NULL DEFAULT 0,                        -- 下载次数，默认为0
	views_ INT NOT NULL DEFAULT 0,
    review_status VARCHAR(20) NOT NULL CHECK (review_status IN ('pending', 'approved', 'rejected')),  -- 审核状态
    reviewer_id INT,                                        -- 审批员ID，可以为空，表示还未分配审批员
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('public', 'private', 'followers_only', 'pay_for_view', 'pay_for_download')), -- 访问类型
    FOREIGN KEY (uploader_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_videos_upload_date ON Videos(upload_date);
CREATE INDEX idx_videos_review_status ON Videos(review_status);
CREATE INDEX idx_videos_uploader_id ON Videos(uploader_id);


-- 标签表
CREATE TABLE Tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

COMMENT ON TABLE Tags IS '标签表';
COMMENT ON COLUMN Tags.id IS '标签ID，自增主键';
COMMENT ON COLUMN Tags.name IS '标签名称，必须唯一且非空';

-- 视频标签关联表
CREATE TABLE VideoTags (
    video_id INT NOT NULL,
    tag_id INT NOT NULL,
);

COMMENT ON TABLE VideoTags IS '视频标签关联表';
COMMENT ON COLUMN VideoTags.video_id IS '视频ID，非空';
COMMENT ON COLUMN VideoTags.tag_id IS '标签ID，非空';

-- 评论表
CREATE TABLE Comments (
    id SERIAL PRIMARY KEY,
    video_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_comment_id INT,
    content TEXT NOT NULL,
    comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES Videos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES Comments(id) ON DELETE CASCADE
);
-- 索引
CREATE INDEX idx_comments_video_id ON Comments(video_id);
CREATE INDEX idx_comments_user_id ON Comments(user_id);
CREATE INDEX idx_comments_parent_comment_id ON Comments(parent_comment_id);
CREATE INDEX idx_comments_comment_date ON Comments(comment_date);

COMMENT ON TABLE Comments IS '评论表';
COMMENT ON COLUMN Comments.id IS '评论ID，自增主键';
COMMENT ON COLUMN Comments.video_id IS '视频ID，非空';
COMMENT ON COLUMN Comments.user_id IS '用户ID，非空';
COMMENT ON COLUMN Comments.parent_comment_id IS '父评论ID，可以为空，表示根评论';
COMMENT ON COLUMN Comments.content IS '评论内容，非空';
COMMENT ON COLUMN Comments.comment_date IS '评论时间，默认为当前时间戳';
COMMENT ON COLUMN Comments.video_id IS '视频ID外键约束，关联Videos表的视频ID，级联删除';
COMMENT ON COLUMN Comments.user_id IS '用户ID外键约束，关联Users表的用户ID，级联删除';
COMMENT ON COLUMN Comments.parent_comment_id IS '父评论ID外键约束，关联自身表的评论ID，级联删除';

-- 粉丝表
CREATE TABLE Followers (
    blogger_id INT NOT NULL,
    follower_id INT NOT NULL,
    follow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (blogger_id, follower_id),
    FOREIGN KEY (blogger_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (follower_id) REFERENCES Users(id) ON DELETE CASCADE
);
-- 索引
CREATE INDEX idx_followers_blogger_id ON Followers(blogger_id);
CREATE INDEX idx_followers_follower_id ON Followers(follower_id);
CREATE INDEX idx_followers_follow_date ON Followers(follow_date);

COMMENT ON TABLE Followers IS '粉丝表';
COMMENT ON COLUMN Followers.blogger_id IS '博主用户ID，非空';
COMMENT ON COLUMN Followers.follower_id IS '粉丝用户ID，非空';
COMMENT ON COLUMN Followers.follow_date IS '关注日期，默认为当前时间戳';
COMMENT ON CONSTRAINT Followers_pkey ON Followers IS '博主用户ID和粉丝用户ID的复合主键';
COMMENT ON COLUMN Followers.blogger_id IS '博主用户ID外键约束，关联Users表的用户ID，级联删除';
COMMENT ON COLUMN Followers.follower_id IS '粉丝用户ID外键约束，关联Users表的用户ID，级联删除';

-- 视频点赞记录表
CREATE TABLE VideoLikes (
    video_id INT NOT NULL,                                  -- 视频ID，非空
    user_id INT NOT NULL,                                   -- 用户ID，非空
    like_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,          -- 点赞日期，默认为当前时间戳
    PRIMARY KEY (video_id, user_id),
    FOREIGN KEY (video_id) REFERENCES Videos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
-- 索引
CREATE INDEX idx_videolikes_video_id ON VideoLikes(video_id);
CREATE INDEX idx_videolikes_user_id ON VideoLikes(user_id);
CREATE INDEX idx_videolikes_like_date ON VideoLikes(like_date);

COMMENT ON TABLE VideoLikes IS '视频点赞记录表';
COMMENT ON COLUMN VideoLikes.video_id IS '视频ID，非空';
COMMENT ON COLUMN VideoLikes.user_id IS '用户ID，非空';
COMMENT ON COLUMN VideoLikes.like_date IS '点赞日期，默认为当前时间戳';
COMMENT ON COLUMN VideoLikes.video_id IS '视频ID外键约束，关联Videos表的视频ID，级联删除';
COMMENT ON COLUMN VideoLikes.user_id IS '用户ID外键约束，关联Users表的用户ID，级联删除';

-- 视频收藏记录表
CREATE TABLE VideoFavorites (
    video_id INT NOT NULL,                                  -- 视频ID，非空
    user_id INT NOT NULL,                                   -- 用户ID，非空
    favorite_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- 收藏日期，默认为当前时间戳
    PRIMARY KEY (video_id, user_id),
    FOREIGN KEY (video_id) REFERENCES Videos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
-- 索引
CREATE INDEX idx_videofavorites_video_id ON VideoFavorites(video_id);
CREATE INDEX idx_videofavorites_user_id ON VideoFavorites(user_id);
CREATE INDEX idx_videofavorites_favorite_date ON VideoFavorites(favorite_date);

COMMENT ON TABLE VideoFavorites IS '视频收藏记录表';
COMMENT ON COLUMN VideoFavorites.video_id IS '视频ID，非空';
COMMENT ON COLUMN VideoFavorites.user_id IS '用户ID，非空';
COMMENT ON COLUMN VideoFavorites.favorite_date IS '收藏日期，默认为当前时间戳';
COMMENT ON COLUMN VideoFavorites.video_id IS '视频ID外键约束，关联Videos表的视频ID，级联删除';
COMMENT ON COLUMN VideoFavorites.user_id IS '用户ID外键约束，关联Users表的用户ID，级联删除';

-- 审计日志表
CREATE TABLE AdminActivityLog (
    id SERIAL PRIMARY KEY,                        -- 日志ID，自增主键
    admin_id INT NOT NULL,                        -- 执行操作的管理员ID
    action VARCHAR(255) NOT NULL,                 -- 描述管理员执行的具体操作
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 操作执行的时间，默认为当前时间戳

    FOREIGN KEY (admin_id) REFERENCES AdminAccounts(id) ON DELETE CASCADE
);
-- 索引
CREATE INDEX idx_admin_action_time ON AdminActivityLog (action_time);
CREATE INDEX idx_admin_id ON AdminActivityLog (admin_id);

COMMENT ON TABLE AdminActivityLog IS '审计日志表';
COMMENT ON COLUMN AdminActivityLog.id IS '日志ID，自增主键';
COMMENT ON COLUMN AdminActivityLog.admin_id IS '执行操作的管理员ID，非空';
COMMENT ON COLUMN AdminActivityLog.action IS '描述管理员执行的具体操作，非空';
COMMENT ON COLUMN AdminActivityLog.action_time IS '操作执行的时间，默认为当前时间戳';
COMMENT ON COLUMN AdminActivityLog.admin_id IS '管理员ID外键约束，关联AdminAccounts表的管理员ID，级联删除';




-- 用户余额表
CREATE TABLE UserBalances (
    user_id INT PRIMARY KEY,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,  -- 余额，设定两位小数

    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
-- 索引
CREATE INDEX idx_userbalances_user_id ON UserBalances(user_id);

COMMENT ON TABLE UserBalances IS '用户余额表';
COMMENT ON COLUMN UserBalances.user_id IS '用户ID，作为主键';
COMMENT ON COLUMN UserBalances.balance IS '余额，设定为十进制数，精确到小数点后两位';
COMMENT ON COLUMN UserBalances.user_id IS '用户ID外键约束，关联用户表的用户ID，级联删除';

-- 支付记录表
CREATE TABLE PaymentRecords (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,  -- 充值金额
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
-- 索引
CREATE INDEX idx_paymentrecords_user_id ON PaymentRecords(user_id);
CREATE INDEX idx_paymentrecords_payment_date ON PaymentRecords(payment_date);

COMMENT ON TABLE PaymentRecords IS '支付记录表';
COMMENT ON COLUMN PaymentRecords.id IS '支付记录ID，自增主键';
COMMENT ON COLUMN PaymentRecords.user_id IS '用户ID，非空';
COMMENT ON COLUMN PaymentRecords.amount IS '充值金额，设定为十进制数，精确到小数点后两位';
COMMENT ON COLUMN PaymentRecords.payment_date IS '支付日期，默认为当前时间戳';
COMMENT ON COLUMN PaymentRecords.user_id IS '用户ID外键约束，关联Users表的用户ID，级联删除';


-- 用户购买记录表
CREATE TABLE UserPurchases (
    user_id INT NOT NULL,                                   -- 用户ID，非空
    product VARCHAR(255) NOT NULL,                       -- 产品ID（现在为字符串），非空
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP      -- 购买日期，默认为当前时间戳
);

-- 索引
CREATE INDEX idx_userpurchases_user_id ON UserPurchases(user_id);
CREATE INDEX idx_userpurchases_product ON UserPurchases(product);
CREATE INDEX idx_userpurchases_purchase_date ON UserPurchases(purchase_date);

COMMENT ON TABLE UserPurchases IS '用户购买记录表';
COMMENT ON COLUMN UserPurchases.user_id IS '用户ID，非空';
COMMENT ON COLUMN UserPurchases.product IS '产品ID，非空';
COMMENT ON COLUMN UserPurchases.purchase_date IS '购买日期，默认为当前时间戳';

-- 会员充值记录表
CREATE TABLE MembershipPayments (
    id SERIAL PRIMARY KEY,                                  -- 会员充值记录ID，自增主键
    user_id INT NOT NULL,                                   -- 用户ID，非空
    amount DECIMAL(10, 2) NOT NULL,                         -- 充值金额
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,       -- 支付日期，默认为当前时间戳
    membership_level VARCHAR(20) NOT NULL,                  -- 会员等级（如：'silver', 'gold', 'platinum'）
    membership_duration_days INT NOT NULL,                  -- 会员时长（天数）
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
-- 索引
CREATE INDEX idx_membershippayments_user_id ON MembershipPayments(user_id);
CREATE INDEX idx_membershippayments_payment_date ON MembershipPayments(payment_date);

COMMENT ON TABLE MembershipPayments IS '会员充值记录表';
COMMENT ON COLUMN MembershipPayments.id IS '会员充值记录ID，自增主键';
COMMENT ON COLUMN MembershipPayments.user_id IS '用户ID，非空';
COMMENT ON COLUMN MembershipPayments.amount IS '充值金额，设定为十进制数，精确到小数点后两位';
COMMENT ON COLUMN MembershipPayments.payment_date IS '支付日期，默认为当前时间戳';
COMMENT ON COLUMN MembershipPayments.membership_level IS '会员等级，记录充值的会员等级';
COMMENT ON COLUMN MembershipPayments.membership_duration_days IS '会员时长，记录充值的会员天数';
COMMENT ON COLUMN MembershipPayments.user_id IS '用户ID外键约束，关联Users表的用户ID，级联删除';







-- 广告商表
CREATE TABLE Advertisers (
    id SERIAL PRIMARY KEY,                             -- 广告商ID，自增主键
    name VARCHAR(100) NOT NULL,                        -- 广告商名称，非空
    contact_email VARCHAR(100) UNIQUE NOT NULL,        -- 联系邮箱，必须唯一且非空
    contact_phone VARCHAR(20),                         -- 联系电话
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP     -- 创建时间，默认为当前时间戳
);

-- 索引
CREATE INDEX idx_advertisers_name ON Advertisers(name);
CREATE INDEX idx_advertisers_contact_email ON Advertisers(contact_email);

COMMENT ON TABLE Advertisers IS '广告商表';
COMMENT ON COLUMN Advertisers.id IS '广告商ID，自增主键';
COMMENT ON COLUMN Advertisers.name IS '广告商名称，非空';
COMMENT ON COLUMN Advertisers.contact_email IS '联系邮箱，必须唯一且非空';
COMMENT ON COLUMN Advertisers.contact_phone IS '联系电话';
COMMENT ON COLUMN Advertisers.created_at IS '创建时间，默认为当前时间戳';

-- 广告表
CREATE TABLE Advertisements (
    id SERIAL PRIMARY KEY,                                -- 广告ID，自增主键
    advertiser_id INT NOT NULL,                           -- 广告商ID，非空
    ad_type VARCHAR(50) NOT NULL,                         -- 广告类型（如：'banner', 'video'），非空
    ad_content TEXT NOT NULL,                             -- 广告内容，非空
    start_date TIMESTAMP NOT NULL,                        -- 广告开始时间，非空
    end_date TIMESTAMP NOT NULL,                          -- 广告结束时间，非空
    click_count INT DEFAULT 0,                            -- 广告点击次数，默认为0
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,       -- 创建时间，默认为当前时间戳

    FOREIGN KEY (advertiser_id) REFERENCES Advertisers(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_advertisements_advertiser_id ON Advertisements(advertiser_id);
CREATE INDEX idx_advertisements_start_date ON Advertisements(start_date);
CREATE INDEX idx_advertisements_end_date ON Advertisements(end_date);

COMMENT ON TABLE Advertisements IS '广告表';
COMMENT ON COLUMN Advertisements.id IS '广告ID，自增主键';
COMMENT ON COLUMN Advertisements.advertiser_id IS '广告商ID，非空';
COMMENT ON COLUMN Advertisements.ad_type IS '广告类型，非空';
COMMENT ON COLUMN Advertisements.ad_content IS '广告内容，非空';
COMMENT ON COLUMN Advertisements.start_date IS '广告开始时间，非空';
COMMENT ON COLUMN Advertisements.end_date IS '广告结束时间，非空';
COMMENT ON COLUMN Advertisements.click_count IS '广告点击次数，默认为0';
COMMENT ON COLUMN Advertisements.created_at IS '创建时间，默认为当前时间戳';
COMMENT ON COLUMN Advertisements.advertiser_id IS '广告商ID外键约束，关联Advertisers表的广告商ID，级联删除';

