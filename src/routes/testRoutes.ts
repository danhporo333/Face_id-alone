import { Router } from "express";
import {
  testEmailController,
  testAttendanceReportController,
  testDailyReportController,
} from "controller/testEmailController";

const router = Router();
//api test email

// Test gửi email đơn giản
router.post("/email", testEmailController);

// Test gửi báo cáo điểm danh cho 1 TKB
router.post("/attendance-report", testAttendanceReportController);

// Test gửi báo cáo hàng ngày
router.post("/daily-report", testDailyReportController);

export default router;
