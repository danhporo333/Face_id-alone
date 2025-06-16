import { Button, Input, Modal, notification, Select, DatePicker } from "antd";
import { useState, useEffect } from "react";
import moment from "moment";
import {
  createStudent,
  fetchAllClass,
  handleUploadFile,
} from "../../../services/api.service.js";

const StudentForm = (props) => {
  const { loadDataStudent } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [malop, setMalop] = useState("");
  const [holot, setHolot] = useState("");
  const [ten, setTen] = useState("");
  const [date, setDate] = useState("");
  const [phai, setPhai] = useState("Nam");
  const [emailSV, setEmailSV] = useState("");
  const [image, setImage] = useState("");
  const [classList, setClassList] = useState([]);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadClass();
  }, []);

  const loadClass = async () => {
    try {
      const resClass = await fetchAllClass(1, 1000);
      //   console.log("Khoa Vien List:", resKhoaVien.data.result);
      setClassList(resClass.data.classes);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tải danh mục lớp",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // if (!malop || !holot || !ten || !date || !emailSV || !selectedFile) {
      //   notification.error({
      //     message: "Lỗi",
      //     description: "Vui lòng điền đầy đủ thông tin",
      //   });
      //   setLoading(false);
      //   return;
      // }
      // if (!selectedFile) {
      //   notification.error({
      //     message: "Error create book",
      //     description: "Vui lòng upload ảnh ",
      //   });
      //   return;
      // }

      const resUpload = await handleUploadFile(selectedFile, "student");
      console.log("resUpload", resUpload);
      if (resUpload.data) {
        //sussess
        const newImage = resUpload.data.name;
        console.log("newImage", newImage);
        const resStudent = await createStudent(
          malop,
          holot,
          ten,
          date,
          phai,
          emailSV,
          newImage
        );

        if (resStudent.data) {
          notification.success({
            message: "Thành công",
            description: "Thêm sinh viên mới thành công",
          });
          resetForm();
          loadDataStudent();
        } else {
          notification.error({
            message: "Lỗi",
            description: "Không thể thêm sinh viên mới",
          });
        }
      } else {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải ảnh lên",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: "Lỗi",
        description: error.message || "Thêm sản phẩm thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setLoading(false);
    setMalop("");
    setHolot("");
    setTen("");
    setDate("");
    setPhai("Nam");
    setEmailSV("");
    setSelectedFile(null);
    setPreview(null);
  };

  const handleOnChangeFile = (event) => {
    if (!event.target.files || event.target.files.length === 0) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    // I've kept this example simple by using the first image instead of multiple
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div>
      <Button
        type="primary"
        className="add-class-btn"
        onClick={() => setIsModalOpen(true)}
      >
        Thêm sinh viên
      </Button>

      <Modal
        title="Thêm mới sinh viên"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={resetForm}
        confirmLoading={loading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <label>Lớp:</label>
            <Select
              style={{ width: "100%" }}
              value={malop}
              onChange={(value) => setMalop(value)}
              placeholder="Chọn Lớp"
              showSearch
              filterOption={(input, option) => {
                const tenlop = option.children[0];
                const tenkv = option.children[2];
                const searchStr = `${tenlop} ${tenkv}`.toLowerCase();
                return searchStr.includes(input.toLowerCase());
              }}
            >
              {classList.map((kv) => (
                <Select.Option key={kv.malop} value={kv.malop}>
                  {kv.tenlop} - {kv.khoaVien?.tenkv}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <label>Họ lót:</label>
            <Input
              value={holot}
              onChange={(e) => setHolot(e.target.value)}
              placeholder="Nhập Họ lót"
            />
          </div>
          <div>
            <label>Tên:</label>
            <Input
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              placeholder="Nhập Tên"
            />
          </div>
          <div>
            <label>Ngày tháng năm sinh:</label>
            <DatePicker
              style={{ width: "100%" }}
              value={date ? moment(date, "DD/MM/YYYY") : null}
              onChange={(dateObj, dateString) => setDate(dateString)}
              format="DD/MM/YYYY"
              placeholder="Nhập hoặc chọn ngày tháng năm sinh"
              allowClear
              inputReadOnly={false} // Cho phép nhập tay
            />
          </div>
          <div>
            <label>Giới tính:</label>
            <Select
              style={{ width: "100%" }}
              value={phai}
              onChange={setPhai}
              placeholder="Chọn giới tính"
            >
              <Select.Option value="Nam">Nam</Select.Option>
              <Select.Option value="Nữ">Nữ</Select.Option>
              <Select.Option value="Giới tính thứ 3">
                Giới tính thứ 3
              </Select.Option>
              <Select.Option value="Khác">Khác</Select.Option>
            </Select>
          </div>
          <div>
            <label>Email:</label>
            <Input
              value={emailSV}
              onChange={(e) => setEmailSV(e.target.value)}
              placeholder="Nhập Email"
            />
          </div>
          <div>
            <div>Ảnh:</div>
            <div>
              <label
                htmlFor="btnUpload"
                style={{
                  display: "block",
                  width: "fit-content",
                  marginTop: "15px",
                  padding: "5px 10px",
                  background: "orange",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Upload
              </label>
              <input
                type="file"
                hidden
                id="btnUpload"
                onChange={(event) => handleOnChangeFile(event)}
                onClick={(event) => (event.target.value = null)}
              />
            </div>
            {preview && (
              <>
                <div
                  style={{
                    marginTop: "10px",
                    marginBottom: "15px",
                    height: "100px",
                    width: "150px",
                  }}
                >
                  <img
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "contain",
                    }}
                    src={preview}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentForm;
