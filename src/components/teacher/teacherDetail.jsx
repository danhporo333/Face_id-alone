import React, { useState, useEffect } from 'react';
import { Drawer, Table, Avatar, Tag, notification, Badge } from 'antd';
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getTimetableByTeacher } from '../../services/api.service';

const TeacherTimetableDetail = () => {
    const [studentList, setStudentList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedTimetable && isDetailOpen) {
            fetchStudentList();
        }
    }, [selectedTimetable, isDetailOpen]);

    const fetchStudentList = async () => {
        try {
            setLoading(true);
            const resp = await getTimetableByTeacher(selectedTimetable.id);
            // resp.data.tkbs là mảng, chúng ta tìm đúng bản ghi theo id
            const record = resp.data?.tkbs?.find((tkb) => tkb.id === selectedTimetable.id);
            const list = record?.danhSachSinhVien || [];
            console.log('studentList', list);
            setStudentList(list);
        } catch (err) {
            notification.error({
                message: 'Lỗi',
                description: 'Không tải được danh sách sinh viên',
            });
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (stt) => {
        if (!stt) return <ExclamationCircleOutlined style={{ color: '#999' }} />;
        if (stt.coMat && !stt.diTre) return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
        if (stt.coMat && stt.diTre) return <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />;
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    };
    const getText = (stt) => {
        if (!stt) return 'Chưa điểm danh';
        if (stt.coMat && !stt.diTre) return 'Có mặt';
        if (stt.coMat && stt.diTre) return 'Đi trễ';
        return 'Vắng mặt';
    };
    const getColor = (stt) => {
        if (!stt) return 'default';
        if (stt.coMat && !stt.diTre) return 'success';
        if (stt.coMat && stt.diTre) return 'warning';
        return 'error';
    };

    const columns = [
        { title: 'STT', key: 'idx', width: 60, render: (_, __, i) => i + 1 },
        {
            title: 'Avatar',
            dataIndex: 'faceID',
            key: 'avatar',
            width: 80,
            render: (faceID) =>
                faceID ? (
                    <Avatar src={`${import.meta.env.VITE_BACKEND_URL}/image/student/${faceID}`} />
                ) : (
                    <Avatar icon={<UserOutlined />} />
                ),
        },
        { title: 'Mã SV', dataIndex: 'mssv', key: 'mssv', width: 140 },
        {
            title: 'Họ tên',
            dataIndex: 'hoTen',
            key: 'hoTen',
        },
        { title: 'Lớp', dataIndex: 'lop', key: 'lop', width: 100 },
        { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
        {
            title: 'Điện thoại',
            dataIndex: 'dienThoai',
            key: 'dienThoai',
            width: 140,
        },
        {
            title: 'Trạng thái',
            key: 'trangThai',
            width: 140,
            render: (_, rec) => {
                const st = rec.trangThaiDiemDanh;
                return (
                    <Badge count={getIcon(st)} style={{ background: 'transparent' }}>
                        <Tag color={getColor(st)}>{getText(st)}</Tag>
                    </Badge>
                );
            },
        },
    ];

    return (
        <Drawer
            title={`Chi tiết: ${selectedTimetable?.subject}`}
            width={800}
            onClose={() => setIsDetailOpen(false)}
            open={isDetailOpen}
        >
            <Table
                rowKey="mssv"
                dataSource={studentList}
                columns={columns}
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
            />
        </Drawer>
    );
};

export default TeacherTimetableDetail;
