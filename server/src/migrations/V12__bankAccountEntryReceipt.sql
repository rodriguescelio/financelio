ALTER TABLE bank_account_entry ADD COLUMN IF NOT EXISTS receipt_id UUID;
ALTER TABLE bank_account_entry ADD CONSTRAINT bank_account_entry_2_fk FOREIGN KEY (receipt_id) REFERENCES receipt (id) ON UPDATE CASCADE ON DELETE SET NULL;
