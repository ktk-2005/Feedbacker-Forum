-- Text encoding used: UTF-8
--
BEGIN TRANSACTION;

-- Table: users
CREATE TABLE users (
    id         CHAR(8) UNIQUE NOT NULL,
    time       VARCHAR(30) DEFAULT (CURRENT_TIMESTAMP) NOT NULL, -- Postgres CURRENT_TIMESTAMP is 29 chars long
    name       VARCHAR(255),
    secret     CHAR(30) NOT NULL,
    blob       TEXT
);

-- Table: containers
CREATE TABLE containers (
  id            CHAR(8) UNIQUE NOT NULL,
  subdomain     VARCHAR(32) UNIQUE NOT NULL,
  url           VARCHAR(255) NOT NULL,
  user_id       CHAR(8) NOT NULL,
  blob          TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (comment_id) REFERENCES comments(id),

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


COMMIT TRANSACTION;
