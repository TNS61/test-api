// utils/auth.js

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function verifyJwtToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;  // คืนค่าผู้ใช้ที่ถูกยืนยันจาก token
  } catch (error) {
    console.error('Invalid token', error);
    return null;
  }
}
