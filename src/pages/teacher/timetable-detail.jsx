import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { 
  Card, 
  Table, 
  Avatar, 
  Tag, 
  notification, 
  Badge, 
  Button, 
  Modal, 
  Select, 
  Input,
  Space 
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { getTimetableByTeacher, updateAttendanceByTeacher, openAttendanceByTeacher, closeAttendanceByTeacher } from "../../services/api.service";

const { TextArea } = Input;

const TimetableDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timetableInfo, setTimetableInfo] = useState(
    location.state?.timetableData || null
  );
  
  // State cho modal chỉnh sửa điểm danh
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    coMat: false,
    diTre: false,
    lyDoKhac: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStudentList();
    }
  }, [id]);

  const fetchStudentList = async () => {
    try {
      setLoading(true);
      const resp = await getTimetableByTeacher(id);
      console.log("Response:", resp);
      const record = resp.data?.tkbs?.find((tkb) => tkb.id === id);
      console.log("Record:", record);
      const list = record?.danhSachSinhVien || [];
      console.log("Danh sách sinh viên:", list);
      setStudentList(list);
      
      if (!timetableInfo && record) {
        setTimetableInfo(record);
      }
    } catch (err) {
      notification.error({
        message: "Lỗi",
        description: "Không tải được danh sách sinh viên",
      });
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý mở modal chỉnh sửa
  const handleEditAttendance = (student) => {
    setEditingStudent(student);
    const attendance = student.trangThaiDiemDanh;
    setEditForm({
      coMat: attendance?.coMat || false,
      diTre: attendance?.diTre || false,
      lyDoKhac: attendance?.lyDoKhac || ''
    });
    setIsEditModalOpen(true);
  };

  // Hàm xử lý cập nhật điểm danh
  const handleUpdateAttendance = async () => {
    try {
      setUpdateLoading(true);
      
      // Gọi API cập nhật điểm danh
      const response = await updateAttendanceByTeacher(
        editingStudent.mssv,
        id,
        editForm
      );

      if (response.data) {
        notification.success({
          message: "Thành công",
          description: "Cập nhật trạng thái điểm danh thành công",
        });
        
        // Refresh lại danh sách
        await fetchStudentList();
        setIsEditModalOpen(false);
        setEditingStudent(null);
      } else {
        notification.error({
          message: "Thất bại",
          description: "Cập nhật trạng thái điểm danh thất bại",
        });
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      notification.error({
        message: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi cập nhật điểm danh",
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const getIcon = (stt) => {
    if (!stt) return <ExclamationCircleOutlined style={{ color: "#999" }} />;
    if (stt.coMat && !stt.diTre)
      return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
    if (stt.coMat && stt.diTre)
      return <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />;
    return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
  };

  const getText = (stt) => {
    if (!stt) return "Chưa điểm danh";
    if (stt.coMat && !stt.diTre) return "Có mặt";
    if (stt.coMat && stt.diTre) return "Đi trễ";
    return "Vắng mặt";
  };

  const getColor = (stt) => {
    if (!stt) return "default";
    if (stt.coMat && !stt.diTre) return "success";
    if (stt.coMat && stt.diTre) return "warning";
    return "error";
  };

  const columns = [
    { title: "STT", key: "idx", width: 60, render: (_, __, i) => i + 1 },
    {
      title: "Avatar",
      dataIndex: "faceID",
      key: "avatar",
      align: "center",
      width: 120,
      render: (faceID) =>
        faceID ? (
          <Avatar
            size={60}
            src={`${import.meta.env.VITE_BACKEND_URL}/image/student/${faceID}`}
          />
        ) : (
          <Avatar size={60} icon={<UserOutlined />} />
        ),
    },
    { title: "Mã SV", dataIndex: "mssv", key: "mssv", width: 120, align: "center" },
    { title: "Họ tên", dataIndex: "hoTen", key: "hoTen", width: 180, align: "center" },
    { title: "Lớp", dataIndex: "lop", key: "lop", width: 100, align: "center" },
    {
      title: "Trạng thái",
      key: "trangThai",
      width: 140,
      align: "center",
      render: (_, rec) => {
        const st = rec.trangThaiDiemDanh;
        return (
          <Badge count={getIcon(st)} style={{ background: "transparent" }}>
            <Tag color={getColor(st)}>{getText(st)}</Tag>
          </Badge>
        );
      },
    },
    {
      title: "Lý do khác",
      key: "lyDoKhac",
      width: 150,
      align: "center",
      render: (_, rec) => {
        const reason = rec.trangThaiDiemDanh?.lyDoKhac;
        return reason ? (
          <span style={{ fontSize: "12px", color: "#666" }}>
            {reason.length > 20 ? `${reason.substring(0, 20)}...` : reason}
          </span>
        ) : (
          <span style={{ color: "#ccc" }}>-</span>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEditAttendance(record)}
        >
          Sửa
        </Button>
      ),
    },
  ];

    // Hàm mở điểm danh  
  const handleOpenAttendance = async () => {
  try {
    const resp = await openAttendanceByTeacher(id);
    if (resp.data?.errorCode === 0) {
      notification.success({
        message: "Thành công",
        description: "Học sinh đã có thể điểm danh",
      });
      setTimetableInfo({ ...timetableInfo, isOpenAttendance: true });
    } else {
      notification.error({
        message: "Thất bại",
        description: resp.data?.message || "Không thể mở điểm danh, vui lòng thử lại",
      });
    }
  } catch (error) {
    console.error("Lỗi khi mở điểm danh:", error);
    notification.error({
      message: "Lỗi",
      description: error.message || "Có lỗi xảy ra khi mở điểm danh",
    });
  }
};

    // Hàm đóng điểm danh
    const handleCloseAttendance = async () => {
      const resp = await closeAttendanceByTeacher(id);
      if (resp.data.errorCode === 0) {
        notification.success({
          message: "Thành công",
          description: "Điểm danh đã được đóng",
        });
        setTimetableInfo({ ...timetableInfo, isOpenAttendance: false });
      } else {
        notification.error({
          message: "Lỗi",
          description: "Không thể đóng điểm danh, vui lòng thử lại sau",
        });
      }
    };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "16px" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: "16px" }}
        >
          Quay lại
        </Button>
        
        {timetableInfo && (
          <Card title={`Chi tiết: ${timetableInfo.subject}`}>
            <p><strong>Môn học:</strong> {timetableInfo.subject}</p>
            <p><strong>Thời gian:</strong> {timetableInfo.day}, Tiết {timetableInfo.start} - {timetableInfo.end}</p>
            <p><strong>Phòng:</strong> {timetableInfo.room}</p>
          </Card>
        )}

        {!timetableInfo?.isOpenAttendance ? (
          <Button
            type="primary"
            style={{ margin: "16px 0" }}
            onClick={handleOpenAttendance}
          >
            Mở điểm danh
          </Button>
        ) 
        : (
          <Button
            danger
            style={{ margin: "16px 0" }}
            onClick={handleCloseAttendance}
          >
            Đóng điểm danh
          </Button>)}
      
      </div>

      <Card title="Danh sách sinh viên">
        <Table
          rowKey="mssv"
          dataSource={studentList}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Modal chỉnh sửa điểm danh */}
      <Modal
        title={`Chỉnh sửa điểm danh - ${editingStudent?.hoTen}`}
        open={isEditModalOpen}
        onOk={handleUpdateAttendance}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingStudent(null);
        }}
        confirmLoading={updateLoading}
        okText="Cập nhật"
        cancelText="Hủy"
        width={500}
      >
        <div style={{ padding: "16px 0" }}>
          <div style={{ marginBottom: "16px" }}>
            <strong>Sinh viên:</strong> {editingStudent?.hoTen} ({editingStudent?.mssv})
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Trạng thái có mặt:
            </label>
            <Select
              style={{ width: "100%" }}
              value={editForm.coMat ? (editForm.diTre ? "late" : "present") : "absent"}
              onChange={(value) => {
                if (value === "present") {
                  setEditForm({ ...editForm, coMat: true, diTre: false });
                } else if (value === "late") {
                  setEditForm({ ...editForm, coMat: true, diTre: true });
                } else {
                  setEditForm({ ...editForm, coMat: false, diTre: false });
                }
              }}
              placeholder="Chọn trạng thái"
            >
              <Select.Option value="present">
                <Space>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  Có mặt
                </Space>
              </Select.Option>
              <Select.Option value="late">
                <Space>
                  <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />
                  Đi trễ
                </Space>
              </Select.Option>
              <Select.Option value="absent">
                <Space>
                  <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                  Vắng mặt
                </Space>
              </Select.Option>
            </Select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Lý do khác (tùy chọn):
            </label>
            <TextArea
              rows={3}
              value={editForm.lyDoKhac}
              onChange={(e) => setEditForm({ ...editForm, lyDoKhac: e.target.value })}
              placeholder="Nhập lý do (nếu có)..."
              maxLength={200}
              showCount
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TimetableDetailPage;