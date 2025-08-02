import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from 'config/client';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
import { paginate } from 'utils/paginate';

interface IUser {
    id?: string;
    email: string;
    username: string;
    password: string;
    role?: Role;
    mssv?: string;
    mgv?: string;
}

export const createUser = async (user: IUser) => {
    // Kiểm tra sinh viên/giảng viên tồn tại
    if (user.mssv && user.mgv) {
        throw new Error('Chỉ được tạo tài khoản sinh viên hoặc giảng viên, không thể cả hai');
    }
    // Kiểm tra sinh viên tồn tại
    if (user.mssv) {
        const sinhVien = await prisma.sV.findUnique({
            where: { mssv: user.mssv },
            include: { user: true },
        });

        if (!sinhVien) {
            throw new Error('Sinh viên không tồn tại');
        }
        if (sinhVien.user) {
            throw new Error('Sinh viên đã có tài khoản');
        }
    }

    // Kiểm tra giảng viên tồn tại
    if (user.mgv) {
        const giangVien = await prisma.gV.findUnique({
            where: { mgv: user.mgv },
            include: { user: true },
        });

        if (!giangVien) {
            throw new Error('Giảng viên không tồn tại');
        }
        if (giangVien.user) {
            throw new Error('Giảng viên đã có tài khoản');
        }
    }

    // Tự động gán role dựa vào mssv/mgv
    let role: Role = 'ADMIN';
    if (user.mssv) role = 'STUDENT';
    if (user.mgv) role = 'TEACHER';

    const hashedPassword = await bcrypt.hash(user.password, 10);

    // const newUser = await prisma.user.create({
    //   data: {
    //     email: user.email,
    //     username: user.username,
    //     password: hashedPassword,
    //     role: role,
    //     mssv: user.mssv,
    //     mgv: user.mgv,
    //   },
    //   include: {
    //     sinhVien: true,
    //     giangVien: true,
    //   },
    // });
    // Chỉ truyền mssv hoặc mgv nếu chúng tồn tại và đã được validate
    const userData: any = {
        email: user.email,
        username: user.username,
        password: hashedPassword,
        role: role,
    };

    // Chỉ thêm mssv nếu có và đã được validate
    if (user.mssv) {
        userData.mssv = user.mssv;
    }

    // Chỉ thêm mgv nếu có và đã được validate
    if (user.mgv) {
        userData.mgv = user.mgv;
    }

    const newUser = await prisma.user.create({
        data: userData,
        include: {
            sinhVien: true,
            giangVien: true,
        },
    });

    return newUser;
};

export const getAllUsers = async (page: number, pageSize: number) => {
    // const users = await prisma.user.findMany({
    //   include: {
    //     sinhVien: true,
    //     giangVien: true,
    //   },
    // });
    // return users;
    return paginate(prisma.user, page, pageSize, {
        sinhVien: true,
        giangVien: true,
    });
};

export const updateUser = async (user: IUser) => {
    const { id, ...userData } = user;
    const existingUser = await prisma.user.findUnique({
        where: { id },
        include: {
            sinhVien: true,
            giangVien: true,
        },
    });

    if (!existingUser) {
        throw new Error('Người dùng không tồn tại');
    }

    // Kiểm tra sinh viên/giảng viên tồn tại
    if (user.mssv && user.mgv) {
        throw new Error('Chỉ được cập nhật tài khoản sinh viên hoặc giảng viên, không thể cả hai');
    }

    // Kiểm tra sinh viên tồn tại
    if (userData.mssv && userData.mssv !== existingUser.mssv) {
        const sinhVien = await prisma.sV.findUnique({
            where: { mssv: userData.mssv },
            include: { user: true },
        });

        if (!sinhVien) {
            throw new Error('Sinh viên không tồn tại');
        }
        if (sinhVien.user && sinhVien.user.id !== id) {
            throw new Error('Sinh viên đã có tài khoản khác');
        }
    }

    // Kiểm tra giảng viên tồn tại
    if (userData.mgv && userData.mgv !== existingUser.mgv) {
        const giangVien = await prisma.gV.findUnique({
            where: { mgv: userData.mgv },
            include: { user: true },
        });

        if (!giangVien) {
            throw new Error('Giảng viên không tồn tại');
        }
        if (giangVien.user && giangVien.user.id !== id) {
            throw new Error('Giảng viên đã có tài khoản khác');
        }
    }

    // Chuẩn bị dữ liệu cập nhật
    const finaluserData: any = {};

    if (userData.email) finaluserData.email = userData.email;
    if (userData.username) finaluserData.username = userData.username;
    if (userData.role) finaluserData.role = userData.role;

    // Hash password nếu có thay đổi
    if (userData.password) {
        finaluserData.password = await bcrypt.hash(userData.password, 10);
    }

    // Xử lý mssv/mgv
    if (userData.hasOwnProperty('mssv')) {
        finaluserData.mssv = userData.mssv || null;
    }
    if (userData.hasOwnProperty('mgv')) {
        finaluserData.mgv = userData.mgv || null;
    }

    // Tự động cập nhật role dựa vào mssv/mgv
    if (userData.mssv) {
        finaluserData.role = 'STUDENT';
        finaluserData.mgv = null; // Xóa mgv nếu có
    } else if (userData.mgv) {
        finaluserData.role = 'TEACHER';
        finaluserData.mssv = null; // Xóa mssv nếu có
    } else if (userData.mssv === null && userData.mgv === null) {
        finaluserData.role = 'ADMIN';
    }

    // Cập nhật người dùng
    const updatedUser = await prisma.user.update({
        where: { id },
        data: finaluserData,
        include: {
            sinhVien: true,
            giangVien: true,
        },
    });

    return updatedUser;
};

export const deleteUser = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }

    const deleteuser = await prisma.user.delete({
        where: { id },
    });

    return deleteuser;
};

export const loginUser = async (username: string, password: string) => {
    const user = await prisma.user.findFirst({
        where: { username },
        include: {
            sinhVien: true,
            giangVien: true,
        },
    });

    const isValidCredentials = user && (await bcrypt.compare(password, user.password));
    if (!isValidCredentials) {
        throw new Error('Thông tin tài khoản không chính xác');
    }

    // Xóa password trước khi trả về
    const { password: _, ...userWithoutPassword } = user;

    let holot, ten, hoGV, tenGV;
    if (user.role === 'STUDENT' && user.sinhVien) {
        holot = user.sinhVien.holot;
        ten = user.sinhVien.ten;
    }
    if (user.role === 'TEACHER' && user.giangVien) {
        hoGV = user.giangVien.hoGV;
        tenGV = user.giangVien.tenGV;
    }

    const token = jwt.sign(
        {
            id: user.id,
            username: user.username,
            role: user.role,
            holot,
            ten,
            hoGV,
            tenGV,
        },
        JWT_SECRET,
        {
            expiresIn: '24h',
        },
    );

    return { user: userWithoutPassword, token };
};
