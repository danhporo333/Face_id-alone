import { useEffect, useState } from "react";
import ClassTable from "../../components/class/class.table";
import ClassForm from "../../components/class/class.form";
import { fetchAllClass } from "../../services/api.service.js";
import "../../style/admin/class.css";

const ClassPage = () => {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [dataClass, setDataClass] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadDataClass();
  }, [current, pageSize]);

  const loadDataClass = async () => {
    const res = await fetchAllClass(current, pageSize);
    if (res.data) {
      setDataClass(res.data.classes);
      setCurrent(res.data.meta.current);
      setPageSize(res.data.meta.pageSize);
      setTotal(res.data.meta.total);
      // console.log("Data khoa vien:", res.data);
    }
  };

  console.log("Current page:", current);
  return (
    <div className="class-table-container">
      <div className="class-table-title">Quản lý lớp</div>
      <ClassForm loadDataClass={loadDataClass} />
      <ClassTable
        loadDataClass={loadDataClass}
        dataClass={dataClass}
        current={current}
        pageSize={pageSize}
        total={total}
        setCurrent={setCurrent}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default ClassPage;
