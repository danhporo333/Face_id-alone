import { Request, Response } from "express";
import {
  createRoom,
  getAllRooms,
  updateRoom,
  deleteRoom,
} from "services/RoomService";

export const createRoomController = async (req: Request, res: Response) => {
  try {
    const { tenPhong, sucChua, coSo } = req.body;
    console.log("reqbody", req.body);

    // Validate input
    if (!tenPhong || !sucChua || !coSo) {
      res.status(400).json({
        errorCode: 1,
        message: "Vui lòng điền đầy đủ thông tin",
      });
      return;
    }

    // Validate sucChua
    if (sucChua <= 0) {
      res.status(400).json({
        errorCode: 1,
        message: "Sức chứa phòng phải lớn hơn 0",
      });
      return;
    }

    const newRoom = await createRoom({
      tenPhong,
      sucChua: parseInt(sucChua),
      coSo,
    });

    res.status(201).json({
      errorCode: 0,
      message: "Tạo phòng học thành công",
      data: newRoom,
    });
    return;
  } catch (error: any) {
    if (error.message === "Phòng học này đã tồn tại") {
      res.status(400).json({
        errorCode: 1,
        message: "Phòng học này đã tồn tại trong hệ thống",
      });
      return;
    }
    res.status(500).json({
      errorCode: 1,
      message: "Internal server error",
    });
    return;
  }
};

export const getAllRoomsController = async (req: Request, res: Response) => {
  try {
    const page = +(req.query.current || 1);
    const pageSize = +(req.query.pageSize || 5);
    const { result: rooms, total } = await getAllRooms(page, pageSize);
    const pages = Math.ceil(total / pageSize);

    res.status(200).json({
      errorCode: 0,
      message: "Lấy danh sách phòng học thành công",
      data: {
        meta: {
          current: page,
          pageSize: pageSize,
          pages: pages,
          total: total,
          roomCount: rooms.length,
        },
        rooms: rooms,
      },
    });
  } catch (error) {
    res.status(500).json({
      errorCode: 1,
      message: "Internal server error",
    });
  }
};

export const updateRoomController = async (req: Request, res: Response) => {
  try {
    const { sop, tenPhong, sucChua, coSo } = req.body;

    if (!sop) {
      res.status(400).json({
        errorCode: 1,
        message: "Vui lòng cung cấp mã phòng",
      });
    }

    // Validate sucChua if provided
    if (sucChua && sucChua <= 0) {
      res.status(400).json({
        errorCode: 1,
        message: "Sức chứa phòng phải lớn hơn 0",
      });
    }

    const updatedRoom = await updateRoom(sop, {
      tenPhong,
      sucChua: sucChua ? parseInt(sucChua) : undefined,
      coSo,
    });

    res.status(200).json({
      errorCode: 0,
      message: "Cập nhật phòng học thành công",
      data: updatedRoom,
    });
  } catch (error: any) {
    if (error.message === "Phòng học không tồn tại") {
      res.status(404).json({
        errorCode: 1,
        message: "Phòng học không tồn tại trong hệ thống",
      });
    }
    res.status(500).json({
      errorCode: 1,
      message: "Internal server error",
    });
  }
};

export const deleteRoomController = async (req: Request, res: Response) => {
  try {
    const { sop } = req.params;

    if (!sop) {
      res.status(400).json({
        errorCode: 1,
        message: "Vui lòng cung cấp mã phòng",
      });
    }

    const deletedRoom = await deleteRoom(sop);

    res.status(200).json({
      errorCode: 0,
      message: "Xóa phòng học thành công",
      data: deletedRoom,
    });
  } catch (error: any) {
    if (error.message === "Phòng học không tồn tại") {
      res.status(404).json({
        errorCode: 1,
        message: "Phòng học không tồn tại trong hệ thống",
      });
    }
    res.status(500).json({
      errorCode: 1,
      message: "Internal server error",
    });
  }
};
