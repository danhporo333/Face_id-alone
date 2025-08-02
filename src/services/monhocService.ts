import { prisma } from "config/client";
import { paginate } from "utils/paginate";
import { validatePhoneNumber } from "../utils/validator";
import { parseExcelFile } from "../utils/excelImport";
import fs from "fs";

interface IMonHoc {
  tenmh: string;
  tclt: number;
  tcth: number;
}

export const createMonHoc = async (monhoc: IMonHoc) => {
  // Kiểm tra xem môn học đã tồn tại chưa
  const existingSubject = await prisma.monHoc.findFirst({
    where: {
      tenmh: monhoc.tenmh,
    },
  });

  if (existingSubject) {
    throw new Error("Môn học đã tồn tại");
  }

  // Tạo mới môn học
  const newSubject = await prisma.monHoc.create({
    data: {
      tenmh: monhoc.tenmh,
      tclt: monhoc.tclt,
      tcth: monhoc.tcth,
    },
  });
  return newSubject;
};

export const getAllMonHoc = async (page: number, pageSize: number) => {
  // const subjects = await prisma.monHoc.findMany({
  //   include: {
  //     tkb: true,
  //   },
  // });
  // return subjects;
  return paginate(prisma.monHoc, page, pageSize, { tkb: true });
};

export const updateMonHoc = async (mamh: string, monhoc: Partial<IMonHoc>) => {
  // Kiểm tra xem môn học có tồn tại không
  const existingSubject = await prisma.monHoc.findUnique({
    where: { mamh },
  });

  if (!existingSubject) {
    throw new Error("Môn học không tồn tại");
  }

  const updatedSubject = await prisma.monHoc.update({
    where: { mamh },
    data: {
      tenmh: monhoc.tenmh,
      tclt: monhoc.tclt,
      tcth: monhoc.tcth,
    },
    include: {
      tkb: true,
    },
  });

  return updatedSubject;
};

export const deleteMonHoc = async (mamh: string) => {
  // Kiểm tra xem môn học có tồn tại không
  const existingSubject = await prisma.monHoc.findUnique({
    where: { mamh },
  });

  if (!existingSubject) {
    throw new Error("Môn học không tồn tại");
  }

  const deletedSubject = await prisma.monHoc.delete({
    where: { mamh },
    include: {
      tkb: true,
    },
  });

  return deletedSubject;
};

export const findMonHocByName = async (tenmh: string) => {
  const monhoc = await prisma.monHoc.findFirst({
    where: {
      tenmh: {
        equals: tenmh,
      },
    },
  });
  return monhoc;
};

export const importSubjectsFromExcel = async (file: Express.Multer.File) => {
  // Map tên cột excel về tên field DB (không phân biệt hoa thường)
  const columnMap = {
    tenmh: "tenmh",
    "tên môn học": "tenmh",
    "Tên môn học": "tenmh",
    "TÊN MÔN HỌC": "tenmh",
    "ten mon hoc": "tenmh",
    "Ten mon hoc": "tenmh",
    "môn học": "tenmh",
    "Môn học": "tenmh",
    "MÔN HỌC": "tenmh",
    "mon hoc": "tenmh",
    "Mon hoc": "tenmh",
    môn: "tenmh",
    Môn: "tenmh",
    MÔN: "tenmh",
    subject: "tenmh",
    Subject: "tenmh",
    "tên môn": "tenmh",

    tclt: "tclt",
    "tín chỉ lý thuyết": "tclt",
    "Tín chỉ lý thuyết": "tclt",
    "TÍN CHỈ LÝ THUYẾT": "tclt",
    "tin chi ly thuyet": "tclt",
    "Tin chi ly thuyet": "tclt",
    "TIN CHI LY THUYET": "tclt",
    "tc lý thuyết": "tclt",
    "TC lý thuyết": "tclt",
    "TC LÝ THUYẾT": "tclt",
    "tc ly thuyet": "tclt",
    "TC ly thuyet": "tclt",
    "lý thuyết": "tclt",
    "Lý thuyết": "tclt",
    "LÝ THUYẾT": "tclt",
    "ly thuyet": "tclt",
    "Ly thuyet": "tclt",

    tcth: "tcth",
    "tín chỉ thực hành": "tcth",
    "Tín chỉ thực hành": "tcth",
    "TÍN CHỈ THỰC HÀNH": "tcth",
    "tin chi thuc hanh": "tcth",
    "Tin chi thuc hanh": "tcth",
    "TIN CHI THUC HANH": "tcth",
    "tc thực hành": "tcth",
    "TC thực hành": "tcth",
    "TC THỰC HÀNH": "tcth",
    "tc thuc hanh": "tcth",
    "TC thuc hanh": "tcth",
    "thực hành": "tcth",
    "Thực hành": "tcth",
    "THỰC HÀNH": "tcth",
    "thuc hanh": "tcth",
    "Thuc hanh": "tcth",
  };

  try {
    const data = parseExcelFile<IMonHoc>(file.path, columnMap);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("File Excel không có dữ liệu hoặc sai định dạng");
    }

    const results = [];
    const errors = [];

    for (const [index, row] of data.entries()) {
      try {
        if (!row.tenmh) throw new Error("Tên môn học không được để trống");
        if (row.tclt === undefined || row.tclt === null)
          throw new Error("Tín chỉ lý thuyết không được để trống");
        if (row.tcth === undefined || row.tcth === null)
          throw new Error("Tín chỉ thực hành không được để trống");
        // Validate tín chỉ lý thuyết
        const tcltNumber = row.tclt;
        if (isNaN(tcltNumber) || tcltNumber < 0) {
          throw new Error("Tín chỉ lý thuyết phải là số không âm");
        }

        // Validate tín chỉ thực hành
        const tcthNumber = row.tcth;
        if (isNaN(tcthNumber) || tcthNumber < 0) {
          throw new Error("Tín chỉ thực hành phải là số không âm");
        }
        const existing = await prisma.monHoc.findFirst({
          where: { tenmh: row.tenmh },
        });
        if (existing) throw new Error("Môn học đã tồn tại");
        const created = await prisma.monHoc.create({ data: row });
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
