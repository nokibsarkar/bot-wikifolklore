SQL1_SELECT_SUBMISSIONS = """
SELECT * FROM `submission` WHERE `campaign_id` = :campaign_id
"""
SQL1_CREATE_CAMPAIGN = """
INSERT INTO
    `campaign`
(
    --- `id`,
    `title`,
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
    :title,
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
        `jury` (`user_id`, `campaign_id`)
    VALUES
        (:user_id, :campaign_id)
    ON CONFLICT DO UPDATE SET `allowed` = TRUE
"""
SQL1_REMOVE_JURY_FROM_CAMPAIGN = "UPDATE `jury` SET `allowed` = FALSE WHERE `user_id` = :user_id AND `campaign_id` = :campaign_id"