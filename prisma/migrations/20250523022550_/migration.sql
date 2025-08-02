/*
  Warnings:

  - You are about to drop the column `lcth` on the `MonHoc` table. All the data in the column will be lost.
  - You are about to drop the `KhoaVien` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tcth` to the `MonHoc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenPhong` to the `Phong` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Lop` DROP FOREIGN KEY `Lop_makv_fkey`;

-- DropIndex
DROP INDEX `Lop_makv_fkey` ON `Lop`;

-- AlterTable
ALTER TABLE `DiemDanh` ADD COLUMN `faceID` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `MonHoc` DROP COLUMN `lcth`,
    ADD COLUMN `tcth` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Phong` ADD COLUMN `tenPhong` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `SV` ADD COLUMN `faceID` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `KhoaVien`;

-- CreateTable
CREATE TABLE `khoaVien` (
    `makv` VARCHAR(191) NOT NULL,
    `tenkv` VARCHAR(191) NOT NULL,
    `dtkv` VARCHAR(191) NULL,
    `diaChi` VARCHAR(191) NULL,

    PRIMARY KEY (`makv`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL DEFAULT 'ADMIN',
    `mssv` VARCHAR(191) NULL,
    `mgv` VARCHAR(191) NULL,

    UNIQUE INDEX `User_mssv_key`(`mssv`),
    UNIQUE INDEX `User_mgv_key`(`mgv`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Lop` ADD CONSTRAINT `Lop_makv_fkey` FOREIGN KEY (`makv`) REFERENCES `khoaVien`(`makv`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_mssv_fkey` FOREIGN KEY (`mssv`) REFERENCES `SV`(`mssv`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_mgv_fkey` FOREIGN KEY (`mgv`) REFERENCES `GV`(`mgv`) ON DELETE SET NULL ON UPDATE CASCADE;
