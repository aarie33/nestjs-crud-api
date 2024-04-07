/*
  Warnings:

  - Added the required column `created_at` to the `posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `posts` ADD COLUMN `created_at` DATETIME NOT NULL,
    ADD COLUMN `deleted_at` DATETIME NULL,
    ADD COLUMN `updated_at` DATETIME NOT NULL;
