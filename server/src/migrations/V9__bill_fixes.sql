ALTER TABLE bill DROP CONSTRAINT bill_2_fk;
ALTER TABLE bill DROP CONSTRAINT bill_3_fk;

ALTER TABLE bill ADD CONSTRAINT bill_2_fk FOREIGN KEY (category_id) REFERENCES category (id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE bill ADD CONSTRAINT bill_3_fk FOREIGN KEY (card_id) REFERENCES card (id) ON UPDATE CASCADE ON DELETE SET NULL;

