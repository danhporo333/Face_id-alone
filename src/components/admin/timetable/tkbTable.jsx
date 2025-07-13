import { Table, Button, Popconfirm, notification, Image, Modal } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import UpdateTkb from "./updateTkb";
import {
  deleteTkb,
  assignStudentToTkb,
  fetchAllStudent,
} from "../../../services/api.service.js";

const TKBtable = (props) => {
  const {
    loadDataTkb,
    dataTkb,
    current,
    pageSize,
    total,
    setCurrent,
    setPageSize,
  } = props;
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTkb, setSelectedTkb] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Load SV khi modal mở
  useEffect(() => {
    if (!isAssignModalOpen) return;
    (async () => {
      try {
        const res = await fetchAllStudent(1, 1000);
        console.log("res.data.students", res);
        setStudentList(res.data.students);
      } catch (err) {
        notification.error({
          message: "Lỗi",
          description: "Không tải được sinh viên",
        });
      }
    })();
  }, [isAssignModalOpen]);

  const handleAssign = async () => {
    try {
      await Promise.all(
        selectedRowKeys.map((mssv) =>
          assignStudentToTkb({ mssv, tkbId: selectedTkb.id })
        )
      );
      notification.success({ message: "Gán thành công" });
      setIsAssignModalOpen(false);
      loadDataTkb();
    } catch (err) {
      notification.error({ message: "Lỗi", description: err.message });
    }
  };

  const handleDelete = async (id) => {
    try {
      const resDelete = await deleteTkb(id);
      if (resDelete.data) {
        notification.success({
          message: "Thành công",
          description: "Xóa thời khóa biểu thành công",
        });
      }
      await loadDataTkb();
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
      title: "Ngày",
      dataIndex: "ngay",
      key: "ngay",
      align: "center",
    },
    {
      title: "Thứ",
      dataIndex: "thu",
      key: "thu",
      align: "center",
    },
    {
      title: "Ca học (tiết BD - KT)",
      dataIndex: "cahoc",
      key: "cahoc",
      align: "center",
      render: (_, record) => `${record.tietBD}-${record.tietKT}`,
    },
    {
      title: "Môn học",
      dataIndex: "monhoc",
      key: "monhoc",
      render: (_, record) => record.monHoc?.tenmh,
    },
    {
      title: "Giảng viên",
      dataIndex: "giangVien",
      key: "giangVien",
      align: "center",
      render: (_, record) =>
        `${record.giangVien?.hoGV} ${record.giangVien?.tenGV}`,
    },
    {
      title: "Trạng thái điểm danh",
      dataIndex: "diemdanh",
      key: "diemdanh",
      align: "center",
      render: (_, record) => (
        <span
          style={{
            color: record.isOpenAttendance ? "#52c41a" : "#ff4d4f",
            fontWeight: "bold",
          }}
        >
          {record.isOpenAttendance ? "Đang mở" : "Đã đóng"}
        </span>
      ),
    },
    {
      title: "Thống kê điểm danh",
      key: "thongke",
      align: "center",
      render: (_, record) => {
        if (!record.diemDanh || record.diemDanh.length === 0) {
          return <span style={{ color: "#999" }}>Chưa điểm danh</span>;
        }

        const coMat = record.diemDanh.filter(
          (dd) => dd.coMat && !dd.diTre
        ).length;
        const diTre = record.diemDanh.filter(
          (dd) => dd.coMat && dd.diTre
        ).length;
        const vang = record.diemDanh.filter((dd) => !dd.coMat).length;
        const total = record.diemDanh.length;

        const statuses = [];

        if (coMat > 0) {
          statuses.push(
            <div
              key="comat"
              style={{ color: "#52c41a", fontWeight: "bold", fontSize: "17px" }}
            >
              Có mặt
            </div>
          );
        }

        if (diTre > 0) {
          // Lấy danh sách sinh viên đi trễ và lý do
          const diTreList = record.diemDanh.filter(
            (dd) => dd.coMat && dd.diTre
          );
          const lyDoList = diTreList
            .filter((dd) => dd.lyDoKhac) // Chỉ lấy những sinh viên có lý do
            .map((dd) => dd.lyDoKhac);

          statuses.push(
            <div
              key="ditre"
              style={{ color: "#fa8c16", fontWeight: "bold", fontSize: "17px" }}
            >
              <div>Đi trễ</div>
              {lyDoList.length > 0 && (
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "normal",
                    marginTop: "4px",
                    fontStyle: "italic",
                  }}
                >
                  Lý do: {lyDoList.join(", ")}
                </div>
              )}
            </div>
          );
        }
        if (vang > 0) {
          statuses.push(
            <div
              key="vang"
              style={{ color: "#ff4d4f", fontWeight: "bold", fontSize: "17px" }}
            >
              Vắng
            </div>
          );
        }
        return (
          <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
            {statuses.length > 0 ? (
              statuses
            ) : (
              <span style={{ color: "#999" }}>Chưa có dữ liệu</span>
            )}
          </div>
        );
      },
    },
    {
      key: "assign",
      title: "Gán SV",
      align: "center",
      render: (_, record) => (
        <Button
          icon={<UserAddOutlined />}
          onClick={() => {
            setSelectedTkb(record);
            setSelectedRowKeys([]);
            setIsAssignModalOpen(true);
          }}
        >
          Gán SV
        </Button>
      ),
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
              setSelectedTkb(record);
              setIsUpdateModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa khoa viện"
            description="Bạn có chắc chắn muốn xóa khoa viện này?"
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
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={dataTkb}
        rowKey="id"
        pagination={{
          position: ["bottomCenter"],
          current: current,
          pageSize: pageSize,
          showSizeChanger: false,
          total: total,
        }}
        onChange={onChange}
      />
      <Modal
        title={`Gán SV cho buổi ${selectedTkb?.thu}`}
        open={isAssignModalOpen}
        onOk={handleAssign}
        onCancel={() => setIsAssignModalOpen(false)}
        okText="Xác nhận"
        width={800}
      >
        <Table
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          dataSource={studentList}
          columns={[
            { title: "MSSV", dataIndex: "mssv", key: "mssv" },
            {
              title: "Họ tên",
              key: "ten",
              render: (_, record) => `${record.holot} ${record.ten}`,
            },
          ]}
          rowKey="mssv"
          pagination={false}
          scroll={{ y: 400 }} // Thêm scroll dọc
          size="small" // Làm table nhỏ gọn hơn
        />
      </Modal>
      <UpdateTkb
        isUpdateModalOpen={isUpdateModalOpen}
        setIsUpdateModalOpen={setIsUpdateModalOpen}
        selectedTkb={selectedTkb}
        loadDataTkb={loadDataTkb}
      />
    </>
  );
};

export default TKBtable;
