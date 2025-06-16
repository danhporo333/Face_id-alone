import { Modal, Input, Upload, Button, notification } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { updateKhoaVien } from "../../../services/api.service.js";

const UpdateKhoaVien = ({
  isUpdateModalOpen,
  setIsUpdateModalOpen,
  selectedkhoaVien,
  loadDataKhoaVien,
}) => {
  const [namekv, setNamekv] = useState("");
  const [dtkv, setDtkv] = useState("");
  const [diaChi, setDiaChi] = useState("");

  useEffect(() => {
    if (selectedkhoaVien) {
      setNamekv(selectedkhoaVien.tenkv);
      setDtkv(selectedkhoaVien.dtkv);
      setDiaChi(selectedkhoaVien.diaChi);
    }
  }, [selectedkhoaVien]);

  const handleUpdate = async () => {
    try {
      if (!namekv || !dtkv || !diaChi) {
        notification.error({
          message: "Lỗi",
          description: "Vui lòng nhập đầy đủ thông tin.",
        });
        return;
      }
      const resUpdate = await updateKhoaVien(
        selectedkhoaVien.makv,
        namekv,
        dtkv,
        diaChi
      );
      if (resUpdate.data) {
        notification.success({
          message: "Thành công",
          description: "Cập nhật khoa viện thành công",
        });
        resetForm();
        await loadDataKhoaVien();
      } else {
        notification.error({
          message: "Thất bại",
          description: "Cập nhật khoa viện thất bại",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: "Lỗi",
        description: error.message || "Cập nhật khoa viện thất bại",
      });
    }
  };

  const resetForm = () => {
    setNamekv("");
    setDtkv("");
    setDiaChi("");
    setIsUpdateModalOpen(false);
  };

  return (
    <Modal
      title="Cập nhật khoa viện"
      open={isUpdateModalOpen}
      onCancel={resetForm}
      onOk={handleUpdate}
    >
      <Input
        placeholder="Tên khoa viện"
        value={namekv}
        onChange={(e) => setNamekv(e.target.value)}
      />
      <Input
        placeholder="Điện thoại"
        value={dtkv}
        onChange={(e) => setDtkv(e.target.value)}
        style={{ marginTop: 10 }}
      />
      <Input
        placeholder="Địa chỉ"
        value={diaChi}
        onChange={(e) => setDiaChi(e.target.value)}
        style={{ marginTop: 10 }}
      />
    </Modal>
  );
};
export default UpdateKhoaVien;
