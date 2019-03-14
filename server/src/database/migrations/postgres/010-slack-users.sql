BEGIN TRANSACTION;

CREATE TABLE slack_users (
    id            VARCHAR(8) UNIQUE NOT NULL,
    username      TEXT,
    slack_user_id VARCHAR(32)
);


ALTER TABLE users
ADD COLUMN slack_id VARCHAR(8),
ADD FOREIGN KEY (slack_id)
  REFERENCES slack_users(id);

COMMIT TRANSACTION;
