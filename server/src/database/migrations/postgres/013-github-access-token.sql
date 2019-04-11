BEGIN TRANSACTION;

CREATE TABLE github_access_token (
  user_id CHAR(8) NOT NULL PRIMARY KEY,
  access_token VARCHAR(128) NOT NULL,

  FOREIGN KEY (user_id) references users(id)
);

COMMIT TRANSACTION;
