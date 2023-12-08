
SQL1_INIT = """
CREATE TABLE IF NOT EXISTS `user` (
    `id`	INTEGER NOT NULL PRIMARY KEY,
    `username`	TEXT NOT NULL UNIQUE,
    `rights`	INTEGER NOT NULL DEFAULT 1,
    `created_at`	TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `article_count`	INTEGER DEFAULT 0,
    `category_count`	INTEGER DEFAULT 0,
    `task_count`	INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS `campaign` (
    `id`    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `name`    TEXT NOT NULL,
    `language`    TEXT NOT NULL,
    `start_at`    TEXT NOT NULL,
    `end_at`    TEXT NOT NULL,
    `created_at`    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_by_id`    INTEGER NOT NULL,
    `approved_by`    INTEGER NULL DEFAULT NULL,
    `approved_at`    TIMESTAMP NULL DEFAULT NULL,
    `description`    TEXT NULL DEFAULT NULL,
    `rules`    TEXT NULL DEFAULT NULL,
    `blacklist`    TEXT NULL DEFAULT NULL,
    `image`    TEXT NULL DEFAULT NULL,
    `jury`    TEXT NULL DEFAULT NULL,
    `status`    TEXT NOT NULL DEFAULT 'pending',
    `maximumSubmissionOfSameArticle`   INTEGER NOT NULL DEFAULT 1,
    `allowExpansions`   BOOLEAN NOT NULL DEFAULT TRUE,
    `minimumTotalBytes` INTEGER NOT NULL DEFAULT 1000,
    `minimumTotalWords` INTEGER NOT NULL DEFAULT 100,
    `minimumAddedBytes` INTEGER NOT NULL DEFAULT 100,
    `minimumAddedWords` INTEGER NOT NULL DEFAULT 10,
    `secretBallot`  BOOLEAN NOT NULL DEFAULT TRUE,
    `allowJuryToParticipate`    BOOLEAN NOT NULL DEFAULT TRUE,
    `allowMultipleJudgement`    BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT `campaign_approved_by_fkey` FOREIGN KEY(`approved_by`) REFERENCES `user`(`id`),
    CONSTRAINT `campaign_created_by_id_fkey` FOREIGN KEY(`created_by_id`) REFERENCES `user`(`id`),
    CONSTRAINT `campaign_start_end_check` CHECK(NOT `start_at` > `end_at`),
    CONSTRAINT `campaign_approved_at_check` CHECK(`created_at` <= `approved_at` AND `approved_at` <= `start_at`)
);
CREATE TABLE IF NOT EXISTS `submission` (
    `id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    `total_words`	INTEGER  NULL DEFAULT NULL, -- total words of the page on the target wiki
    `added_bytes`	INTEGER  NULL DEFAULT NULL, -- added bytes of the page on the target wiki
    `added_words`	INTEGER  NULL DEFAULT NULL, -- added words of the page on the target wiki
    `positive_votes`	INTEGER NOT NULL DEFAULT 0, -- positive votes of the submission
    `negative_votes`	INTEGER NOT NULL DEFAULT 0, -- negative votes of the submission
    `total_votes`	INTEGER NOT NULL DEFAULT 0, -- total votes of the submission
    `points`	INTEGER NOT NULL DEFAULT 0, -- points of the submission
    `judgable`	BOOLEAN NOT NULL DEFAULT TRUE, -- whether the submission is judgable
    CONSTRAINT `submission_campaign_id_fkey` FOREIGN KEY(`campaign_id`) REFERENCES `campaign`(`id`),
    CONSTRAINT `submission_submitted_by_id_fkey` FOREIGN KEY(`submitted_by_id`) REFERENCES `user`(`id`),
    CONSTRAINT `submission_date_check` CHECK(`submitted_at` > `created_at`),
    CONSTRAINT `submission_unique_campaign_id_pageid` UNIQUE(`campaign_id`, `pageid`)
);
CREATE TABLE IF NOT EXISTS `jury` (
    `user_id`	INTEGER NOT NULL, -- user id of the jury
    `username`    TEXT NOT NULL, -- username of the jury
    `campaign_id`	INTEGER NOT NULL, -- campaign id
    `created_at`	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- creation time of the jury
    `allowed`	BOOLEAN NOT NULL DEFAULT TRUE, -- whether the jury is allowed to vote
    `judged_count`	INTEGER NOT NULL DEFAULT 0, -- how many articles did this jury judged? (less or equal to submission count)
    `positive_votes`	INTEGER NOT NULL DEFAULT 0, -- how many articles did this jury voted positive?
    `negative_votes`	INTEGER NOT NULL DEFAULT 0, -- how many articles did this jury voted negative?
    `total_votes`	INTEGER NOT NULL DEFAULT 0, -- how many articles did this jury voted?
    CONSTRAINT `jury_campaign_id_fkey` FOREIGN KEY(`campaign_id`) REFERENCES `campaign`(`id`),
    CONSTRAINT `jury_user_id_fkey` FOREIGN KEY(`user_id`) REFERENCES `user`(`id`),
    CONSTRAINT `PK_jury` PRIMARY KEY (`user_id`,`campaign_id`)
);
CREATE TABLE IF NOT EXISTS `jury_vote` (
    `jury_id`	INTEGER NOT NULL, -- user id of the jury
    `submission_id`	INTEGER NOT NULL, -- submission id
    `created_at`	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- creation time of the vote
    `vote`	INTEGER NOT NULL, -- vote value
    CONSTRAINT `jury_vote_jury_id_fkey` FOREIGN KEY(`jury_id`) REFERENCES `jury`(`user_id`),
    CONSTRAINT `jury_vote_submission_id_fkey` FOREIGN KEY(`submission_id`) REFERENCES `submission`(`id`),
    CONSTRAINT `PK_jury_vote` PRIMARY KEY (`jury_id`,`submission_id`)
);
-- The Table would be used to store the statistics of a submission
CREATE TABLE IF NOT EXISTS `draft` (
    `id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    `total_words`	INTEGER  NULL DEFAULT NULL, -- total words of the page on the target wiki
    `added_bytes`	INTEGER  NULL DEFAULT NULL, -- added bytes of the page on the target wiki
    `added_words`	INTEGER  NULL DEFAULT NULL, -- added words of the page on the target wiki
    `calculated`	BOOLEAN NOT NULL DEFAULT FALSE, -- whether the submission is calculated
    `passed`    BOOLEAN NOT NULL DEFAULT FALSE, -- whether the submission is passed
    `submitted`	BOOLEAN NOT NULL DEFAULT FALSE, -- whether the submission is submitted
    CONSTRAINT `criteria_campaign_id_fkey` FOREIGN KEY(`campaign_id`) REFERENCES `campaign`(`id`),
    CONSTRAINT `submission_submitted_by_id_fkey` FOREIGN KEY(`submitted_by_id`) REFERENCES `user`(`id`)
);

-- This Table would be used to store the topic 
CREATE TABLE IF NOT EXISTS `topic` (
    `id`	VARCHAR(100) NOT NULL PRIMARY KEY,
    `title`	VARCHAR(95) NOT NULL,
    `country`    VARCHAR(3) NOT NULL
);

-- This Table would be used to store the category
CREATE TABLE IF NOT EXISTS `category` (
    `id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `title`	TEXT NOT NULL UNIQUE
);

-- This Table would be used to store the task
CREATE TABLE IF NOT EXISTS `task` (
    `id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `submitted_by` INTEGER NOT NULL,
    `status`	TEXT NOT NULL,
    `created_at`	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `topic_id`	VARCHAR(100) NOT NULL,
    `task_data`	TEXT NOT NULL,
    `category_count`    INTEGER NOT NULL DEFAULT 0,
    `category_done`    INTEGER NOT NULL DEFAULT 0,
    `last_category`    TEXT NULL DEFAULT NULL,
    `target_wiki`    TEXT NOT NULL,
    `article_count`    INTEGER NOT NULL DEFAULT 0,
    `country`    TEXT NOT NULL,
    FOREIGN KEY(`topic_id`) REFERENCES `topic`(`id`),
    FOREIGN KEY(`submitted_by`) REFERENCES `user`(`id`)

);
-- This Table would be used to store categories for a topic
CREATE TABLE IF NOT EXISTS `topic_category` (
    `topic_id`	VARCHAR(100) NOT NULL,
    `category_id`	INTEGER NOT NULL,
    PRIMARY KEY(`topic_id`,`category_id`)
);

"""
SQL2_INIT = """
-- This Table would be used to store the article
CREATE TABLE IF NOT EXISTS `article` (
    `id`	INTEGER NOT NULL,
    `task_id`	INTEGER NOT NULL,
    `title`	TEXT NOT NULL,
    `target`	TEXT NOT NULL,
    `wikidata`	TEXT NULL DEFAULT NULL,
    `category`	TEXT NOT NULL,
    `created_at`	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `target_lang` TEXT NULL DEFAULT NULL,
    PRIMARY KEY(`id`,`task_id`)
);
"""
SQL1_CREATE_TASK = """
INSERT INTO
    `task` (status, topic_id, task_data, target_wiki, country, `category_count`, `submitted_by`)
VALUES
    (:status, :topic_id, :task_data, :target_wiki, :country, :category_count, :submitted_by);
"""
SQL1_GET_TASK = "SELECT * FROM `task` WHERE `id` = :task_id"
SQL1_GET_TASKS = "SELECT * FROM `task`"
SQL1_GET_TASKS_BY_STATUS = "SELECT * FROM `task` WHERE `status` = :status"

SQL2_GET_ARTICLES_BY_TASK_ID = "SELECT * FROM `article` WHERE `task_id` = :task_id ORDER BY `title` ASC"
SQL2_INSERT_ARTICLE = """
INSERT INTO
    `article` (`id`, `task_id`, `title`, target, wikidata, category, `target_lang`)
VALUES
    (:id, :task_id, :title, :target, :wikidata, :category, :target_lang)
    ON CONFLICT DO NOTHING;
"""
SQL2_GET_ARTICLE_BY_pageid_AND_TASK_ID = """
SELECT * FROM `article` WHERE `id` = :id AND `task_id` = :task_id;
"""

SQL1_INSERT_CATEGORY = """
INSERT INTO
    `category` (id, title)
VALUES
    (:id, :title)
    ON CONFLICT DO NOTHING;
"""
SQL1_INSERT_TOPIC_CATEGORY = """
INSERT INTO
    `topic_category` (topic_id, category_id)
VALUES
    (:topic_id, :category_id);
"""
SQL1_GET_CATEGORIES_BY_TOPIC_ID = """
SELECT
    `category`.`id` AS `id`,
    `category`.`title` AS `title`
FROM
    `category`
INNER JOIN
    `topic_category`
ON
    `category`.`id` = `topic_category`.`category_id`
WHERE
    `topic_category`.`topic_id` = :topic_id;
"""
SQL1_TASK_UPDATE_ARTICLE_COUNT = """
UPDATE
    `task` SET
        `article_count` = `article_count` + :new_added,
        `category_done` = `category_done` + :category_done,
        `last_category` = :last_category
WHERE `id` = :task_id
"""

SQL1_DELETE_UNUSED_ARTICLES = "DELETE FROM `article` WHERE `created_at` < CURRENT_TIMESTAMP - 60*60*24*7;"
SQL1_INSERT_TOPIC = "INSERT INTO `topic` (`id`, `title`, `country`) VALUES (:id, :title, :country);"
SQL1_GET_TOPIC_BY_ID = "SELECT * FROM `topic` WHERE `id` = :id;"
SQL1_GET_TOPICS = "SELECT * FROM `topic`;"

SQL1_GET_CATEGORY_BY_TOPIC_ID="""
SELECT
    `category`.`id` AS `id`,
    `category`.`title` AS `title`
FROM
    `category`
INNER JOIN
    `topic_category`
ON
    `category`.`id` = `topic_category`.`category_id`
WHERE
    `topic_category`.`topic_id` = :topic_id;
"""
SQL1_GET_CATEGORY_REL_BY_TOPIC_ID = """
SELECT
    `category_id` AS `id`
FROM
    `topic_category`
WHERE
    `topic_category`.`topic_id` = :topic_id;
"""
SQL1_INSERT_USER = "INSERT INTO `user` (`id`, `username`,`rights`) VALUES (:id, :username, :rights)"
SQL1_GET_STATISTICS_FROM_USER="""
SELECT
    COUNT(*) AS `registered_user_count`,
    SUM(`article_count`) AS `total_articles`,
    SUM(`category_count`) AS `total_categories`,
    SUM(`task_count`) AS `total_tasks`
FROM `user`
    """
SQL1_UPDATE_TOPIC_CATEGORY_COUNT = """
UPDATE
    `topic` SET
        `category_count` = `category_count` + :category_count
WHERE `id` = :topic_id
"""
SQL1_DELETE_TOPIC_CATEGORY = """
DELETE FROM `topic_category` WHERE `topic_id` = :topic_id AND `category_id` = :category_id
"""
SQL1_GET_COUNTRIES = """
SELECT
    *
FROM
    `topic`
WHERE
    `id` LIKE :title_prefix
"""
SQL1_GET_USER_SUMMARY = """
SELECT
    *
FROM
    `user`
"""
SQL2_DELETE_UNUSED_ARTICLES = "DELETE FROM `article` WHERE `created_at` < ?"
SQL2_GET_MISSING_TRANSLATION = """
SELECT
    `article`.`id` AS `id`,
    `article`.`title` AS `title`,
    `article`.`target` AS `target`
FROM
    `article`
WHERE
    `task_id` = :task_id
"""