CREATE TABLE IF NOT EXISTS password (
    password_hash varchar(255) PRIMARY KEY,
    salt varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS gateway (
    url varchar(255) PRIMARY KEY ,
    aes_key varchar(255) NOT NULL,
    aes_token varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS key (
   pubkey_hash varchar(255) PRIMARY KEY ,
   encrypt_key varchar(255) NOT NULL,
   created_at text NOT NULL
);
