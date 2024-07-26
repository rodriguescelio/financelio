ALTER TABLE bank_account_entry ADD COLUMN IF NOT EXISTS bill_id UUID;
ALTER TABLE bank_account_entry ADD CONSTRAINT bank_account_entry_3_fk FOREIGN KEY (bill_id) REFERENCES bill (id) ON UPDATE CASCADE ON DELETE SET NULL;
