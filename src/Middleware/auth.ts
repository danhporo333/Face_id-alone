import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import passport from "../config/passport";
import "dotenv/config";

declare global {
  namespace Express {
    interface User {
      role?: string;
      [key: string]: any;
    }
    interface Request {
      user?: User;
    }
  }
}

// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// export const auth = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//       throw new Error();
//     }

//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Vui lòng đăng nhập" });
//   }
// };

// export const checkRole = (roles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!roles.includes(req.user.role)) {
//       res.status(403).json({ message: "Không có quyền truy cập" });
//       return;
//     }
//     next();
//   };
// };

export const auth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, (err: any, user: any) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi xác thực" });
    }

    if (!user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    req.user = user;
    next();
  })(req, res, next);
};

export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Không có quyền truy cập" });
    }
    next();
  };
};
