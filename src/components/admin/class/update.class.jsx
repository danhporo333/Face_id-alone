import { Modal, Input, notification, Select } from "antd";
import { useEffect, useState } from "react";
import {
  updateClass,
  fetchAllKhoaVien,
} from "../../../services/api.service.js";

const UpdateClass = ({
  isUpdateModalOpen,
  setIsUpdateModalOpen,
  selectedClass,
  loadDataClass,
}) => {
  const [nameClass, setNameClass] = useState("");
  const [siso, setSiso] = useState();
  const [khoaVien, setkhoaVien] = useState("");
  const [khoaVienList, setKhoaVienList] = useState([]);

  useEffect(() => {
    if (selectedClass) {
      setNameClass(selectedClass.tenlop);
      setSiso(selectedClass.siso); // sửa lại tên hàm setSiso
      setkhoaVien(selectedClass.makv); // sửa lại tên hàm setkhoaVien
    }
  }, [selectedClass]);

  useEffect(() => {
    const loadKhoaVien = async () => {
      try {
        const resKhoaVien = await fetchAllKhoaVien(1, 1000);
        setKhoaVienList(resKhoaVien.data.result);
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách khoa viện",
        });
      }
    };
    loadKhoaVien();
  }, []);

  const handleUpdate = async () => {
    try {
      if (!nameClass || !siso || !khoaVien) {
        notification.error({
          message: "Lỗi",
          description: "Vui lòng nhập đầy đủ thông tin.",
        });
        return;
      }
      const resUpdate = await updateClass(
        selectedClass.malop,
        nameClass,
        siso,
        khoaVien
      );
      if (resUpdate.data) {
        notification.success({
          message: "Thành công",
          description: "Cập nhật lớp thành công",
        });
        resetForm();
        await loadDataClass();
      } else {
        notification.error({
          message: "Thất bại",
          description: "Cập nhật lớp thất bại",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: "Lỗi",
        description: error.message || "Cập nhật lớp thất bại",
      });
    }
  };
  const resetForm = () => {
    setNameClass("");
    setSiso("");
    setkhoaVien("");
    setIsUpdateModalOpen(false);
  };

  return (
    <Modal
      title="Cập nhật lớp"
      open={isUpdateModalOpen}
      onCancel={() => setIsUpdateModalOpen(false)}
      onOk={handleUpdate}
      okText="Cập nhật"
      cancelText="Hủy"
    >
      <div className="form-group">
        <label>Tên lớp:</label>
        <Input
          value={nameClass}
          onChange={(e) => setNameClass(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Sĩ số:</label>
        <Input
          type="number"
          value={siso}
          onChange={(e) => setSiso(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Khoa viện:</label>
        <Select
          style={{ width: "100%" }}
          value={khoaVien}
          onChange={(value) => setkhoaVien(value)}
          placeholder="Chọn khoa viện"
        >
          {khoaVienList.map((kv) => (
            <Select.Option key={kv.makv} value={kv.makv}>
              {kv.tenkv}
            </Select.Option>
          ))}
        </Select>
      </div>
    </Modal>
  );
};

export default UpdateClass;
