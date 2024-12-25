import { promisePool } from "@/lib/db";
import { verifyJwtToken } from "@/utils/auth";

// แสดงข้อมูลทั้งหมด
export async function GET(request) {
  try {

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
    


    const [rows] = await promisePool.query("SELECT * FROM users");
    return Response.json({
      status: "ok",
      data: rows,
    });
  } catch (err) {
    return Response.json({
      status: "error",
      message: err.message,
    });
  }
}

// เพิ่มข้อมูล
export async function POST(request) {
  try {
    const body = await request.json();

    const { firstName, lastName, phoneNumber, email } = body;

    if (!firstName || !lastName || !phoneNumber || !email) {
      return Response.json({
        status: "error",
        message: "All fields are required",
      });
    }

    const [rows] = await promisePool.query(
      "INSERT INTO users (firstName, lastName, phoneNumber, email) VALUES (?, ?, ?, ?)",
      [firstName, lastName, phoneNumber, email]
    );

    if (!rows.affectedRows) {
      throw new Error("Failed to insert user");
    }

    const id = rows.insertId;

    const [user] = await promisePool.query("SELECT * FROM users WHERE id = ?", [
      id,
    ]);

    return Response.json({
      status: "ok",
      message: "User added successfully",
      data: user[0],
    });
  } catch (err) {
    return Response.json({
      status: "error",
      message: err.message,
    });
  }
}
