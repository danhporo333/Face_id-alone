import { Table, Button, Popconfirm, notification, Image } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { deleteRoom } from "../../../services/api.service";
import UpdateRoom from "./update.room";

const RoomTable = (props) => {
  const {
    dataRoom,
    loadDataRoom,
    current,
    pageSize,
    total,
    setCurrent,
    setPageSize,
  } = props;

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleDelete = async (makv) => {
    try {
      const resDelete = await deleteRoom(sop);
      if (resDelete.data) {
        notification.success({
          message: "Thành công",
          description: "Xóa thành công",
        });
        await loadDataRoom();
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
      title: "Mã phòng",
      dataIndex: "sop",
      key: "sop",
    },
    {
      title: "Tên phòng",
      dataIndex: "tenPhong",
      align: "center",
      key: "tenPhong",
    },
    {
      title: "Sức chứa",
      dataIndex: "sucChua",
      align: "center",
      key: "sucChua",
    },
    {
      title: "Cơ Sở",
      dataIndex: "coSo",
      align: "center",
      key: "coSo",
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
              setSelectedRoom(record);
              setIsUpdateModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa Phòng học"
            description="Bạn có chắc chắn muốn Phòng này không ?"
            onConfirm={() => handleDelete(record.sop)}
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
        dataSource={dataRoom}
        rowKey="sop"
        pagination={{
          position: ["bottomCenter"],
          current: current,
          pageSize: pageSize,
          showSizeChanger: false,
          total: total,
        }}
        onChange={onChange}
      />
      <UpdateRoom
        isUpdateModalOpen={isUpdateModalOpen}
        setIsUpdateModalOpen={setIsUpdateModalOpen}
        selectedRoom={selectedRoom}
        loadDataRoom={loadDataRoom}
      />
    </>
  );
};

export default RoomTable;
