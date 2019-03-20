-- Test data for development purposes

INSERT INTO users (id, time, name, secret, blob) VALUES ('da776df3', '2018-11-10 09:32:11', 'jaba', 'sf8a7s', NULL);

INSERT INTO containers (id, subdomain, url, user_id, runner, blob) VALUES ('APP-1111-aa34-4468-83ae-0cc334a7d38bf168b275-ba81-428e-a842-d63d', 'one', 'http://localhost:10001', 'da776df3', 'site', NULL);
INSERT INTO containers (id, subdomain, url, user_id, runner, blob) VALUES ('APP-2222-6009-4e3a-bd4d-21553db4df665544db26-24ea-46b2-a4c3-bd7b', 'two', 'http://localhost:10002', 'da776df3', 'site', NULL);
INSERT INTO containers (id, subdomain, url, user_id, runner, blob) VALUES ('APP-3333-6009-4e3a-bd4d-21553db4df665544db26-24ea-46b2-a4c3-bd7b', 'three', 'http://localhost:10003', 'da776df3', 'site', NULL);
INSERT INTO containers (id, subdomain, url, user_id, runner, blob) VALUES ('APD-1111-3ba9-4e1f-a4f4-1f5bc94b9e043bf31ee9-a239-4086-8288-f089', 'done', 'http://dockerhost:10001', 'da776df3', 'site', NULL);
INSERT INTO containers (id, subdomain, url, user_id, runner, blob) VALUES ('APD-2222-681e-4876-84bb-7316886551bf111e9f8f-9e62-4aed-b797-11b8', 'dtwo', 'http://dockerhost:10002', 'da776df3', 'site', NULL);
INSERT INTO containers (id, subdomain, url, user_id, runner, blob) VALUES ('APD-3333-681e-4876-84bb-7316886551bf111e9f8f-9e62-4aed-b797-11b8', 'dthree', 'http://dockerhost:10003', 'da776df3', 'site', NULL);
INSERT INTO containers (id, subdomain, url, user_id, runner, blob) VALUES ('APP-TEST-b4a8-4fc4-8685-4c3277e43f8e7ef2f33f-4ed9-409e-9404-6e85', 'test', 'http://localhost:8080', 'da776df3', 'site', NULL);
INSERT INTO containers (id, subdomain, url, user_id, runner, blob) VALUES ('APP-OTHR-0e90-48c8-b060-8cef900f0fb84c9d244a-b80c-45d5-a308-961b', 'other', 'http://localhost:8080', 'da776df3', 'site', NULL);
INSERT INTO containers (id, subdomain, url, user_id, runner, blob) VALUES ('APP-AUTH-70cb-479c-b457-b23dd64f8b69a0d98a47-be8d-4b12-adc8-985a', 'authorized', 'http://localhost:8080', 'da776df3', 'site', '{"auth": {"password": "$2a$10$Hr8a20CYZbBrSsnjAWQfu.l/v471fhXdwMbQc3Pgpqs.He.JVUwbu"}}');

INSERT INTO threads (id, container_id, blob) VALUES ('THR-1234', 'APP-TEST-b4a8-4fc4-8685-4c3277e43f8e7ef2f33f-4ed9-409e-9404-6e85', NULL);

INSERT INTO comments (id, time, text, user_id, thread_id, anonymous, blob) VALUES ('1bd8052b', '2018-11-14 16:35:27', 'skrattia', 'da776df3', 'THR-1234', 'f', '{"route":"/"}');
INSERT INTO comments (id, time, text, user_id, thread_id, anonymous, blob) VALUES ('cb38e8f6', '2018-11-14 17:10:42', 'tröttistä', 'da776df3', 'THR-1234', 't', '{"route":"/"}');
INSERT INTO comments (id, time, text, user_id, thread_id, anonymous, blob) VALUES ('13adr8sa', '2019-3-14 16:51:12', 'jaahaa', 'da776df3', 'THR-1234', 'f', '{"route":"/"}');


INSERT INTO questions (id, time, text, type, user_id, container_id, blob, order_id) VALUES ('eb1de3fc', '2018-11-14 17:40:09', 'Mitä tänään syötäisiin?', 'text', 'da776df3', 'APP-TEST-b4a8-4fc4-8685-4c3277e43f8e7ef2f33f-4ed9-409e-9404-6e85', NULL, 1);

INSERT INTO reactions (id, time, emoji, user_id, comment_id) VALUES ('5eaafea3', '2018-11-14 16:38:41', 'up', 'da776df3', 'cb38e8f6');
INSERT INTO reactions (id, time, emoji, user_id, comment_id) VALUES ('fb05d1a5', '2018-11-14 16:59:32', 'up', 'da776df3', '1bd8052b');
INSERT INTO reactions (id, time, emoji, user_id, comment_id) VALUES ('cba06aee', '2018-11-14 23:20:11', 'down', 'da776df3', '1bd8052b');
INSERT INTO reactions (id, time, emoji, user_id, comment_id) VALUES ('cba06dw', '2018-11-14 23:20:11', 'fire', 'da776df3', '1bd8052b');
