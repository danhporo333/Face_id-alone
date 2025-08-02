import { Request, Response } from "express";
import { prisma } from "config/client";

export const diemDanhFaceID = async (req: Request, res: Response) => {
  const { mssv, tkbId } = req.body;
  if (!mssv || !tkbId) {
    res.status(400).json({ errorCode: 1, message: "Thiếu dữ liệu" });
    return;
  }
  try {
    // Nếu đã có bản ghi thì update, chưa có thì tạo mới
    const diemDanh = await prisma.diemDanh.upsert({
      where: { mssv_id: { mssv, id: tkbId } },
      update: { coMat: true },
      create: {
        mssv,
        id: tkbId,
        coMat: true,
        diTre: false,
        lyDoKhac: null,
        faceID: null,
      },
    });
    res.status(200).json({
      errorCode: 0,
      message: "Điểm danh thành công",
      data: diemDanh,
    });
    return;
  } catch (error: any) {
    res.status(500).json({ errorCode: 1, message: error.message });
    return;
  }
};
