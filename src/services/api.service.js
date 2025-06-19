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
};
