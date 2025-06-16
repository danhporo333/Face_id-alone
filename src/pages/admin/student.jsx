import { useEffect, useState } from "react";
import StudentTable from "../../components/admin/student/student.table";
import StudentForm from "../../components/admin/student/student.form";
import { fetchAllStudent } from "../../services/api.service";
import "../../style/admin/student.css";

const StudentPage = () => {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [datastudent, setDatastudent] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadDataStudent();
  }, [current, pageSize]);

  const loadDataStudent = async () => {
    const res = await fetchAllStudent(current, pageSize);
    if (res.data) {
      setDatastudent(res.data.students);
      setCurrent(res.data.meta.current);
      setPageSize(res.data.meta.pageSize);
      setTotal(res.data.meta.total);
    }
  };

  return (
    <div className="student-table-container">
      <div className="student-table-title">Quản lý sinh viên</div>
      <StudentForm loadDataStudent={loadDataStudent} />
      <StudentTable
        loadDataStudent={loadDataStudent}
        datastudent={datastudent}
        current={current}
        pageSize={pageSize}
        total={total}
        setCurrent={setCurrent}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default StudentPage;
