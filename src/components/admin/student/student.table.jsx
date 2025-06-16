import { useEffect, useState } from "react";
import { Table, Button, Popconfirm, notification, Image } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import StudentDetail from "./detail.student.jsx";
import { deleteStudent } from "../../../services/api.service.js";

const StudentTable = (props) => {
  const {
    loadDataStudent,
    datastudent,
    current,
    pageSize,
    total,
    setCurrent,
    setPageSize,
  } = props;
  const [dataDetail, setDataDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  // const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const columns = [
    {
      title: "STT",
      align: "center",
      render: (_, record, index) => {
        //   return <>{index + 1 + (current - 1) * pageSize}</>;
        return <>{index + 1}</>;
      },
    },
    {
      title: "Mã sinh viên",
      dataIndex: "mssv",
      key: "mssv",
    },
    {
      title: "Tên sinh viên",
      dataIndex: "tensv",
      //   key: "tenkv",
      render: (_, record) => `${record.holot} ${record.ten}`,
    },
    {
      title: "Ngày sinh",
      dataIndex: "ntns",
      key: "ntns",
    },
    {
      title: "Giới tính",
      dataIndex: "phai",
      key: "phai",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 10 }}>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => {
              setDataDetail(record);
              setIsDetailOpen(true);
            }}
          ></Button>
          <Popconfirm
            title="Xóa khoa viện"
            description="Bạn có chắc chắn muốn xóa khoa viện này?"
            onConfirm={() => handleDelete(record.mssv)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleDelete = async (mssv) => {
    try {
      const resDelete = await deleteStudent(mssv);
      if (resDelete.data) {
        notification.success({
          message: "Thành công",
          description: "Xóa sinh viên thành công",
        });
        await loadDataStudent();
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
        dataSource={datastudent}
        rowKey="mssv"
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
      <StudentDetail
        dataDetail={dataDetail}
        setDataDetail={setDataDetail}
        isDetailOpen={isDetailOpen}
        setIsDetailOpen={setIsDetailOpen}
        loadDataStudent={loadDataStudent}
      />
    </>
  );
};

export default StudentTable;
