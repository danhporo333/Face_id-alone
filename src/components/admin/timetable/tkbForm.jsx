import { Button, Input, Modal, notification, Select } from "antd";
import { useState, useEffect } from "react";
import { createTkb, fetchAllSubjects, fetchAllTeachers, fetchAllRooms } from "../../../services/api.service";

const TKBform = (props) => {
    const { loadDataTkb } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [thu, setThu] = useState("");
    const [ngay, setNgay] = useState("")
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
        loadSubject();
    }, []);

    useEffect(() => {
        loadTeacher();
    }, []);

    useEffect(() => {
        loadRoom();
    }, []);

    const loadSubject = async () => {
        try {
            const resSubjects = await fetchAllSubjects(1,1000);
            setsubjectList(resSubjects.data.monhoc);
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: "Không thể tải danh sách môn học",
            });
        }
    }
    
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
    }

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
    }

    const handleSubmit = async () => {
        try {
            setLoading(true);
            if (!thu || !ngay || !tietBD || !tietKT || !monHoc || !giangVien || !sop) {
                notification.error({
                    message: "Lỗi",
                    description: "Vui lòng nhập đầy đủ thông tin.",
                });
                return;
            }
            const resTkb = await createTkb(thu, ngay, parseInt(tietBD), parseInt(tietKT), monHoc, giangVien, sop);
            console.log("dữ liệu form", thu, ngay, parseInt(tietBD), parseInt(tietKT), monHoc, giangVien, sop);
            // console.log("dữ liệu form", resTkb);
            if (resTkb.data) {
                notification.success({
                    message: "Thành công",
                    description: "Thêm mới thời khóa biểu thành công",
                });
                resetForm();
                await loadDataTkb();
            } else {
                notification.error({
                    message: "Thất bại",
                    description: "Thêm mới thời khóa biểu thất bại",
                });
            }
        } catch (error) {
            console.error("Error:", error);
            notification.error({
                message: "Lỗi",
                description: error.message || "Thêm thời khóa biểu thất bại",
            });
        } finally {
            setLoading(false);
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
        setIsModalOpen(false);
    };

    return (
        <div>
            <Button
                type="primary"
                className="add-tkb-btn"
                onClick={() => setIsModalOpen(true)}
            >
                Thêm thời khóa biểu mới
            </Button>

            <Modal
                title="Thêm thời khóa biểu"
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={resetForm}
                confirmLoading={loading}
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
        </div>
    );
}

export default TKBform;