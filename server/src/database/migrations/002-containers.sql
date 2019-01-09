-- Text encoding used: UTF-8
--
BEGIN TRANSACTION;

-- Table: containers
CREATE TABLE containers (
  id            CHAR(8) UNIQUE NOT NULL,
  subdomain     VARCHAR(32) UNIQUE NOT NULL,
  url           VARCHAR(255) NOT NULL,
  user_id       CHAR(8) NOT NULL,
  blob          TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

COMMIT TRANSACTION;

