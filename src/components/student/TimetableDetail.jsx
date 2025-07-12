import React, { useState, useRef, useEffect } from "react";
import {
  Drawer,
  Tag,
  Descriptions,
  Avatar,
  Button,
  Modal,
  notification,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import {
  submitAttendanceAPI,
  getStudentById,
} from "../../services/api.service";

const TimetableDetail = ({
  isDetailOpen,
  setIsDetailOpen,
  selectedTimetable,
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [statusText, setStatusText] = useState("Chưa khởi động");
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadModels();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Load face-api.js models từ thư mục public/model
  const loadModels = async () => {
    try {
      const MODEL_URL = "/model";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(
          `${MODEL_URL}/tiny_face_detector`
        ),
        faceapi.nets.faceRecognitionNet.loadFromUri(
          `${MODEL_URL}/face_recognition`
        ),
        faceapi.nets.faceLandmark68Net.loadFromUri(
          `${MODEL_URL}/face_landmark_68`
        ),
      ]);
      setModelsLoaded(true);
      console.log("Face-api models loaded successfully");
    } catch (error) {
      console.error("Error loading face-api models:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải các model nhận diện khuôn mặt",
      });
    }
  };

  // Lấy descriptor tham chiếu từ ảnh Face ID đã lưu
  const getReferenceDescriptor = async () => {
    try {
      const mssv = localStorage.getItem("mssv");
      console.log("mssv:", mssv);

      if (!mssv) throw new Error("Không tìm thấy mã sinh viên");

      const response = await getStudentById(mssv);
      console.log("Full API Response:", response);

      const faceIDUrl = response.data?.data?.faceID || response.data?.faceID;
      console.log("Face ID URL:", faceIDUrl);

      if (!faceIDUrl) {
        throw new Error("Không tìm thấy ảnh Face ID trong response");
      }

      const fullImageUrl = `${
        import.meta.env.VITE_BACKEND_URL
      }/image/student/${faceIDUrl}`;
      console.log("Full image URL:", fullImageUrl);

      // Đợi ảnh load xong trước khi dùng face-api
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous"; // Quan trọng cho CORS
        image.onload = () => {
          console.log(
            "✅ Image loaded successfully",
            image.width,
            image.height
          );
          resolve(image);
        };
        image.onerror = (err) => {
          console.error("❌ Image load failed:", err);
          reject(new Error("Không thể tải ảnh Face ID"));
        };
        image.src = fullImageUrl;
      });

      console.log("Face-api image object:", img);

      // Thử với các options khác nhau
      const detectionOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.3,
      });

      const detection = await faceapi
        .detectSingleFace(img, detectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

      console.log("Face detection result:", detection);

      if (!detection) {
        // Thử với SSD MobileNet nếu Tiny Face Detector không hoạt động
        const ssdDetection = await faceapi
          .detectSingleFace(img, new faceapi.SsdMobilenetv1Options())
          .withFaceLandmarks()
          .withFaceDescriptor();

        console.log("SSD detection result:", ssdDetection);
        return ssdDetection?.descriptor;
      }

      return detection?.descriptor;
    } catch (error) {
      console.error("❌ Error in getReferenceDescriptor:", error);
      throw error;
    }
  };

  // Bắt đầu quá trình nhận diện khuôn mặt
  const startFaceRecognition = async (refDescriptor) => {
    if (!webcamRef.current?.video || !faceapi) return;

    intervalRef.current = setInterval(async () => {
      try {
        const video = webcamRef.current.video;

        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          setStatusText("Không nhận diện được khuôn mặt");
          return;
        }

        // Tính khoảng cách Euclidean
        const distance = faceapi.euclideanDistance(
          detection.descriptor,
          refDescriptor
        );

        console.log("Face distance:", distance);

        // Threshold để xác định khuôn mặt khớp (có thể điều chỉnh)
        if (distance < 0.5) {
          setStatusText("Nhận diện thành công! Đang điểm danh...");
          clearInterval(intervalRef.current);

          // Gửi API điểm danh
          await submitAttendance();
        } else {
          setStatusText(
            `Khuôn mặt không khớp (${distance.toFixed(
              3
            )})! Hãy đưa mặt vào khung hình`
          );
        }
      } catch (error) {
        console.error("Face recognition error:", error);
        setStatusText("Lỗi nhận diện khuôn mặt");
      }
    }, 1500); // Kiểm tra mỗi 1.5 giây
  };

  // Gửi API điểm danh
  const submitAttendance = async () => {
    try {
      setAttendanceLoading(true);
      const mssv = localStorage.getItem("mssv");

      const response = await submitAttendanceAPI(selectedTimetable.id, mssv);

      if (response.data) {
        setStatusText("Điểm danh thành công!");
        notification.success({
          message: "Thành công",
          description: "Điểm danh bằng Face ID thành công!",
        });

        // Đóng camera sau 2 giây
        setTimeout(() => {
          stopCamera();
        }, 2000);
      } else {
        setStatusText("Điểm danh thất bại!");
        notification.error({
          message: "Lỗi",
          description: "Điểm danh thất bại!",
        });
      }
    } catch (error) {
      console.error("Attendance submission error:", error);
      setStatusText("Lỗi kết nối khi điểm danh");
      notification.error({
        message: "Lỗi",
        description: "Lỗi kết nối khi điểm danh",
      });
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Bắt đầu camera và nhận diện
  const startCamera = async () => {
    if (!modelsLoaded) {
      notification.error({
        message: "Lỗi",
        description: "Các model nhận diện chưa được tải. Vui lòng thử lại.",
      });
      return;
    }

    try {
      setStatusText("Đang tải dữ liệu tham chiếu...");
      setIsCameraOpen(true);

      // Lấy descriptor tham chiếu
      const refDescriptor = await getReferenceDescriptor();
      if (!refDescriptor) {
        setStatusText("Không tìm thấy ảnh Face ID!");
        return;
      }

      setStatusText("Đang nhận diện khuôn mặt...");

      // Đợi webcam sẵn sàng rồi bắt đầu nhận diện
      setTimeout(() => {
        startFaceRecognition(refDescriptor);
      }, 1000);
    } catch (error) {
      console.error("Camera error:", error);
      setStatusText("Không thể khởi động camera hoặc tải dữ liệu");
      notification.error({
        message: "Lỗi",
        description: "Không thể khởi động camera hoặc tải dữ liệu Face ID",
      });
    }
  };

  // Dừng camera
  const stopCamera = () => {
    console.log("🛑 Stopping camera and cleaning up...");

    try {
      // 1. Dừng interval nhận diện khuôn mặt
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log("✅ Face recognition interval cleared");
      }

      // 2. Dừng và cleanup video stream
      if (webcamRef.current?.video) {
        const video = webcamRef.current.video;

        // Dừng tất cả media tracks
        if (video.srcObject) {
          const stream = video.srcObject;
          const tracks = stream.getTracks();

          tracks.forEach((track) => {
            track.stop();
            console.log(`✅ Stopped ${track.kind} track:`, track.label);
          });

          // Clear srcObject
          video.srcObject = null;
          console.log("✅ Video srcObject cleared");
        }

        // Reset video element
        video.load(); // Force video element to reset
      }

      // 3. Reset tất cả states về trạng thái ban đầu
      setIsCameraOpen(false);
      setStatusText("Chưa khởi động");
      setAttendanceLoading(false);

      // 4. Cleanup các refs nếu có
      if (typeof lastDetectionRef !== "undefined" && lastDetectionRef.current) {
        lastDetectionRef.current = null;
      }

      // 5. Force garbage collection (nếu available)
      if (window.gc) {
        window.gc();
      }

      console.log("✅ Camera stopped and cleanup completed");
    } catch (error) {
      console.error("❌ Error during camera cleanup:", error);

      // Fallback cleanup - force reset states ngay cả khi có lỗi
      setIsCameraOpen(false);
      setStatusText("Lỗi khi dừng camera");
      setAttendanceLoading(false);

      notification.warning({
        message: "Cảnh báo",
        description: "Có lỗi khi dừng camera, nhưng đã được xử lý.",
      });
    }
  };

  // Kiểm tra xem có thể điểm danh không
  const canAttendance = () => {
    const isOpen = selectedTimetable.isOpenAttendance;
    return isOpen;
  };

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
    <>
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
        styles={{ body: { padding: 0 } }}
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <CalendarOutlined />
                <span>{selectedTimetable.date}</span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <UserOutlined style={{ color: "#722ed1" }} />
                    <span>Giảng viên</span>
                  </div>
                ),
                children: (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
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

          {/* Attendance Button */}
          {canAttendance() && (
            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <Button
                type="primary"
                size="large"
                icon={<CameraOutlined />}
                onClick={startCamera}
                loading={!modelsLoaded}
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "8px",
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                {!modelsLoaded ? "Đang tải model..." : "Điểm danh bằng Face ID"}
              </Button>
            </div>
          )}

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
        {/* mới: chỉ hiển thị khi giảng viên đã mở điểm danh */}
        {/* {canAttendance() && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Button
            type="primary"
            size="large"
            onClick={submitAttendance}
            loading={attendanceLoading}
          >
            Điểm danh
          </Button>
        </div>
      )} */}
      </Drawer>

      {/* Face ID Camera Modal */}
      <Modal
        title="Điểm danh bằng Face ID"
        open={isCameraOpen}
        onCancel={stopCamera}
        width={700}
        footer={[
          <Button
            key="cancel"
            onClick={stopCamera}
            disabled={attendanceLoading}
          >
            Hủy
          </Button>,
        ]}
        styles={{
          body: {
            textAlign: "center",
            background: "#f0f2f5",
            borderRadius: "8px",
          },
        }}
      >
        <div style={{ padding: "20px" }}>
          <div
            style={{
              position: "relative",
              display: "inline-block",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#000",
              marginBottom: "20px",
            }}
          >
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored={true}
              screenshotFormat="image/jpeg"
              style={{
                width: "640px",
                height: "480px",
                objectFit: "cover",
              }}
            />

            {/* Face outline overlay */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "200px",
                height: "250px",
                border: "3px solid #52c41a",
                borderRadius: "50%",
                opacity: 0.7,
                pointerEvents: "none",
              }}
            />

            {/* Status overlay */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.8)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {statusText}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              padding: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#1890ff" }}>
              Hướng dẫn:
            </h4>
            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
              • Đặt khuôn mặt vào trong vòng tròn xanh
              <br />
              • Giữ khuôn mặt thẳng và nhìn vào camera
              <br />
              • Đảm bảo có đủ ánh sáng
              <br />• Hệ thống sẽ tự động điểm danh khi nhận diện thành công
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TimetableDetail;
