-- Text encoding used: UTF-8
--
BEGIN TRANSACTION;

-- Table: users
CREATE TABLE users (
    id         CHAR(8) UNIQUE NOT NULL,
    time       VARCHAR(30) DEFAULT (CURRENT_TIMESTAMP) NOT NULL, -- Postgres CURRENT_TIMESTAMP is 29 chars long
    name       VARCHAR(255),
    secret     CHAR(30) NOT NULL,
    slack_id   VARCHAR(8),
    blob       TEXT,
    FOREIGN KEY (slack_id) REFERENCES slack_users(id)
);

-- Table: containers
CREATE TABLE containers (
  id            VARCHAR(64) UNIQUE NOT NULL,
  time          VARCHAR(30) DEFAULT (CURRENT_TIMESTAMP) NOT NULL, -- Postgres CURRENT_TIMESTAMP is 29 chars long
  subdomain     VARCHAR(32) UNIQUE NOT NULL,
  url           VARCHAR(255) NOT NULL,
  user_id       CHAR(8) NOT NULL,
  runner        VARCHAR(128) NOT NULL,
  origin        TEXT,
  blob          TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: threads
CREATE TABLE threads (
  id            CHAR(8) UNIQUE NOT NULL,
  container_id  CHAR(8) NOT NULL,
  blob          TEXT,
  FOREIGN KEY (container_id) REFERENCES containers(id) ON DELETE CASCADE
);

-- Table: comments
CREATE TABLE comments (
    id        CHAR(8) UNIQUE NOT NULL,
    time      VARCHAR(30) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
    text      TEXT NOT NULL,
    user_id   CHAR(8) NOT NULL,
    thread_id CHAR(8) NOT NULL,
    anonymous INTEGER,
    blob      TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);

-- Table: questions
CREATE TABLE questions (
    id        CHAR(8) UNIQUE NOT NULL,
    time      VARCHAR(30) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
    text      TEXT NOT NULL,
    user_id   CHAR(8) NOT NULL,
    container_id VARCHAR(8) NOT NULL,
    type      VARCHAR(16) NOT NULL,
    blob      TEXT,
    order_id  INTEGER NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (container_id) REFERENCES containers(id) ON DELETE CASCADE
);

-- Table: reactions
CREATE TABLE reactions (
    id         CHAR(8) UNIQUE NOT NULL,
    time       VARCHAR(30) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
    emoji      VARCHAR(32) NOT NULL,
    user_id    CHAR(8) NOT NULL,
    comment_id CHAR(8) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,

    UNIQUE (emoji, user_id, comment_id) ON CONFLICT ROLLBACK
);

-- Table: answers
CREATE TABLE answers (
    id        CHAR(8) UNIQUE NOT NULL,
    time      VARCHAR(30) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
    user_id   CHAR(8) NOT NULL,
    question_id CHAR(8) NOT NULL,
    blob      TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,

    UNIQUE (user_id, question_id) ON CONFLICT ROLLBACK
);


-- Table: Migrations
CREATE TABLE migrations (id INTEGER PRIMARY KEY, file VARCHAR(255) UNIQUE);

-- Table: Instance runners
CREATE TABLE instance_runners (
  tag      VARCHAR(128) NOT NULL,
  time     VARCHAR(30) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  user_id  CHAR(8) NOT NULL,
  size     INT,
  status   CHAR(16) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),

  UNIQUE (tag, user_id) ON CONFLICT ROLLBACK
);

-- Table: Slack users
CREATE TABLE slack_users (
  id        VARCHAR(8) UNIQUE NOT NULL,
  username  TEXT,
  slack_user_id   VARCHAR(32)
);

-- Table: Authorization
CREATE TABLE container_auth (
  subdomain  VARCHAR(32) NOT NULL,
  user_id    CHAR(8) NOT NULL,
  token      CHAR(32) NOT NULL UNIQUE,

  FOREIGN KEY (subdomain) REFERENCES containers(subdomain),
  FOREIGN KEY (user_id) REFERENCES users(id),

  UNIQUE (subdomain, user_id) ON CONFLICT ROLLBACK
);

CREATE TABLE github_access_token (
  user_id CHAR(8) NOT NULL PRIMARY KEY,
  access_token VARCHAR(128) NOT NULL,

  FOREIGN KEY (user_id) references users(id)
);

COMMIT TRANSACTION;
