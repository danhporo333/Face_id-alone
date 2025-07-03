import { Button, Input, Modal, notification } from "antd";
import { useState } from "react";
import { createRoom } from "../../../services/api.service";

const RoomForm = (props) => {
  const { loadDataRoom } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tenPhong, setTenPhong] = useState("");
  const [sucChua, setSucChua] = useState("");
  const [coSo, setCoSo] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!tenPhong || !sucChua || !coSo) {
        notification.error({
          message: "Lỗi",
          description: "Vui lòng nhập đầy đủ thông tin.",
        });
        return;
      }
      const resRoom = await createRoom(tenPhong, sucChua, coSo);
      if (resRoom.data) {
        notification.success({
          message: "Thành công",
          description: "Thêm mới phòng học thành công",
        });
        resetForm();
        await loadDataRoom();
      } else {
        notification.error({
          message: "Thất bại",
          description: "Thêm mới phòng học thất bại",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: "Lỗi",
        description: error.message || "Thêm phòng học thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTenPhong("");
    setSucChua("");
    setCoSo("");
    setIsModalOpen(false);
  };

  return (
    <div>
      <Button
        type="primary"
        className="add-khoavien-btn"
        onClick={() => setIsModalOpen(true)}
      >
        Thêm phòng học mới
      </Button>

      <Modal
        title="Thêm phòng học mới"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={resetForm}
        confirmLoading={loading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <label>Tên phòng học:</label>
            <Input
              value={tenPhong}
              onChange={(e) => setTenPhong(e.target.value)}
              placeholder="Nhập tên phòng học"
            />
          </div>

          <div>
            <label>Sức chứa:</label>
            <Input
              value={sucChua}
              onChange={(e) => setSucChua(e.target.value)}
              placeholder="Nhập Sức chứa"
            />
          </div>

          <div>
            <label>Cơ sở:</label>
            <Input
              value={coSo}
              onChange={(e) => setCoSo(e.target.value)}
              placeholder="Nhập Cơ sở"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomForm;
