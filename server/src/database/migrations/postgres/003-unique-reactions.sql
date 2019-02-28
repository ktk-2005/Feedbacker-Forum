
BEGIN TRANSACTION;

ALTER TABLE reactions
  ADD CONSTRAINT unique_emoji_user_id_comment_id_constraint UNIQUE(emoji, user_id, comment_id);

COMMIT TRANSACTION;

