CREATE TABLE IF NOT EXISTS gateway (
    url varchar(255) PRIMARY KEY ,
    aes_key varchar(255) NOT NULL,
    aes_token varchar(255) NOT NULL
);
