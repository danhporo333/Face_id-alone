import { prisma } from "config/client";
import { validatePhoneNumber } from "../utils/validator";
import { parseExcelFile } from "../utils/excelImport";
import fs from "fs";
import { paginate } from "../utils/paginate";

interface IKhoaVien {
  tenkv: string;
  dtkv?: string;
  diaChi?: string;
}

export const findKhoaVienByName = async (tenkv: string) => {
  const khoavien = await prisma.khoaVien.findFirst({
    where: {
      tenkv: {
        equals: tenkv,
      },
    },
  });
  return khoavien;
};

export const createKhoaVien = async (khoaVien: IKhoaVien) => {
  // Kiểm tra xem khoa viện đã tồn tại chưa
  const existingKhoaVien = await findKhoaVienByName(khoaVien.tenkv);
  if (existingKhoaVien) {
    throw new Error("Khoa viện đã tồn tại");
  }
  // Tạo mới khoa viện
  const khoavien = await prisma.khoaVien.create({
    data: {
      tenkv: khoaVien.tenkv,
      dtkv: khoaVien.dtkv,
      diaChi: khoaVien.diaChi,
    },
  });
  return khoavien;
};

export const getAllKhoaVien = async (page: number, pageSize: number) => {
  // Số lượng khoa viện trên mỗi trang
  // const skip = (page - 1) * pageSize;
  // const [khoavien, total] = await Promise.all([
  //   prisma.khoaVien.findMany({
  //     skip,
  //     take: pageSize,
  //     include: { lop: true },
  //   }),
  //   prisma.khoaVien.count(),
  // ]);
  // return { khoavien, total };
  return paginate(prisma.khoaVien, page, pageSize, { lop: true });
};

export const updateKhoaVien = async (makv: string, khoavien: IKhoaVien) => {
  // Kiểm tra xem khoa viện có tồn tại không
  const existingKhoaVien = await prisma.khoaVien.findUnique({
    where: { makv },
  });

  if (!existingKhoaVien) {
    throw new Error("Khoa viện không tồn tại");
  }

  // Kiểm tra xem tên mới có bị trùng với khoa viện khác không
  if (khoavien.tenkv !== existingKhoaVien.tenkv) {
    const duplicateKhoaVien = await prisma.khoaVien.findFirst({
      where: {
        tenkv: khoavien.tenkv,
        makv: { not: makv },
      },
    });

    if (duplicateKhoaVien) {
      throw new Error("Tên khoa viện đã tồn tại");
    }
  }

  // Cập nhật thông tin khoa viện
  const updatedKhoaVien = await prisma.khoaVien.update({
    where: { makv },
    data: {
      tenkv: khoavien.tenkv,
      dtkv: khoavien.dtkv,
      diaChi: khoavien.diaChi,
    },
    include: {
      lop: true, // Bao gồm thông tin các lớp thuộc khoa viện
    },
  });

  return updatedKhoaVien;
};

export const deleteKhoaVien = async (makv: string) => {
  const deletedKhoaVien = await prisma.khoaVien.delete({
    where: { makv: makv },
  });
  return deletedKhoaVien;
};

export const importKhoaVienFromExcel = async (file: Express.Multer.File) => {
  // Map tên cột excel về tên field DB (không phân biệt hoa thường)
  const columnMap = {
    tenkv: "tenkv",
    "tên khoa viện": "tenkv",
    tenkhoa: "tenkv",
    "ten khoa": "tenkv",
    dtkv: "dtkv",
    "điện thoại": "dtkv",
    sdt: "dtkv",
    "số điện thoại": "dtkv",
    diachi: "diaChi",
    "địa chỉ": "diaChi",
    "dia chi": "diaChi",
  };

  try {
    const data = parseExcelFile<IKhoaVien>(file.path, columnMap);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("File Excel không có dữ liệu hoặc sai định dạng");
    }

    const results = [];
    const errors = [];

    for (const [index, row] of data.entries()) {
      try {
        if (!row.tenkv) throw new Error("Tên khoa viện không được để trống");
        if (row.dtkv && !validatePhoneNumber(row.dtkv)) {
          throw new Error("Số điện thoại không hợp lệ");
        }
        const existing = await prisma.khoaVien.findFirst({
          where: { tenkv: row.tenkv },
        });
        if (existing) throw new Error("Khoa viện đã tồn tại");
        const created = await prisma.khoaVien.create({ data: row });
        results.push(created);
      } catch (error: any) {
        errors.push({ row: index + 2, error: error.message });
      }
    }

    // Xóa file sau khi import xong nếu muốn
    fs.unlinkSync(file.path);

    return { imported: results.length, failed: errors.length, results, errors };
  } catch (error: any) {
    try {
      fs.unlinkSync(file.path);
    } catch {}
    throw new Error(`Lỗi import: ${error.message}`);
  }
};
