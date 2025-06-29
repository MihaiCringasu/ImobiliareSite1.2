-- Migration: Add rent category and map location support
-- Run this migration to add rent category support and map location

-- Update properties table to ensure category column exists and add map location
ALTER TABLE `properties` 
ADD COLUMN IF NOT EXISTS `category` ENUM('vanzare', 'inchiriere') NOT NULL DEFAULT 'vanzare',
ADD COLUMN IF NOT EXISTS `map_url` VARCHAR(1024) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `map_embed_url` VARCHAR(1024) DEFAULT NULL;

-- Update existing properties to have vanzare category if null
UPDATE `properties` 
SET `category` = 'vanzare' 
WHERE `category` IS NULL OR `category` = '';

-- Add index for better performance
ALTER TABLE `properties` 
ADD INDEX `idx_category` (`category`),
ADD INDEX `idx_type_category` (`type`, `category`);
