import { Table, Button, Popconfirm, notification, Image } from 'antd';
import { DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { deleteUser } from '../../../services/api.service.js';
import UpdateRegister from './update.register.jsx';

const RegisterTable = (props) => {
    const { loadDataUser, dataUser, current, pageSize, total, setCurrent, setPageSize } = props;
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    // const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const handleDelete = async (id) => {
        try {
            await deleteUser(id);
            notification.success({
                message: 'thành công',
                description: 'Xóa người dùng thành công',
            });
            await loadDataUser();
        } catch (error) {
            notification.error({
                message: 'Xóa người dùng thất bại',
                description: error.response?.data?.message || 'Có lỗi xảy ra',
            });
        }
    };

    const columns = [
        {
            title: 'STT',
            align: 'center',
            render: (_, record, index) => {
                return <>{index + 1 + (current - 1) * pageSize}</>;
                // return <>{index + 1}</>;
            },
        },
        {
            title: 'id',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Họ tên',
            dataIndex: 'giangVien',
            key: 'giangVien',
            render: (text, record) => {
                if (record.giangVien) {
                    return (
                        <>
                            {record.giangVien.hoGV} {record.giangVien.tenGV}
                        </>
                    );
                } else if (record.sinhVien) {
                    return (
                        <>
                            {record.sinhVien.holot} {record.sinhVien.ten}
                        </>
                    );
                }
                return <>Chưa có thông tin</>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 10 }}>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setSelectedUser(record);
                            setIsUpdateModalOpen(true);
                        }}
                    />
                    <Popconfirm
                        title="Xóa người dùng"
                        description="Bạn có chắc chắn muốn xóa người dùng này không ?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const onChange = (pagination, filters, sorter, extra) => {
        if (pagination && pagination.current) {
            if (pagination.current !== current) {
                setCurrent(+pagination.current);
            }
        }

        if (pagination && pagination.pageSize) {
            if (pagination.pageSize !== pageSize) {
                setPageSize(pagination.pageSize);
            }
        }
        console.log('onChange', { pagination, filters, sorter, extra });
    };

    return (
        <>
            <Table
                columns={columns}
                dataSource={dataUser}
                rowKey="id"
                pagination={{
                    position: ['bottomCenter'],
                    current: current,
                    pageSize: pageSize,
                    showSizeChanger: false,
                    total: total,
                }}
                onChange={onChange}
            />
            <UpdateRegister
                isUpdateModalOpen={isUpdateModalOpen}
                setIsUpdateModalOpen={setIsUpdateModalOpen}
                selectedUser={selectedUser}
                loadDataUser={loadDataUser}
            />
        </>
    );
};

export default RegisterTable;
