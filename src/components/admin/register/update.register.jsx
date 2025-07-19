import { Modal, Input, notification, Select } from 'antd';
import { useEffect, useState } from 'react';
import { fetchAllStudent, fetchAllTeachers, updateUser } from '../../../services/api.service.js';
import { use } from 'react';

const UpdateRegister = (props) => {
    const { isUpdateModalOpen, setIsUpdateModalOpen, selectedUser, loadDataUser } = props;
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [mssv, setMSSV] = useState('');
    const [mgv, setMGV] = useState('');
    const [studentList, setStudentList] = useState([]);
    const [teacherList, setTeacherList] = useState([]);
    const [accountType, setAccountType] = useState('');

    useEffect(() => {
        if (selectedUser) {
            setEmail(selectedUser.email);
            setUsername(selectedUser.username);
            setMSSV(selectedUser.mssv);
            setMGV(selectedUser.mgv);

            setAccountType(selectedUser.mssv ? 'student' : 'teacher');
        }
    }, [selectedUser]);

    useEffect(() => {
        const loadStudents = async () => {
            try {
                const res = await fetchAllStudent(1, 1000);
                setStudentList(res.data.students);
            } catch (error) {
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể tải danh mục sinh viên',
                });
            }
        };
        loadStudents();
    }, []);

    useEffect(() => {
        const loadTeachers = async () => {
            try {
                const res = await fetchAllTeachers(1, 1000);
                setTeacherList(res.data.teachers);
            } catch (error) {
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể tải danh mục giáo viên',
                });
            }
        };
        loadTeachers();
    }, []);

    const handleUpdate = async () => {
        try {
            if (!email || !username || (!mssv && !mgv)) {
                notification.error({
                    message: 'Lỗi',
                    description: 'Vui lòng điền đầy đủ thông tin',
                });
                return;
            }
            const res = await updateUser(selectedUser.id, email, username, mssv, mgv);
            if (res.data) {
                notification.success({
                    message: 'Thành công',
                    description: 'Cập nhật người dùng thành công',
                });
                resetForm();
                await loadDataUser();
            } else {
                notification.error({
                    message: 'Thất bại',
                    description: 'Cập nhật người dùng thất bại',
                });
            }
        } catch (error) {
            console.error('Error:', error);
            notification.error({
                message: 'Lỗi',
                description: error.response?.data?.message || 'Có lỗi xảy ra',
            });
        }
    };

    const handleStudentChange = (value) => {
        setMSSV(value);
        setMGV(''); // Clear giảng viên khi chọn sinh viên
        setAccountType('student');
    };

    const handleTeacherChange = (value) => {
        setMGV(value);
        setMSSV(''); // Clear sinh viên khi chọn giảng viên
        setAccountType('teacher');
    };

    const resetForm = () => {
        setNameClass('');
        setSiso('');
        setkhoaVien('');
        setIsUpdateModalOpen(false);
    };

    return (
        <Modal
            title="Cập nhật người dùng"
            open={isUpdateModalOpen}
            onCancel={() => setIsUpdateModalOpen(false)}
            onOk={handleUpdate}
            okText="Cập nhật"
            cancelText="Hủy"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <label>Email:</label>
                    <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <label>Tên đăng nhập:</label>
                    <Input placeholder="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                    <label>Chọn sinh viên:</label>
                    <Select
                        placeholder="Chọn sinh viên"
                        style={{ width: '100%' }}
                        value={mssv}
                        onChange={handleStudentChange}
                        disabled={accountType === 'teacher'}
                    >
                        {studentList.map((student) => (
                            <Select.Option key={student.mssv} value={student.mssv}>
                                {student.holot} {student.ten}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                <div>
                    <label>Chọn giảng viên:</label>
                    <Select
                        placeholder="Chọn giáo viên"
                        style={{ width: '100%' }}
                        value={mgv}
                        onChange={handleTeacherChange}
                        disabled={accountType === 'student'}
                    >
                        {teacherList.map((teacher) => (
                            <Select.Option key={teacher.mgv} value={teacher.mgv}>
                                {teacher.hoGV} {teacher.tenGV}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            </div>
        </Modal>
    );
};

export default UpdateRegister;
