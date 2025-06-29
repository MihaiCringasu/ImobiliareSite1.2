-- Add address field to properties table
ALTER TABLE properties ADD COLUMN address TEXT AFTER location;
