import { useEffect, useState } from "react";
import TeacherForm from "../../components/admin/teacher/teacher.form.jsx";
import TeacherTable from "../../components/admin/teacher/teacher.table.jsx";
import { fetchAllTeachers } from "../../services/api.service.js";
import "../../style/admin/teacher.css";

const TeacherPage = () => {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [dataTeachers, setDataTeachers] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadDataTeachers();
  }, [current, pageSize]);

  const loadDataTeachers = async () => {
    const res = await fetchAllTeachers(current, pageSize);
    if (res.data) {
      setDataTeachers(res.data.teachers);
      setCurrent(res.data.meta.current);
      setPageSize(res.data.meta.pageSize);
      setTotal(res.data.meta.total);
    }
  };

  return (
    <div className="teacher-table-container">
      <div className="teacher-table-title">Quản lý giảng viên</div>
      <TeacherForm loadDataTeachers={loadDataTeachers} />
      <TeacherTable
        loadDataTeachers={loadDataTeachers}
        dataTeachers={dataTeachers}
        current={current}
        pageSize={pageSize}
        total={total}
        setCurrent={setCurrent}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default TeacherPage;
