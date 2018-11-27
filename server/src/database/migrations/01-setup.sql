-- Text encoding used: UTF-8
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: users
CREATE TABLE users (
    id         STRING UNIQUE,
    time       DATETIME DEFAULT (CURRENT_TIMESTAMP),
    name       STRING,
    secret     VARCHAR(30),
    blob       STRING
);

-- Table: comments
CREATE TABLE comments (
    id        STRING   UNIQUE,
    time      DATETIME DEFAULT (CURRENT_TIMESTAMP),
    text      STRING NOT NULL,
    user      STRING,
    url       STRING,
    thread_id STRING,
    blob      STRING
);

-- Table: questions
CREATE TABLE questions (
    id        STRING   UNIQUE,
    time      DATETIME DEFAULT (CURRENT_TIMESTAMP),
    text      STRING,
    user      STRING,
    url       STRING,
    thread_id STRING,
    blob      STRING
);

-- Table: reactions
CREATE TABLE reactions (
    id         STRING UNIQUE,
    time       DATETIME DEFAULT (CURRENT_TIMESTAMP),
    emoji      CHAR,
    user       STRING,
    comment_id STRING
);

-- Table: threads
CREATE TABLE threads (
  id            STRING UNIQUE,
  container_id  INTEGER,
  blob          STRING
);


-- Table: Migrations
CREATE TABLE migrations (file STRING UNIQUE);


COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
