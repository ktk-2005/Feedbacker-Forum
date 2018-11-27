-- Text encoding used: UTF-8
--
BEGIN TRANSACTION;

-- Table: users
CREATE TABLE users (
    id         CHAR(8) UNIQUE,
    time       VARCHAR(30) DEFAULT (CURRENT_TIMESTAMP), -- Postgres CURRENT_TIMESTAMP is 29 chars long
    name       VARCHAR(255),
    secret     CHAR(30),
    blob       TEXT
);

-- Table: comments
CREATE TABLE comments (
    id        CHAR(8)   UNIQUE,
    time      VARCHAR(30) DEFAULT (CURRENT_TIMESTAMP),
    text      TEXT,
    user_id   CHAR(8),
    thread_id CHAR(8),
    blob      TEXT
);

-- Table: questions
CREATE TABLE questions (
    id        CHAR(8) UNIQUE,
    time      VARCHAR(30) DEFAULT (CURRENT_TIMESTAMP),
    text      TEXT,
    user_id   CHAR(8),
    thread_id VARCHAR(8),
    blob      TEXT
);

-- Table: reactions
CREATE TABLE reactions (
    id         CHAR(8) UNIQUE,
    time       VARCHAR(30) DEFAULT (CURRENT_TIMESTAMP),
    emoji      VARCHAR(32),
    user_id    CHAR(8),
    comment_id CHAR(8)
);

-- Table: threads
CREATE TABLE threads (
  id            CHAR(8) UNIQUE,
  container_id  INTEGER,
  blob          TEXT
);


-- Table: Migrations
CREATE TABLE migrations (id INTEGER PRIMARY KEY, file VARCHAR(255) UNIQUE);


COMMIT TRANSACTION;
