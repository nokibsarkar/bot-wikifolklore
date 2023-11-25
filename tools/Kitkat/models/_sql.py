

SQL1_INIT = """
CREATE TABLE IF NOT EXISTS `user` (
    `id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `username`	TEXT NOT NULL UNIQUE,
    `rights`	INTEGER NOT NULL DEFAULT 0,
    `created_at`	TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `article_count`	INTEGER DEFAULT 0,
    `category_count`	INTEGER DEFAULT 0,
    `task_count`	INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS `campaign` (
    `id`    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `title`    TEXT NOT NULL,
    `language`    TEXT NOT NULL,
    `start_at`    TEXT NOT NULL,
    `end_at`    TEXT NOT NULL,
    `created_at`    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `creator_id`    INTEGER NOT NULL,
    `approved_by`    INTEGER NOT NULL,
    `approved_at`    TEXT NOT NULL,
    `description`    TEXT NOT NULL,
    `rules`    TEXT NOT NULL,
    `blacklist`    TEXT NULL DEFAULT NULL,
    `image`    TEXT NULL DEFAULT NULL,
    `jury`    TEXT NULL DEFAULT NULL,
    `status`    TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT `campaign_approved_by_fkey` FOREIGN KEY(`approved_by`) REFERENCES `user`(`id`),
    CONSTRAINT `campaign_creator_id_fkey` FOREIGN KEY(`creator_id`) REFERENCES `user`(`id`),
    CONSTRAINT `campaign_start_end_check` CHECK(`start_at` < `end_at`),
    CONSTRAINT `campaign_approved_at_check` CHECK(`created_at` <= `approved_at` AND `approved_at` <= `start_at`)
);
CREATE TABLE IF NOT EXISTS `submission` (
    `id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `page_id`	INTEGER NOT NULL, -- page_id of the page on the target wiki
    `campaign_id`	INTEGER NOT NULL, -- campaign id
    `title`	TEXT NOT NULL, -- title of the page on the target wiki
    `old_id`	INTEGER NOT NULL, -- revision id of the page on the home wiki
    `target_wiki`	TEXT NOT NULL, -- target wiki language code
    `submitted_at`	TEXT NOT NULL, -- submission time
    `submitter_id`	INTEGER NOT NULL, -- user id of the submitter
    `submitter_username`	TEXT NOT NULL, -- username of the submitter
    `created_at`	TEXT NOT NULL, -- creation time of the page on the target wiki
    `creator_id`	INTEGER NOT NULL, -- user id of the creator
    `creator_username`	TEXT NOT NULL, -- username of the creator
    `total_bytes`	INTEGER NOT NULL, -- total bytes of the page on the target wiki
    `total_words`	INTEGER NOT NULL, -- total words of the page on the target wiki
    `added_bytes`	INTEGER NOT NULL, -- added bytes of the page on the target wiki
    `added_words`	INTEGER NOT NULL, -- added words of the page on the target wiki
    `points`	INTEGER NOT NULL DEFAULT 0, -- points of the submission
    `positive_votes`	INTEGER NOT NULL, -- positive votes of the submission
    `negative_votes`	INTEGER NOT NULL, -- negative votes of the submission
    `total_votes`	INTEGER NOT NULL, -- total votes of the submission
    `judgable`	INTEGER NOT NULL DEFAULT TRUE, -- whether the submission is judgable
    CONSTRAINT `submission_campaign_id_fkey` FOREIGN KEY(`campaign_id`) REFERENCES `campaign`(`id`),
    CONSTRAINT `submission_submitter_id_fkey` FOREIGN KEY(`submitter_id`) REFERENCES `user`(`id`),
    CONSTRAINT `submission_date_check` CHECK(`submitted_at` < `created_at`)
);
CREATE TABLE IF NOT EXISTS `jury` (
    `user_id`	INTEGER NOT NULL, -- user id of the jury
    `campaign_id`	INTEGER NOT NULL, -- campaign id
    `created_at`	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- creation time of the jury
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
"""