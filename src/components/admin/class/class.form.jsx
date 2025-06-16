import { Button, Input, Modal, notification, Select } from "antd";
import { useState, useEffect } from "react";
import { fetchAllKhoaVien, createClass } from "../../../services/api.service";

const ClassForm = (props) => {
  const { loadDataClass } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameClass, setNameClass] = useState("");
  const [siso, setSiso] = useState("");
  const [makv, setmakv] = useState("");
  const [khoaVienList, setKhoaVienList] = useState([]);

  useEffect(() => {
    loadKhoaVien();
  }, []);

  const loadKhoaVien = async () => {
    try {
      const resKhoaVien = await fetchAllKhoaVien(1, 1000);
      //   console.log("Khoa Vien List:", resKhoaVien.data.result);
      setKhoaVienList(resKhoaVien.data.result);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tải danh mục sản phẩm",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!nameClass || !siso || !makv) {
        notification.error({
          message: "Lỗi",
          description: "Vui lòng nhập đầy đủ thông tin.",
        });
        return;
      }
      const resClass = await createClass(nameClass, parseInt(siso), makv);
      if (resClass.data) {
        notification.success({
          message: "Thành công",
          description: "Thêm mới lớp thành công",
        });
        resetForm();
        await loadDataClass();
      } else {
        notification.error({
          message: "Thất bại",
          description: "Thêm mới lớp thất bại",
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
    setNameClass("");
    setSiso("");
    setmakv("");
    setIsModalOpen(false);
  };

  return (
    <div>
      <Button
        type="primary"
        className="add-class-btn"
        onClick={() => setIsModalOpen(true)}
      >
        Thêm lớp mới
      </Button>

      <Modal
        title="Thêm Lớp"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={resetForm}
        confirmLoading={loading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <label>Tên lớp:</label>
            <Input
              value={nameClass}
              onChange={(e) => setNameClass(e.target.value)}
              placeholder="Nhập tên tên lớp"
            />
          </div>

          <div>
            <label>sĩ số:</label>
            <Input
              value={siso}
              onChange={(e) => setSiso(e.target.value)}
              placeholder="Nhập sĩ số lớp"
            />
          </div>

          <div>
            <label>Tên khoa viện:</label>
            <Select
              style={{ width: "100%" }}
              value={makv}
              onChange={(value) => setmakv(value)}
              placeholder="Chọn khoa viện"
            >
              {khoaVienList.map((kv) => (
                <Select.Option key={kv.makv} value={kv.makv}>
                  {kv.tenkv}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClassForm;
