import { createUser, loginUser, getAllUsers, deleteUser, updateUser } from 'services/userService';
import { Request, Response, NextFunction } from 'express';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, username, password, role, mssv, mgv } = req.body;
        if (!email || !username || !password) {
            res.status(400).json({
                errorCode: 1,
                message: 'vui lòng điền đầy đủ thông tin',
            });
        }
        const newUser = await createUser({
            email,
            username,
            password,
            role,
            mssv: mssv || undefined, // Chuyển null thành undefined
            mgv: mgv || undefined, // Chuyển null thành undefined
        });

        // tạo lại response và loại bỏ các trường null
        const responseData: any = {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            role: newUser.role,
        };
        if (newUser.sinhVien) {
            responseData.sinhvien = newUser.sinhVien;
        }
        if (newUser.giangVien) {
            responseData.giangvien = newUser.giangVien;
        }
        res.status(201).json({
            message: 'Tạo tài khoản thành công',
            data: responseData,
        });
    } catch (error: any) {
        console.error(error);

        if (error.message.includes('không tồn tại') || error.message.includes('đã có tài khoản')) {
            res.status(400).json({
                errorCode: 1,
                message: error.message,
            });
            return;
        }

        res.status(500).json({
            errorCode: 1,
            message: error.message || 'Internal server error',
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        //delay
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const { username, password } = req.body;
        const { user, token } = await loginUser(username, password);

        res.json({
            message: 'Đăng nhập thành công',
            data: { user, token },
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllUsersController = async (req: Request, res: Response) => {
    try {
        const page = +(req.query.current || 1);
        const pageSize = +(req.query.pageSize || 5);
        const { result: users, total } = await getAllUsers(page, pageSize);
        const pages = Math.ceil(total / pageSize);
        // const userCount = users.length;

        res.status(200).json({
            errorCode: 0,
            message: 'Lấy danh sách tài khoản thành công',
            data: {
                meta: {
                    current: page,
                    pageSize: pageSize,
                    pages: pages,
                    total: total,
                    userCount: users.length,
                },
                users: users,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            errorCode: 1,
            message: 'Lỗi khi lấy danh sách tài khoản',
        });
    }
};

export const deleteUserController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedUser = await deleteUser(id);

        res.status(200).json({
            errorCode: 0,
            message: 'Xóa tài khoản thành công',
            data: deletedUser,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            errorCode: 1,
            message: 'Lỗi khi xóa tài khoản',
        });
    }
};

export const updateUserController = async (req: Request, res: Response) => {
    try {
        const { id, email, username, password, role, mssv, mgv } = req.body;

        // Kiểm tra id có tồn tại không
        if (!id) {
            res.status(400).json({
                errorCode: 1,
                message: 'ID không được để trống',
            });
            return;
        }

        // Tạo object updateData chỉ với các trường có giá trị
        const updateData: any = {};

        if (email !== undefined && email !== '') updateData.email = email;
        if (username !== undefined && username !== '') updateData.username = username;
        if (password !== undefined && password !== '') updateData.password = password;
        if (role !== undefined && role !== '') updateData.role = role;

        // Xử lý mssv và mgv đặc biệt để cho phép set null
        if (mssv !== undefined) {
            updateData.mssv = mssv || undefined;
        }
        if (mgv !== undefined) {
            updateData.mgv = mgv || undefined;
        }

        const updatedUser = await updateUser({
            id,
            ...updateData,
        });

        // Tạo response data và loại bỏ các trường null
        const responseData: any = {
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            role: updatedUser.role,
        };

        if (updatedUser.sinhVien) {
            responseData.sinhvien = updatedUser.sinhVien;
        }
        if (updatedUser.giangVien) {
            responseData.giangvien = updatedUser.giangVien;
        }

        res.status(200).json({
            errorCode: 0,
            message: 'Cập nhật tài khoản thành công',
            data: responseData,
        });
    } catch (error: any) {
        console.error(error);

        if (error.message.includes('không tồn tại') || error.message.includes('đã có tài khoản')) {
            res.status(400).json({
                errorCode: 1,
                message: error.message,
            });
            return;
        }

        res.status(500).json({
            errorCode: 1,
            message: error.message || 'Lỗi khi cập nhật tài khoản',
        });
    }
};
