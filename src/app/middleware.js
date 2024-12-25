// app/middleware.js หรือ pages/middleware.js

import { NextResponse } from "next/server";
import { verifyJwtToken } from "./utils/auth"; // ฟังก์ชันตรวจสอบ JWT

export async function middleware(req) {
  // ดึง token จาก Authorization header
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // ตรวจสอบความถูกต้องของ JWT token
    const user = await verifyJwtToken(token);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // หาก token ถูกต้อง ส่งการอนุญาต
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

// คุณสามารถใช้ pathSegments เพื่อจำกัด middleware ให้ทำงานในบางเส้นทาง
// ได้แก่ users , users/[id] , admin/signin , admin/me
export const config = {
  api: {
    bodyParser: false,
  },

    middleware: "auth",
    pathSegments: ["users", "admin/me"],
};
