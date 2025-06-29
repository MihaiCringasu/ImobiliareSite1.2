-- Migration: Add images support to properties
-- Run this migration to add image support and move video data to separate section

-- Add images table
CREATE TABLE IF NOT EXISTS `property_images` (
  `id` varchar(36) NOT NULL,
  `property_id` varchar(36) NOT NULL,
  `url` varchar(512) NOT NULL,
  `alt` varchar(255) DEFAULT NULL,
  `order_index` int(11) DEFAULT 0,
  `is_primary` boolean DEFAULT false,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `property_id` (`property_id`),
  FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add videos table for separate video section
CREATE TABLE IF NOT EXISTS `property_videos` (
  `id` varchar(36) NOT NULL,
  `property_id` varchar(36) NOT NULL,
  `url` varchar(512) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `property_id` (`property_id`),
  FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Migrate existing video URLs to the videos table
INSERT INTO `property_videos` (`id`, `property_id`, `url`, `title`, `order_index`)
SELECT 
  UUID() as id,
  id as property_id,
  videoUrl as url,
  CONCAT('Video pentru ', title) as title,
  0 as order_index
FROM `properties` 
WHERE videoUrl IS NOT NULL AND videoUrl != '';

-- Migrate existing thumbnail URLs to images table
INSERT INTO `property_images` (`id`, `property_id`, `url`, `alt`, `order_index`, `is_primary`)
SELECT 
  UUID() as id,
  id as property_id,
  thumbnailUrl as url,
  CONCAT('Imagine principală pentru ', title) as alt,
  0 as order_index,
  true as is_primary
FROM `properties` 
WHERE thumbnailUrl IS NOT NULL AND thumbnailUrl != '';

-- Remove videoUrl and thumbnailUrl columns from properties table
-- (Keep them for now to ensure backward compatibility during transition)
-- ALTER TABLE `properties` DROP COLUMN `videoUrl`;
-- ALTER TABLE `properties` DROP COLUMN `thumbnailUrl`;
