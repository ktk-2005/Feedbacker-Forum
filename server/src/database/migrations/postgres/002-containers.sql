
BEGIN TRANSACTION;

-- Table: containers
CREATE TABLE containers (
  id            VARCHAR(64) UNIQUE NOT NULL,
  subdomain     VARCHAR(32) UNIQUE NOT NULL,
  url           VARCHAR(255) NOT NULL,
  user_id       CHAR(8) NOT NULL,
  blob          TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE threads
  ADD FOREIGN KEY (container_id) REFERENCES containers(id);

COMMIT TRANSACTION;


