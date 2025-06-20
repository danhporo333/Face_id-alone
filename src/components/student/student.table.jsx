import React, { useState, useEffect } from "react";
import { Card, Tag, Row, Col, Button, Spin, notification } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { getTimetableByAccount } from "../../services/api.service";
import "../../style/student/timetable.css";

const TimetableTable = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [allData, setAllData] = useState([]); // raw tkbs
  const [weekData, setWeekData] = useState([]); // filtered
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterWeek();
  }, [currentWeek, allData]);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await getTimetableByAccount();
      // lấy mảng tkbs
      const tkbs = res.data?.tkbs || [];
      console.log("tkbs", tkbs);
      // transform về định dạng dễ dùng
      const arr = tkbs.map((x) => ({
        id: x.id,
        day: x.thu,
        date: x.ngay, // "09/05/2025"
        start: x.tietBD,
        end: x.tietKT,
        subject: x.monHoc.tenmh,
        room: x.phong.tenPhong,
        teacher: `${x.giangVien.hoGV} ${x.giangVien.tenGV}`,
        attendance: x.diemDanh?.[0],
      }));
      setAllData(arr);
    } catch (e) {
      notification.error({ message: "Lỗi", description: "Không tải TKB" });
    } finally {
      setLoading(false);
    }
  }

  // parse "DD/MM/YYYY" thành Date
  const parse = (s) => {
    const [d, m, y] = s.split("/");
    return new Date(+y, +m - 1, +d);
  };

  const filterWeek = () => {
    if (!allData.length) return setWeekData([]);
    const now = new Date();
    // tìm thứ 2 của tuần hiện tại + offset
    const mon = new Date(now);
    mon.setDate(now.getDate() - now.getDay() + 1 + currentWeek * 7);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const f = allData
      .filter((i) => {
        const dt = parse(i.date);
        return dt >= mon && dt <= sun;
      })
      .sort((a, b) => {
        const da = parse(a.date),
          db = parse(b.date);
        if (da - db) return da - db;
        return a.start - b.start;
      });
    setWeekData(f);
  };

  const weekRange = () => {
    const now = new Date();
    const mon = new Date(now);
    mon.setDate(now.getDate() - now.getDay() + 1 + currentWeek * 7);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const fmt = (d) => d.toLocaleDateString("vi-VN");
    return `${fmt(mon)} – ${fmt(sun)}`;
  };

  if (loading) {
    return (
      <div className="timetable-list-container">
        <Spin tip="Đang tải..." size="large" />
      </div>
    );
  }

  return (
    <div className="timetable-list-container">
      <h2 className="timetable-title">THỜI KHÓA BIỂU</h2>
      <div className="week-navigation">
        <Button
          icon={<LeftOutlined />}
          onClick={() => setCurrentWeek((w) => w - 1)}
        />
        <Tag icon={<CalendarOutlined />}>{weekRange()}</Tag>
        <Button
          icon={<RightOutlined />}
          onClick={() => setCurrentWeek((w) => w + 1)}
        />
      </div>
      <div className="timetable-cards">
        {weekData.length ? (
          weekData.map((it) => (
            <Card key={it.id} className="timetable-card" bordered={false}>
              <Row gutter={[16, 8]} align="middle">
                <Col span={6}>
                  <Tag color="blue">
                    {it.day}, {it.date}
                  </Tag>
                </Col>
                <Col span={4}>
                  <ClockCircleOutlined /> Tiết {it.start}-{it.end}
                </Col>
                <Col span={5}>{it.subject}</Col>
                <Col
                  style={{ display: "flex", justifyContent: "flex-end" }}
                  span={8}
                >
                  Phòng: {it.room}
                </Col>
                {/* <Col span={2}>
                  <EnvironmentOutlined /> {it.teacher}
                </Col> */}
              </Row>
            </Card>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: 50, color: "#999" }}>
            <CalendarOutlined style={{ fontSize: 48 }} />
            <p>Không có lịch tuần này</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableTable;
