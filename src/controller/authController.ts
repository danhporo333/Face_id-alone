import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const verifyTokenController = (req: Request, res: Response) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ errorCode: 1, message: "Không có token!" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res
      .status(500)
      .json({ errorCode: 1, message: "JWT_SECRET chưa được cấu hình" });
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    res
      .status(200)
      .json({ errorCode: 0, message: "Token hợp lệ!", user: decoded });
  } catch (error) {
    res.status(403).json({ errorCode: 1, message: "Token không hợp lệ!" });
  }
};
