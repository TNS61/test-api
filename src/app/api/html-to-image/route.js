import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export async function POST(request) {
  const body = await request.formData();
  //random string 6 digit
  const random = Math.random().toString(36).substring(2, 8);
  const fileName = `photo-${random}.png`;
  const host = request.headers.get("host");

  const firstName = body.get("firstName");
  const lastName = body.get("lastName");
  const imageData = body.get("image");

  const img = await imageData.arrayBuffer();
  const imgBuffer = Buffer.from(img);
  const imgBase64 = imgBuffer.toString("base64");
  const imgSrc = `data:image/png;base64,${imgBase64}`;

  const html = `
 <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>

  <style>
    body {
      width: 1920px !important;
      height: 1080px !important;
    }
      #img{
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;

      }
  </style>

  <body>
  <h1>Hello ${firstName} ${lastName}</h1>
    <img src="${imgSrc}" alt="image" id="img" />
  </body>
</html>

  `;

  if (!html) {
    return new Response("HTML content is required", { status: 400 });
  }

  try {
    // เปิด Puppeteer browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // ตั้งค่าขนาดหน้าจอ browser ตาม html ที่สร้างไว้
    await page.setViewport({ width: 1920, height: 1080 });

    // ตั้งค่าหน้า HTML
    await page.setContent(html);

    // ถ่ายภาพหน้าจอ
    const screenshotBuffer = await page.screenshot();

    // ปิด Puppeteer browser
    await browser.close();

    // กำหนด path ที่จะบันทึกไฟล์ภาพ
    const filePath = path.join(process.cwd(), "public", "images", fileName);

    // ตรวจสอบว่าโฟลเดอร์ images มีอยู่หรือไม่ ถ้าไม่มีก็สร้าง
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // บันทึกไฟล์ภาพลงในเครื่อง
    fs.writeFileSync(filePath, screenshotBuffer);

    // ส่ง path ของไฟล์ที่บันทึกลงเครื่องกลับ
    //  return new Response(JSON.stringify({ message: 'Image saved successfully!', path: `${host}/images/${fileName}` }), {
    //    status: 200,
    //    headers: { 'Content-Type': 'application/json' },
    //  });

    return Response.json(
      {
        status: "ok",
        message: "Image saved successfully!",
        url: `${host}/images/${fileName}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
