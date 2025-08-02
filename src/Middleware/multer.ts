import multer from 'multer';
import path from 'path';
import { v4 } from 'uuid';
import fs from 'fs';

export const fileUploadMiddleware = (fieldName: string, dir: string = 'student', maxCount = 50) => {
    // Create absolute path to the upload directory
    const uploadPath = path.resolve(__dirname, '../Public/image', dir);

    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log(`Created directory: ${uploadPath}`);
    }

    return multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const extension = path.extname(file.originalname);
                console.log('File extension:', extension);
                cb(null, v4() + extension);
            },
        }),
        limits: {
            fileSize: 1024 * 1024 * 5, // 5MB
        },
        fileFilter: (req: Express.Request, file: Express.Multer.File, cb: Function) => {
            if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
                cb(null, true);
            } else {
                cb(new Error('Only JPEG and PNG images are allowed.'), false);
            }
        },
    }).single(fieldName);
};

export const multipleFileUploadMiddleware = (fieldName: string, dir: string = 'student', maxCount = 10) => {
    // Create absolute path to the upload directory
    const uploadPath = path.resolve(__dirname, '../Public/image', dir);

    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log(`Created directory: ${uploadPath}`);
    }

    return multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const extension = path.extname(file.originalname);
                console.log('File extension:', extension);
                cb(null, v4() + extension);
            },
        }),
        limits: {
            fileSize: 1024 * 1024 * 5, // 5MB per file
        },
        fileFilter: (req: Express.Request, file: Express.Multer.File, cb: Function) => {
            if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
                cb(null, true);
            } else {
                cb(new Error('Only JPEG and PNG images are allowed.'), false);
            }
        },
    }).array(fieldName, maxCount); // Sử dụng .array() thay vì .single()
};

export const excelUploadMiddleware = (fieldName: string) => {
    const uploadExcel = path.resolve(__dirname, '../Public/excel/imports');
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadExcel)) {
        fs.mkdirSync(uploadExcel, { recursive: true });
        console.log(`Created directory: ${uploadExcel}`);
    }
    return multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, uploadExcel);
            },
            filename: (req, file, cb) => {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `import-${timestamp}${path.extname(file.originalname)}`;
                cb(null, filename);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (
                file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.mimetype === 'application/vnd.ms-excel'
            ) {
                cb(null, true);
            } else {
                cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)'));
            }
        },
    }).single(fieldName);
};
