DATABASE_NAME='wiki.db'

SQL_INIT = """
-- This Table would be used to store the topic 
CREATE TABLE IF NOT EXISTS `topic` (
    `id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `title`	TEXT NOT NULL UNIQUE
);

-- This Table would be used to store the category
CREATE TABLE IF NOT EXISTS `category` (
    `pageid`	INTEGER NOT NULL PRIMARY KEY UNIQUE,
    `title`	TEXT NOT NULL UNIQUE
);
-- This Table would be used to store categories for a topic
CREATE TABLE IF NOT EXISTS `topic_category` (
    `topic_id`	INTEGER NOT NULL,
    `category_id`	INTEGER NOT NULL,
    PRIMARY KEY(`topic_id`,`category_id`)
);
-- This Table would be used to store the task
CREATE TABLE IF NOT EXISTS `task` (
    `id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `status`	TEXT NOT NULL,
    `created_at`	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `topic_id`	INTEGER NOT NULL,
    `task_data`	TEXT NOT NULL,
    `category_count`    INTEGER NOT NULL DEFAULT 0,
    `category_done`    INTEGER NOT NULL DEFAULT 0,
    `last_category`    TEXT NULL DEFAULT NULL,
    `home_wiki`    TEXT NOT NULL,
    `target_wiki`    TEXT NOT NULL,
    `article_count`    INTEGER NOT NULL DEFAULT 0,
    `country`    TEXT NOT NULL,
    FOREIGN KEY(`topic_id`) REFERENCES `topic`(`id`)
);
-- This Table would be used to store the article
CREATE TABLE IF NOT EXISTS `article` (
    `pageid`	INTEGER NOT NULL,
    `task_id`	INTEGER NOT NULL,
    `title`	TEXT NOT NULL,
    `target`	TEXT NOT NULL,
    `wikidata`	TEXT NULL DEFAULT NULL,
    `category`	TEXT NOT NULL,
    `created_at`	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    --- PRIMARY KEY(`pageid`,`task_id`),
    -- FOREIGN KEY(`task_id`) REFERENCES `task`(`id`)
);
INSERT INTO `topic` (id, title) VALUES (1, 'folklore/IN'),  (2, 'folklore/BD'), (3, 'folklore/PAK') ON CONFLICT DO NOTHING;
INSERT INTO `category` (pageid, title) VALUES (11360135, 'Category:Indian folklore') ON CONFLICT DO NOTHING;
INSERT INTO `topic_category` (topic_id, category_id) VALUES (1, 11360135) ON CONFLICT DO NOTHING;
"""
SQL_CREATE_TASK = """
INSERT INTO
    `task` (status, topic_id, task_data, home_wiki, target_wiki, country, `category_count`)
VALUES
    (:status, (SELECT `id` FROM `topic` WHERE `title` = :topic_title), :task_data, :home_wiki, :target_wiki, :country, :category_count);
"""
SQL_GET_TASK = "SELECT * FROM `task` WHERE `id` = :task_id"
SQL_GET_TASKS = "SELECT * FROM `task`"
SQL_GET_TASKS_BY_STATUS = "SELECT * FROM `task` WHERE `status` = :status"

SQL_GET_ARTICLES_BY_TASK_ID = "SELECT * FROM `article` WHERE `task_id` = :task_id ORDER BY `title` ASC"
SQL_INSERT_ARTICLE = """
INSERT INTO
    `article` (pageid, task_id, title, target, wikidata, category)
VALUES
    (:pageid, :task_id, :title, :target, :wikidata, :category)
    ON CONFLICT DO NOTHING;
"""
SQL_GET_ARTICLE_BY_PAGE_ID_AND_TASK_ID = """
SELECT * FROM `article` WHERE `pageid` = :pageid AND `task_id` = :task_id;
"""

SQL_INSERT_CATEGORY = """
INSERT INTO
    `category` (pageid, title)
VALUES
    (:pageid, :title);
"""
SQL_INSERT_TOPIC_CATEGORY = """
INSERT INTO
    `topic_category` (topic_id, category_id)
VALUES
    (:topic_id, :category_id);
"""
SQL_GET_CATEGORIES_BY_TOPIC_TITLE = """
SELECT
    `category`.`pageid` AS `pageid`,
    `category`.`title` AS `title`
FROM
    `category`
INNER JOIN
    `topic_category`
ON
    `category`.`pageid` = `topic_category`.`category_id`
WHERE
    `topic_category`.`topic_id` = (SELECT `id` FROM `topic` WHERE `title` = :topic_title);
"""
SQL_TASK_UPDATE_ARTICLE_COUNT = """
UPDATE
    `task` SET
        `article_count` = `article_count` + :new_added,
        `category_done` = `category_done` + :category_done,
        `last_category` = :last_category
WHERE `id` = :task_id
"""

SQL_DELETE_UNUSED_ARTICLES = "DELETE FROM `article` WHERE `created_at` < CURRENT_TIMESTAMP - 60*60*24*7;"