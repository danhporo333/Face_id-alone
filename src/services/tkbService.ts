import { prisma } from 'config/client';
import { paginate } from 'utils/paginate';
import { parseExcelFile } from 'utils/excelImport';
import fs from 'fs';

interface ITKB {
    thu: string;
    ngay: Date;
    tietBD: number;
    tietKT: number;
    mamh: string;
    mgv: string;
    sop: string;
}

function excelDateToJSDate(serial: number): Date {
    // Excel tính ngày từ 1/1/1900, nhưng có bug leap year
    // Số 25569 = số ngày từ 1/1/1900 đến 1/1/1970
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400; // seconds in a day
    return new Date(utc_value * 1000); // milliseconds
}

export const createTKB = async (tkb: ITKB) => {
    // Kiểm tra môn học tồn tại
    const monHoc = await prisma.monHoc.findUnique({
        where: { mamh: tkb.mamh },
    });
    if (!monHoc) {
        throw new Error('Môn học không tồn tại');
    }

    // Kiểm tra giảng viên tồn tại
    const giangVien = await prisma.gV.findUnique({
        where: { mgv: tkb.mgv },
    });
    if (!giangVien) {
        throw new Error('Giảng viên không tồn tại');
    }

    // Kiểm tra phòng tồn tại
    const phong = await prisma.phong.findUnique({
        where: { sop: tkb.sop },
    });
    if (!phong) {
        throw new Error('Phòng học không tồn tại');
    }

    // Kiểm tra trùng lịch
    const existingTKB = await prisma.tKB.findFirst({
        where: {
            ngay: tkb.ngay,
            thu: tkb.thu,
            AND: [
                {
                    OR: [
                        {
                            AND: [{ tietBD: { lte: tkb.tietBD } }, { tietKT: { gte: tkb.tietBD } }],
                        },
                        {
                            AND: [{ tietBD: { lte: tkb.tietKT } }, { tietKT: { gte: tkb.tietKT } }],
                        },
                    ],
                },
                {
                    OR: [{ sop: tkb.sop }, { mgv: tkb.mgv }],
                },
            ],
        },
    });

    if (existingTKB) {
        throw new Error('Thời gian này đã có lịch học');
    }

    // Tạo TKB mới
    const newTKB = await prisma.tKB.create({
        data: {
            thu: tkb.thu,
            ngay: tkb.ngay,
            tietBD: tkb.tietBD,
            tietKT: tkb.tietKT,
            mamh: tkb.mamh,
            mgv: tkb.mgv,
            sop: tkb.sop,
        },
        include: {
            monHoc: true,
            giangVien: true,
            phong: true,
            diemDanh: true,
        },
    });

    return newTKB;
};

export const getAllTKB = async (page: number, pageSize: number) => {
    return paginate(prisma.tKB, page, pageSize, {
        monHoc: true,
        giangVien: true,
        phong: true,
        diemDanh: true,
    });
};

export const updateTKB = async (id: string, tkb: Partial<ITKB>) => {
    // Kiểm tra TKB tồn tại
    const existingTKB = await prisma.tKB.findUnique({
        where: { id },
    });
    if (!existingTKB) {
        throw new Error('Thời khóa biểu không tồn tại');
    }

    // Kiểm tra môn học nếu được cập nhật
    if (tkb.mamh) {
        const monHoc = await prisma.monHoc.findUnique({
            where: { mamh: tkb.mamh },
        });
        if (!monHoc) {
            throw new Error('Môn học không tồn tại');
        }
    }

    // Kiểm tra giảng viên nếu được cập nhật
    if (tkb.mgv) {
        const giangVien = await prisma.gV.findUnique({
            where: { mgv: tkb.mgv },
        });
        if (!giangVien) {
            throw new Error('Giảng viên không tồn tại');
        }
    }

    // Kiểm tra phòng nếu được cập nhật
    if (tkb.sop) {
        const phong = await prisma.phong.findUnique({
            where: { sop: tkb.sop },
        });
        if (!phong) {
            throw new Error('Phòng học không tồn tại');
        }
    }

    // Cập nhật TKB
    const updatedTKB = await prisma.tKB.update({
        where: { id },
        data: {
            thu: tkb.thu,
            ngay: tkb.ngay,
            tietBD: tkb.tietBD,
            tietKT: tkb.tietKT,
            mamh: tkb.mamh,
            mgv: tkb.mgv,
            sop: tkb.sop,
        },
        include: {
            monHoc: true,
            giangVien: true,
            phong: true,
            diemDanh: true,
        },
    });

    return updatedTKB;
};

export const deleteTKB = async (id: string) => {
    // Kiểm tra TKB tồn tại
    const existingTKB = await prisma.tKB.findUnique({
        where: { id },
    });
    if (!existingTKB) {
        throw new Error('Thời khóa biểu không tồn tại');
    }

    // Xóa TKB
    const deletedTKB = await prisma.tKB.delete({
        where: { id },
        include: {
            monHoc: true,
            giangVien: true,
            phong: true,
            diemDanh: true,
        },
    });

    return deletedTKB;
};

export const getTKBByStudentId = async (mssv: string) => {
    // Kiểm tra sinh viên tồn tại
    const student = await prisma.sV.findUnique({
        where: { mssv },
    });
    if (!student) {
        throw new Error('Sinh viên không tồn tại');
    }

    // Lấy thông tin lớp của sinh viên
    const studentWithClass = await prisma.sV.findUnique({
        where: { mssv },
        include: {
            lop: true,
        },
    });

    // Lấy tất cả TKB có liên quan đến sinh viên này (qua bảng DiemDanh)
    const tkbs = await prisma.tKB.findMany({
        where: {
            diemDanh: {
                some: {
                    mssv: mssv,
                },
            },
        },
        include: {
            monHoc: true,
            giangVien: true,
            phong: true,
            diemDanh: {
                where: {
                    mssv: mssv,
                },
            },
        },
        orderBy: [{ ngay: 'asc' }, { tietBD: 'asc' }],
    });
    return {
        student: {
            mssv: student.mssv,
            holot: student.holot,
            ten: student.ten,
            lop: studentWithClass?.lop?.tenlop || 'N/A',
        },
        tkbs: tkbs,
    };
};

export const ganSinhVienVaoTKB = async (mssv: string, tkbId: string) => {
    // Kiểm tra sinh viên có tồn tại không
    const sinhVien = await prisma.sV.findUnique({
        where: { mssv },
    });

    if (!sinhVien) {
        throw new Error('Sinh viên không tồn tại');
    }

    // Kiểm tra TKB có tồn tại không
    const tkb = await prisma.tKB.findUnique({
        where: { id: tkbId },
    });

    if (!tkb) {
        throw new Error('Thời khóa biểu không tồn tại');
    }

    // Kiểm tra sinh viên đã được gán vào TKB này chưa
    const diemDanhDaTonTai = await prisma.diemDanh.findUnique({
        where: {
            mssv_id: {
                mssv: mssv,
                id: tkbId,
            },
        },
    });

    if (diemDanhDaTonTai) {
        throw new Error('Sinh viên đã được gán vào thời khóa biểu này');
    }

    // Tạo bản ghi điểm danh (với giá trị mặc định)
    const diemDanh = await prisma.diemDanh.create({
        data: {
            mssv: mssv,
            id: tkbId,
            coMat: false,
            diTre: false,
        },
        include: {
            sinhVien: true,
            tkb: {
                include: {
                    monHoc: true,
                    giangVien: true,
                    phong: true,
                },
            },
        },
    });

    return diemDanh;
};

//chức năng gán nhiều sinh viên vào TKB
export const ganLopVaoTKB = async (maLop: string, tkbId: string) => {
    // Kiểm tra lớp có tồn tại không
    const lop = await prisma.lop.findUnique({
        where: { malop: maLop },
        include: {
            sinhVien: true,
        },
    });

    if (!lop) {
        throw new Error('Lớp không tồn tại');
    }

    // Kiểm tra TKB có tồn tại không
    const tkb = await prisma.tKB.findUnique({
        where: { id: tkbId },
    });

    if (!tkb) {
        throw new Error('Thời khóa biểu không tồn tại');
    }

    // Lấy tất cả sinh viên trong lớp
    const danhSachSinhVien = lop.sinhVien;

    if (danhSachSinhVien.length === 0) {
        throw new Error('Lớp không có sinh viên nào');
    }

    // Tạo bản ghi điểm danh cho tất cả sinh viên
    const ketQua = [];
    for (const sinhVien of danhSachSinhVien) {
        // Kiểm tra bản ghi đã tồn tại chưa
        const diemDanhDaTonTai = await prisma.diemDanh.findUnique({
            where: {
                mssv_id: {
                    mssv: sinhVien.mssv,
                    id: tkbId,
                },
            },
        });

        if (!diemDanhDaTonTai) {
            const diemDanh = await prisma.diemDanh.create({
                data: {
                    mssv: sinhVien.mssv,
                    id: tkbId,
                    coMat: false,
                    diTre: false,
                },
            });
            ketQua.push(diemDanh);
        }
    }

    return {
        tongSoSinhVien: danhSachSinhVien.length,
        soSinhVienDaGan: ketQua.length,
        thongBao: `Đã gán ${ketQua.length} sinh viên vào thời khóa biểu`,
    };
};

export const getTKBByUserId = async (userId: string) => {
    // Lấy thông tin người dùng kèm theo quan hệ với sinh viên
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            sinhVien: true,
        },
    });

    if (!user) {
        throw new Error('Không tìm thấy người dùng');
    }

    // Kiểm tra xem người dùng có phải là sinh viên không
    if (user.role !== 'STUDENT' || !user.sinhVien) {
        throw new Error('Người dùng không phải là sinh viên');
    }

    // Sử dụng hàm hiện có để lấy thời khóa biểu của sinh viên
    return getTKBByStudentId(user.sinhVien.mssv);
};

// export const getCompleteStudentSchedule = async (mssv: string) => {
//   // Kiểm tra sinh viên có tồn tại không
//   const student = await prisma.sV.findUnique({
//     where: { mssv },
//     include: {
//       lop: {
//         include: {
//           khoaVien: true
//         }
//       },
//       diemDanh: {
//         include: {
//           tkb: {
//             include: {
//               monHoc: true,
//               giangVien: true,
//               phong: true
//             }
//           }
//         }
//       }
//     }
//   });

//   if (!student) {
//     throw new Error("Sinh viên không tồn tại");
//   }

//   // Trích xuất TKB từ các bản ghi điểm danh
//   const scheduledClasses = student.diemDanh.map(attendance => {
//     return {
//       ...attendance.tkb,
//       attendanceStatus: {
//         coMat: attendance.coMat,
//         diTre: attendance.diTre,
//         lyDoKhac: attendance.lyDoKhac
//       }
//     };
//   });

//   // Nhóm theo ngày để tổ chức tốt hơn
//   const scheduleByDay = scheduledClasses.reduce((acc, tkb) => {
//     const day = formatDate(new Date(tkb.ngay));
//     if (!acc[day]) {
//       acc[day] = [];
//     }
//     acc[day].push(tkb);
//     return acc;
//   }, {} as Record<string, any[]>);

//   return {
//     student: {
//       mssv: student.mssv,
//       holot: student.holot,
//       ten: student.ten,
//       hoTen: `${student.holot} ${student.ten}`,
//       lop: student.lop?.tenlop || 'N/A',
//       khoaVien: student.lop?.khoaVien?.tenkv || 'N/A',
//     },
//     lichTheoNgay: scheduleByDay,
//     tatCaLich: scheduledClasses.sort((a, b) => {
//       // Sắp xếp theo ngày trước, sau đó theo tiết bắt đầu
//       const dateCompare = new Date(a.ngay).getTime() - new Date(b.ngay).getTime();
//       if (dateCompare !== 0) return dateCompare;
//       return a.tietBD - b.tietBD;
//     })
//   };
// };

// lây lịch dạy của giảng viên
export const getTKBByTeacherUserId = async (userId: string) => {
    // Lấy thông tin người dùng kèm theo quan hệ với giảng viên
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            giangVien: true,
        },
    });

    if (!user) {
        throw new Error('Không tìm thấy người dùng');
    }

    // Kiểm tra xem người dùng có phải là giảng viên không
    if (user.role !== 'TEACHER' || !user.giangVien) {
        throw new Error('Người dùng không phải là giảng viên');
    }

    // Lấy tất cả TKB của giảng viên này
    const tkbs = await prisma.tKB.findMany({
        where: {
            mgv: user.giangVien.mgv,
        },
        include: {
            monHoc: true,
            giangVien: true,
            phong: true,
            diemDanh: {
                include: {
                    sinhVien: {
                        include: {
                            lop: true,
                        },
                    },
                },
            },
        },
        orderBy: [{ ngay: 'asc' }, { tietBD: 'asc' }],
    });

    return {
        teacher: {
            mgv: user.giangVien.mgv,
            hoGV: user.giangVien.hoGV,
            tenGV: user.giangVien.tenGV,
            hoTen: `${user.giangVien.hoGV} ${user.giangVien.tenGV}`,
            donVi: user.giangVien.donVi || 'N/A',
        },
        tkbs: tkbs,
    };
};

export const importTKBFromExcel = async (file: Express.Multer.File) => {
    const columnMap = {
        thu: 'thu',
        thứ: 'thu',
        Thứ: 'thu',
        THỨ: 'thu',
        ngay: 'ngay',
        Ngày: 'ngay',
        ngày: 'ngay',
        NGÀY: 'ngay',
        'ngày học': 'ngay',
        tietBD: 'tietBD',
        'tiết bắt đầu': 'tietBD',
        'Tiết bắt đầu': 'tietBD',
        'Tiết Bắt Đầu': 'tietBD',
        'TIẾT BẮT ĐẦU': 'tietBD',
        tietKT: 'tietKT',
        'tiết kết thúc': 'tietKT',
        'Tiết kết thúc': 'tietKT',
        'Tiết Kết Thúc': 'tietKT',
        'TIẾT KẾT THÚC': 'tietKT',

        tenmh: 'tenmh',
        'tên môn học': 'tenmh',
        'Tên môn học': 'tenmh',
        'TÊN MÔN HỌC': 'tenmh',
        'ten mon hoc': 'tenmh',
        'Ten mon hoc': 'tenmh',
        'môn học': 'tenmh',
        'Môn học': 'tenmh',
        'MÔN HỌC': 'tenmh',
        'mon hoc': 'tenmh',
        'Mon hoc': 'tenmh',
        môn: 'tenmh',
        Môn: 'tenmh',
        MÔN: 'tenmh',
        subject: 'tenmh',
        Subject: 'tenmh',
        'tên môn': 'tenmh',

        mamh: 'mamh',
        'mã môn học': 'mamh',
        'Mã môn học': 'mamh',
        'MÃ MÔN HỌC': 'mamh',
        'mã môn': 'mamh',
        'Mã môn': 'mamh',
        'MÃ MÔN': 'mamh',
        'ma mon hoc': 'mamh',
        'Ma mon hoc': 'mamh',

        hoGV: 'hoGV',
        'họ giảng viên': 'hoGV',
        'Họ giảng viên': 'hoGV',
        'HỌ GIẢNG VIÊN': 'hoGV',
        'ho giang vien': 'hoGV',
        'Ho giang vien': 'hoGV',
        'HO GIANG VIEN': 'hoGV',
        'họ gv': 'hoGV',
        'Họ GV': 'hoGV',
        'HỌ GV': 'hoGV',
        'ho gv': 'hoGV',
        'Ho gv': 'hoGV',
        họ: 'hoGV',
        Họ: 'hoGV',
        HỌ: 'hoGV',
        ho: 'hoGV',
        Ho: 'hoGV',

        tenGV: 'tenGV',
        'tên giảng viên': 'tenGV',
        'Tên giảng viên': 'tenGV',
        'TÊN GIẢNG VIÊN': 'tenGV',
        'ten giang vien': 'tenGV',
        'Ten giang vien': 'tenGV',
        'TEN GIANG VIEN': 'tenGV',
        'tên gv': 'tenGV',
        'Tên GV': 'tenGV',
        'TÊN GV': 'tenGV',
        'ten gv': 'tenGV',
        'Ten gv': 'tenGV',
        tên: 'tenGV',
        Tên: 'tenGV',
        TÊN: 'tenGV',
        ten: 'tenGV',
        Ten: 'tenGV',
        name: 'tenGV',
        Name: 'tenGV',
        NAME: 'tenGV',

        mgv: 'mgv',
        'mã giảng viên': 'mgv',
        'Mã giảng viên': 'mgv',
        'MÃ GIẢNG VIÊN': 'mgv',

        'tên phòng': 'tenPhong',
        'Tên phòng': 'tenPhong',
        'TÊN PHÒNG': 'tenPhong',

        sop: 'sop',
        'số phòng': 'sop',
        'Số phòng': 'sop',
        'SỐ PHÒNG': 'sop',
    };

    try {
        const data = parseExcelFile<any>(file.path, columnMap);
        console.log('Dữ liệu Excel:', data);

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('File không chứa dữ liệu hợp lệ');
        }

        // Lấy tất cả dữ liệu reference một lần
        const [allmonhoc, allteacher, allphong] = await Promise.all([
            prisma.monHoc.findMany({ select: { mamh: true, tenmh: true } }),
            prisma.gV.findMany({ select: { mgv: true, hoGV: true, tenGV: true } }),
            prisma.phong.findMany({ select: { sop: true, tenPhong: true } }),
        ]);

        // Tạo maps cho lookup nhanh
        const allteacherMap = new Map<string, string>();
        allteacher.forEach((gv) => {
            const key = `${gv.hoGV.trim().toLowerCase()} ${gv.tenGV.trim().toLowerCase()}`;
            allteacherMap.set(key, gv.mgv);
        });

        const results = [];
        const errors = [];

        // **THÊM DEBUG LOG**
        console.log('=== DEBUG PHÒNG HỌC ===');
        console.log(
            'Danh sách phòng trong DB:',
            allphong.map((p) => ({
                sop: p.sop,
                tenPhong: p.tenPhong,
            })),
        );
        console.log('Dữ liệu Excel mẫu:', data.slice(0, 3));

        for (const [index, rows] of data.entries()) {
            try {
                if (!rows.thu) {
                    throw new Error('Thứ không được để trống');
                }
                if (!rows.ngay) throw new Error('Ngày không được để trống');
                if (!rows.tietBD) throw new Error('Tiết bắt đầu không được để trống');
                if (!rows.tietKT) throw new Error('Tiết kết thúc không được để trống');
                if (!rows.mamh && !rows.tenmh) {
                    throw new Error('Mã hoặc tên môn học không được để trống');
                }
                if (!rows.mgv && !rows.hoGV && !rows.tenGV) {
                    throw new Error('Mã hoặc tên giảng viên không được để trống');
                }
                if (!rows.sop && !rows.tenPhong) {
                    throw new Error('Số hoặc tên phòng không được để trống');
                }

                // Validate tiết học
                const tietBD = Number(rows.tietBD);
                const tietKT = Number(rows.tietKT);
                if (tietBD < 1 || tietBD > 15 || tietKT < 1 || tietKT > 15 || tietBD >= tietKT) {
                    throw new Error('Tiết học không hợp lệ (1-15 và tiết bắt đầu < tiết kết thúc)');
                }

                //môn học
                let monhoc;
                if (rows.tenmh) {
                    // Chuẩn hóa tên môn học: loại bỏ khoảng trắng đầu/cuối và ký tự đặc biệt
                    const cleanTenmh = rows.tenmh
                        .toString()
                        .replace(/^\s+|\s+$/g, '')
                        .replace(/\s+/g, ' ')
                        .toLowerCase();
                    monhoc = allmonhoc.find((mh) => mh.tenmh.trim().toLowerCase() === cleanTenmh);

                    if (!monhoc) {
                        throw new Error(`Môn học "${rows.tenmh}" không tồn tại`);
                    }
                } else if (rows.mamh) {
                    const cleanMamh = rows.mamh.toString().trim();
                    monhoc = allmonhoc.find((mh) => mh.mamh === cleanMamh);

                    if (!monhoc) {
                        throw new Error(`Mã môn học "${rows.mamh}" không tồn tại`);
                    }
                }

                //giảng viên
                let giangVien;
                if (rows.hoGV && rows.tenGV) {
                    const cleanTenGV = `${rows.hoGV.toString().trim().toLowerCase()} ${rows.tenGV
                        .toString()
                        .trim()
                        .toLowerCase()}`;
                    const mgv = allteacherMap.get(cleanTenGV);
                    if (mgv) {
                        giangVien = allteacher.find((gv) => gv.mgv === mgv);
                    }
                } else if (rows.mgv) {
                    const cleanMgv = rows.mgv.toString().trim();
                    giangVien = allteacher.find((gv) => gv.mgv === cleanMgv);
                }

                if (!giangVien) {
                    throw new Error(`Giảng viên "${rows.hoGV || ''} ${rows.tenGV || rows.mgv || ''}" không tồn tại`);
                }

                //phòng học
                let phongHoc;
                console.log(`\n--- Row ${index + 2} ---`);
                console.log('tenPhong from Excel:', rows.tenPhong);
                console.log('sop from Excel:', rows.sop);

                // Ưu tiên sop vì Excel đang dùng cột "số phòng" chứa tên phòng
                if (rows.sop) {
                    const cleanSop = rows.sop.toString().trim().toLowerCase();
                    console.log('Cleaned sop:', JSON.stringify(cleanSop));

                    // Tìm bằng tên phòng (vì sop trong Excel chứa tên phòng)
                    phongHoc = allphong.find((ph) => {
                        const dbTenPhong = ph.tenPhong.trim().toLowerCase();
                        console.log(`Comparing sop as tenPhong: "${cleanSop}" vs "${dbTenPhong}"`);
                        return dbTenPhong === cleanSop;
                    });

                    // Nếu không tìm thấy, thử tìm bằng sop (UUID)
                    if (!phongHoc) {
                        phongHoc = allphong.find((ph) => {
                            const dbSop = ph.sop.trim().toLowerCase();
                            console.log(`Comparing sop as UUID: "${cleanSop}" vs "${dbSop}"`);
                            return dbSop === cleanSop;
                        });
                    }
                } else if (rows.tenPhong) {
                    // Logic cho trường hợp có tenPhong (hiện tại không có)
                    const cleanTenPhong = rows.tenPhong.toString().trim().toLowerCase();
                    phongHoc = allphong.find((ph) => ph.tenPhong.trim().toLowerCase() === cleanTenPhong);
                }

                if (!phongHoc) {
                    console.log('❌ Không tìm thấy phòng:', rows.tenPhong || rows.sop);
                    throw new Error(`Phòng học "${rows.tenPhong || rows.sop || ''}" không tồn tại`);
                } else {
                    console.log('✅ Tìm thấy phòng:', phongHoc);
                }

                // Validate và format ngày
                let validDate;
                try {
                    if (typeof rows.ngay === 'number') {
                        // Chuyển đổi Excel date serial sang JavaScript Date
                        validDate = excelDateToJSDate(rows.ngay);
                    } else if (typeof rows.ngay === 'string') {
                        // Hỗ trợ format DD/MM/YYYY và YYYY-MM-DD
                        const dateParts = rows.ngay.includes('/') ? rows.ngay.split('/') : null;
                        if (dateParts && dateParts.length === 3) {
                            const [day, month, year] = dateParts;
                            validDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
                        } else {
                            validDate = new Date(rows.ngay);
                        }
                    } else {
                        validDate = new Date(rows.ngay);
                    }

                    if (isNaN(validDate.getTime())) {
                        throw new Error('Ngày không hợp lệ');
                    }
                } catch (error) {
                    throw new Error(`Ngày "${rows.ngay}" không hợp lệ. Định dạng: DD/MM/YYYY hoặc YYYY-MM-DD`);
                }

                //kiểm tra trùng lịch
                const existingTKB = await prisma.tKB.findFirst({
                    where: {
                        AND: [
                            { thu: rows.thu },
                            { ngay: validDate },
                            { tietBD: tietBD },
                            { tietKT: tietKT },
                            { mgv: giangVien.mgv },
                            { sop: phongHoc.sop },
                        ],
                    },
                });

                if (existingTKB) {
                    throw new Error(
                        `Lịch học vào thứ ${rows.thu} ngày ${rows.ngay} từ tiết ${rows.tietBD} đến tiết ${rows.tietKT} đã tồn tại`,
                    );
                }

                //tạo TKB mới
                const created = await prisma.tKB.create({
                    data: {
                        thu: rows.thu,
                        ngay: validDate,
                        tietBD: tietBD,
                        tietKT: tietKT,
                        mamh: monhoc.mamh,
                        mgv: giangVien.mgv,
                        sop: phongHoc.sop,
                    },
                    include: {
                        monHoc: true,
                        giangVien: true,
                        phong: true,
                    },
                });
                results.push(created);
            } catch (error) {
                errors.push({ row: index + 2, error: error.message });
            }
        }
        fs.unlinkSync(file.path);
        return { imported: results.length, failed: errors.length, results, errors };
    } catch (error) {
        try {
            fs.unlinkSync(file.path);
        } catch {}
        throw new Error(`Lỗi import: ${error.message}`);
    }
};
