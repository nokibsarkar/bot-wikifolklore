SQL1_SELECT_SUBMISSIONS = """
SELECT * FROM `submission` WHERE `campaign_id` = :campaign_id
"""
SQL1_CREATE_CAMPAIGN = """
INSERT INTO
    `campaign`
(
    --- `id`,
    `name`,
    `language`,
    `start_at`,
    `end_at`,
    `status`,
    `description`,
    `rules`,
    `blacklist`,
    `image`,
    `created_by_id`
)
VALUES
(
    --- :id,
    :name,
    :language,
    :start_at,
    :end_at,
    :status,
    :description,
    :rules,
    :blacklist,
    :image,
    :created_by_id
)
"""
SQL1_GET_CAMPAIGN_BY_ID = "SELECT * FROM `campaign` WHERE `id` = :id"
SQL1_GET_USERS_BY_USERNAME_PREFIX = "SELECT * FROM `user` WHERE `username` IN "
SQL1_ADD_JURY_TO_CAMPAIGN = """
    INSERT INTO
        `jury` (`user_id`, `username`, `campaign_id`)
    VALUES
        (:user_id, :username, :campaign_id)
    ON CONFLICT DO UPDATE SET `allowed` = TRUE
"""
SQL1_REMOVE_JURY_FROM_CAMPAIGN = "UPDATE `jury` SET `allowed` = FALSE WHERE `user_id` = :user_id AND `campaign_id` = :campaign_id"
SQL1_GET_JURY_BY_ALLOWED = "SELECT * FROM `jury` WHERE `campaign_id` = :campaign_id AND `allowed` = :allowed"
SQL1_GET_JURY_BY_CAMPAIGN_ID = "SELECT * FROM `jury` WHERE `campaign_id` = :campaign_id"

SQL1_CREATE_USER_IF_NOT_EXISTS = """
INSERT OR IGNORE INTO
    `user` (
    `id`,
    `username`,
    `rights`
)
VALUES
(
    :id,
    :username,
    :rights
)
"""
SQL1_GET_ALL_CAMPAIGN = "SELECT * FROM `campaign` ORDER BY `id` DESC LIMIT :limit OFFSET :offset"
SQL1_GET_ALL_CAMPAIGN_BY_LANGUAGE = "SELECT * FROM `campaign` WHERE `language` = :language ORDER BY `id` DESC LIMIT :limit OFFSET :offset"
SQL1_GET_ALL_CAMPAIGN_BY_STATUS_FORMAT = "SELECT * FROM `campaign` WHERE `status` IN ({status_placeholder}) ORDER BY `id` DESC LIMIT :limit OFFSET :offset"
SQL1_GET_ALL_CAMPAIGN_BY_STATUS_AND_LANGUAGE_FORMAT = "SELECT * FROM `campaign` WHERE `status` IN ({status_placeholder}) AND `language` = :language ORDER BY `id` DESC LIMIT :limit OFFSET :offset"

SQL1_UPDATE_CAMPAIGN_FORMAT = "UPDATE `campaign` SET {updates} WHERE `id` = {id} RETURNING *"
"""
id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `pageid`	INTEGER NOT NULL, -- pageid of the page on the target wiki
    `campaign_id`	INTEGER NOT NULL, -- campaign id
    `title`	TEXT NOT NULL, -- title of the page on the target wiki
    `oldid`	INTEGER NOT NULL, -- revision id of the page on the home wiki
    `target_wiki`	TEXT NOT NULL, -- target wiki language code
    `submitted_at`	TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- submission time
    `submitted_by_id`	INTEGER NOT NULL, -- user id of the submitter
    `submitted_by_username`	TEXT NOT NULL, -- username of the submitter
    `created_at`	TEXT NOT NULL, -- creation time of the page on the target wiki
    `created_by_id`	INTEGER NOT NULL, -- user id of the created_by
    `created_by_username`	TEXT NOT NULL, -- username of the created_by
    `total_bytes`	INTEGER NOT NULL, -- total bytes of the page on the target wiki
    `total_words`	INTEGER NOT NULL, -- total words of the page on the target wiki
    `added_bytes`	INTEGER NOT NULL, -- added bytes of the page on the target wiki
    `added_words`	INTEGER NOT NULL, -- added words of the page on the target wiki
"""

SQL1_CREATE_SUBMISSION = """
INSERT INTO
    `submission`
(
    `pageid`,
    `campaign_id`,
    `title`,
    `oldid`,
    `target_wiki`,
    `submitted_by_id`,
    `submitted_by_username`,
    `created_at`,
    `created_by_id`,
    `created_by_username`,
    `total_bytes`,
    `total_words`,
    `added_bytes`,
    `added_words`
) VALUES (
    :pageid,
    :campaign_id,
    :title,
    :oldid,
    :target_wiki,
    :submitted_by_id,
    :submitted_by_username,
    :created_at,
    :created_by_id,
    :created_by_username,
    :total_bytes,
    :total_words,
    :added_bytes,
    :added_words
) RETURNING *
"""