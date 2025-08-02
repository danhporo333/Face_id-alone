import express, { Router } from 'express';
import { auth, checkRole } from '../Middleware/auth';
import { fileUploadMiddleware } from '../Middleware/multer';

import {
    register,
    login,
    getAllUsersController,
    deleteUserController,
    updateUserController,
} from 'controller/userController';

import { uploadFile, uploadMultipleFiles } from 'controller/fileController';
import {
    createKhoaVienController,
    getAllKhoaVienController,
    updateKhoaVienController,
    deleteKhoaVienController,
    importKhoaVienController,
} from 'controller/khoa_vien_Controller';
import {
    createClassController,
    getAllClassController,
    updateClassController,
    deleteClassController,
    importClassesFromExcelController,
} from 'controller/classController';
import {
    createStudentController,
    getAllStudentsController,
    updateStudentController,
    deleteStudentController,
    getStudentByMSSV,
    importStudentsController,
} from 'controller/studentController';
import {
    createMonHocController,
    getAllMonHocController,
    updateMonHocController,
    deleteMonHocController,
    importSubjectsFromExcelController,
} from 'controller/monhocController';
import {
    createTeacherController,
    getAllTeachersController,
    updateTeacherController,
    deleteTeacherController,
    updateAttendanceByTeacherController,
    openAttendanceController,
    closeAttendanceController,
    importTeachersFromExcelController,
} from 'controller/teacherController';
import {
    createRoomController,
    getAllRoomsController,
    updateRoomController,
    deleteRoomController,
} from 'controller/RoomController';

import {
    createTKBController,
    getAllTKBController,
    updateTKBController,
    deleteTKBController,
    getTKBByStudentController,
    ganSinhVienVaoTKBController,
    ganLopVaoTKBController,
    getLichHocCaNhanController, // cho sinh viên
    getLichDayCaNhanController, // cho giáo viên
    importTKBController,
} from 'controller/tkbController';
import { diemDanhFaceID } from 'controller/diemdanhController';
import { verifyTokenController } from 'controller/authController';

const router: Router = express.Router();

//api user
router.post('/register', auth, checkRole(['ADMIN']), register);
router.put('/updateuser', auth, checkRole(['ADMIN']), updateUserController);
router.post('/login', login);
router.get('/verify-token', verifyTokenController);
router.get('/allusers', auth, checkRole(['ADMIN']), getAllUsersController);
router.delete('/deleteuser/:id', auth, checkRole(['ADMIN']), deleteUserController);

//api upload file
router.post('/upload', uploadFile);
router.post('/upload-multiple', uploadMultipleFiles);

//api khoa vien
router.post('/createkhoa_vien', auth, checkRole(['ADMIN']), createKhoaVienController);
router.get('/all', auth, checkRole(['ADMIN']), getAllKhoaVienController);
router.put('/updatekhoa_vien', auth, checkRole(['ADMIN']), updateKhoaVienController);
router.delete('/deletekhoa_vien/:makv', auth, checkRole(['ADMIN']), deleteKhoaVienController);
router.post('/import-khoa-vien', auth, checkRole(['ADMIN']), importKhoaVienController);

//api class
router.post('/createclass', auth, checkRole(['ADMIN']), createClassController);
router.get('/allclass', auth, checkRole(['ADMIN']), getAllClassController);
router.put('/updateclass', auth, checkRole(['ADMIN']), updateClassController);
router.delete('/deleteclass/:malop', auth, checkRole(['ADMIN']), deleteClassController);
router.post('/import-classes', auth, checkRole(['ADMIN']), importClassesFromExcelController);

//api student
router.post('/createstudent', auth, checkRole(['ADMIN']), createStudentController);
router.get('/allstudents', auth, checkRole(['ADMIN']), getAllStudentsController);
router.put('/updatestudent', auth, checkRole(['ADMIN']), updateStudentController);
router.delete('/deletestudent/:mssv', auth, checkRole(['ADMIN']), deleteStudentController);
router.get('/student/:mssv', auth, checkRole(['ADMIN', 'STUDENT']), getStudentByMSSV);

router.post('/import-students', auth, checkRole(['ADMIN']), importStudentsController);

//api mon hoc
router.post('/createmonhoc', auth, checkRole(['ADMIN']), createMonHocController);
router.get('/allmonhoc', auth, checkRole(['ADMIN']), getAllMonHocController);
router.put('/updatemonhoc', auth, checkRole(['ADMIN']), updateMonHocController);
router.delete('/deletemonhoc/:mamh', auth, checkRole(['ADMIN']), deleteMonHocController);
router.post('/import-subjects', auth, checkRole(['ADMIN']), importSubjectsFromExcelController);

//api teacher
router.post('/createteacher', auth, checkRole(['ADMIN']), createTeacherController);
router.get('/allteachers', auth, checkRole(['ADMIN']), getAllTeachersController);
router.put('/updateteacher', auth, checkRole(['ADMIN']), updateTeacherController);
router.delete('/deleteteacher/:mgv', auth, checkRole(['ADMIN']), deleteTeacherController);
router.put('/teacher/update-attendance', auth, checkRole(['TEACHER']), updateAttendanceByTeacherController);
router.post('/teacher/open-attendance', auth, checkRole(['TEACHER']), openAttendanceController);
router.post('/teacher/close-attendance', auth, checkRole(['TEACHER']), closeAttendanceController);
router.post('/import-teachers', auth, checkRole(['ADMIN']), importTeachersFromExcelController);

router.get('/lich-day-ca-nhan', auth, checkRole(['TEACHER']), getLichDayCaNhanController);

//api room
router.post('/createroom', auth, checkRole(['ADMIN']), createRoomController);
router.get('/allrooms', auth, checkRole(['ADMIN']), getAllRoomsController);
router.put('/updateroom', auth, checkRole(['ADMIN']), updateRoomController);
router.delete('/deleteroom/:sop', auth, checkRole(['ADMIN']), deleteRoomController);

//api tkb
router.post('/createtkb', auth, checkRole(['ADMIN']), createTKBController);
router.get('/alltkb', auth, checkRole(['ADMIN']), getAllTKBController);
router.put('/updatetkb', auth, checkRole(['ADMIN']), updateTKBController);
router.delete('/deletetkb/:id', auth, checkRole(['ADMIN']), deleteTKBController);

// cho sinh viên
router.get('/tkb/student/:mssv', auth, checkRole(['STUDENT']), getTKBByStudentController);
router.post('/tkb/gan-sinh-vien', auth, checkRole(['ADMIN']), ganSinhVienVaoTKBController);
router.post('/tkb/gan-lop', ganLopVaoTKBController);
router.get('/lich-hoc-ca-nhan', auth, checkRole(['STUDENT']), getLichHocCaNhanController);
router.post('/import-tkb', auth, checkRole(['ADMIN']), importTKBController);

// cho giáo viên

//api diem danh
router.post('/diemdanh/faceid', diemDanhFaceID);

export default router;
