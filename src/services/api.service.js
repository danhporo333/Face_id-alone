import axios from "./axios.customize.js";

// ------------------------------------------------ API KHOA VIEN ------------------------------------------------
const createKhoaVien = (tenkv, diaChi) => {
  const URL_BACKEND = "/v1/api/createkhoa_vien";
  const data = {
    tenkv: tenkv,
    diaChi: diaChi,
  };
  return axios.post(URL_BACKEND, data);
};

const fetchAllKhoaVien = (current, pageSize) => {
  const URL_BACKEND = `/v1/api/all?current=${current}&pageSize=${pageSize}`;
  return axios.get(URL_BACKEND);
};

const updateKhoaVien = (makv, tenkv, dtkv, diaChi) => {
  const URL_BACKEND = "/v1/api/updatekhoa_vien";
  const data = {
    makv: makv,
    tenkv: tenkv,
    dtkv: dtkv,
    diaChi: diaChi,
  };
  return axios.put(URL_BACKEND, data);
};

const deleteKhoaVien = (makv) => {
  const URL_BACKEND = `/v1/api/deletekhoa_vien/${makv}`;
  return axios.delete(URL_BACKEND);
};

// ------------------------------------------------ API CLASS ------------------------------------------------

const createClass = (tenlop, siso, makv) => {
  const URL_BACKEND = `/v1/api/createclass`;
  const data = {
    tenlop: tenlop,
    siso: siso,
    makv: makv,
  };
  return axios.post(URL_BACKEND, data);
};

const fetchAllClass = (current, pageSize) => {
  const URL_BACKEND = `/v1/api/allclass?current=${current}&pageSize=${pageSize}`;
  return axios.get(URL_BACKEND);
};

const updateClass = (malop, tenlop, siso, makv) => {
  const URL_BACKEND = "/v1/api/updateclass";
  const data = {
    malop: malop,
    tenlop: tenlop,
    siso: siso,
    makv: makv,
  };
  return axios.put(URL_BACKEND, data);
};

const deleteClass = (malop) => {
  const URL_BACKEND = `/v1/api/deleteclass/${malop}`;
  return axios.delete(URL_BACKEND);
};

// ------------------------------------------------ API STUDENT ------------------------------------------------

const createStudent = (malop, holot, ten, ntns, phai, emailSV, image) => {
  const URL_BACKEND = `/v1/api/createstudent`;
  const data = {
    malop: malop,
    holot: holot,
    ten: ten,
    ntns: ntns,
    phai: phai,
    emailSV: emailSV,
    image: image,
  };
  return axios.post(URL_BACKEND, data);
};

const fetchAllStudent = (current, pageSize) => {
  const URL_BACKEND = `/v1/api/allstudents?current=${current}&pageSize=${pageSize}`;
  return axios.get(URL_BACKEND);
};

const updateStudent = (
  mssv,
  malop,
  holot,
  ten,
  ntns,
  phai,
  dt_sv,
  emailSV,
  faceID
) => {
  const URL_BACKEND = "/v1/api/updatestudent";
  const data = {
    mssv: mssv,
    malop: malop,
    holot: holot,
    ten: ten,
    ntns: ntns,
    phai: phai,
    dt_sv: dt_sv,
    emailSV: emailSV,
    image: faceID,
  };
  return axios.put(URL_BACKEND, data);
};

const deleteStudent = (mssv) => {
  const URL_BACKEND = `/v1/api/deletestudent/${mssv}`;
  return axios.delete(URL_BACKEND);
};

const handleUploadFile = async (file, folder) => {
  const URL_BACKEND = `/v1/api/upload`;
  let config = {
    headers: {
      "upload-type": folder,
      "Content-Type": "multipart/form-data",
    },
  };

  const bodyFormData = new FormData();
  bodyFormData.append("image", file);
  return axios.post(URL_BACKEND, bodyFormData, config);
};

// ------------------------------------------------ API SUBJECT ------------------------------------------------
const createSubject = (tenmh, tclt, tcth) => {
  const URL_BACKEND = `/v1/api/createmonhoc`;
  const data = {
    tenmh: tenmh,
    tclt: tclt,
    tcth: tcth,
  };
  return axios.post(URL_BACKEND, data);
};

const fetchAllSubjects = (current, pageSize) => {
  const URL_BACKEND = `/v1/api/allmonhoc?current=${current}&pageSize=${pageSize}`;
  return axios.get(URL_BACKEND);
};

const updateSubject = (mamh, tenmh, tclt, tcth) => {
  const URL_BACKEND = "/v1/api/updatemonhoc";
  const data = {
    mamh: mamh,
    tenmh: tenmh,
    tclt: tclt,
    tcth: tcth,
  };
  return axios.put(URL_BACKEND, data);
};

const deleteSubject = (mamh) => {
  const URL_BACKEND = `/v1/api/deletemonhoc/${mamh}`;
  return axios.delete(URL_BACKEND);
};

// ------------------------------------------------ API TEACHER ------------------------------------------------
const createTeacher = (hoGV, tenGV, dt_gv, donVi) => {
  const URL_BACKEND = `/v1/api/createteacher`;
  const data = {
    hoGV: hoGV,
    tenGV: tenGV,
    dt_gv: dt_gv,
    donVi: donVi,
  };
  return axios.post(URL_BACKEND, data);
};

const fetchAllTeachers = (current, pageSize) => {
  const URL_BACKEND = `/v1/api/allteachers?current=${current}&pageSize=${pageSize}`;
  return axios.get(URL_BACKEND);
};

const updateTeacher = (mgv, hoGV, tenGV, dt_gv, donVi) => {
  const URL_BACKEND = "/v1/api/updateteacher";
  const data = {
    mgv: mgv,
    hoGV: hoGV,
    tenGV: tenGV,
    dt_gv: dt_gv,
    donVi: donVi,
  };
  return axios.put(URL_BACKEND, data);
};

const deleteTeacher = (mgv) => {
  const URL_BACKEND = `/v1/api/deleteteacher/${mgv}`;
  return axios.delete(URL_BACKEND);
};

// ------------------------------------------------ API LOGIN ------------------------------------------------
const login = (username, password) => {
  const URL_BACKEND = "/v1/api/login";
  const data = {
    username: username,
    password: password,
  };
  return axios.post(URL_BACKEND, data);
};

const getAccountAPI = () => {
  const URL_BACKEND = "/v1/api/verify-token";
  return axios.get(URL_BACKEND);
};

// ------------------------------------------------ lấy tkb theo tài khoản sinh viên ------------------------------------------------
const getTimetableByAccount = () => {
  const URL_BACKEND = `/v1/api/lich-hoc-ca-nhan`;
  return axios.get(URL_BACKEND);
};

// ------------------------------------------------ API ĐIỂM DANH ------------------------------------------------
const submitAttendanceAPI = (tkbId, mssv) => {
  const URL_BACKEND = "/v1/api/diemdanh/faceid";
  const data = {
    mssv: mssv,
    tkbId: tkbId,
  };
  return axios.post(URL_BACKEND, data);
};

// ------------------------------------------------ lấy thông tin sinh viên theo mã ------------------------------------------------
const getStudentById = (mssv) => {
  const URL_BACKEND = `/v1/api/student/${mssv}`;
  return axios.get(URL_BACKEND);
};

// ------------------------------------------------ API phòng học ------------------------------------------------
const createRoom = (tenPhong, sucChua, coSo) => {
  const URL_BACKEND = `/v1/api/createroom`;
  const data = {
    tenPhong: tenPhong,
    sucChua: sucChua,
    coSo: coSo,
  };
  return axios.post(URL_BACKEND, data);
};

const fetchAllRooms = (current, pageSize) => {
  const URL_BACKEND = `/v1/api/allrooms?current=${current}&pageSize=${pageSize}`;
  return axios.get(URL_BACKEND);
};

const updateRoom = (sop, tenPhong, sucChua, coSo) => {
  const URL_BACKEND = "/v1/api/updateroom";
  const data = {
    sop: sop,
    tenPhong: tenPhong,
    sucChua: sucChua,
    coSo: coSo,
  };
  return axios.put(URL_BACKEND, data);
};

const deleteRoom = (sop) => {
  const URL_BACKEND = `/v1/api/deleteroom/${sop}`;
  return axios.delete(URL_BACKEND);
};

// ------------------------------------------------ API Lấy lịch dạy học của giảng viên ------------------------------------------------
const getTimetableByTeacher = () => {
  const URL_BACKEND = `/v1/api/lich-day-ca-nhan`;
  return axios.get(URL_BACKEND);
};

// API cập nhật điểm danh bởi giảng viên
const updateAttendanceByTeacher = (mssv, tkbId, attendanceData) => {
  return axios.put(`${import.meta.env.VITE_BACKEND_URL}/v1/api/teacher/update-attendance`, {
    mssv,
    tkbId,
    ...attendanceData
  });
};

export const openAttendanceByTeacher = (tkbId) => {
  return axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/v1/api/teacher/open-attendance`,
    { tkbId }
  );
}

export const closeAttendanceByTeacher = (tkbId) => {
  return axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/v1/api/teacher/close-attendance`,
    { tkbId }
  );
}

export {
  fetchAllKhoaVien,
  createKhoaVien,
  updateKhoaVien,
  deleteKhoaVien,
  createClass,
  fetchAllClass,
  updateClass,
  deleteClass,
  createStudent,
  fetchAllStudent,
  updateStudent,
  deleteStudent,
  handleUploadFile,
  createSubject,
  fetchAllSubjects,
  updateSubject,
  deleteSubject,
  createTeacher,
  fetchAllTeachers,
  updateTeacher,
  deleteTeacher,
  login,
  getAccountAPI,
  getTimetableByAccount,
  submitAttendanceAPI,
  getStudentById,
  createRoom,
  fetchAllRooms,
  updateRoom,
  deleteRoom,
  getTimetableByTeacher,
  updateAttendanceByTeacher,
};
