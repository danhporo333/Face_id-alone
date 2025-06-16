import { Button, Input, Modal, notification, Select } from "antd";
import { useState, useEffect } from "react";
import { createSubject } from "../../../services/api.service.js";

const SubjectForm = (props) => {
  const { loadDataSubject } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tenmh, setTenmh] = useState("");
  const [tclt, setTclt] = useState("");
  const [tcth, setTcth] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!tenmh || !tclt || !tcth) {
        notification.error({
          message: "Lỗi",
          description: "Vui lòng nhập đầy đủ thông tin.",
        });
        return;
      }
      const resSubject = await createSubject(
        tenmh,
        parseInt(tclt),
        parseInt(tcth)
      );
      if (resSubject.data) {
        notification.success({
          message: "Thành công",
          description: "Thêm mới môn học thành công",
        });
        resetForm();
        await loadDataSubject();
      } else {
        notification.error({
          message: "Thất bại",
          description: "Thêm mới môn học thất bại",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: "Lỗi",
        description: error.message || "Thêm khoa viện thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setLoading(false);
    setTenmh("");
    setTclt("");
    setTcth("");
  };
  return (
    <div>
      <Button
        type="primary"
        className="add-class-btn"
        onClick={() => setIsModalOpen(true)}
      >
        Thêm môn học mới
      </Button>

      <Modal
        title="Thêm Môn Học"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={resetForm}
        confirmLoading={loading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <label>Tên môn học:</label>
            <Input
              value={tenmh}
              onChange={(e) => setTenmh(e.target.value)}
              placeholder="Nhập tên tên lớp"
            />
          </div>

          <div>
            <label>Tín chỉ lý thuyết:</label>
            <Input
              value={tclt}
              onChange={(e) => setTclt(e.target.value)}
              placeholder="Nhập số tín chỉ lý thuyết"
            />
          </div>

          <div>
            <label>Tín chỉ thực hành:</label>
            <Input
              value={tcth}
              onChange={(e) => setTcth(e.target.value)}
              placeholder="Nhập số tín chỉ thực hành"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubjectForm;
