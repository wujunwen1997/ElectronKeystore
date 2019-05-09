CREATE TABLE IF NOT EXISTS password (
    password_hash varchar(255) PRIMARY KEY,
    salt varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS key (
   pubkey_hash varchar(255) PRIMARY KEY ,
   encrypt_key varchar(255) NOT NULL,
   created_at text NOT NULL
);
