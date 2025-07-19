import { useEffect, useState } from "react";
import RegisterTable from "../../components/admin/register/registerTable.jsx";
import RegisterForm from "../../components/admin/register/registerform.jsx";
import { getFullUser } from "../../services/api.service.js";
import "../../style/admin/register.css";

const RegisterPage = () => {
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(2);
    const [dataUser, setDataUser] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadDataUser();
    }, [current, pageSize]);

    const loadDataUser = async () => {
        const res = await getFullUser(current, pageSize);
        console.log("API Response:", res);
        if(res.data) {
            setDataUser(res.data.users);
            setCurrent(res.data.meta.current);
            setPageSize(res.data.meta.pageSize);
            setTotal(res.data.meta.total);
        }
    }
  return (
    <div className="user-table-container">
      <div className="user-table-title">Quản lý người dùng</div>
      <RegisterForm loadDataUser={loadDataUser} />
      <RegisterTable
        loadDataUser={loadDataUser}
        dataUser={dataUser}
        current={current}
        pageSize={pageSize}
        total={total}
        setCurrent={setCurrent}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default RegisterPage;
