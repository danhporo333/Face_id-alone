import { Request, Response } from "express";
import { prisma } from "config/client";
import {
  createTeacher,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
  importTeachersFromExcel,
} from "services/teacherService";
import { excelUploadMiddleware } from "src/Middleware/multer";
import { attendanceReportService } from "services/AttendanceReportService";

const VN_PHONE_PREFIXES = [
  "086",
  "096",
  "097",
  "098", // Viettel
  "032",
  "033",
  "034",
  "035",
  "036",
  "037",
  "038",
  "039", // Viettel
  "088",
  "091",
  "094", // Vinaphone
  "081",
  "082",
  "083",
  "084",
  "085", // Vinaphone
  "089",
  "090",
  "093", // Mobifone
  "070",
  "079",
  "077",
  "076",
  "078", // Mobifone
];

const generateVNPhoneNumber = (): string => {
  // Chọn ngẫu nhiên đầu số từ danh sách
  const prefix =
    VN_PHONE_PREFIXES[Math.floor(Math.random() * VN_PHONE_PREFIXES.length)];

  // Thêm 7 số ngẫu nhiên để đủ 10 số
  let remainingDigits = "";
  for (let i = 0; i < 7; i++) {
    remainingDigits += Math.floor(Math.random() * 10);
  }

  return prefix + remainingDigits;
};

export const createTeacherController = async (req: Request, res: Response) => {
  try {
    const { hoGV, tenGV, dt_gv, donVi } = req.body;
    // console.log(req.body);

    if (!hoGV || !tenGV) {
      res.status(400).json({
        errorCode: 1,
        message: "Họ và tên giảng viên là bắt buộc",
      });
    }

    const phoneNumber = dt_gv || generateVNPhoneNumber();

    const newTeacher = await createTeacher({
      hoGV,
      tenGV,
      dt_gv: phoneNumber,
      donVi,
    });
    console.log(newTeacher);

    res.status(201).json({
      errorCode: 0,
      message: "Thêm giảng viên thành công",
      data: newTeacher,
    });
  } catch (error: any) {
    if (error.message === "Giảng viên đã tồn tại") {
      res.status(400).json({
        errorCode: 1,
        message: "giảng viên đã tồn tại trong hệ thống",
      });
    }
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      detail: error.message,
    });
  }
};

export const getAllTeachersController = async (req: Request, res: Response) => {
  try {
    const page = +(req.query.current || 1);
    const pageSize = +(req.query.pageSize || 5);
    const { result: teachers, total } = await getAllTeachers(page, pageSize);
    const pages = Math.ceil(total / pageSize);

    res.status(200).json({
      errorCode: 0,
      message: "Lấy danh sách giảng viên thành công",
      data: {
        meta: {
          current: page,
          pageSize: pageSize,
          pages: pages,
          total: total,
          result_count: teachers.length,
        },
        teachers: teachers,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      errorCode: 1,
      message: "Không thể lấy danh sách giảng viên",
    });
  }
};

export const updateTeacherController = async (req: Request, res: Response) => {
  try {
    const { mgv, hoGV, tenGV, dt_gv, donVi } = req.body;
    if (!mgv) {
      res.status(400).json({
        errorCode: 1,
        message: "Mã giảng viên là bắt buộc",
      });
    }

    const updatedTeacher = await updateTeacher(mgv, {
      hoGV,
      tenGV,
      dt_gv,
      donVi,
    });
    console.log("Update result:", updatedTeacher);

    res.status(200).json({
      message: "Cập nhật giảng viên thành công",
      data: updatedTeacher,
    });
  } catch (error: any) {
    if (error.message === "Giảng viên không tồn tại") {
      res.status(404).json({
        errorCode: 1,
        message: error.message,
      });
    }
    console.error("Update teacher error:", error);
    res.status(500).json({
      errorCode: 1,
      message: "Internal server error",
    });
  }
};

export const deleteTeacherController = async (req: Request, res: Response) => {
  try {
    const { mgv } = req.params;

    if (!mgv) {
      res.status(400).json({
        errorCode: 1,
        message: "Mã giảng viên là bắt buộc",
      });
    }

    const deletedTeacher = await deleteTeacher(mgv);

    res.status(200).json({
      message: "Xóa giảng viên thành công",
      data: deletedTeacher,
    });
  } catch (error: any) {
    if (error.message === "Giảng viên không tồn tại") {
      res.status(404).json({
        errorCode: 1,
        message: error.message,
      });
    }
    res.status(500).json({
      errorCode: 1,
      message: "Internal server error",
    });
  }
};

export const updateAttendanceByTeacherController = async (
  req: Request,
  res: Response
) => {
  try {
    const { mssv, tkbId, coMat, diTre, lyDoKhac } = req.body;

    if (!mssv || !tkbId) {
      res.status(400).json({
        errorCode: 1,
        message: "MSSV và TKB ID là bắt buộc",
      });
      return;
    }

    // Kiểm tra bản ghi điểm danh có tồn tại không
    const existingAttendance = await prisma.diemDanh.findUnique({
      where: {
        mssv_id: {
          mssv: mssv,
          id: tkbId,
        },
      },
    });

    if (!existingAttendance) {
      res.status(404).json({
        errorCode: 1,
        message: "Bản ghi điểm danh không tồn tại",
      });
      return;
    }

    // Cập nhật trạng thái điểm danh
    const updatedAttendance = await prisma.diemDanh.update({
      where: {
        mssv_id: {
          mssv: mssv,
          id: tkbId,
        },
      },
      data: {
        coMat: coMat,
        diTre: diTre,
        lyDoKhac: lyDoKhac || null,
        // thoiGianCapNhat: new Date(),
      },
    });

    res.status(200).json({
      errorCode: 0,
      message: "Cập nhật điểm danh thành công",
      data: updatedAttendance,
    });
  } catch (error: any) {
    console.error("Update attendance error:", error);
    res.status(500).json({
      errorCode: 1,
      message: "Internal server error",
    });
  }
};

export const openAttendanceController = async (req: Request, res: Response) => {
  const { tkbId } = req.body;
  if (!tkbId) {
    res.status(400).json({ errorCode: 1, message: "tkbId là bắt buộc" });
    return;
  }
  await prisma.tKB.update({
    where: { id: tkbId },
    data: { isOpenAttendance: true },
  });
  res.status(200).json({ errorCode: 0, message: "Mở điểm danh thành công" });
};

export const closeAttendanceController = async (
  req: Request,
  res: Response
) => {
  const { tkbId } = req.body;
  if (!tkbId) {
    res.status(400).json({
      errorCode: 1,
      message: "tkbId là bắt buộc",
    });
    return;
  }

  try {
    // Đóng điểm danh
    await prisma.tKB.update({
      where: { id: tkbId },
      data: { isOpenAttendance: false },
    });

    // Gửi báo cáo email cho admin
    await attendanceReportService.generateReportForTKB(tkbId);

    res.status(200).json({
      errorCode: 0,
      message: "Đóng điểm danh thành công. Báo cáo đã được gửi tới admin.",
    });
  } catch (error: any) {
    console.error("Error closing attendance:", error);
    res.status(200).json({
      errorCode: 0,
      message: "Đóng điểm danh thành công nhưng không thể gửi báo cáo email",
    });
  }
};

export const importTeachersFromExcelController = async (
  req: Request,
  res: Response
) => {
  // Sử dụng middleware excel
  const upload = excelUploadMiddleware("excel");

  upload(req, res, async (err: any) => {
    try {
      if (err) {
        return res.status(400).json({
          errorCode: 1,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          errorCode: 1,
          message: "Vui lòng chọn file Excel",
        });
      }

      const result = await importTeachersFromExcel(req.file);

      return res.status(200).json({
        errorCode: result.failed > 0 ? 1 : 0,
        message:
          `Import thành công ${result.imported} giảng viên` +
          (result.failed > 0 ? `, ${result.failed} bản ghi lỗi` : ""),
        data: {
          imported: result.imported,
          failed: result.failed,
          results: result.results,
          errors: result.errors,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        errorCode: 1,
        message: error.message,
      });
    }
  });
};
