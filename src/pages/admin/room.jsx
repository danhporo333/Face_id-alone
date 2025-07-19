import { useEffect, useState } from "react";
import RoomTable from "../../components/admin/room/room.table";
import RoomForm from "../../components/admin/room/room.form..jsx";
import { fetchAllRooms } from "../../services/api.service.js";
import "../../style/admin/room.css";

const RoomPage = () => {
  const [dataRoom, setDataRoom] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadDataRoom();
  }, [current, pageSize]);

  const loadDataRoom = async () => {
    try {
      const res = await fetchAllRooms(current, pageSize);
      if (res.data) {
        setDataRoom(res.data.rooms);
        setCurrent(res.data.meta.current);
        setPageSize(res.data.meta.pageSize);
        setTotal(res.data.meta.total);
      }
    } catch (error) {
      console.error("Error loading room data:", error);
    }
  };

  return (
    <div className="room-table-container">
      <div className="room-table-title">Quản lý phòng học</div>
      <RoomForm loadDataRoom={loadDataRoom} />
      <RoomTable
        dataRoom={dataRoom}
        loadDataRoom={loadDataRoom}
        current={current}
        pageSize={pageSize}
        total={total}
        setCurrent={setCurrent}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default RoomPage;
