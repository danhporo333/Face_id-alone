import { Table, Button, Popconfirm, notification, Image } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import UpdateTeacher from "./update.teacher";
import { deleteTeacher } from "../../../services/api.service.js";

const TeacherTable = (props) => {
  const {
    loadDataTeachers,
    dataTeachers,
    current,
    pageSize,
    total,
    setCurrent,
    setPageSize,
  } = props;
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const handleDelete = async (mgv) => {
    try {
      const resDelete = await deleteTeacher(mgv);
      if (resDelete.data) {
        notification.success({
          message: "Thành công",
          description: "Xóa giảng viên thành công",
        });
        await loadDataTeachers();
      }
    } catch (error) {
      notification.error({
        message: "Có lỗi xảy ra",
        description: error.message,
      });
    }
  };

  const columns = [
    {
      title: "STT",
      align: "center",
      render: (_, record, index) => {
        // return <>{index + 1}</>;
        return <>{index + 1 + (current - 1) * pageSize}</>;
      },
    },
    {
      title: "Mã giảng viên",
      dataIndex: "mgv",
      key: "mgv",
    },
    {
      title: "Tên giảng viên",
      dataIndex: "tenGV",
      // key: "tenGV",
      render: (_, record) => `${record.hoGV} ${record.tenGV}`,
    },
    {
      title: "Điện thoại",
      dataIndex: "dt_gv",
      key: "dt_gv",
    },
    {
      title: "Đơn vị",
      dataIndex: "donVi",
      key: "donVi",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 10 }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedTeacher(record);
              setIsUpdateModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa khoa viện"
            description="Bạn có chắc chắn muốn xóa khoa viện này?"
            onConfirm={() => handleDelete(record.mgv)}
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
    console.log("onChange", { pagination, filters, sorter, extra });
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={dataTeachers}
        rowKey="mgv"
        pagination={{
          position: ["bottomCenter"],
          current: current,
          pageSize: pageSize,
          showSizeChanger: false,
          total: total,
        }}
        onChange={onChange}
      />
      <UpdateTeacher
        isUpdateModalOpen={isUpdateModalOpen}
        setIsUpdateModalOpen={setIsUpdateModalOpen}
        selectedTeacher={selectedTeacher}
        loadDataTeachers={loadDataTeachers}
      />
    </>
  );
};

export default TeacherTable;
