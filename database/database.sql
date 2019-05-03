CREATE DATABASE dating owner postgres encoding 'utf8';
\c dating;

CREATE TABLE users
(
    id serial NOT NULL UNIQUE,
    username VARCHAR(45),
    nickname VARCHAR(45),
    age smallint,
    gender VARCHAR(5),
    income_level VARCHAR(100),
    location_id INTEGER,
    address VARCHAR(255),
    occupation VARCHAR(255),
    ethnic VARCHAR(255),
    created_at timestamp,
    updated_at timestamp,
    deleted_at timestamp,
    PRIMARY KEY (id)
) WITHOUT OIDS;

ALTER SEQUENCE users_id_SEQ INCREMENT 1 RESTART 1;