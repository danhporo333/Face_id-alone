-- CreateTable
CREATE TABLE `KhoaVien` (
    `makv` VARCHAR(191) NOT NULL,
    `tenkv` VARCHAR(191) NOT NULL,
    `dtkv` VARCHAR(191) NULL,
    `diaChi` VARCHAR(191) NULL,

    PRIMARY KEY (`makv`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lop` (
    `malop` VARCHAR(191) NOT NULL,
    `tenlop` VARCHAR(191) NOT NULL,
    `siso` INTEGER NOT NULL,
    `makv` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`malop`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SV` (
    `mssv` VARCHAR(191) NOT NULL,
    `malop` VARCHAR(191) NOT NULL,
    `holot` VARCHAR(191) NOT NULL,
    `ten` VARCHAR(191) NOT NULL,
    `ntns` DATETIME(3) NOT NULL,
    `phai` VARCHAR(191) NOT NULL,
    `dt_sv` VARCHAR(191) NULL,
    `emailSV` VARCHAR(191) NULL,

    PRIMARY KEY (`mssv`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MonHoc` (
    `mamh` VARCHAR(191) NOT NULL,
    `tenmh` VARCHAR(191) NOT NULL,
    `tclt` INTEGER NOT NULL,
    `lcth` INTEGER NOT NULL,

    PRIMARY KEY (`mamh`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GV` (
    `mgv` VARCHAR(191) NOT NULL,
    `hoGV` VARCHAR(191) NOT NULL,
    `tenGV` VARCHAR(191) NOT NULL,
    `dt_gv` VARCHAR(191) NULL,
    `donVi` VARCHAR(191) NULL,

    PRIMARY KEY (`mgv`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Phong` (
    `sop` VARCHAR(191) NOT NULL,
    `sucChua` INTEGER NOT NULL,
    `coSo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`sop`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TKB` (
    `id` VARCHAR(191) NOT NULL,
    `thu` VARCHAR(191) NOT NULL,
    `ngay` DATETIME(3) NOT NULL,
    `tietBD` INTEGER NOT NULL,
    `tietKT` INTEGER NOT NULL,
    `mamh` VARCHAR(191) NOT NULL,
    `mgv` VARCHAR(191) NOT NULL,
    `sop` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiemDanh` (
    `mssv` VARCHAR(191) NOT NULL,
    `id` VARCHAR(191) NOT NULL,
    `coMat` BOOLEAN NOT NULL,
    `diTre` BOOLEAN NOT NULL,
    `lyDoKhac` VARCHAR(191) NULL,

    PRIMARY KEY (`mssv`, `id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Lop` ADD CONSTRAINT `Lop_makv_fkey` FOREIGN KEY (`makv`) REFERENCES `KhoaVien`(`makv`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SV` ADD CONSTRAINT `SV_malop_fkey` FOREIGN KEY (`malop`) REFERENCES `Lop`(`malop`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TKB` ADD CONSTRAINT `TKB_mamh_fkey` FOREIGN KEY (`mamh`) REFERENCES `MonHoc`(`mamh`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TKB` ADD CONSTRAINT `TKB_mgv_fkey` FOREIGN KEY (`mgv`) REFERENCES `GV`(`mgv`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TKB` ADD CONSTRAINT `TKB_sop_fkey` FOREIGN KEY (`sop`) REFERENCES `Phong`(`sop`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiemDanh` ADD CONSTRAINT `DiemDanh_mssv_fkey` FOREIGN KEY (`mssv`) REFERENCES `SV`(`mssv`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiemDanh` ADD CONSTRAINT `DiemDanh_id_fkey` FOREIGN KEY (`id`) REFERENCES `TKB`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
