import { promisePool } from "@/lib/db";

export async function GET(request) {
  try {
    // รับ Token จาก Header Authorization
    const token = request.headers.get("Authorization");

    // ตรวจสอบว่ามี Token หรือไม่
    if (!token) {
      return Response.json({
        status: "error",
        message: "No token provided",
      });
    }

    // ตรวจสอบ Token ว่าถูกต้องหรือไม่
    const jwt = require("jsonwebtoken");
    const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

    // ทำการ query ข้อมูลจากฐานข้อมูลตาม username
    const [rows] = await promisePool.query(
      "SELECT * FROM admins WHERE username = ?",
      [verified.username]
    );

    // ตรวจสอบว่ามีผู้ใช้งานนี้หรือไม่
    if (rows.length === 0) {
      return Response.json({
        status: "error",
        message: "This user does not exist",
      });
    }

    // เช้็คเวลาหมดอายุของ Token
    const now = Math.floor(Date.now() / 1000);
    if (verified.exp < now) {
      return Response.json({
        status: "error",
        message: "Token has expired",
      });
    }

    // ส่งข้อมูลผู้ใช้ที่พบ

    return Response.json({
      status: "ok",
      data: rows[0],
      timeOut: new Date(verified.exp * 1000).toLocaleString("en-TH", {
        timeZone: "Asia/Bangkok",
      }),
    });
  } catch (err) {
    return Response.json({
      status: "error",
      message: err.message,
    });
  }
}
