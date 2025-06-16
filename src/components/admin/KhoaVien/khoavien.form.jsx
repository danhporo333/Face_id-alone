import { Button, Input, Modal, notification } from "antd";
import { useState, useEffect } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { createKhoaVien } from "../../../services/api.service";

const KhoavienForm = (props) => {
  const { loadDataKhoaVien } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [namekv, setNamekv] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!namekv || !address) {
        notification.error({
          message: "Lỗi",
          description: "Vui lòng nhập đầy đủ thông tin.",
        });
        return;
      }
      const resKhoaVien = await createKhoaVien(namekv, address);
      if (resKhoaVien.data) {
        notification.success({
          message: "Thành công",
          description: "Thêm mới khoa viện thành công",
        });
        resetForm();
        await loadDataKhoaVien();
      } else {
        notification.error({
          message: "Thất bại",
          description: "Thêm mới khoa viện thất bại",
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
    setNamekv("");
    setAddress("");
    setIsModalOpen(false);
  };

  return (
    <div>
      <Button
        type="primary"
        className="add-khoavien-btn"
        onClick={() => setIsModalOpen(true)}
      >
        Thêm Khoa viện mới
      </Button>

      <Modal
        title="Thêm Khoa viện mới"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={resetForm}
        confirmLoading={loading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <label>Tên khoa viện:</label>
            <Input
              value={namekv}
              onChange={(e) => setNamekv(e.target.value)}
              placeholder="Nhập tên khoa viện"
            />
          </div>

          <div>
            <label>Địa chỉ:</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nhập tên khoa viện"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KhoavienForm;
