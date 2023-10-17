
SQL1_INIT = """
CREATE TABLE IF NOT EXISTS `user` (
    `id` INTEGER PRIMARY KEY,
    `username` TEXT NOT NULL,
    `rights` INTEGER DEFAULT '0b100000', -- task-stats-category-topic-grant-revoke,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `article_count` INTEGER DEFAULT 0,
    `category_count` INTEGER DEFAULT 0,
    `task_count` INTEGER DEFAULT 0
);


-- This Table would be used to store the topic 
CREATE TABLE IF NOT EXISTS `topic` (
    `id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `title`	TEXT NOT NULL UNIQUE,
    `country`    TEXT NULL DEFAULT NULL
);
INSERT INTO
    `topic` (`id`, `title`)
VALUES
    (1, 'folklore/IN'),
    (2, 'folklore/BD'),
    (3, 'folklore/PAK')
 ON CONFLICT DO NOTHING;

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
    `topic_id`	INTEGER NOT NULL,
    `task_data`	TEXT NOT NULL,
    `category_count`    INTEGER NOT NULL DEFAULT 0,
    `category_done`    INTEGER NOT NULL DEFAULT 0,
    `last_category`    TEXT NULL DEFAULT NULL,
    `home_wiki`    TEXT NOT NULL,
    `target_wiki`    TEXT NOT NULL,
    `article_count`    INTEGER NOT NULL DEFAULT 0,
    `country`    TEXT NOT NULL,
    FOREIGN KEY(`topic_id`) REFERENCES `topic`(`id`),
    FOREIGN KEY(`submitted_by`) REFERENCES `user`(`id`)

);
-- This Table would be used to store categories for a topic
CREATE TABLE IF NOT EXISTS `topic_category` (
    `topic_id`	INTEGER NOT NULL,
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
    PRIMARY KEY(`id`,`task_id`)
);
"""
SQL1_CREATE_TASK = """
INSERT INTO
    `task` (status, topic_id, task_data, home_wiki, target_wiki, country, `category_count`, `submitted_by`)
VALUES
    (:status, :topic_id, :task_data, :home_wiki, :target_wiki, :country, :category_count, :submitted_by);
"""
SQL1_GET_TASK = "SELECT * FROM `task` WHERE `id` = :task_id"
SQL1_GET_TASKS = "SELECT * FROM `task`"
SQL1_GET_TASKS_BY_STATUS = "SELECT * FROM `task` WHERE `status` = :status"

SQL1_GET_ARTICLES_BY_TASK_ID = "SELECT * FROM `article` WHERE `task_id` = :task_id ORDER BY `title` ASC"
SQL1_INSERT_ARTICLE = """
INSERT INTO
    `article` (id, task_id, title, target, wikidata, category)
VALUES
    (:id, :task_id, :title, :target, :wikidata, :category)
    ON CONFLICT DO NOTHING;
"""
SQL1_GET_ARTICLE_BY_PAGE_ID_AND_TASK_ID = """
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
SQL1_GET_CATEGORIES_BY_TOPIC_TITLE = """
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
    `topic_category`.`topic_id` = (SELECT `id` FROM `topic` WHERE `title` = :topic_title);
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
SQL1_INSERT_TOPIC = "INSERT INTO `topic` (title, `country`) VALUES (:title, :country);"
SQL1_GET_TOPIC_BY_TITLE = "SELECT * FROM `topic` WHERE `title` = :title;"
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
SELECT DISTINCT
    `title`
FROM
    `topic`
WHERE
    `title` LIKE :title_prefix
"""