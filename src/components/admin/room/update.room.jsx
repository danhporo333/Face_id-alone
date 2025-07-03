import { Modal, Input, Upload, Button, notification } from "antd";
import { useEffect, useState } from "react";
import { updateRoom } from "../../../services/api.service.js";

const UpdateRoom = (props) => {
  const {
    isUpdateModalOpen,
    setIsUpdateModalOpen,
    selectedRoom,
    loadDataRoom,
  } = props;
  const [tenPhong, setTenPhong] = useState("");
  const [sucChua, setSucChua] = useState("");
  const [coSo, setCoSo] = useState("");

  useEffect(() => {
    if (selectedRoom) {
      setTenPhong(selectedRoom.tenPhong);
      setSucChua(selectedRoom.sucChua);
      setCoSo(selectedRoom.coSo);
    }
  }, [selectedRoom]);

  const handleUpdate = async () => {
    try {
      if (!tenPhong || !sucChua || !coSo) {
        notification.error({
          message: "Lỗi",
          description: "Vui lòng nhập đầy đủ thông tin.",
        });
        return;
      }
      const resUpdate = await updateRoom(
        selectedRoom.sop,
        tenPhong,
        sucChua,
        coSo
      );
      if (resUpdate.data) {
        notification.success({
          message: "Thành công",
          description: "Cập nhật phòng học thành công",
        });
        resetForm();
        await loadDataRoom();
      } else {
        notification.error({
          message: "Thất bại",
          description: "Cập nhật phòng học thất bại",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: "Lỗi",
        description: error.message || "Cập nhật phòng học thất bại",
      });
    }
  };

  const resetForm = () => {
    setTenPhong("");
    setSucChua("");
    setCoSo("");
    setIsUpdateModalOpen(false);
  };

  return (
    <Modal
      title="Cập nhật phòng học"
      open={isUpdateModalOpen}
      onCancel={resetForm}
      onOk={handleUpdate}
    >
      <Input
        placeholder="Tên phòng"
        value={tenPhong}
        onChange={(e) => setTenPhong(e.target.value)}
      />
      <Input
        placeholder="Sức chứa"
        value={sucChua}
        onChange={(e) => setSucChua(e.target.value)}
        style={{ marginTop: 10 }}
      />
      <Input
        placeholder="Cơ sở"
        value={coSo}
        onChange={(e) => setCoSo(e.target.value)}
        style={{ marginTop: 10 }}
      />
    </Modal>
  );
};

export default UpdateRoom;
