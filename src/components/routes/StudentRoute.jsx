import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import { Result, Button } from "antd";
import { Link } from "react-router-dom";

const StudentRoute = (props) => {
  const { user } = useContext(AuthContext);
  const isStudent = user?.role?.includes("STUDENT");

  if (!isStudent) {
    return (
      <Result
        status="403"
        title="Permission Denied"
        subTitle="bạn không có quyền truy cập."
        extra={
          <Button type="primary">
            <Link to="/login">Back to login</Link>
          </Button>
        }
      />
    );
  }

  return <>{props.children}</>;
};

export default StudentRoute;
