import { Modal, Input, notification, Select } from "antd";
import { useEffect, useState } from "react";
import {
  updateTkb,
  fetchAllSubjects,
  fetchAllTeachers,
  fetchAllRooms,
} from "../../../services/api.service.js";

const UpdateTkb = (props) => {
  const { isUpdateModalOpen, setIsUpdateModalOpen, selectedTkb, loadDataTkb } =
    props;
  const [thu, setThu] = useState("");
  const [ngay, setNgay] = useState("");
  const [tietBD, setTietBD] = useState("");
  const [tietKT, setTietKT] = useState("");
  const [monHoc, setMonHoc] = useState("");
  const [giangVien, setGiangVien] = useState("");
  const [isOpenAttendance, setIsOpenAttendance] = useState(false);
  const [sop, setSop] = useState("");
  const [subjectList, setsubjectList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [roomList, setRoomList] = useState([]);

  useEffect(() => {
    if (selectedTkb) {
      setThu(selectedTkb.thu);
      setNgay(selectedTkb.ngay);
      setTietBD(selectedTkb.tietBD);
      setTietKT(selectedTkb.tietKT);
      setMonHoc(selectedTkb.monHoc?.tenmh || "");
      setGiangVien(selectedTkb.giangVien?.mgv || "");
      // setIsOpenAttendance(selectedTkb.isOpenAttendance);
      setSop(selectedTkb.sop);
    }
  }, [selectedTkb]);

  useEffect(() => {
    const loadSubject = async () => {
      try {
        const resSubjects = await fetchAllSubjects(1, 1000);
        setsubjectList(resSubjects.data.monhoc);
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách môn học",
        });
      }
    };
    loadSubject();
  }, []);

  useEffect(() => {
    const loadTeacher = async () => {
      try {
        const resTeachers = await fetchAllTeachers(1, 1000);
        setTeacherList(resTeachers.data.teachers);
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách giảng viên",
        });
      }
    };
    loadTeacher();
  }, []);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const resRooms = await fetchAllRooms(1, 1000);
        setRoomList(resRooms.data.rooms);
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách phòng học",
        });
      }
    };
    loadRoom();
  }, []);

  const handleUpdate = async () => {
    try {
      if (
        !thu ||
        !ngay ||
        !tietBD ||
        !tietKT ||
        !monHoc ||
        !giangVien ||
        !sop
      ) {
        notification.error({
          message: "Lỗi",
          description: "Vui lòng nhập đầy đủ thông tin.",
        });
        return;
      }
      const resUpdate = await updateTkb(
        selectedTkb.id,
        thu,
        ngay,
        parseInt(tietBD),
        parseInt(tietKT),
        monHoc,
        giangVien,
        sop
      );
      if (resUpdate.data) {
        notification.success({
          message: "Thành công",
          description: "Cập nhật thời khoá biểu thành công",
        });
        resetForm();
        await loadDataTkb();
      } else {
        notification.error({
          message: "Thất bại",
          description: "Cập nhật thời khoá biểu thất bại",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: "Lỗi",
        description: error.message || "Cập nhật thời khoá biểu thất bại",
      });
    }
  };

  const resetForm = () => {
    setThu("");
    setNgay("");
    setTietBD("");
    setTietKT("");
    setMonHoc("");
    setGiangVien("");
    setIsOpenAttendance(false);
    setSop("");
    setIsUpdateModalOpen(false);
  };

  return (
    <Modal
      title="Cập nhật thời khóa biểu"
      open={isUpdateModalOpen}
      onCancel={() => setIsUpdateModalOpen(false)}
      onOk={handleUpdate}
    >
      <div>
        <label>Thứ:</label>
        <Select
          placeholder="Chọn thứ"
          value={thu}
          onChange={setThu}
          style={{ width: "100%", marginBottom: "10px" }}
        >
          <Select.Option value="Thứ 2">Thứ 2</Select.Option>
          <Select.Option value="Thứ 3">Thứ 3</Select.Option>
          <Select.Option value="Thứ 4">Thứ 4</Select.Option>
          <Select.Option value="Thứ 5">Thứ 5</Select.Option>
          <Select.Option value="Thứ 6">Thứ 6</Select.Option>
          <Select.Option value="Thứ 7">Thứ 7</Select.Option>
          <Select.Option value="Chủ nhật">Chủ nhật</Select.Option>
        </Select>
      </div>
      <div>
        <label>Ngày:</label>
        <Input
          placeholder="Ngày (dd/mm/yyyy)"
          value={ngay}
          onChange={(e) => setNgay(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
      </div>
      <div>
        <label>Tiết Bắt Đầu:</label>
        <Input
          placeholder="Tiết bắt đầu"
          value={tietBD}
          onChange={(e) => setTietBD(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
      </div>

      <div>
        <label>Tiết kết thúc:</label>
        <Input
          placeholder="Tiết kết thúc"
          value={tietKT}
          onChange={(e) => setTietKT(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
      </div>
      <div>
        <label>Tên Môn học:</label>
        <Select
          style={{ width: "100%" }}
          value={monHoc}
          onChange={(value) => setMonHoc(value)}
          placeholder="Chọn Môn học"
        >
          {subjectList.map((subject) => (
            <Select.Option key={subject.mamh} value={subject.mamh}>
              {subject.tenmh}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div>
        <label>Giảng viên:</label>
        <Select
          style={{ width: "100%" }}
          value={giangVien}
          onChange={(value) => setGiangVien(value)}
        >
          {teacherList.map((teacher) => (
            <Select.Option key={teacher.mgv} value={teacher.mgv}>
              {teacher.hoGV} {teacher.tenGV}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div>
        <label>Số phòng:</label>
        <Select
          style={{ width: "100%" }}
          value={sop}
          onChange={(value) => setSop(value)}
        >
          {roomList.map((sp) => (
            <Select.Option key={sp.sop} value={sp.sop}>
              {sp.tenPhong}
            </Select.Option>
          ))}
        </Select>
      </div>
    </Modal>
  );
};

export default UpdateTkb;
