import { Button, Input, Modal, notification } from "antd";
import { useState, useEffect } from "react";
import { createTeacher } from "../../../services/api.service";

const TeacherForm = (props) => {
  const { loadDataTeachers } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoGV, setHoGV] = useState("");
  const [tenGV, setTenGV] = useState("");
  const [dt_gv, setDtGV] = useState("");
  const [donVi, setDonVi] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!hoGV || !tenGV || !dt_gv || !donVi) {
        notification.error({
          message: "Lỗi",
          description: "Vui lòng nhập đầy đủ thông tin.",
        });
        return;
      }
      const resTeacher = await createTeacher(hoGV, tenGV, dt_gv, donVi);
      if (resTeacher.data) {
        notification.success({
          message: "Thành công",
          description: "Thêm giảng viên mới thành công",
        });
        resetForm();
        await loadDataTeachers();
      } else {
        notification.error({
          message: "Thất bại",
          description: "Thêm giảng viên mới thất bại",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: "Lỗi",
        description: error.message || "Thêm giảng viên thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setHoGV("");
    setTenGV("");
    setDtGV("");
    setDonVi("");
    setIsModalOpen(false);
  };

  return (
    <div>
      <Button
        type="primary"
        className="add-khoavien-btn"
        onClick={() => setIsModalOpen(true)}
      >
        Thêm giảng viên mới
      </Button>

      <Modal
        title="Thêm giảng viên mới"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={resetForm}
        confirmLoading={loading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <label>Họ giảng viên:</label>
            <Input
              value={hoGV}
              onChange={(e) => setHoGV(e.target.value)}
              placeholder="Nhập họ giảng viên"
            />
          </div>

          <div>
            <label>Tên giảng viên:</label>
            <Input
              value={tenGV}
              onChange={(e) => setTenGV(e.target.value)}
              placeholder="Nhập tên giảng viên"
            />
          </div>
          <div>
            <label>Số điện thoại:</label>
            <Input
              value={dt_gv}
              onChange={(e) => setDtGV(e.target.value)}
              placeholder="Nhập sô điện thoại giảng viên"
            />
          </div>
          <div>
            <label>Đơn vị làm việc</label>
            <Input
              value={donVi}
              onChange={(e) => setDonVi(e.target.value)}
              placeholder="Nhập tên đơn vị làm việc giảng viên"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherForm;
