import TKBtable from "../../components/admin/timetable/tkbTable";
import TKBform from "../../components/admin/timetable/tkbForm";
import { useEffect, useState } from "react";
import { fetchAllTkb } from "../../services/api.service";
import "../../style/admin/timetable.css";

const TimetableAdminPage = () => {
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(4);
    const [dataTkb, setDataTkb] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadDataTkb();
    }, [current, pageSize]);

    const loadDataTkb = async () => {
        // Giả sử bạn có một hàm API để lấy dữ liệu thời khóa biểu
        const res = await fetchAllTkb(current, pageSize);
        if (res.data) {
            setDataTkb(res.data.tkbs);
            setCurrent(res.data.meta.current);
            setPageSize(res.data.meta.pageSize);
            setTotal(res.data.meta.total);
        }
    }
    return (
        <div className="timetable-admin-container">
            <div className="timetable-admin-title">Quản lý thời khóa biểu</div>
            <TKBform loadDataTkb={loadDataTkb} />
            <TKBtable
                loadDataTkb={loadDataTkb}
                dataTkb={dataTkb}
                current={current}
                pageSize={pageSize}
                total={total}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
            />
        </div>
        
    );
}

export default TimetableAdminPage;