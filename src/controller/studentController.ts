import { Request, Response } from 'express';
import {
    createStudent,
    getAllStudents,
    updateStudent,
    deleteStudent,
    importStudentsFromExcel,
} from 'services/studentService';
import { fileUploadMiddleware } from '../Middleware/multer';
import { prisma } from 'config/client';
import { excelUploadMiddleware } from '../Middleware/multer';

interface IStudent {
    malop: string;
    holot: string;
    ten: string;
    ntns: Date;
    phai: string;
    dt_sv?: string;
    emailSV?: string;
    faceID?: string;
}
const VN_PHONE_PREFIXES = [
    '086',
    '096',
    '097',
    '098', // Viettel
    '032',
    '033',
    '034',
    '035',
    '036',
    '037',
    '038',
    '039', // Viettel
    '088',
    '091',
    '094', // Vinaphone
    '081',
    '082',
    '083',
    '084',
    '085', // Vinaphone
    '089',
    '090',
    '093', // Mobifone
    '070',
    '079',
    '077',
    '076',
    '078', // Mobifone
];

const generateVNPhoneNumber = (): string => {
    // Chọn ngẫu nhiên đầu số từ danh sách
    const prefix = VN_PHONE_PREFIXES[Math.floor(Math.random() * VN_PHONE_PREFIXES.length)];

    // Thêm 7 số ngẫu nhiên để đủ 10 số
    let remainingDigits = '';
    for (let i = 0; i < 7; i++) {
        remainingDigits += Math.floor(Math.random() * 10);
    }

    return prefix + remainingDigits;
};

const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export const createStudentController = async (req: Request, res: Response) => {
    const upload = fileUploadMiddleware('image', 'student');

    upload(req, res, async (err: any) => {
        if (err) {
            return res.status(400).json({
                errorCode: 1,
                message: err.message,
            });
        }

        try {
            const { malop, holot, ten, ntns, phai, dt_sv, emailSV, image } = req.body;
            console.log('Received data:', req.body);
            if (!malop || !holot || !ten || !ntns || !phai) {
                return res.status(400).json({
                    errorCode: 1,
                    message: 'Vui lòng điền đầy đủ thông tin',
                });
            }

            let inputDate: Date;
            try {
                // Hỗ trợ cả 2 format DD/MM/YYYY và YYYY-MM-DD
                const dateParts = ntns.includes('/') ? ntns.split('/') : null;
                if (dateParts) {
                    const [day, month, year] = dateParts;
                    inputDate = new Date(`${year}-${month}-${day}`);
                } else {
                    inputDate = new Date(ntns);
                }

                if (isNaN(inputDate.getTime())) {
                    return res.status(400).json({
                        errorCode: 1,
                        message: 'Ngày tháng năm không hợp lệ',
                    });
                }
            } catch (error) {
                return res.status(400).json({
                    errorCode: 1,
                    message: 'Định dạng ngày tháng không hợp lệ (DD/MM/YYYY hoặc YYYY-MM-DD)',
                });
            }

            // Validate gender
            if (!['Nam', 'Nữ'].includes(phai)) {
                return res.status(400).json({
                    errorCode: 1,
                    message: 'Giới tính không hợp lệ (Nam/Nữ)',
                });
            }

            const phoneNumber = dt_sv || generateVNPhoneNumber();

            let faceIDUrl = image || null;
            if (req.file && req.file.filename) {
                faceIDUrl = req.file.filename;
            }
            if (!faceIDUrl) {
                return res.status(400).json({
                    errorCode: 1,
                    message: 'Image is required!',
                });
            }

            const svData = {
                malop,
                holot,
                ten,
                ntns: inputDate,
                phai,
                dt_sv: phoneNumber,
                emailSV,
                faceID: faceIDUrl,
            };

            const newStudent = await createStudent(svData);

            return res.status(201).json({
                message: 'Tạo sinh viên thành công',
                data: {
                    ...newStudent,
                    ntns: formatDate(new Date(newStudent.ntns)),
                },
            });
        } catch (error: any) {
            if (error.message === 'Lớp không tồn tại') {
                return res.status(404).json({
                    errorCode: 1,
                    message: 'Lớp không tồn tại trong hệ thống',
                });
            }
            return res.status(500).json({
                message: 'Internal server error',
            });
        }
    });
};

export const getAllStudentsController = async (req: Request, res: Response) => {
    try {
        const page = +(req.query.current || 1);
        const pageSize = +(req.query.pageSize || 1000);
        const { result: students, total } = await getAllStudents(page, pageSize);

        const formattedStudents = (students as IStudent[]).map((student) => ({
            ...student,
            ntns: formatDate(new Date(student.ntns)), // Chuyển sang DD/MM/YYYY
        }));

        const pages = Math.ceil(total / pageSize);

        res.status(200).json({
            message: 'Lấy danh sách sinh viên thành công',
            data: {
                meta: {
                    current: page,
                    pageSize,
                    pages,
                    total,
                    count: formattedStudents.length,
                },
                students: formattedStudents,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
        });
    }
};

export const updateStudentController = async (req: Request, res: Response) => {
    const upload = fileUploadMiddleware('image', 'student');

    upload(req, res, async (err: any) => {
        if (err) {
            return res.status(400).json({
                errorCode: 1,
                message: err.message,
            });
        }

        try {
            const { mssv, malop, holot, ten, ntns, phai, dt_sv, emailSV, image } = req.body;
            if (!mssv) {
                return res.status(400).json({
                    errorCode: 1,
                    message: 'Vui lòng cung cấp mã số sinh viên',
                });
            }

            let birthDate: Date | null = null;
            if (ntns) {
                try {
                    const dateParts = ntns.includes('/') ? ntns.split('/') : null;
                    if (dateParts) {
                        const [day, month, year] = dateParts;
                        birthDate = new Date(`${year}-${month}-${day}`);
                    } else {
                        birthDate = new Date(ntns);
                    }

                    if (isNaN(birthDate.getTime())) {
                        return res.status(400).json({
                            errorCode: 1,
                            message: 'Ngày tháng năm sinh không hợp lệ',
                        });
                    }
                } catch (error) {
                    return res.status(400).json({
                        errorCode: 1,
                        message: 'Định dạng ngày tháng không hợp lệ (DD/MM/YYYY hoặc YYYY-MM-DD)',
                    });
                }
            }

            // Validate gender if provided
            if (phai && !['Nam', 'Nữ'].includes(phai)) {
                return res.status(400).json({
                    errorCode: 1,
                    message: 'Giới tính không hợp lệ (Nam/Nữ)',
                });
            }

            let faceIDUrl: string | undefined = image;
            if (req.file && req.file.filename) {
                faceIDUrl = req.file.filename;
            }

            // build object update, chỉ include các field thực sự có value
            const updateData: Partial<IStudent> = {
                malop,
                holot,
                ten,
                phai,
                dt_sv,
                emailSV,
            };
            if (birthDate !== null) updateData.ntns = birthDate;
            if (faceIDUrl) updateData.faceID = faceIDUrl;

            const updatedStudent = await updateStudent(mssv, updateData);

            return res.status(200).json({
                message: 'Cập nhật sinh viên thành công',
                data: {
                    ...updatedStudent,
                    ntns: formatDate(new Date(updatedStudent.ntns)),
                },
            });
        } catch (error: any) {
            console.error('Error updating student:', error);
            if (error.message === 'Sinh viên không tồn tại') {
                return res.status(404).json({
                    errorCode: 1,
                    message: 'Sinh viên không tồn tại trong hệ thống',
                });
            }
            if (error.message === 'Lớp không tồn tại') {
                return res.status(404).json({
                    errorCode: 1,
                    message: 'Lớp không tồn tại trong hệ thống',
                });
            }
            return res.status(500).json({
                message: 'Internal server error',
            });
        }
    });
};

export const deleteStudentController = async (req: Request, res: Response) => {
    try {
        const { mssv } = req.params;

        if (!mssv) {
            res.status(400).json({
                errorCode: 1,
                message: 'Vui lòng cung cấp mã số sinh viên',
            });
        }

        //xóa sinh viên
        const deletedStudent = await deleteStudent(mssv);
        res.status(200).json({
            message: 'Xóa sinh viên thành công',
            data: deletedStudent,
        });
    } catch (error: any) {
        console.error('Error deleting student:', error);
        if (error.message === 'Sinh viên không tồn tại') {
            res.status(404).json({
                errorCode: 1,
                message: 'Sinh viên không tồn tại trong hệ thống',
            });
        }
        res.status(500).json({
            message: 'Internal server error',
        });
    }
};

export const getStudentByMSSV = async (req: Request, res: Response) => {
    const { mssv } = req.params;
    try {
        const student = await prisma.sV.findUnique({ where: { mssv } });
        if (!student) {
            res.status(404).json({ message: 'Không tìm thấy sinh viên' });
            return;
        }
        res.json({ data: student });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const importStudentsController = async (req: Request, res: Response) => {
    const upload = excelUploadMiddleware('excel');

    upload(req, res, async (err: any) => {
        try {
            if (err) {
                return res.status(400).json({
                    errorCode: 1,
                    message: err.message,
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    errorCode: 1,
                    message: 'Vui lòng chọn file Excel',
                });
            }

            const result = await importStudentsFromExcel(req.file);

            return res.status(200).json({
                errorCode: result.failed > 0 ? 1 : 0,
                message:
                    `Import thành công ${result.imported} sinh viên` +
                    (result.failed > 0 ? `, ${result.failed} bản ghi lỗi` : ''),
                data: {
                    imported: result.imported,
                    failed: result.failed,
                    results: result.results,
                    errors: result.errors,
                },
            });
        } catch (error: any) {
            return res.status(500).json({
                errorCode: 1,
                message: error.message,
            });
        }
    });
};
