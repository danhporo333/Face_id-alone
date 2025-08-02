import { prisma } from 'config/client';
import { paginate } from 'utils/paginate';
import { parseExcelFile } from 'utils/excelImport';
import fs from 'fs';
import { validatePhoneNumber } from 'utils/validator';

interface IStudent {
    malop?: string;
    holot?: string;
    ten: string;
    ntns: Date;
    phai: string;
    dt_sv?: string;
    emailSV?: string;
    faceID?: string;
}

export const createStudent = async (student: IStudent) => {
    // kiểm tra xem lớp có tồn tại không
    const lop = await prisma.lop.findUnique({
        where: { malop: student.malop },
    });

    if (!lop) {
        throw new Error('Lớp không tồn tại');
    }
    // tạo sinh viên mới
    const newStudent = await prisma.sV.create({
        data: {
            malop: student.malop,
            holot: student.holot,
            ten: student.ten,
            ntns: student.ntns,
            phai: student.phai,
            dt_sv: student.dt_sv,
            emailSV: student.emailSV,
            faceID: student.faceID,
        },
        include: {
            lop: {
                include: {
                    khoaVien: true,
                },
            },
        },
    });
    return newStudent;
};

export const getAllStudents = async (page: number, pageSize: number) => {
    return paginate(
        prisma.sV,
        page,
        pageSize,
        {
            lop: {
                include: {
                    khoaVien: true,
                },
            },
            diemDanh: true,
        },
        {}, // <--- đây là where, hiện tại bạn không lọc gì cả
        { malop: 'asc' },
    );
};

export const updateStudent = async (mssv: string, student: Partial<IStudent>) => {
    // kiểm tra xem sinh viên có tồn tại không
    const existingStudent = await prisma.sV.findUnique({
        where: { mssv },
    });

    if (!existingStudent) {
        throw new Error('Sinh viên không tồn tại');
    }

    // kiem tra xem lớp có tồn tại không
    if (student.malop) {
        const lop = await prisma.lop.findUnique({
            where: { malop: student.malop },
        });

        if (!lop) {
            throw new Error('Lớp không tồn tại');
        }
    }

    // cập nhật sinh viên
    const updatedStudent = await prisma.sV.update({
        where: { mssv },
        data: {
            malop: student.malop,
            holot: student.holot,
            ten: student.ten,
            ntns: student.ntns,
            phai: student.phai,
            dt_sv: student.dt_sv,
            emailSV: student.emailSV,
            faceID: student.faceID,
        },
        include: {
            lop: {
                include: {
                    khoaVien: true,
                },
            },
        },
    });

    return updatedStudent;
};

export const deleteStudent = async (mssv: string) => {
    // kiểm tra xem sinh viên có tồn tại không
    const existingStudent = await prisma.sV.findUnique({
        where: { mssv },
    });

    if (!existingStudent) {
        throw new Error('Sinh viên không tồn tại');
    }

    // xóa sinh viên
    const deletedStudent = await prisma.sV.delete({
        where: { mssv },
        include: {
            lop: {
                include: {
                    khoaVien: true,
                },
            },
        },
    });

    return deletedStudent;
};

const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export const importStudentsFromExcel = async (file: Express.Multer.File) => {
    const columnMap = {
        // Map cho tên lớp (thay vì mã lớp)
        tenlop: 'tenlop',
        'tên lớp': 'tenlop',
        'Tên lớp': 'tenlop',
        'TÊN LỚP': 'tenlop',
        'ten lop': 'tenlop',
        'Ten lop': 'tenlop',
        'TEN LOP': 'tenlop',
        lớp: 'tenlop',
        Lớp: 'tenlop',
        LỚP: 'tenlop',
        lop: 'tenlop',
        Lop: 'tenlop',
        LOP: 'tenlop',
        class: 'tenlop',
        Class: 'tenlop',
        CLASS: 'tenlop',
        'Tên Lớp': 'tenlop',
        'tên Lớp': 'tenlop',

        // Giữ lại mapping cũ để tương thích
        malop: 'malop',
        'mã lớp': 'malop',
        'Mã lớp': 'malop',
        'MÃ LỚP': 'malop',
        'ma lop': 'malop',
        'Ma lop': 'malop',
        'MA LOP': 'malop',
        'Mã Lớp': 'malop',
        'mã Lớp': 'malop',
        'class code': 'malop',
        'Class Code': 'malop',

        // Các field khác
        holot: 'holot',
        'họ lót': 'holot',
        'Họ lót': 'holot',
        'HỌ LÓT': 'holot',
        ten: 'ten',
        tên: 'ten',
        Tên: 'ten',
        TÊN: 'ten',
        ntns: 'ntns',
        'ngày tháng năm sinh': 'ntns',
        'Ngày tháng năm sinh': 'ntns',
        'NGÀY THÁNG NĂM SINH': 'ntns',
        'ngay sinh': 'ntns',
        'Ngày sinh': 'ntns',
        'NGÀY SINH': 'ntns',
        phai: 'phai',
        phái: 'phai',
        Phái: 'phai',
        'giới tính': 'phai',
        'Giới tính': 'phai',
        'GIỚI TÍNH': 'phai',
        dt_sv: 'dt_sv',
        'điện thoại': 'dt_sv',
        'Điện thoại': 'dt_sv',
        'số điện thoại': 'dt_sv',
        emailSV: 'emailSV',
        'email sinh viên': 'emailSV',
        'Email sinh viên': 'emailSV',
        email: 'emailSV',
        faceID: 'faceID',
        'Hình ảnh': 'faceID',
        'hình ảnh': 'faceID',
    };

    try {
        const data = parseExcelFile<any>(file.path, columnMap);

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Không có dữ liệu hợp lệ trong file Excel');
        }

        // 🔥 OPTIMIZE: Lấy tất cả lớp 1 lần thay vì query trong loop
        const allClasses = await prisma.lop.findMany({
            select: { malop: true, tenlop: true },
        });

        // Tạo Map để lookup nhanh
        const classMap = new Map();
        allClasses.forEach((cls) => {
            classMap.set(cls.tenlop.toLowerCase(), cls);
        });

        const results = [];
        const errors = [];

        for (const [index, row] of data.entries()) {
            try {
                // Validate required fields
                if (!row.tenlop && !row.malop) {
                    throw new Error('Tên lớp hoặc mã lớp không được để trống');
                }
                if (!row.holot) throw new Error('Họ lót không được để trống');
                if (!row.ten) throw new Error('Tên không được để trống');
                if (!row.ntns) throw new Error('Ngày sinh không được để trống');
                if (!row.phai) throw new Error('Giới tính không được để trống');

                // 🔥 OPTIMIZE: Tìm lớp từ Map thay vì query DB
                let lop;
                if (row.tenlop) {
                    const cleanTenlop = row.tenlop.toString().trim();
                    lop = classMap.get(cleanTenlop.toLowerCase());

                    if (!lop) {
                        throw new Error(`Không tìm thấy lớp với tên: ${cleanTenlop}`);
                    }
                } else if (row.malop) {
                    const cleanMalop = row.malop.toString().trim();
                    lop = allClasses.find((cls) => cls.malop === cleanMalop);

                    if (!lop) {
                        throw new Error(`Không tìm thấy lớp với mã: ${cleanMalop}`);
                    }
                }

                // Parse date
                let birthDate: Date;
                if (typeof row.ntns === 'string') {
                    const ntnsStr = row.ntns as string;
                    const dateParts = ntnsStr.includes('/') ? ntnsStr.split('/') : null;
                    if (dateParts) {
                        const [day, month, year] = dateParts;
                        birthDate = new Date(`${year}-${month}-${day}`);
                    } else {
                        birthDate = new Date(ntnsStr);
                    }
                } else {
                    birthDate = new Date(row.ntns);
                }

                if (isNaN(birthDate.getTime())) {
                    throw new Error('Ngày sinh không hợp lệ');
                }

                // Validate gender
                if (!['Nam', 'Nữ'].includes(row.phai)) {
                    throw new Error("Giới tính phải là 'Nam' hoặc 'Nữ'");
                }

                // Generate phone if not provided
                const phoneNumber = row.dt_sv && validatePhoneNumber(row.dt_sv) ? row.dt_sv : undefined;

                const created = await prisma.sV.create({
                    data: {
                        malop: lop.malop,
                        holot: row.holot,
                        ten: row.ten,
                        ntns: birthDate,
                        phai: row.phai,
                        dt_sv: phoneNumber,
                        emailSV: row.emailSV,
                        // faceID: row.faceID,
                    },
                });
                // Format ngày sinh trước khi trả về kết quả
                const formattedDate = {
                    ...created,
                    ntns: formatDate(created.ntns),
                };

                if (created.faceID == null) {
                    delete formattedDate.faceID;
                }

                results.push(formattedDate);
            } catch (error: any) {
                errors.push({ row: index + 2, error: error.message });
            }
        }

        fs.unlinkSync(file.path);
        return { imported: results.length, failed: errors.length, results, errors };
    } catch (error: any) {
        try {
            fs.unlinkSync(file.path);
        } catch {}
        throw new Error(`Lỗi import: ${error.message}`);
    }
};
