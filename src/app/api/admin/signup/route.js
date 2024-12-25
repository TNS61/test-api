import { promisePool } from "@/lib/db";

export async function POST(request) {
  try {
    // รับข้อมูลจาก body ของ request
    const body = await request.json();

    const { username, password, name } = body;

    //เข้ารหัส password
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ตรวจสอบว่ามีข้อมูลที่ส่งมาหรือไม่
    if (!username || !password || !name) {
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
    if (rows.length > 0) {
      return Response.json({
        status: "error",
        message: "This user already exists",
      });
    }

    // ทำการ insert ข้อมูลผู้ใช้ใหม่ลงฐานข้อมูล
    await promisePool.query("INSERT INTO admins SET ?", {
      username,
      password: hashedPassword,
      name,
    });

    // สร้าง token และกำหนดเวลาใช้งาน 1 วัน
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // ส่งข้อความว่าสมัครสมาชิกสำเร็จ
    return Response.json({
      status: "ok",
      message: "Signup successful",
      token,
    });
  } catch (err) {
    return Response.json({
      status: "error",
      message: err.message,
    });
  }
}
