-- Migration: Add detailed property fields
-- Run this migration to add detailed property information fields

-- Add new fields to properties table
ALTER TABLE `properties` 
ADD COLUMN IF NOT EXISTS `bathrooms` INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `orientation` VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `balconies` INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `construction_type` VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `has_basement` BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `has_attic` BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `building_floors` INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `parking_spaces` INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `bedrooms` INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `is_negotiable` BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS `address` VARCHAR(255) DEFAULT NULL;

-- Update existing properties to have negotiable as true by default
UPDATE `properties` 
SET `is_negotiable` = TRUE 
WHERE `is_negotiable` IS NULL;
