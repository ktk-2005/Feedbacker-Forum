--
-- File generated with SQLiteStudio v3.1.1 on Tue Nov 20 15:15:48 2018
--
-- Text encoding used: UTF-8
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: comments
CREATE TABLE comments (
    id        STRING   UNIQUE,
    time      DATETIME DEFAULT (CURRENT_TIMESTAMP),
    text      STRING,
    user      STRING,
    url       STRING,
    thread_id STRING
);
INSERT INTO comments (id, time, text, user, url, thread_id) VALUES ('1bd8052b', '2018-11-14 16:35:27', 'skrattia', 'jaba', NULL, '55c132a6');
INSERT INTO comments (id, time, text, user, url, thread_id) VALUES ('cb38e8f6', '2018-11-14 17:10:42', 'tröttistä', 'jaba', NULL, '8ed4ee5d');

-- Table: questions
CREATE TABLE questions (
    id        STRING   UNIQUE,
    time      DATETIME DEFAULT (CURRENT_TIMESTAMP),
    text      STRING,
    user      STRING,
    url       STRING,
    thread_id STRING
);
INSERT INTO questions (id, time, text, user, url, thread_id) VALUES ('eb1de3fc', '2018-11-14 17:40:09', 'Mitä tänään syötäisiin?', 'jaba', NULL, 'b07ed81a');

-- Table: reactions
CREATE TABLE reactions (
    id         STRING UNIQUE,
    time       DATETIME DEFAULT (CURRENT_TIMESTAMP),
    emoji      CHAR,
    user       STRING,
    comment_id STRING
);
INSERT INTO reactions (id, time, emoji, user, comment_id) VALUES ('5eaafea3', '2018-11-14 16:38:41', '👌', 'jaba', '1bd8052b');
INSERT INTO reactions (id, time, emoji, user, comment_id) VALUES ('fb05d1a5', '2018-11-14 16:59:32', '🅱️', 'jaba', '1bd8052b');
INSERT INTO reactions (id, time, emoji, user, comment_id) VALUES ('cba06aee', '2018-11-14 23:20:11', '🅱️', 'jaba', '1bd8052b');

-- Table: threads
CREATE TABLE threads (id STRING UNIQUE, container_id INTEGER);
INSERT INTO threads (id, container_id) VALUES (1, 2);
INSERT INTO threads (id, container_id) VALUES (2, 2);
INSERT INTO threads (id, container_id) VALUES (3, 2);

-- Table: Migrations
CREATE TABLE migrations (file STRING UNIQUE);


COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
