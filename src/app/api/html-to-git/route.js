import fs from "fs";
import path from "path";
import { createCanvas, loadImage } from "canvas";
import GIFEncoder from "gifencoder";
import puppeteer from "puppeteer";

export async function POST(request) {
  //   //รับจาก form data
  const body = await request.formData();
  const width = parseInt(body.get("width")) || 500;
  const height = parseInt(body.get("height")) || 500;
  const images = body.getAll("images");
  const description = JSON.parse(body.get("description"));
  const name = JSON.parse(body.get("name"));
  const random = Math.random().toString(36).substring(2, 8);
  const fileName = `gif-image-${random}.png`;
  const host = request.headers.get("host");

  const html = (currentName, currentDescription, currentImages) => {
    return `
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
         background: linear-gradient(90deg, #f12711, #f5af19);
       }
         h1 {
            color: white;
            text-align: center;
            margin-top: 50px;
         }
            p {
                color: white;
                text-align: center;
            }

            #img{
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: top center;
            }
     </style>

     <body>
     <h1>Hello ${currentName}</h1>
      <p>${currentDescription}</p>
        <img src="${currentImages}" alt="image" id="img" />

     </body>

    `;
  };

  // ตรวจสอบข้อมูล
  if (!images || !Array.isArray(images) || images.length === 0) {
    return new Response("A list of image URLs is required", { status: 400 });
  }

  try {
    const imageHTML = images.map(async (image, index) => {
      // เปิด Puppeteer browser
      const browser = await puppeteer.launch();

      const page = await browser.newPage();

      // ตั้งค่าขนาดหน้าจอ browser ตาม html ที่สร้างไว้
      await page.setViewport({ width: 1920, height: 1080 });

      // ตั้งค่าหน้า HTML
      await page.setContent(html(name[index], description[index], image));

      // ถ่ายภาพหน้าจอ
      const screenshotBuffer = await page.screenshot();

      // ปิด Puppeteer browser
      await browser.close();

      const filePath = path.join(process.cwd(), "public", "images", fileName);

      // ตรวจสอบว่าโฟลเดอร์ images มีอยู่หรือไม่ ถ้าไม่มีก็สร้าง
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // บันทึกไฟล์ภาพลงในเครื่อง
      fs.writeFileSync(filePath, screenshotBuffer);

      // ส่งภาพกลับเป็น Response
      const base64 = screenshotBuffer.toString("base64");
      const imageString = `data:image/png;base64,${base64}`;

      console.log(
        "Image saved successfully!",
        index,
        name[index],
        description[index]
      );

      return imageString;
    });

    const result = await Promise.all(imageHTML);

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

    for (const imageFile of result) {
      // โหลดภาพจาก Base64
      //   const img = await loadImage(imageFile);
      //   console.log("Image loaded", img);
      //   // วาดภาพลงบน canvas
      //   ctx.clearRect(0, 0, width, height);
      //   //ปรับ aspect ratio
      //   //   const aspectRatio = img.width / img.height;
      //   //   const newWidth = width;
      //   //   const newHeight = width / aspectRatio;
      //   //   const y = (height - newHeight) / 2;
      //   ctx.drawImage(img, 0, y, width, height);
      //   // เพิ่มเฟรมลงใน GIF
      //   encoder.addFrame(ctx);
      //   console.log("Frame added");
    }

    encoder.finish();

    return Response.json(
      {
        status: "ok",
        message: "Gif saved successfully!",
        url: `${host}/images/${fileName}`,
        result: result[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response("Error generating image", { status: 500 });
  }

  //   try {
  //     // สร้าง encoder สำหรับ GIF
  //     const encoder = new GIFEncoder(width, height);
  //     const gifPath = path.join(process.cwd(), "public", "images", fileName);

  //     const stream = fs.createWriteStream(gifPath);
  //     encoder.createReadStream().pipe(stream);

  //     // ตั้งค่าพื้นฐาน
  //     encoder.start();
  //     encoder.setRepeat(0); // loop = 0 (infinite)
  //     encoder.setDelay(500); // 500ms per frame
  //     encoder.setQuality(10); // คุณภาพ

  //     // สร้าง canvas สำหรับแต่ละเฟรม
  //     const canvas = createCanvas(width, height);
  //     const ctx = canvas.getContext("2d");

  //     for (const imageFile of images) {

  //       // โหลดภาพจาก File
  //       const image = await imageFile.arrayBuffer();
  //       const img = await loadImage(Buffer.from(image));

  //       // วาดภาพลงบน canvas
  //       ctx.clearRect(0, 0, width, height);

  //       //ปรับ aspect ratio
  //       const aspectRatio = img.width / img.height;
  //       const newWidth = width;
  //       const newHeight = width / aspectRatio;
  //       const y = (height - newHeight) / 2;
  //       ctx.drawImage(img, 0, y, newWidth, newHeight);

  //       // เพิ่มเฟรมลงใน GIF
  //       encoder.addFrame(ctx);

  //       console.log("Frame added");
  //     }

  //     encoder.finish();

  //     return Response.json(
  //       {
  //         status: "ok",
  //         message: "Gif saved successfully!",
  //         url: `${host}/images/${fileName}`,
  //       },
  //       { status: 200 }
  //     );
  //   } catch (error) {
  //     console.error("Error generating GIF:", error);
  //     return Response.json(
  //       {
  //         status: "error",
  //         message: "Error generating GIF",
  //       },
  //       { status: 500 }
  //     );
  //   }

  //   try {
  //     // เปิด Puppeteer browser
  // const browser = await puppeteer.launch();
  //     const page = await browser.newPage();

  //     // ตั้งค่าขนาดหน้าจอ browser ตาม html ที่สร้างไว้
  //     await page.setViewport({ width: 1920, height: 1080 });

  //     // ตั้งค่าหน้า HTML
  //     await page.setContent(html);

  //     // ถ่ายภาพหน้าจอ
  //     const screenshotBuffer = await page.screenshot();

  //     // ปิด Puppeteer browser
  //     await browser.close();

  //     // กำหนด path ที่จะบันทึกไฟล์ภาพ
  //     const filePath = path.join(process.cwd(), "public", "images", fileName);

  //     // ตรวจสอบว่าโฟลเดอร์ images มีอยู่หรือไม่ ถ้าไม่มีก็สร้าง
  //     const dirPath = path.dirname(filePath);
  //     if (!fs.existsSync(dirPath)) {
  //       fs.mkdirSync(dirPath, { recursive: true });
  //     }

  //     // บันทึกไฟล์ภาพลงในเครื่อง
  //     fs.writeFileSync(filePath, screenshotBuffer);

  //     // ส่ง path ของไฟล์ที่บันทึกลงเครื่องกลับ
  //     //  return new Response(JSON.stringify({ message: 'Image saved successfully!', path: `${host}/images/${fileName}` }), {
  //     //    status: 200,
  //     //    headers: { 'Content-Type': 'application/json' },
  //     //  });

  //     return Response.json(
  //       {
  //         status: "ok",
  //         message: "Image saved successfully!",
  //         url: `${host}/images/${fileName}`,
  //       },
  //       { status: 200 }
  //     );
  //   } catch (error) {
  //     console.error("Error generating image:", error);
  //     return new Response("Error generating image", { status: 500 });
  //   }
}
