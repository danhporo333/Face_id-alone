import { Table, Button, Popconfirm, notification, Image } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import UpdateClass from "./update.class";
import { deleteClass } from "../../../services/api.service.js";
import ImportModal from "./ImportModal.jsx";

const ClassTable = (props) => {
  const {
    loadDataClass,
    dataClass,
    current,
    pageSize,
    total,
    setCurrent,
    setPageSize,
  } = props;

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const columns = [
    {
      title: "STT",
      align: "center",
      render: (_, record, index) => {
        return <>{index + 1 + (current - 1) * pageSize}</>;
        // return <>{index + 1}</>;
      },
    },
    {
      title: "Mã Lớp",
      dataIndex: "malop",
      key: "malop",
    },
    {
      title: "Tên lớp",
      dataIndex: "tenlop",
      key: "tenlop",
    },
    {
      title: "Sĩ số",
      dataIndex: "siso",
      key: "siso",
    },
    {
      title: "Khoa viện",
      dataIndex: "tenkv",
      key: "tenkv",
      render: (text, record) => {
        return <>{record.khoaVien ? record.khoaVien.tenkv : "Không có"}</>;
      },
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
              setSelectedClass(record);
              setIsUpdateModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa lớp"
            description="Bạn có chắc chắn muốn xóa lớp này không ?"
            onConfirm={() => handleDelete(record.malop)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleDelete = async (malop) => {
    try {
      const resDelete = await deleteClass(malop);
      if (resDelete.data) {
        notification.success({
          message: "Thành công",
          description: "Xóa lớp thành công",
        });
        await loadDataClass();
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
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<UploadOutlined />}
          type="primary"
          onClick={() => setIsImportModalOpen(true)}
        >
          Import Excel
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={dataClass}
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
      <UpdateClass
        isUpdateModalOpen={isUpdateModalOpen}
        setIsUpdateModalOpen={setIsUpdateModalOpen}
        selectedClass={selectedClass}
        loadDataClass={loadDataClass}
      />
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={loadDataClass}
      />
    </>
  );
};
export default ClassTable;
