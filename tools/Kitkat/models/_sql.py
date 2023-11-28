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
    `creator_id`
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
    :creator_id
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
SQL1_GET_ALL_CAMPAIGN = "SELECT * FROM `campaign` ORDER BY `id` DESC"
SQL1_GET_ALL_CAMPAIGN_BY_LANGUAGE = "SELECT * FROM `campaign` WHERE `language` = :language ORDER BY `id` DESC"
SQL1_GET_ALL_CAMPAIGN_BY_STATUS = "SELECT * FROM `campaign` WHERE `status` = :status ORDER BY `id` DESC"
SQL1_GET_ALL_CAMPAIGN_BY_STATUS_AND_LANGUAGE = "SELECT * FROM `campaign` WHERE `status` = :status AND `language` = :language ORDER BY `id` DESC"

SQL1_UPDATE_CAMPAIGN_FORMAT = "UPDATE `campaign` SET {updates} WHERE `id` = {id} RETURNING *"