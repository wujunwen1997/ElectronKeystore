CREATE TABLE IF NOT EXISTS password (
    password_hash varchar(255) PRIMARY KEY,
    salt varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS key (
   pubkey_hash varchar(255) PRIMARY KEY ,
   p2sh_p2wpkh varchar(255),
   encrypt_key text NOT NULL,
   compressed integer default 0,
   created_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS redeem_hash ON key (p2sh_p2wpkh);

CREATE TABLE IF NOT EXISTS hd (
   mnemonic varchar(255) PRIMARY KEY ,
   encrypt_seed text NOT NULL,
   created_at text NOT NULL
);
