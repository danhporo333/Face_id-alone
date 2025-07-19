import { Modal, Input, notification, Select } from "antd";
import { useEffect, useState } from "react";
import { updateSubject } from "../../../services/api.service";

const UpdateSubject = (props) => {
  const {
    isUpdateModalOpen,
    setIsUpdateModalOpen,
    selectedSubject,
    loadDataSubject,
  } = props;
  const [mamh, setMamh] = useState("");
  const [tenmh, setTenmh] = useState("");
  const [tclt, setTclt] = useState("");
  const [tcth, setTcth] = useState("");

  useEffect(() => {
    if (selectedSubject) {
      setMamh(selectedSubject.mamh);
      setTenmh(selectedSubject.tenmh);
      setTclt(selectedSubject.tclt);
      setTcth(selectedSubject.tcth);
    }
  }, [selectedSubject]);

  const handleUpdate = async () => {
    try {
      if (!tenmh || !tclt || !tcth) {
        notification.error({
          message: "Lỗi",
          description: "Vui lòng nhập đầy đủ thông tin.",
        });
        return;
      }
      const resUpdate = await updateSubject(
        selectedSubject.mamh,
        tenmh,
        tclt,
        tcth
      );
      if (resUpdate.data) {
        notification.success({
          message: "Thành công",
          description: "Cập nhật môn học thành công",
        });
        resetForm();
        await loadDataSubject();
      } else {
        notification.error({
          message: "Lỗi",
          description: "Cập nhật môn học thất bại",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: "Lỗi",
        description: error.message || "Cập nhật môn học thất bại",
      });
    }
  };

  return (
    <Modal
      title="Cập nhật môn học"
      open={isUpdateModalOpen}
      onCancel={() => setIsUpdateModalOpen(false)}
      onOk={handleUpdate}
      okText="Cập nhật"
      cancelText="Hủy"
    >
      <div className="form-group">
        <label>Mã môn học:</label>
        <Input
          value={mamh}
          onChange={(e) => setMamh(e.target.value)}
          disabled
        />
      </div>
      <div className="form-group">
        <label>Tên môn học:</label>
        <Input value={tenmh} onChange={(e) => setTenmh(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Tín chỉ lý thuyết:</label>
        <Input
          type="number"
          value={tclt}
          onChange={(e) => setTclt(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Tín chỉ thực hành:</label>
        <Input
          type="number"
          value={tcth}
          onChange={(e) => setTcth(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default UpdateSubject;
