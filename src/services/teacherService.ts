import { prisma } from "config/client";
import { parseExcelFile } from "utils/excelImport";
import { paginate } from "utils/paginate";
import fs from "fs";

interface ITeacher {
  hoGV: string;
  tenGV: string;
  dt_gv?: string;
  donVi?: string;
}

export const createTeacher = async (teacher: ITeacher) => {
  try {
    // Kiểm tra xem giảng viên đã tồn tại chưa
    const existingTeacher = await prisma.gV.findFirst({
      where: {
        tenGV: teacher.tenGV,
      },
    });

    if (existingTeacher) {
      throw new Error("Giảng viên đã tồn tại");
    }

    // Tạo mới giảng viên
    const newTeacher = await prisma.gV.create({
      data: {
        hoGV: teacher.hoGV,
        tenGV: teacher.tenGV,
        dt_gv: teacher.dt_gv,
        donVi: teacher.donVi,
      },
    });
    return newTeacher;
  } catch (error) {
    throw new Error("Không thể tạo giảng viên mới hoặc giảng viên đã tồn tại");
  }
};

export const getAllTeachers = async (page: number, pageSize: number) => {
  try {
    // const teachers = await prisma.gV.findMany({
    //   include: {
    //     tkb: true,
    //     user: true,
    //   },
    // });
    // return teachers;
    return paginate(prisma.gV, page, pageSize, { tkb: true, user: true });
  } catch (error) {
    throw new Error("Không thể lấy danh sách giảng viên");
  }
};

export const updateTeacher = async (
  mgv: string,
  teacher: Partial<ITeacher>
) => {
  try {
    const existingTeacher = await prisma.gV.findUnique({
      where: { mgv },
    });

    if (!existingTeacher) {
      throw new Error("Giảng viên không tồn tại");
    }

    const updatedTeacher = await prisma.gV.update({
      where: { mgv },
      data: {
        hoGV: teacher.hoGV,
        tenGV: teacher.tenGV,
        dt_gv: teacher.dt_gv,
        donVi: teacher.donVi,
      },
      include: {
        tkb: true,
        user: true,
      },
    });
    return updatedTeacher;
  } catch (error) {
    throw error;
  }
};

export const deleteTeacher = async (mgv: string) => {
  try {
    const existingTeacher = await prisma.gV.findUnique({
      where: { mgv },
    });

    if (!existingTeacher) {
      throw new Error("Giảng viên không tồn tại");
    }

    const deletedTeacher = await prisma.gV.delete({
      where: { mgv },
      include: {
        tkb: true,
        user: true,
      },
    });
    return deletedTeacher;
  } catch (error) {
    throw error;
  }
};

export const findTeacherByName = async (tenGV: string) => {
  const name = await prisma.gV.findFirst({
    where: {
      tenGV: {
        equals: tenGV,
      },
    },
  });
  return name;
};

export const importTeachersFromExcel = async (file: Express.Multer.File) => {
  const columnMap = {
    hoGV: "hoGV",
    "họ giảng viên": "hoGV",
    "Họ giảng viên": "hoGV",
    "HỌ GIẢNG VIÊN": "hoGV",
    "ho giang vien": "hoGV",
    "Ho giang vien": "hoGV",
    "HO GIANG VIEN": "hoGV",
    "họ gv": "hoGV",
    "Họ GV": "hoGV",
    "HỌ GV": "hoGV",
    "ho gv": "hoGV",
    "Ho gv": "hoGV",
    họ: "hoGV",
    Họ: "hoGV",
    HỌ: "hoGV",
    ho: "hoGV",
    Ho: "hoGV",

    tenGV: "tenGV",
    "tên giảng viên": "tenGV",
    "Tên giảng viên": "tenGV",
    "TÊN GIẢNG VIÊN": "tenGV",
    "ten giang vien": "tenGV",
    "Ten giang vien": "tenGV",
    "TEN GIANG VIEN": "tenGV",
    "tên gv": "tenGV",
    "Tên GV": "tenGV",
    "TÊN GV": "tenGV",
    "ten gv": "tenGV",
    "Ten gv": "tenGV",
    tên: "tenGV",
    Tên: "tenGV",
    TÊN: "tenGV",
    ten: "tenGV",
    Ten: "tenGV",
    name: "tenGV",
    Name: "tenGV",
    NAME: "tenGV",

    dt_gv: "dt_gv",
    "điện thoại": "dt_gv",
    "Điện thoại": "dt_gv",
    "ĐIỆN THOẠI": "dt_gv",
    "dien thoai": "dt_gv",
    "Dien thoai": "dt_gv",
    "DIEN THOAI": "dt_gv",
    "số điện thoại": "dt_gv",
    "Số điện thoại": "dt_gv",
    "SỐ ĐIỆN THOẠI": "dt_gv",
    "so dien thoai": "dt_gv",
    "So dien thoai": "dt_gv",
    "SO DIEN THOAI": "dt_gv",
    phone: "dt_gv",
    Phone: "dt_gv",
    PHONE: "dt_gv",
    sdt: "dt_gv",
    SDT: "dt_gv",

    donVi: "donVi",
    "đơn vị": "donVi",
    "Đơn vị": "donVi",
    "ĐƠN VỊ": "donVi",
    "don vi": "donVi",
    "Don vi": "donVi",
    "DON VI": "donVi",
    "đơn vị công tác": "donVi",
    "Đơn vị công tác": "donVi",
    "ĐƠN VỊ CÔNG TÁC": "donVi",
    "don vi cong tac": "donVi",
    "Don vi cong tac": "donVi",
    "DON VI CONG TAC": "donVi",
    khoa: "donVi",
    Khoa: "donVi",
    KHOA: "donVi",
    "bộ môn": "donVi",
    "Bộ môn": "donVi",
    "BỘ MÔN": "donVi",
    "bo mon": "donVi",
    "Bo mon": "donVi",
    "BO MON": "donVi",
    department: "donVi",
    Department: "donVi",
    DEPARTMENT: "donVi",
  };

  try {
    const data = parseExcelFile<ITeacher>(file.path, columnMap);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("File không chứa dữ liệu hợp lệ");
    }

    const results = [];
    const errors = [];

    for (const [index, row] of data.entries()) {
      try {
        if (!row.hoGV) throw new Error("Họ giảng viên không được để trống");
        if (!row.tenGV) throw new Error("Tên giảng viên không được để trống");

        // Validate điện thoại
        if (row.dt_gv) {
          const phoneRegex = /^[0-9]{10,11}$/;
          if (!phoneRegex.test(row.dt_gv.toString().trim())) {
            throw new Error("Số điện thoại không hợp lệ (phải là 10-11 số)");
          }
        }

        // Kiểm tra giảng viên đã tồn tại chưa
        const existingTeacher = await prisma.gV.findFirst({
          where: {
            AND: [
              { hoGV: row.hoGV.toString().trim() },
              { tenGV: row.tenGV.toString().trim() },
            ],
          },
        });

        if (existingTeacher) {
          throw new Error(`Giảng viên ${row.hoGV} ${row.tenGV} đã tồn tại`);
        }

        // Tạo mới giảng viên
        const created = await prisma.gV.create({
          data: {
            hoGV: row.hoGV.toString().trim(),
            tenGV: row.tenGV.toString().trim(),
            dt_gv: row.dt_gv ? row.dt_gv.toString().trim() : null,
            donVi: row.donVi ? row.donVi.toString().trim() : null,
          },
        });
        results.push(created);
      } catch (error) {
        errors.push({
          row: index + 2,
          error: error.message,
        });
      }
    }

    // Xóa file sau khi import xong nếu muốn
    fs.unlinkSync(file.path);

    return { imported: results.length, failed: errors.length, results, errors };
  } catch (error) {
    try {
      fs.unlinkSync(file.path);
    } catch {}
    throw new Error(`Lỗi import: ${error.message}`);
  }
};
