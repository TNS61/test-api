import { promisePool } from "@/lib/db";
import { verifyJwtToken } from "@/utils/auth";

export async function GET(request) {
  try {
    const id = request.url.split("/").pop(); // ดึง ID จาก URL

    let token = request.headers.get("Authorization")

    if (!token) {
      return Response.json({
        status: "error",
        message: "No token provided",
      });
    }

    token = token.split(" ")[1];

    const auth = await verifyJwtToken(token); // ตรวจสอบ Token ว่าถูกต้องหรือไม่

    if (!auth) {
      return Response.json({
        status: "error",
        message: "Unauthorized",
      });
    }

    // ทำการ query ข้อมูลจากฐานข้อมูลตาม ID
    const [rows] = await promisePool.query("SELECT * FROM users WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return Response.json({
        status: "error",
        message: "User not found",
      });
    }

    // ส่งข้อมูลผู้ใช้ที่พบ
    return Response.json({
      status: "ok",
      data: rows[0],
    });
  } catch (err) {
    return Response.json({
      status: "error",
      message: err.message,
    });
  }
}
