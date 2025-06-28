import React from "react";
import { Drawer, Tag, Descriptions, Avatar } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const TimetableDetail = ({
  isDetailOpen,
  setIsDetailOpen,
  selectedTimetable,
}) => {
  if (!selectedTimetable) return null;

  const getAttendanceIcon = (attendance) => {
    if (!attendance)
      return <ExclamationCircleOutlined style={{ color: "#999" }} />;
    if (attendance.coMat && !attendance.diTre)
      return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
    if (attendance.coMat && attendance.diTre)
      return <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />;
    return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
  };

  const getAttendanceText = (attendance) => {
    if (!attendance) return "Chưa điểm danh";
    if (attendance.coMat && !attendance.diTre) return "Có mặt";
    if (attendance.coMat && attendance.diTre) return "Đi trễ";
    return "Vắng mặt";
  };

  const getAttendanceColor = (attendance) => {
    if (!attendance) return "default";
    if (attendance.coMat && !attendance.diTre) return "success";
    if (attendance.coMat && attendance.diTre) return "warning";
    return "error";
  };

  const getDayColor = (day) => {
    const colors = {
      "Thứ 2": "#1890ff",
      "Thứ 3": "#52c41a",
      "Thứ 4": "#fa8c16",
      "Thứ 5": "#eb2f96",
      "Thứ 6": "#722ed1",
      "Thứ 7": "#13c2c2",
      "Chủ nhật": "#f5222d",
    };
    return colors[day] || "#1890ff";
  };

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BookOutlined />
          <span>Chi tiết lịch học</span>
        </div>
      }
      placement="right"
      onClose={() => setIsDetailOpen(false)}
      open={isDetailOpen}
      width={500}
      styles={{
        body: { padding: 0 },
      }}
    >
      <div style={{ padding: "24px" }}>
        {/* Header Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "16px",
            }}
          >
            <Tag
              color={getDayColor(selectedTimetable.day)}
              style={{ margin: 0 }}
            >
              {selectedTimetable.day}
            </Tag>
            <Tag
              color={getAttendanceColor(selectedTimetable.attendance)}
              icon={getAttendanceIcon(selectedTimetable.attendance)}
            >
              {getAttendanceText(selectedTimetable.attendance)}
            </Tag>
          </div>

          <h2 style={{ color: "white", margin: "8px 0", fontSize: "20px" }}>
            {selectedTimetable.subject}
          </h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              opacity: 0.9,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <CalendarOutlined />
              <span>{selectedTimetable.date}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <ClockCircleOutlined />
              <span>
                Tiết {selectedTimetable.start} - {selectedTimetable.end}
              </span>
            </div>
          </div>
        </div>

        {/* Detail Information */}
        <Descriptions
          column={1}
          size="middle"
          bordered
          items={[
            {
              key: "subject",
              label: (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <BookOutlined style={{ color: "#1890ff" }} />
                  <span>Môn học</span>
                </div>
              ),
              children: selectedTimetable.subject,
            },
            {
              key: "time",
              label: (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <ClockCircleOutlined style={{ color: "#1890ff" }} />
                  <span>Thời gian</span>
                </div>
              ),
              children: `${selectedTimetable.day}, ${selectedTimetable.date} - Tiết ${selectedTimetable.start} đến ${selectedTimetable.end}`,
            },
            {
              key: "room",
              label: (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <EnvironmentOutlined style={{ color: "#52c41a" }} />
                  <span>Phòng học</span>
                </div>
              ),
              children: selectedTimetable.room,
            },
            {
              key: "teacher",
              label: (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <UserOutlined style={{ color: "#722ed1" }} />
                  <span>Giảng viên</span>
                </div>
              ),
              children: (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    style={{ background: "#722ed1" }}
                  />
                  <span>{selectedTimetable.teacher}</span>
                </div>
              ),
            },
            {
              key: "attendance",
              label: (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {getAttendanceIcon(selectedTimetable.attendance)}
                  <span>Trạng thái điểm danh</span>
                </div>
              ),
              children: (
                <Tag
                  color={getAttendanceColor(selectedTimetable.attendance)}
                  icon={getAttendanceIcon(selectedTimetable.attendance)}
                >
                  {getAttendanceText(selectedTimetable.attendance)}
                </Tag>
              ),
            },
          ]}
        />

        {/* Additional Info */}
        {selectedTimetable.attendance?.lyDoKhac && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "#f6f8fa",
              borderRadius: "8px",
              border: "1px solid #e1e4e8",
            }}
          >
            <strong>Ghi chú:</strong>
            <p style={{ margin: "4px 0 0 0", color: "#586069" }}>
              {selectedTimetable.attendance.lyDoKhac}
            </p>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default TimetableDetail;
