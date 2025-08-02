import "dotenv/config";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Kiểm tra environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error(
        "EMAIL_USER và EMAIL_PASSWORD phải được cấu hình trong file .env"
      );
    }
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Email admin
        pass: process.env.EMAIL_PASSWORD, // App password
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Hệ thống điểm danh" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });
      console.log("Email sent successfully to:", options.to);
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Không thể gửi email");
    }
  }

  async sendAttendanceReport(
    adminEmail: string,
    reportData: any,
    excelFilePath: string
  ): Promise<void> {
    const {
      date,
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      classDetails,
    } = reportData;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2E86AB; text-align: center;">📊 Báo cáo điểm danh hàng ngày</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Thông tin chung</h3>
          <p><strong>Ngày:</strong> ${date}</p>
          <p><strong>Tổng số sinh viên:</strong> ${totalStudents}</p>
          <p><strong>Có mặt:</strong> <span style="color: #28a745;">${presentCount}</span></p>
          <p><strong>Vắng mặt:</strong> <span style="color: #dc3545;">${absentCount}</span></p>
          <p><strong>Đi trễ:</strong> <span style="color: #ffc107;">${lateCount}</span></p>
          <p><strong>Tỷ lệ tham gia:</strong> <span style="color: #17a2b8;">${(
            (presentCount / totalStudents) *
            100
          ).toFixed(1)}%</span></p>
        </div>

        <div style="background: #e9ecef; padding: 15px; border-radius: 8px;">
          <h3 style="color: #333; margin-top: 0;">Chi tiết theo lớp</h3>
          ${classDetails
            .map(
              (cls: any) => `
            <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 5px;">
              <p><strong>${cls.className}</strong> - ${cls.subject}</p>
              <p style="margin: 5px 0; font-size: 14px;">
                Có mặt: ${cls.present} | Vắng: ${cls.absent} | Trễ: ${cls.late}
              </p>
            </div>
          `
            )
            .join("")}
        </div>

        <p style="text-align: center; margin-top: 20px; color: #666;">
          File Excel chi tiết đính kèm trong email này.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: adminEmail,
      subject: `📊 Báo cáo điểm danh - ${date}`,
      html,
      attachments: [
        {
          filename: `BaoCao_DiemDanh_${date.replace(/\//g, "-")}.xlsx`,
          path: excelFilePath,
        },
      ],
    });
  }
}

export const emailService = new EmailService();
