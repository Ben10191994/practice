const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const csvWriter = require('csv-write-stream');

// 設置 CSV 寫入器
const writer = csvWriter();
writer.pipe(fs.createWriteStream('products_data.csv'));

// 生成隨機圖片並保存至本地
function generateRandomImage(imagePath) {
    const canvas = createCanvas(200, 200);  // 創建一個 200x200 的畫布
    const ctx = canvas.getContext('2d');
    
    // 隨機填充背景顏色
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 可以加入隨機文字或其他圖案
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('產品', 50, 100);
    
    // 儲存圖片到指定的路徑
    const out = fs.createWriteStream(imagePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    
    out.on('finish', () => {
        console.log(`圖片已保存至 ${imagePath}`);
    });
}

const products = [];

for (let i = 1; i <= 5000; i++) {
    const isDefective = Math.random() > 0.6; // 隨機決定是否為劣質品
    const quality = isDefective ? '劣質品' : '良品';

    // 生成缺陷資料（確保劣質品一定有缺陷）
    const defects = isDefective 
        ? (() => {
            const possibleDefects = ['划痕', '汙點', '裁切', '大範圍污痕', '顏色汙染'];
            // 確保至少隨機選擇一種缺陷
            const selectedDefects = possibleDefects.filter(() => Math.random() > 0.8); // 減少隨機門檻以確保缺陷存在
            if (selectedDefects.length === 0) {
                // 如果隨機結果導致無缺陷，強制選擇一種缺陷
                return possibleDefects[Math.floor(Math.random() * possibleDefects.length)];
            }
            return selectedDefects.join(', ');
        })()
        : '';
    
    // 生成隨機時間
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const randomHour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
    const randomMinute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    const randomSecond = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    const detectionTime = `${year}-${month}-${day} ${randomHour}:${randomMinute}:${randomSecond}`;

    // 生成隨機圖片並儲存
    const imagePath = `images/product_${i}.png`;
    generateRandomImage(imagePath);

    // 將產品資料寫入 CSV 文件
    writer.write({
        product_id: i,
        quality: quality,
        defects: defects,
        detection_time: detectionTime,
        image_data: imagePath
    });
}

writer.end(); // 結束 CSV 寫入

console.log("所有資料已寫入 CSV 文件！");
