BEGIN TRANSACTION;

ALTER TABLE comments
DROP CONSTRAINT comments_thread_id_fkey;
ALTER TABLE comments
ADD CONSTRAINT comments_thread_id_fkey
FOREIGN KEY (thread_id)
REFERENCES threads(id)
ON DELETE CASCADE;


ALTER TABLE comments
DROP CONSTRAINT comments_user_id_fkey;
ALTER TABLE comments
ADD CONSTRAINT comments_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;


ALTER TABLE questions
DROP CONSTRAINT questions_thread_id_fkey;
ALTER TABLE questions
ADD CONSTRAINT questions_thread_id_fkey
FOREIGN KEY (thread_id)
REFERENCES threads(id)
ON DELETE CASCADE;


ALTER TABLE questions
DROP CONSTRAINT questions_user_id_fkey;
ALTER TABLE questions
ADD CONSTRAINT questions_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;


ALTER TABLE reactions
DROP CONSTRAINT reactions_user_id_fkey;
ALTER TABLE reactions
ADD CONSTRAINT reactions_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;


ALTER TABLE reactions
DROP CONSTRAINT reactions_comment_id_fkey;
ALTER TABLE reactions
ADD CONSTRAINT reactions_comment_id_fkey
FOREIGN KEY (comment_id)
REFERENCES comments(id)
ON DELETE CASCADE;


ALTER TABLE threads
DROP CONSTRAINT threads_container_id_fkey;
ALTER TABLE threads
ADD CONSTRAINT threads_container_id_fkey
FOREIGN KEY (container_id)
REFERENCES containers(id)
ON DELETE CASCADE;


COMMIT TRANSACTION;
