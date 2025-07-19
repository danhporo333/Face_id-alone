import { Button, Input, Modal, notification, Select } from 'antd';
import { useState, useEffect } from 'react';
import { registerAccount, fetchAllStudent, fetchAllTeachers } from '../../../services/api.service.js';

const RegisterForm = (props) => {
    const { loadDataUser } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mssv, setMssv] = useState('');
    const [mgv, setMgv] = useState('');
    const [studentList, setStudentList] = useState([]);
    const [teacherList, setTeacherList] = useState([]);
    const [accountType, setAccountType] = useState('');

    useEffect(() => {
        loadStudents();
    }, []);

    useEffect(() => {
        loadTeachers();
    }, []);

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

    const handleSubmit = async () => {
        try {
            if (!email || !username || !password || (!mssv && !mgv)) {
                notification.error({
                    message: 'Lỗi',
                    description: 'Vui lòng điền đầy đủ thông tin',
                });
                return;
            }
            const res = await registerAccount(email, username, password, mssv, mgv);
            if (res.data) {
                notification.success({
                    message: 'Thành công',
                    description: 'Đăng ký tài khoản thành công',
                });
                resetForm();
                await loadDataUser();
            } else {
                notification.error({
                    message: 'Thất bại',
                    description: 'Đăng ký tài khoản thất bại',
                });
            }
        } catch (error) {
            console.error('Error:', error);
            notification.error({
                message: 'Lỗi',
                description: error.message || 'Đăng ký tài khoản thất bại',
            });
        }
    };

    const handleStudentChange = (value) => {
        setMssv(value);
        setMgv(''); // Clear giảng viên khi chọn sinh viên
        setAccountType('student');
    };

    const handleTeacherChange = (value) => {
        setMgv(value);
        setMssv(''); // Clear sinh viên khi chọn giảng viên
        setAccountType('teacher');
    };

    const resetForm = () => {
        setEmail('');
        setUsername('');
        setPassword('');
        setMssv('');
        setMgv('');
        setAccountType('');
        setIsModalOpen(false);
    };

    return (
        <>
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
                Đăng ký tài khoản
            </Button>
            <Modal title="Đăng ký tài khoản" open={isModalOpen} onCancel={resetForm} onOk={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                        <label>Email:</label>
                        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div>
                        <label>Username:</label>
                        <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>

                    <div>
                        <label>Password:</label>
                        <Input.Password
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
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
                                <Select.Option key={student.id} value={student.mssv}>
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
        </>
    );
};

export default RegisterForm;
