import { useEffect, useState } from "react";
import SubjectForm from "../../components/admin/Subject/subject.form";
import SubjectTable from "../../components/admin/Subject/subject.table";
import { fetchAllSubjects } from "../../services/api.service";
import "../../style/admin/subject.css";

const SubjectPage = () => {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [dataSubject, setDataSubject] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadDataSubject();
  }, [current, pageSize]);
  const loadDataSubject = async () => {
    const res = await fetchAllSubjects(current, pageSize);
    if (res.data) {
      setDataSubject(res.data.monhoc);
      setCurrent(res.data.meta.current);
      setPageSize(res.data.meta.pageSize);
      setTotal(res.data.meta.total);
    }
  };

  return (
    <div className="subject-table-container">
      <div className="subject-table-title">Quản lý môn học</div>
      <SubjectForm loadDataSubject={loadDataSubject} />
      <SubjectTable
        loadDataSubject={loadDataSubject}
        dataSubject={dataSubject}
        current={current}
        pageSize={pageSize}
        total={total}
        setCurrent={setCurrent}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default SubjectPage;
