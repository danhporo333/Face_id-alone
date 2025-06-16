import { Modal, Input, Upload, Button, notification } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { updateTeacher } from "../../../services/api.service.js";

const UpdateTeacher = (props) => {
  const {
    isUpdateModalOpen,
    setIsUpdateModalOpen,
    selectedTeacher,
    loadDataTeachers,
  } = props;
  const [mgv, setMgv] = useState("");
  const [hoGV, setHoGV] = useState("");
  const [tenGV, setTenGV] = useState("");
  const [dtGV, setDtGV] = useState("");
  const [donVi, setDonVi] = useState("");

  useEffect(() => {
    if (selectedTeacher) {
      setMgv(selectedTeacher.mgv);
      setHoGV(selectedTeacher.hoGV);
      setTenGV(selectedTeacher.tenGV);
      setDtGV(selectedTeacher.dt_gv);
      setDonVi(selectedTeacher.donVi);
    }
  }, [selectedTeacher]);

  const handleUpdate = async () => {
    try {
      if (!hoGV || !tenGV || !dtGV || !donVi) {
        notification.error({
          message: "Lỗi",
          description: "Vui lòng nhập đầy đủ thông tin.",
        });
        return;
      }
      const resUpdate = await updateTeacher(
        selectedTeacher.mgv,
        hoGV,
        tenGV,
        dtGV,
        donVi
      );
      if (resUpdate.data) {
        notification.success({
          message: "Thành công",
          description: "Cập nhật giảng viên thành công",
        });
        resetForm();
        await loadDataTeachers();
      } else {
        notification.error({
          message: "Thất bại",
          description: "Cập nhật giảng viên thất bại",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: "Lỗi",
        description: error.message || "Cập nhật giảng viên thất bại",
      });
    }
  };

  const resetForm = () => {
    setHoGV("");
    setTenGV("");
    setDtGV("");
    setDonVi("");
    setIsUpdateModalOpen(false);
  };

  return (
    <Modal
      title="Cập nhật giảng viên"
      open={isUpdateModalOpen}
      onCancel={() => setIsUpdateModalOpen(false)}
      onOk={handleUpdate}
      okText="Cập nhật"
      cancelText="Hủy"
    >
      <div className="form-group">
        <label>Mã giảng viên:</label>
        <Input value={mgv} onChange={(e) => setMgv(e.target.value)} disabled />
      </div>
      <div className="form-group">
        <label>Họ giảng viên:</label>
        <Input value={hoGV} onChange={(e) => setHoGV(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Tên giảng viên:</label>
        <Input value={tenGV} onChange={(e) => setTenGV(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Điện Thoại:</label>
        <Input
          type="number"
          value={dtGV}
          onChange={(e) => setDtGV(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Đơn vị:</label>
        <Input value={donVi} onChange={(e) => setDonVi(e.target.value)} />
      </div>
    </Modal>
  );
};

export default UpdateTeacher;
