import { Table, Button, Popconfirm, notification, Image } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { deleteSubject } from "../../../services/api.service";
import UpdateSubject from "./update.subject";

const SubjectTable = (props) => {
  const {
    loadDataSubject,
    dataSubject,
    current,
    pageSize,
    total,
    setCurrent,
    setPageSize,
  } = props;
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const columns = [
    {
      title: "STT",
      align: "center",
      render: (_, record, index) => {
        return <>{index + 1 + (current - 1) * pageSize}</>;
      },
    },
    {
      title: "Mã môn học",
      dataIndex: "mamh",
      key: "mamh",
    },
    {
      title: "Tên môn học",
      dataIndex: "tenmh",
      key: "tenmh",
    },
    {
      title: "tclt",
      align: "center",
      dataIndex: "tclt",
      key: "tclt",
    },
    {
      title: "tcth",
      align: "center",
      dataIndex: "tcth",
      key: "tcth",
    },
    {
      title: "Thao tác",
      align: "center",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedSubject(record);
              setIsUpdateModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa môn học"
            description="Bạn có chắc chắn muốn môn này không ?"
            onConfirm={() => handleDelete(record.mamh)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleDelete = async (mamh) => {
    try {
      const resDelete = await deleteSubject(mamh);
      if (resDelete.data) {
        notification.success({
          message: "Thành công",
          description: "Xóa môn học thành công",
        });
        await loadDataSubject();
      }
    } catch (error) {
      notification.error({
        message: "Có lỗi xảy ra",
        description: error.message,
      });
    }
  };

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
        dataSource={dataSubject}
        rowKey="malop"
        pagination={{
          position: ["bottomCenter"],
          current: current,
          pageSize: pageSize,
          showSizeChanger: false,
          total: total,
        }}
        onChange={onChange}
      />
      <UpdateSubject
        isUpdateModalOpen={isUpdateModalOpen}
        setIsUpdateModalOpen={setIsUpdateModalOpen}
        selectedSubject={selectedSubject}
        loadDataSubject={loadDataSubject}
      />
    </>
  );
};

export default SubjectTable;
