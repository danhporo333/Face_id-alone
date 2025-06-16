import { useEffect, useState } from "react";
import KhoavienForm from "../../components/KhoaVien/khoavien.form.jsx";
import KhoavienTable from "../../components/KhoaVien/khoavien.table";
import { fetchAllKhoaVien } from "../../services/api.service.js";
import "../../style/admin/khoavien.css";

const KhoaVienPage = () => {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [dataKhoaVien, setDataKhoaVien] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadDataKhoaVien();
  }, [current, pageSize]);

  const loadDataKhoaVien = async () => {
    const res = await fetchAllKhoaVien(current, pageSize);
    if (res.data) {
      setDataKhoaVien(res.data.result);
      setCurrent(res.data.meta.current);
      setPageSize(res.data.meta.pageSize);
      setTotal(res.data.meta.total);
      // console.log("Data khoa vien:", res.data);
    }
  };

  return (
    <div className="khoavien-table-container">
      <div className="khoavien-table-title">Quản lý khoa viện</div>
      <KhoavienForm loadDataKhoaVien={loadDataKhoaVien} />
      <KhoavienTable
        loadDataKhoaVien={loadDataKhoaVien}
        dataKhoaVien={dataKhoaVien}
        current={current}
        pageSize={pageSize}
        total={total}
        setCurrent={setCurrent}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default KhoaVienPage;
