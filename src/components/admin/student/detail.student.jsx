import { useState } from "react";
import { Button, Drawer } from "antd";
import UpdateStudent from "./update.student.jsx";

const StudentDetail = (props) => {
  const {
    dataDetail,
    isDetailOpen,
    setIsDetailOpen,
    setDataDetail,
    loadDataStudent, // thêm prop này
  } = props;

  // thêm state điều khiển modal update
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  return (
    <Drawer
      title="Chi tiết sinh viên"
      placement="right"
      onClose={() => setIsDetailOpen(false)}
      open={isDetailOpen}
      width={600}
    >
      {dataDetail ? (
        <div style={{ userSelect: "none" }}>
          <p>
            <strong>Mã sinh viên:</strong> {dataDetail.mssv}
          </p>
          <p>
            <strong>Tên sinh viên:</strong> {dataDetail.holot} {dataDetail.ten}
          </p>
          <p>
            <strong>Ngày sinh:</strong> {dataDetail.ntns}
          </p>
          <p>
            <strong>Giới tính:</strong> {dataDetail.phai}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {dataDetail.dt_sv}
          </p>
          <p>
            <strong>Email:</strong> {dataDetail.emailSV}
          </p>
          <p>
            <strong>Hình ảnh:</strong>
          </p>
          <div
            style={{
              marginTop: "10px",
              height: "300px",
              width: "500px",
              border: "1px solid #ccc",
            }}
          >
            <img
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              src={`${import.meta.env.VITE_BACKEND_URL}/image/student/${
                dataDetail.faceID
              }`}
            />
          </div>
          <Button
            className="btn-update"
            onClick={() => setIsUpdateModalOpen(true)}
          >
            Cập nhật thông tin
          </Button>
        </div>
      ) : (
        <p>Không có dữ liệu chi tiết.</p>
      )}
      <UpdateStudent
        selectedStudent={dataDetail}
        loadDataStudent={() => {
          loadDataStudent();
          setIsDetailOpen(false);
        }}
        isUpdateModalOpen={isUpdateModalOpen}
        setIsUpdateModalOpen={setIsUpdateModalOpen}
      />
    </Drawer>
  );
};

export default StudentDetail;
