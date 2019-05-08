CREATE DATABASE dating owner postgres encoding 'utf8';
\c dating;

DROP TABLE IF EXISTS social_users;
DROP TABLE IF EXISTS facebook_users;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_friends;

CREATE TABLE IF NOT EXISTS users
(
    id serial NOT NULL UNIQUE,
    username VARCHAR(45),
    nickname VARCHAR(45),
    profile_picture VARCHAR(255),
    age smallint,
    gender VARCHAR(5),
    income_level VARCHAR(100),
    location VARCHAR(100),
    occupation VARCHAR(255),
    ethnic VARCHAR(255),
    created_at timestamp,
    updated_at timestamp,
    deleted_at timestamp,
    PRIMARY KEY (id)
) WITHOUT OIDS;

ALTER SEQUENCE users_id_SEQ INCREMENT 1 RESTART 1;

CREATE TABLE IF NOT EXISTS social_users
(
    id serial NOT NULL UNIQUE,
    social_id VARCHAR(255),
    social_type VARCHAR(10),
    user_id INTEGER,
    created_at timestamp,
    updated_at timestamp,
    deleted_at timestamp,
    PRIMARY KEY (id)
) WITHOUT OIDS;

ALTER SEQUENCE social_users_id_SEQ INCREMENT 1 RESTART 1;

ALTER TABLE social_users
	ADD FOREIGN KEY (user_id)
	REFERENCES users (id)
	ON UPDATE RESTRICT
	ON DELETE RESTRICT
;

CREATE UNIQUE INDEX IF NOT EXISTS social_user_idx ON social_users (social_id, social_type);

CREATE TABLE IF NOT EXISTS facebook_users
(
    id VARCHAR(255) NOT NULL UNIQUE,
    access_token VARCHAR(255),
    created_at timestamp,
    updated_at timestamp,
    deleted_at timestamp,
    PRIMARY KEY (id)
) WITHOUT OIDS;

CREATE TABLE IF NOT EXISTS user_friends
(
    id serial NOT NULL UNIQUE,
    user_id INTEGER,
    friend_id INTEGER,
    status smallint,
    created_at timestamp,
    updated_at timestamp,
    deleted_at timestamp,
    PRIMARY KEY (id)
) WITHOUT OIDS;

ALTER SEQUENCE user_friends_id_SEQ INCREMENT 1 RESTART 1;

ALTER TABLE user_friends
	ADD FOREIGN KEY (user_id)
	REFERENCES users (id)
	ON UPDATE RESTRICT
	ON DELETE RESTRICT
;
ALTER TABLE user_friends
	ADD FOREIGN KEY (friend_id)
	REFERENCES users (id)
	ON UPDATE RESTRICT
	ON DELETE RESTRICT
;