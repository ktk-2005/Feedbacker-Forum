
-- Table: containers
CREATE TABLE containers (
  id            CHAR(8) UNIQUE NOT NULL,
  subdomain     VARCHAR(32) UNIQUE NOT NULL,
  url           VARCHAR(255) NOT NULL,
  blob          TEXT
);


