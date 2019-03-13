BEGIN TRANSACTION;

-- Table: Authorization
CREATE TABLE container_auth (
  subdomain  VARCHAR(32) NOT NULL,
  user_id    CHAR(8) NOT NULL,

  FOREIGN KEY (subdomain) REFERENCES containers(subdomain) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  UNIQUE (subdomain, user_id)
);

COMMIT TRANSACTION;
