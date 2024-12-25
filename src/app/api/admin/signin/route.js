import { promisePool } from "@/lib/db";

export async function POST(request) {
  try {
    // รับข้อมูลจาก body ของ request
    const body = await request.json();

    const { username, password } = body;

    // ตรวจสอบว่ามีข้อมูลที่ส่งมาหรือไม่
    if (!username || !password) {
      return Response.json({
        status: "error",
        message: "Please fill in all fields",
      });
    }

    // ทำการ query ข้อมูลจากฐานข้อมูลตาม username
    const [rows] = await promisePool.query(
      "SELECT * FROM admins WHERE username = ?",
      [username]
    );

    // ตรวจสอบว่ามีผู้ใช้งานนี้หรือไม่
    if (rows.length === 0) {
      return Response.json({
        status: "error",
        message: "This user does not exist",
      });
    }

    // ตรวจสอบรหัสผ่าน
    const bcrypt = require("bcryptjs");
    const validPassword = await bcrypt.compare(password, rows[0].password);

    if (!validPassword) {
      return Response.json({
        status: "error",
        message: "Invalid password",
      });
    }

    // สร้าง token และกำหนดเวลาใช้งาน 1 ชั่วโมง
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // ส่งข้อความว่าเข้าสู่ระบบสำเร็จ
    return Response.json({
      status: "ok",
      message: "Signin successful",
      token,
    });
  } catch (err) {
    return Response.json({
      status: "error",
      message: err.message,
    });
  }
}
