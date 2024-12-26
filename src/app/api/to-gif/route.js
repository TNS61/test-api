import fs from "fs";
import path from "path";
import { createCanvas, loadImage } from "canvas";
import GIFEncoder from "gifencoder";

export async function POST(request) {
  //รับจาก form data
  const body = await request.formData();
  const width = parseInt(body.get("width")) || 500;
  const height = parseInt(body.get("height")) || 500;
  const images = body.getAll("images");
  const random = Math.random().toString(36).substring(2, 8);
  const fileName = `gif-${random}.png`;
  const host = request.headers.get("host");
  // ตรวจสอบข้อมูล

  if (!images || !Array.isArray(images) || images.length === 0) {
    return new Response("A list of image URLs is required", { status: 400 });
  }

  try {
    // สร้าง encoder สำหรับ GIF
    const encoder = new GIFEncoder(width, height);
    const gifPath = path.join(process.cwd(), "public", "images", fileName);

    const stream = fs.createWriteStream(gifPath);
    encoder.createReadStream().pipe(stream);

    // ตั้งค่าพื้นฐาน
    encoder.start();
    encoder.setRepeat(0); // loop = 0 (infinite)
    encoder.setDelay(500); // 500ms per frame
    encoder.setQuality(10); // คุณภาพ

    // สร้าง canvas สำหรับแต่ละเฟรม
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    for (const imageFile of images) {


      // โหลดภาพจาก File
      const image = await imageFile.arrayBuffer();
      const img = await loadImage(Buffer.from(image));

      // วาดภาพลงบน canvas
      ctx.clearRect(0, 0, width, height);

      //ปรับ aspect ratio
      const aspectRatio = img.width / img.height;
      const newWidth = width;
      const newHeight = width / aspectRatio;
      const y = (height - newHeight) / 2;
      ctx.drawImage(img, 0, y, newWidth, newHeight);

      // เพิ่มเฟรมลงใน GIF
      encoder.addFrame(ctx);

      console.log("Frame added");
    }

    encoder.finish();

    return Response.json(
      {
        status: "ok",
        message: "Gif saved successfully!",
        url: `${host}/images/${fileName}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating GIF:", error);
    return Response.json(
      {
        status: "error",
        message: "Error generating GIF",
      },
      { status: 500 }
    );
  }
}
