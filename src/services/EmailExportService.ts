import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

interface AttendanceRecord {
  mssv: string;
  hoTen: string;
  lop: string;
  monHoc: string;
  giangVien: string;
  phong: string;
  tiet: string;
  coMat: boolean;
  diTre: boolean;
  lyDoKhac?: string;
}

export class ExcelExportService {
  private ensureDirectoryExists(filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async exportAttendanceReport(
    attendanceData: AttendanceRecord[],
    date: string
  ): Promise<string> {
    const exportsDir = path.join(process.cwd(), "exports");
    this.ensureDirectoryExists(exportsDir);

    const fileName = `BaoCao_DiemDanh_${date.replace(/\//g, "-")}.xlsx`;
    const filePath = path.join(exportsDir, fileName);

    // Tạo worksheet data
    const worksheetData = [
      [
        "MSSV",
        "Họ tên",
        "Lớp",
        "Môn học",
        "Giảng viên",
        "Phòng",
        "Tiết",
        "Có mặt",
        "Đi trễ",
        "Ghi chú",
      ],
      ...attendanceData.map((record) => [
        record.mssv,
        record.hoTen,
        record.lop,
        record.monHoc,
        record.giangVien,
        record.phong,
        record.tiet,
        record.coMat ? "Có" : "Không",
        record.diTre ? "Có" : "Không",
        record.lyDoKhac || "",
      ]),
    ];

    // Tạo workbook và worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Thiết lập độ rộng cột
    const columnWidths = [
      { wch: 15 }, // MSSV
      { wch: 25 }, // Họ tên
      { wch: 15 }, // Lớp
      { wch: 30 }, // Môn học
      { wch: 25 }, // Giảng viên
      { wch: 15 }, // Phòng
      { wch: 10 }, // Tiết
      { wch: 10 }, // Có mặt
      { wch: 10 }, // Đi trễ
      { wch: 20 }, // Ghi chú
    ];
    worksheet["!cols"] = columnWidths;

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo điểm danh");

    // Xuất file
    XLSX.writeFile(workbook, filePath);

    return filePath;
  }

  async cleanupFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Cleaned up file:", filePath);
      }
    } catch (error) {
      console.error("Error cleaning up file:", error);
    }
  }
}

export const excelExportService = new ExcelExportService();
