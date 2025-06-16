import { Modal, Input, Button, notification, Select, DatePicker } from "antd";
import { useEffect, useState } from "react";
import moment from "moment";
import {
  updateStudent,
  fetchAllClass,
  handleUploadFile,
} from "../../../services/api.service.js";

const UpdateStudent = ({
  selectedStudent,
  loadDataStudent,
  isUpdateModalOpen,
  setIsUpdateModalOpen,
}) => {
  const [malop, setMalop] = useState("");
  const [holot, setHolot] = useState("");
  const [ten, setTen] = useState("");
  const [date, setDate] = useState("");
  const [phai, setPhai] = useState("Nam");
  const [dt_sv, setDt_sv] = useState("");
  const [emailSV, setEmailSV] = useState("");
  const [classList, setClassList] = useState([]);
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load lớp và set giá trị đầu vào khi mở modal
  useEffect(() => {
    const loadClass = async () => {
      try {
        const res = await fetchAllClass(1, 1000);
        setClassList(res.data.classes);
      } catch {
        notification.error({
          message: "Lỗi",
          description: "Không tải được lớp",
        });
      }
    };
    loadClass();

    if (selectedStudent) {
      setMalop(selectedStudent.malop);
      setHolot(selectedStudent.holot);
      setTen(selectedStudent.ten);
      setDate(selectedStudent.ntns);
      setPhai(selectedStudent.phai);
      setDt_sv(selectedStudent.dt_sv);
      setEmailSV(selectedStudent.emailSV);
      setImage(selectedStudent.faceID);
      setPreview(
        selectedStudent.faceID
          ? `${import.meta.env.VITE_BACKEND_URL}/image/student/${
              selectedStudent.faceID
            }`
          : null
      );
      setSelectedFile(null);
    }
  }, [selectedStudent]);

  const handleOnChangeFile = (e) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleUpdate = async () => {
    if (!malop || !holot || !ten || !date || !emailSV) {
      return notification.error({
        message: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
      });
    }
    setLoading(true);
    try {
      let finalImage = selectedStudent.faceID;
      console.log("selectedStudent", selectedStudent.faceID);
      console.log("selectedFile", finalImage);
      if (selectedFile) {
        const resUpload = await handleUploadFile(selectedFile, "student");
        console.log("resUpload", resUpload);
        if (!resUpload.data) {
          notification.error({
            message: "Lỗi",
            description: "Không thể tải ảnh lên",
          });
          return;
        }
        finalImage = resUpload.data.name;
      }
      const res = await updateStudent(
        selectedStudent.mssv,
        malop,
        holot,
        ten,
        date,
        phai,
        dt_sv,
        emailSV,
        finalImage
      );
      if (res.data) {
        notification.success({
          message: "Thành công",
          description: "Cập nhật sinh viên thành công",
        });

        // Cập nhật lại preview với ảnh mới từ server
        if (finalImage && finalImage !== selectedStudent.faceID) {
          setPreview(
            `${import.meta.env.VITE_BACKEND_URL}/image/student/${finalImage}`
          );
          setImage(finalImage);
        }

        loadDataStudent();
        resetForm();
        setIsUpdateModalOpen(false);
      }
    } catch (err) {
      notification.error({
        message: "Lỗi",
        description: err.message || "Cập nhật thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMalop("");
    setHolot("");
    setTen("");
    setDate("");
    setPhai("Nam");
    setEmailSV("");
    setSelectedFile(null);
    setPreview(null);
    setIsUpdateModalOpen(false);
  };

  return (
    <Modal
      title="Cập nhật sinh viên"
      open={isUpdateModalOpen}
      onCancel={() => setIsUpdateModalOpen(false)}
      onOk={handleUpdate}
      confirmLoading={loading}
      okText="Lưu"
      cancelText="Hủy"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Select value={malop} onChange={setMalop} placeholder="Chọn lớp">
          {classList.map((c) => (
            <Select.Option key={c.malop} value={c.malop}>
              {c.tenlop} - {c.khoaVien?.tenkv}
            </Select.Option>
          ))}
        </Select>
        <Input
          value={holot}
          onChange={(e) => setHolot(e.target.value)}
          placeholder="Họ lót"
        />
        <Input
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          placeholder="Tên"
        />
        <DatePicker
          style={{ width: "100%" }}
          value={date ? moment(date, "DD/MM/YYYY") : null}
          onChange={(_, ds) => setDate(ds)}
          format="DD/MM/YYYY"
        />
        <Select value={phai} onChange={setPhai}>
          <Select.Option value="Nam">Nam</Select.Option>
          <Select.Option value="Nữ">Nữ</Select.Option>
          <Select.Option value="Khác">Khác</Select.Option>
        </Select>
        <Input
          value={dt_sv}
          onChange={(e) => setDt_sv(e.target.value)}
          placeholder="số điện thoại sinh viên"
        />
        <Input
          type="email"
          value={emailSV}
          onChange={(e) => setEmailSV(e.target.value)}
          placeholder="Email"
        />
        <label>Ảnh:</label>
        <input type="file" accept="image/*" onChange={handleOnChangeFile} />
        {preview && (
          <div style={{ marginTop: 8, textAlign: "center" }}>
            <img
              src={preview}
              alt="preview"
              style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UpdateStudent;
