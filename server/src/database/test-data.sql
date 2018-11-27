-- Test data for developement purposes

INSERT INTO comments (id, time, text, user_id, thread_id) VALUES ('1bd8052b', '2018-11-14 16:35:27', 'skrattia', 'jaba', '55c132a6');
INSERT INTO comments (id, time, text, user_id, thread_id) VALUES ('cb38e8f6', '2018-11-14 17:10:42', 'tröttistä', 'jaba', '8ed4ee5d');

INSERT INTO questions (id, time, text, user_id, thread_id) VALUES ('eb1de3fc', '2018-11-14 17:40:09', 'Mitä tänään syötäisiin?', 'jaba', 'b07ed81a');

INSERT INTO reactions (id, time, emoji, user_id, comment_id) VALUES ('5eaafea3', '2018-11-14 16:38:41', '👌', 'jaba', '1bd8052b');
INSERT INTO reactions (id, time, emoji, user_id, comment_id) VALUES ('fb05d1a5', '2018-11-14 16:59:32', '🅱️', 'jaba', '1bd8052b');
INSERT INTO reactions (id, time, emoji, user_id, comment_id) VALUES ('cba06aee', '2018-11-14 23:20:11', '🅱️', 'jaba', '1bd8052b');

INSERT INTO comments (id, text, user_id, thread_id) VALUES ('13adr8sa', 'jaahaa', 'jaba', 'a688ad4f');

