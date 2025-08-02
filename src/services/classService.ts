import { prisma } from "config/client";
import { validatePhoneNumber } from "../utils/validator";
import { parseExcelFile } from "../utils/excelImport";
import fs from "fs";
import { paginate } from "utils/paginate";

interface ILop {
  tenlop: string;
  siso: number;
  makv: string;
}

export const findClassByName = async (tenlop: string) => {
  const lop = await prisma.lop.findFirst({
    where: {
      tenlop: {
        equals: tenlop,
      },
    },
  });
  return lop;
};

export const createClass = async (lop: ILop) => {
  const khoaVien = await prisma.khoaVien.findUnique({
    where: { makv: lop.makv },
  });
  if (!khoaVien) {
    throw new Error("Khoa viện không tồn tại");
  }
  // Kiểm tra xem lớp đã tồn tại chưa
  const existingClass = await findClassByName(lop.tenlop);
  if (existingClass) {
    throw new Error("Lớp đã tồn tại");
  }
  // Tạo mới lớp
  const newClass = await prisma.lop.create({
    data: {
      tenlop: lop.tenlop,
      siso: +lop.siso,
      makv: lop.makv,
    },
    include: {
      khoaVien: true,
    },
  });
  return newClass;
};

export const getAllClass = async (page: number, pageSize: number) => {
  return paginate(prisma.lop, page, pageSize, { khoaVien: true });
};

export const updateClass = async (malop: string, lop: ILop) => {
  const updatedClass = await prisma.lop.update({
    where: { malop: malop },
    data: {
      tenlop: lop.tenlop,
      siso: +lop.siso,
      makv: lop.makv,
    },
  });
  return updatedClass;
};

export const deleteClass = async (malop: string) => {
  const deletedClass = await prisma.lop.delete({
    where: { malop: malop },
  });
  return deletedClass;
};

export const importClassesFromExcel = async (file: Express.Multer.File) => {
  // Map tên cột excel về tên field DB (không phân biệt hoa thường, có dấu hoặc không dấu)
  const columnMapping = {
    tenlop: "tenlop",
    "tên lớp": "tenlop",
    "ten lop": "tenlop",
    "Tên lớp": "tenlop",
    "Tên Lớp": "tenlop",
    "TÊN LỚP": "tenlop",
    lớp: "tenlop",
    Lớp: "tenlop",
    LỚP: "tenlop",
    class: "tenlop",
    Class: "tenlop",

    siso: "siso",
    "sĩ số": "siso",
    "si so": "siso",
    "SI SO": "siso",
    "Sĩ số": "siso",
    "Sĩ Số": "siso",
    "SĨ SỐ": "siso",
    "số lượng": "siso",
    "Số lượng": "siso",
    "SỐ LƯỢNG": "siso",

    // Map cho tên khoa viện (thay vì mã khoa viện)
    tenkhoa: "tenkhoa",
    "tên khoa": "tenkhoa",
    "Tên khoa": "tenkhoa",
    "TÊN KHOA": "tenkhoa",
    "tên khoa viện": "tenkhoa",
    "Tên khoa viện": "tenkhoa",
    "TÊN KHOA VIỆN": "tenkhoa",
    "ten khoa vien": "tenkhoa",
    "Ten khoa vien": "tenkhoa",
    khoavien: "tenkhoa",
    "khoa viện": "tenkhoa",
    "Khoa viện": "tenkhoa",
    "KHOA VIỆN": "tenkhoa",

    // Giữ lại mapping cũ để tương thích
    makv: "makv",
    "mã khoa viện": "makv",
    "ma khoa vien": "makv",
    "ma kv": "makv",
    "Mã khoa viện": "makv",
    "Mã Khoa Viện": "makv",
    "MÃ KHOA VIỆN": "makv",
    "Mã KV": "makv",
  };

  try {
    const data = parseExcelFile<any>(file.path, columnMapping);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Không có dữ liệu hợp lệ trong file Excel");
    }

    // 🔥 OPTIMIZE: Lấy tất cả khoa viện 1 lần thay vì query trong loop
    const allKhoaVien = await prisma.khoaVien.findMany({
      select: { makv: true, tenkv: true },
    });

    // Tạo Map để lookup nhanh
    const khoaVienMap = new Map();
    allKhoaVien.forEach((kv) => {
      khoaVienMap.set(kv.tenkv.toLowerCase(), kv);
    });

    const results = [];
    const errors = [];

    for (const [index, row] of data.entries()) {
      try {
        // Validate required fields
        if (!row.tenlop) throw new Error("Tên lớp không được để trống");
        if (!row.siso) throw new Error("Sĩ số không được để trống");
        if (!row.tenkhoa && !row.makv) {
          throw new Error(
            "Tên khoa viện hoặc mã khoa viện không được để trống"
          );
        }

        // Tìm khoa viện từ Map thay vì query DB
        let khoaVien;
        if (row.tenkhoa) {
          const cleanTenKhoa = row.tenkhoa.toString().trim();
          khoaVien = khoaVienMap.get(cleanTenKhoa.toLowerCase());

          if (!khoaVien) {
            throw new Error(
              `Không tìm thấy khoa viện với tên: ${cleanTenKhoa}`
            );
          }
        } else if (row.makv) {
          const cleanMakv = row.makv.toString().trim();
          khoaVien = allKhoaVien.find((kv) => kv.makv === cleanMakv);

          if (!khoaVien) {
            throw new Error(`Không tìm thấy khoa viện với mã: ${cleanMakv}`);
          }
        }

        // Validate sĩ số
        const sisoNumber = parseInt(row.siso);
        if (isNaN(sisoNumber) || sisoNumber <= 0) {
          throw new Error("Sĩ số phải là số dương");
        }

        // Kiểm tra lớp đã tồn tại chưa
        const existingClass = await prisma.lop.findFirst({
          where: { tenlop: row.tenlop.toString().trim() },
        });
        if (existingClass) {
          throw new Error(`Lớp ${row.tenlop} đã tồn tại`);
        }

        // Tạo mới lớp
        const created = await prisma.lop.create({
          data: {
            tenlop: row.tenlop.toString().trim(),
            siso: sisoNumber,
            makv: khoaVien.makv,
          },
          include: {
            khoaVien: true,
          },
        });

        results.push(created);
      } catch (error: any) {
        errors.push({ row: index + 2, error: error.message });
      }
    }

    // Xóa file sau khi import xong
    fs.unlinkSync(file.path);
    return { imported: results.length, failed: errors.length, results, errors };
  } catch (error: any) {
    try {
      fs.unlinkSync(file.path);
    } catch {}
    throw new Error(`Lỗi import: ${error.message}`);
  }
};
