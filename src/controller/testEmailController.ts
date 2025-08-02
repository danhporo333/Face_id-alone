import { Request, Response } from "express";
import { attendanceReportService } from "services/AttendanceReportService";
import { emailService } from "services/Emailservice";
import "dotenv/config";

export const testEmailController = async (req: Request, res: Response) => {
  try {
    // Test gửi email đơn giản
    await emailService.sendEmail({
      to: process.env.ADMIN_EMAIL || "danhzxc555@gmail.com",
      subject: "Test Email từ hệ thống điểm danh",
      html: `
        <h2>🧪 Test Email</h2>
        <p>Đây là email test từ hệ thống điểm danh.</p>
        <p>Thời gian: ${new Date().toLocaleString("vi-VN")}</p>
      `,
    });

    res.json({
      success: true,
      message: "Email test đã được gửi thành công!",
    });
  } catch (error: any) {
    console.error("Test email error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi gửi email: " + error.message,
    });
  }
};

export const testAttendanceReportController = async (
  req: Request,
  res: Response
) => {
  const { tkbId } = req.body;

  if (!tkbId) {
    res.status(400).json({
      success: false,
      message: "tkbId là bắt buộc",
    });
    return;
  }

  try {
    // Test gửi báo cáo điểm danh
    await attendanceReportService.generateReportForTKB(tkbId);

    res.json({
      success: true,
      message: "Báo cáo điểm danh đã được gửi thành công!",
    });
  } catch (error: any) {
    console.error("Test attendance report error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi gửi báo cáo: " + error.message,
    });
  }
};

export const testDailyReportController = async (
  req: Request,
  res: Response
) => {
  try {
    // Test gửi báo cáo hàng ngày
    await attendanceReportService.generateDailyReport();

    res.json({
      success: true,
      message: "Báo cáo hàng ngày đã được gửi thành công!",
    });
  } catch (error: any) {
    console.error("Test daily report error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi gửi báo cáo hàng ngày: " + error.message,
    });
  }
};
