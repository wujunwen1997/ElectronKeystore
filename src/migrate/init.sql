CREATE TABLE IF NOT EXISTS gateway (
   url varchar(255) PRIMARY KEY ,
   encrypt_aes_key varchar(255) NOT NULL,
   encrypt_token varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS password (
    password_hash varchar(255) PRIMARY KEY,
    salt varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS key (
   pubkey_hash varchar(255) PRIMARY KEY ,
   p2sh_p2wpkh varchar(255),
   encrypt_key text NOT NULL,
   compressed integer DEFAULT 0,
   algorithm varchar(255) NULL,
   created_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS redeem_hash ON key (p2sh_p2wpkh);

CREATE TABLE IF NOT EXISTS hd (
   mnemonic varchar(255) PRIMARY KEY ,
   encrypt_seed text NOT NULL,
   created_at text NOT NULL
);
