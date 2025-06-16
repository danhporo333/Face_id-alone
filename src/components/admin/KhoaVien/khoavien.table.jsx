import { Table, Button, Popconfirm, notification, Image } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import UpdateKhoaVien from "./update.khoavien";
import { deleteKhoaVien } from "../../../services/api.service.js";
import { useState } from "react";

const KhoavienTable = (props) => {
  const {
    loadDataKhoaVien,
    dataKhoaVien,
    current,
    pageSize,
    total,
    setCurrent,
    setPageSize,
  } = props;
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedkhoaVien, setSelectedkhoaVien] = useState(null);

  const handleDelete = async (makv) => {
    try {
      const resDelete = await deleteKhoaVien(makv);
      if (resDelete.data) {
        notification.success({
          message: "Thành công",
          description: "Xóa khoa viện thành công",
        });
        await loadDataKhoaVien();
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
      title: "Mã khoa viện",
      dataIndex: "makv",
      key: "makv",
    },
    {
      title: "Tên khoa viện",
      dataIndex: "tenkv",
      key: "tenkv",
    },
    {
      title: "Điện thoại",
      dataIndex: "dtkv",
      key: "dtkv",
    },
    {
      title: "Địa chỉ",
      dataIndex: "diaChi",
      key: "diaChi",
    },
    {
      title: "Số lớp",
      dataIndex: "lop",
      key: "lop",
      align: "center",
      render: (lop) => (Array.isArray(lop) ? lop.length : 0),
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
              setSelectedkhoaVien(record);
              setIsUpdateModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa khoa viện"
            description="Bạn có chắc chắn muốn xóa khoa viện này?"
            onConfirm={() => handleDelete(record.makv)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={dataKhoaVien}
        rowKey="makv"
        pagination={{
          position: ["bottomCenter"],
          current: current,
          pageSize: pageSize,
          showSizeChanger: false,
          total: total,
          // showTotal: (total, range) => {
          //   return (
          //     <div>
          //       {" "}
          //       {range[0]}-{range[1]} trên {total} rows
          //     </div>
          //   );
          // },
        }}
        onChange={onChange}
      />
      <UpdateKhoaVien
        isUpdateModalOpen={isUpdateModalOpen}
        setIsUpdateModalOpen={setIsUpdateModalOpen}
        selectedkhoaVien={selectedkhoaVien}
        loadDataKhoaVien={loadDataKhoaVien}
      />
    </>
  );
};

export default KhoavienTable;
