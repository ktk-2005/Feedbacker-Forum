BEGIN TRANSACTION;

CREATE TABLE instance_runners (
  tag      VARCHAR(128) NOT NULL,
  time     VARCHAR(30) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  user_id  CHAR(8) NOT NULL,
  size     INT,
  status   CHAR(16) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),

  UNIQUE (tag, user_id)
);

ALTER TABLE containers
  ADD COLUMN runner VARCHAR(128) NOT NULL;

COMMIT TRANSACTION;
