import { Request, Response } from 'express';
import {
    createTKB,
    getAllTKB,
    updateTKB,
    deleteTKB,
    getTKBByStudentId,
    ganSinhVienVaoTKB,
    ganLopVaoTKB,
    getTKBByUserId,
    getTKBByTeacherUserId,
    importTKBFromExcel,
} from 'services/tkbService';
import { excelUploadMiddleware } from 'Middleware/multer';

interface ITKB {
    thu: string;
    ngay: Date;
    tietBD: number;
    tietKT: number;
    mamh: string;
    mgv: string;
    sop: string;
}

const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export const createTKBController = async (req: Request, res: Response) => {
    try {
        const { thu, ngay, tietBD, tietKT, mamh, mgv, sop } = req.body;

        // Validate required fields
        if (!thu || !ngay || !tietBD || !tietKT || !mamh || !mgv || !sop) {
            res.status(400).json({
                errorCode: 1,
                message: 'Vui lòng điền đầy đủ thông tin',
            });
            return;
        }

        // Validate và chuyển đổi ngày tháng
        let inputDate: Date;
        try {
            // Hỗ trợ cả 2 format DD/MM/YYYY và YYYY-MM-DD
            const dateParts = ngay.includes('/') ? ngay.split('/') : null;
            if (dateParts) {
                const [day, month, year] = dateParts;
                inputDate = new Date(`${year}-${month}-${day}`);
            } else {
                inputDate = new Date(ngay);
            }

            if (isNaN(inputDate.getTime())) {
                res.status(400).json({
                    errorCode: 1,
                    message: 'Ngày tháng năm không hợp lệ',
                });
                return;
            }
        } catch (error) {
            res.status(400).json({
                errorCode: 1,
                message: 'Định dạng ngày tháng không hợp lệ (DD/MM/YYYY hoặc YYYY-MM-DD)',
            });
            return;
        }

        // Kiểm tra ngày không được là ngày trong quá khứ
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (inputDate < today) {
            res.status(400).json({
                errorCode: 1,
                message: 'Không thể tạo lịch học cho ngày trong quá khứ',
            });
            return;
        }

        // Validate tiết học
        if (tietBD < 1 || tietBD > 15 || tietKT < 1 || tietKT > 15 || tietBD > tietKT) {
            res.status(400).json({
                errorCode: 1,
                message: 'Tiết học không hợp lệ',
            });
            return;
        }

        // Validate thứ
        if (!['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].includes(thu)) {
            res.status(400).json({
                errorCode: 1,
                message: 'Thứ không hợp lệ',
            });
            return;
        }

        // Validate thứ và kiểm tra khớp với ngày
        const weekDays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        const dayOfWeek = weekDays[inputDate.getDay()];
        if (thu !== dayOfWeek) {
            res.status(400).json({
                errorCode: 1,
                message: 'Thứ không khớp với ngày tháng năm đã chọn',
            });
            return;
        }

        // Format lại ngày tháng để lưu vào database
        const formattedDate = new Date(ngay);
        formattedDate.setHours(0, 0, 0, 0);

        const newTKB = await createTKB({
            thu,
            ngay: inputDate,
            tietBD: parseInt(tietBD),
            tietKT: parseInt(tietKT),
            mamh,
            mgv,
            sop,
        });

        // Format ngày trong response về dạng DD/MM/YYYY
        const responseData = {
            ...newTKB,
            ngay: formatDate(new Date(newTKB.ngay)),
        };

        res.status(201).json({
            errorCode: 0,
            message: 'Tạo thời khóa biểu thành công',
            data: responseData,
        });
        return;
    } catch (error: any) {
        if (
            error.message === 'Môn học không tồn tại' ||
            error.message === 'Giảng viên không tồn tại' ||
            error.message === 'Phòng học không tồn tại' ||
            error.message === 'Thời gian này đã có lịch học'
        ) {
            res.status(400).json({
                errorCode: 1,
                message: error.message,
            });
            return;
        }
        res.status(500).json({
            errorCode: 1,
            message: 'Internal server error',
        });
        return;
    }
};

export const getAllTKBController = async (req: Request, res: Response) => {
    try {
        const page = +(req.query.current || 1);
        const pageSize = +(req.query.pageSize || 5);
        const { result: tkbs, total } = await getAllTKB(page, pageSize);
        const pages = Math.ceil(total / pageSize);
        const formattedTkbs = (tkbs as ITKB[]).map((tkb) => ({
            ...tkb,
            ngay: formatDate(new Date(tkb.ngay)),
        }));

        res.status(200).json({
            errorCode: 0,
            message: 'Lấy danh sách thời khóa biểu thành công',
            data: {
                meta: {
                    current: page,
                    pageSize: pageSize,
                    pages: pages,
                    total: total,
                    tkbcount: formattedTkbs.length,
                },
                tkbs: formattedTkbs,
            },
        });
    } catch (error) {
        res.status(500).json({
            errorCode: 1,
            message: 'Internal server error',
        });
    }
};

export const updateTKBController = async (req: Request, res: Response) => {
    try {
        const { id, thu, ngay, tietBD, tietKT, mamh, mgv, sop } = req.body;

        if (!id) {
            res.status(400).json({
                errorCode: 1,
                message: 'Vui lòng cung cấp ID thời khóa biểu',
            });
            return;
        }

        let inputDate: Date | undefined;
        if (ngay) {
            try {
                const dateParts = ngay.includes('/') ? ngay.split('/') : null;
                if (dateParts) {
                    const [day, month, year] = dateParts;
                    inputDate = new Date(`${year}-${month}-${day}`);
                } else {
                    inputDate = new Date(ngay);
                }

                if (isNaN(inputDate.getTime())) {
                    res.status(400).json({
                        errorCode: 1,
                        message: 'Ngày tháng năm không hợp lệ',
                    });
                    return;
                }
            } catch (error) {
                res.status(400).json({
                    errorCode: 1,
                    message: 'Định dạng ngày tháng không hợp lệ',
                });
                return;
            }
        }

        const updatedTKB = await updateTKB(id, {
            thu,
            ngay: inputDate,
            tietBD: tietBD ? parseInt(tietBD) : undefined,
            tietKT: tietKT ? parseInt(tietKT) : undefined,
            mamh,
            mgv,
            sop,
        });

        // Format ngày trong response về dạng DD/MM/YYYY
        const responseData = {
            ...updatedTKB,
            ngay: formatDate(new Date(updatedTKB.ngay)),
        };

        res.status(200).json({
            errorCode: 0,
            message: 'Cập nhật thời khóa biểu thành công',
            data: responseData,
        });
    } catch (error: any) {
        if (
            error.message === 'Thời khóa biểu không tồn tại' ||
            error.message === 'Môn học không tồn tại' ||
            error.message === 'Giảng viên không tồn tại' ||
            error.message === 'Phòng học không tồn tại' ||
            error.message === 'Thời gian này đã có lịch học'
        ) {
            res.status(400).json({
                errorCode: 1,
                message: error.message,
            });
            return;
        }
        res.status(500).json({
            errorCode: 1,
            message: 'Lỗi hệ thống',
        });
        return;
    }
};

export const deleteTKBController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                errorCode: 1,
                message: 'Vui lòng cung cấp ID thời khóa biểu',
            });
        }

        const deletedTKB = await deleteTKB(id);

        res.status(200).json({
            errorCode: 0,
            message: 'Xóa thời khóa biểu thành công',
            data: deletedTKB,
        });
        return;
    } catch (error: any) {
        if (error.message === 'Thời khóa biểu không tồn tại') {
            res.status(404).json({
                errorCode: 1,
                message: error.message,
            });
            return;
        }
        res.status(500).json({
            errorCode: 1,
            message: 'Internal server error',
        });
        return;
    }
};

export const getTKBByStudentController = async (req: Request, res: Response) => {
    try {
        const { mssv } = req.params;

        if (!mssv) {
            res.status(400).json({
                errorCode: 1,
                message: 'Vui lòng cung cấp mã số sinh viên',
            });
        }

        const result = await getTKBByStudentId(mssv);

        // Format ngày tháng để dễ đọc
        const formattedTkbs = result.tkbs.map((tkb) => ({
            ...tkb,
            ngay: formatDate(new Date(tkb.ngay)),
        }));

        res.status(200).json({
            errorCode: 0,
            message: 'Lấy thời khóa biểu sinh viên thành công',
            data: {
                student: result.student,
                tkbs: formattedTkbs,
            },
        });
    } catch (error: any) {
        if (error.message === 'Sinh viên không tồn tại') {
            res.status(404).json({
                errorCode: 1,
                message: 'Sinh viên không tồn tại trong hệ thống',
            });
        }

        console.error('Lỗi khi lấy thời khóa biểu sinh viên:', error);
        res.status(500).json({
            errorCode: 1,
            message: 'Lỗi máy chủ nội bộ',
        });
    }
};

export const ganSinhVienVaoTKBController = async (req: Request, res: Response) => {
    try {
        const { mssv, tkbId } = req.body;
        console.log('Gán sinh viên vào TKB:', req.body);

        if (!mssv || !tkbId) {
            res.status(400).json({
                errorCode: 1,
                message: 'Vui lòng cung cấp mã số sinh viên và mã thời khóa biểu',
            });
        }

        const ketQua = await ganSinhVienVaoTKB(mssv, tkbId);

        res.status(200).json({
            errorCode: 0,
            message: 'Gán sinh viên vào thời khóa biểu thành công',
            data: ketQua,
        });
        return;
    } catch (error: any) {
        if (
            error.message === 'Sinh viên không tồn tại' ||
            error.message === 'Thời khóa biểu không tồn tại' ||
            error.message === 'Sinh viên đã được gán vào thời khóa biểu này'
        ) {
            res.status(400).json({
                errorCode: 1,
                message: error.message,
            });
        }

        console.error('Lỗi khi gán sinh viên vào TKB:', error);
        res.status(500).json({
            errorCode: 1,
            message: 'Lỗi máy chủ nội bộ',
        });
    }
};

export const ganLopVaoTKBController = async (req: Request, res: Response) => {
    try {
        const { malop, tkbId } = req.body;

        if (!malop || !tkbId) {
            res.status(400).json({
                errorCode: 1,
                message: 'Vui lòng cung cấp mã lớp và mã thời khóa biểu',
            });
        }

        const ketQua = await ganLopVaoTKB(malop, tkbId);

        res.status(200).json({
            errorCode: 0,
            message: 'Gán lớp vào thời khóa biểu thành công',
            data: ketQua,
        });
    } catch (error: any) {
        if (
            error.message === 'Lớp không tồn tại' ||
            error.message === 'Thời khóa biểu không tồn tại' ||
            error.message === 'Lớp không có sinh viên nào'
        ) {
            res.status(400).json({
                errorCode: 1,
                message: error.message,
            });
        }

        console.error('Lỗi khi gán lớp vào TKB:', error);
        res.status(500).json({
            errorCode: 1,
            message: 'Lỗi máy chủ nội bộ',
        });
    }
};

export const getLichHocCaNhanController = async (req: Request, res: Response) => {
    try {
        // Lấy ID người dùng từ JWT token (đã được xác thực qua middleware auth)
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                errorCode: 1,
                message: 'Không có quyền truy cập',
            });
        }

        const result = await getTKBByUserId(userId);

        // Format ngày tháng để dễ đọc
        const formattedTkbs = result.tkbs.map((tkb) => ({
            ...tkb,
            ngay: formatDate(new Date(tkb.ngay)),
        }));

        res.status(200).json({
            errorCode: 0,
            message: 'Lấy thời khóa biểu cá nhân thành công',
            data: {
                sinhVien: result.student,
                tkbs: formattedTkbs,
            },
        });
    } catch (error: any) {
        if (
            error.message === 'Không tìm thấy người dùng' ||
            error.message === 'Người dùng không phải là sinh viên' ||
            error.message === 'Sinh viên không tồn tại'
        ) {
            res.status(404).json({
                errorCode: 1,
                message: error.message,
            });
        }

        console.error('Lỗi khi lấy thời khóa biểu sinh viên:', error);
        res.status(500).json({
            errorCode: 1,
            message: 'Lỗi máy chủ nội bộ',
        });
    }
};

export const getLichDayCaNhanController = async (req: Request, res: Response) => {
    try {
        // Lấy ID người dùng từ JWT token (đã được xác thực qua middleware auth)
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                errorCode: 1,
                message: 'Không có quyền truy cập',
            });
            return;
        }

        const result = await getTKBByTeacherUserId(userId);

        // Format ngày tháng để dễ đọc
        const formattedTkbs = result.tkbs.map((tkb) => ({
            ...tkb,
            ngay: formatDate(new Date(tkb.ngay)),
            lopHoc: tkb.diemDanh
                .map((dd) => dd.sinhVien.lop?.tenlop)
                .filter((lop, index, arr) => arr.indexOf(lop) === index), // Lấy danh sách lớp không trùng lặp
            soSinhVien: tkb.diemDanh.length,
            danhSachSinhVien: tkb.diemDanh.map((dd) => ({
                mssv: dd.sinhVien.mssv,
                holot: dd.sinhVien.holot,
                ten: dd.sinhVien.ten,
                hoTen: `${dd.sinhVien.holot} ${dd.sinhVien.ten}`,
                lop: dd.sinhVien.lop?.tenlop || 'N/A',
                email: dd.sinhVien.emailSV,
                dienThoai: dd.sinhVien.dt_sv,
                faceID: dd.sinhVien.faceID,
                trangThaiDiemDanh: {
                    coMat: dd.coMat,
                    diTre: dd.diTre,
                    lyDoKhac: dd.lyDoKhac,
                },
                isOpenAttendance: tkb.isOpenAttendance, // Trạng thái mở điểm danh
            })),
        }));
        res.status(200).json({
            errorCode: 0,
            message: 'Lấy thời khóa biểu giảng viên thành công',
            data: {
                giangVien: result.teacher,
                tkbs: formattedTkbs,
            },
        });
    } catch (error: any) {
        if (
            error.message === 'Không tìm thấy người dùng' ||
            error.message === 'Người dùng không phải là giảng viên' ||
            error.message === 'Giảng viên không tồn tại'
        ) {
            res.status(404).json({
                errorCode: 1,
                message: error.message,
            });
            return;
        }

        console.error('Lỗi khi lấy thời khóa biểu giảng viên:', error);
        res.status(500).json({
            errorCode: 1,
            message: 'Lỗi máy chủ nội bộ',
        });
    }
};

export const importTKBController = async (req: Request, res: Response) => {
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

            const result = await importTKBFromExcel(req.file);

            return res.status(200).json({
                errorCode: result.failed > 0 ? 1 : 0,
                message:
                    `Import thành công ${result.imported} Thời khóa biểu` +
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
