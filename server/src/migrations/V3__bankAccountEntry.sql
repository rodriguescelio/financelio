CREATE TABLE IF NOT EXISTS bank_account_entry (
  id UUID NOT NULL,
  bank_account_id UUID NOT NULL,
  description TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  type CHARACTER VARYING (32) NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT bank_account_entry_pk PRIMARY KEY (id),
  CONSTRAINT bank_account_entry_1_fk FOREIGN KEY (bank_account_id) REFERENCES bank_account (id) ON DELETE CASCADE ON UPDATE CASCADE
);

