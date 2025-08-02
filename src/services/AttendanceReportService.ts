import { prisma } from "config/client";
import { emailService } from "./Emailservice";
import { excelExportService } from "./EmailExportService";

export class AttendanceReportService {
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  async generateDailyReport(targetDate?: Date): Promise<void> {
    const reportDate = targetDate || new Date();
    reportDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(reportDate);
    nextDay.setDate(reportDate.getDate() + 1);

    try {
      // Lấy tất cả TKB trong ngày
      const tkbsToday = await prisma.tKB.findMany({
        where: {
          ngay: {
            gte: reportDate,
            lt: nextDay,
          },
        },
        include: {
          monHoc: true,
          giangVien: true,
          phong: true,
          diemDanh: {
            include: {
              sinhVien: {
                include: {
                  lop: true,
                },
              },
            },
          },
        },
      });

      if (tkbsToday.length === 0) {
        console.log("Không có lịch học nào trong ngày");
        return;
      }

      // Tính toán thống kê
      const allAttendanceRecords = tkbsToday.flatMap((tkb) => tkb.diemDanh);
      const totalStudents = allAttendanceRecords.length;
      const presentCount = allAttendanceRecords.filter(
        (record) => record.coMat
      ).length;
      const absentCount = totalStudents - presentCount;
      const lateCount = allAttendanceRecords.filter(
        (record) => record.diTre
      ).length;

      // Chi tiết theo lớp
      const classDetails = tkbsToday.map((tkb) => {
        const classAttendance = tkb.diemDanh;
        const present = classAttendance.filter((record) => record.coMat).length;
        const absent = classAttendance.length - present;
        const late = classAttendance.filter((record) => record.diTre).length;

        return {
          className: classAttendance[0]?.sinhVien?.lop?.tenlop || "N/A",
          subject: tkb.monHoc.tenmh,
          present,
          absent,
          late,
          total: classAttendance.length,
        };
      });

      // Tạo dữ liệu cho Excel
      const excelData = allAttendanceRecords.map((record) => ({
        mssv: record.mssv,
        hoTen: `${record.sinhVien.holot} ${record.sinhVien.ten}`,
        lop: record.sinhVien.lop?.tenlop || "N/A",
        monHoc:
          tkbsToday.find((tkb) => tkb.id === record.id)?.monHoc.tenmh || "N/A",
        giangVien: `${
          tkbsToday.find((tkb) => tkb.id === record.id)?.giangVien.hoGV || ""
        } ${
          tkbsToday.find((tkb) => tkb.id === record.id)?.giangVien.tenGV || ""
        }`,
        phong:
          tkbsToday.find((tkb) => tkb.id === record.id)?.phong.tenPhong ||
          "N/A",
        tiet: `${tkbsToday.find((tkb) => tkb.id === record.id)?.tietBD || ""}-${
          tkbsToday.find((tkb) => tkb.id === record.id)?.tietKT || ""
        }`,
        coMat: record.coMat,
        diTre: record.diTre,
        lyDoKhac: record.lyDoKhac,
      }));

      // Xuất Excel
      const excelFilePath = await excelExportService.exportAttendanceReport(
        excelData,
        this.formatDate(reportDate)
      );

      // Gửi email cho admin
      const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
      await emailService.sendAttendanceReport(
        adminEmail,
        {
          date: this.formatDate(reportDate),
          totalStudents,
          presentCount,
          absentCount,
          lateCount,
          classDetails,
        },
        excelFilePath
      );

      // Dọn dẹp file sau khi gửi email (tùy chọn)
      setTimeout(() => {
        excelExportService.cleanupFile(excelFilePath);
      }, 300000); // 5 phút

      console.log("Daily attendance report sent successfully");
    } catch (error) {
      console.error("Error generating daily report:", error);
      throw error;
    }
  }

  async generateReportForTKB(tkbId: string): Promise<void> {
    try {
      const tkb = await prisma.tKB.findUnique({
        where: { id: tkbId },
        include: {
          monHoc: true,
          giangVien: true,
          phong: true,
          diemDanh: {
            include: {
              sinhVien: {
                include: {
                  lop: true,
                },
              },
            },
          },
        },
      });

      if (!tkb) {
        throw new Error("Không tìm thấy thời khóa biểu");
      }

      const attendanceRecords = tkb.diemDanh;
      const totalStudents = attendanceRecords.length;
      const presentCount = attendanceRecords.filter(
        (record) => record.coMat
      ).length;
      const absentCount = totalStudents - presentCount;
      const lateCount = attendanceRecords.filter(
        (record) => record.diTre
      ).length;

      const classDetails = [
        {
          className: attendanceRecords[0]?.sinhVien?.lop?.tenlop || "N/A",
          subject: tkb.monHoc.tenmh,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          total: totalStudents,
        },
      ];

      // Tạo dữ liệu cho Excel
      const excelData = attendanceRecords.map((record) => ({
        mssv: record.mssv,
        hoTen: `${record.sinhVien.holot} ${record.sinhVien.ten}`,
        lop: record.sinhVien.lop?.tenlop || "N/A",
        monHoc: tkb.monHoc.tenmh,
        giangVien: `${tkb.giangVien.hoGV} ${tkb.giangVien.tenGV}`,
        phong: tkb.phong.tenPhong,
        tiet: `${tkb.tietBD}-${tkb.tietKT}`,
        coMat: record.coMat,
        diTre: record.diTre,
        lyDoKhac: record.lyDoKhac,
      }));

      // Xuất Excel
      const excelFilePath = await excelExportService.exportAttendanceReport(
        excelData,
        this.formatDate(tkb.ngay)
      );

      // Gửi email cho admin
      const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
      await emailService.sendAttendanceReport(
        adminEmail,
        {
          date: this.formatDate(tkb.ngay),
          totalStudents,
          presentCount,
          absentCount,
          lateCount,
          classDetails,
        },
        excelFilePath
      );

      // Dọn dẹp file sau khi gửi email
      setTimeout(() => {
        excelExportService.cleanupFile(excelFilePath);
      }, 300000); // 5 phút

      console.log("TKB attendance report sent successfully");
    } catch (error) {
      console.error("Error generating TKB report:", error);
      throw error;
    }
  }
}

export const attendanceReportService = new AttendanceReportService();
