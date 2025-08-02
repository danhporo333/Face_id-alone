import { prisma } from "config/client";
import { paginate } from "utils/paginate";

interface IRoom {
  tenPhong: string;
  sucChua: number;
  coSo: string;
}

export const createRoom = async (room: IRoom) => {
  try {
    // Kiểm tra phòng đã tồn tại
    const existingRoom = await prisma.phong.findFirst({
      where: {
        tenPhong: room.tenPhong,
        coSo: room.coSo,
      },
    });

    if (existingRoom) {
      throw new Error("Phòng học này đã tồn tại");
    }

    const newRoom = await prisma.phong.create({
      data: {
        tenPhong: room.tenPhong,
        sucChua: room.sucChua,
        coSo: room.coSo,
      },
      include: {
        tkb: true,
      },
    });
    return newRoom;
  } catch (error) {
    throw error;
  }
};

export const getAllRooms = async (page: number, pageSize: number) => {
  try {
    // const rooms = await prisma.phong.findMany({
    //   include: {
    //     tkb: true,
    //   },
    // });
    // return rooms;
    return paginate(prisma.phong, page, pageSize, { tkb: true });
  } catch (error) {
    throw error;
  }
};

export const updateRoom = async (sop: string, room: Partial<IRoom>) => {
  try {
    const existingRoom = await prisma.phong.findUnique({
      where: { sop },
    });

    if (!existingRoom) {
      throw new Error("Phòng học không tồn tại");
    }

    const updatedRoom = await prisma.phong.update({
      where: { sop },
      data: {
        tenPhong: room.tenPhong,
        sucChua: room.sucChua,
        coSo: room.coSo,
      },
      include: {
        tkb: true,
      },
    });
    return updatedRoom;
  } catch (error) {
    throw error;
  }
};

export const deleteRoom = async (sop: string) => {
  try {
    const existingRoom = await prisma.phong.findUnique({
      where: { sop },
    });

    if (!existingRoom) {
      throw new Error("Phòng học không tồn tại");
    }

    const deletedRoom = await prisma.phong.delete({
      where: { sop },
      include: {
        tkb: true,
      },
    });
    return deletedRoom;
  } catch (error) {
    throw error;
  }
};
