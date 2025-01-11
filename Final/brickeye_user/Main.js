// 顯示產品列表(產品資訊:產品ID、品質、缺陷、檢測時間、圖片資料等)
function displayProducts(products) {
    const tableBody = document.querySelector('#productsTable tbody');
    tableBody.innerHTML = '';  // 清空表格內容

    products.forEach(product => {
        const row = document.createElement('tr');
        
        // 如果 image_data 存在，則顯示圖片；如果沒有，顯示一個預設的訊息
        const imageContent = product.image_data 
            ? `<img src="http://localhost:3001/${product.image_data}" alt="Product Image" style="max-width: 100px; max-height: 100px;">` 
            : '無圖片';

        row.innerHTML = `
            <td>${product.product_id || 'N/A'}</td>
            <td>${product.quality}</td>
            <td>${product.defects || '無'}</td>
            <td>${product.detection_time ? new Date(product.detection_time).toLocaleString() : '無'}</td>
            <td>${imageContent}</td>  <!-- 顯示圖片或無圖片 -->
        `;
        tableBody.appendChild(row);
    });
}

// 篩選產品(更新後)(隨缺陷選擇更新顯示的資料)(修改後)

function filterProducts() {
    const quality = document.getElementById('quality').value;

    // 取得所有被選中的缺陷
    const selectedDefects = Array.from(document.querySelectorAll('.checkbox-group input:checked'))
        .map(checkbox => checkbox.value);

    // 获取筛选范围
    const start = document.getElementById('start').value || 0;
    const end = document.getElementById('end').value || 50; // 默认显示50条数据

    // 取得時間區間
    const startTime = document.getElementById('startTime').value; // 開始時間
    const endTime = document.getElementById('endTime').value; // 結束時間

    // 構建查詢 URL，使用 encodeURIComponent 編碼
    const url = `http://localhost:3001/api/products/filter?quality=${encodeURIComponent(quality)}&defects=${encodeURIComponent(selectedDefects.join(','))}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;

    console.log("Fetching URL:", url);  // 輸出生成的 URL 用於調試

    fetch(url)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Network response was not ok: ${text}`);
                });
            }
            return response.json();  // 確保返回的是 JSON 格式
        })
        .then(data => {
            displayProducts(data);  // 顯示篩選後的資料
        })
        .catch(error => console.error('Error:', error));
}


// 頁面加載時不自動獲取所有產品，只在用戶篩選後顯示
document.addEventListener('DOMContentLoaded', () => {
    // 點擊篩選按鈕時觸發篩選
    document.getElementById('filterBtn').addEventListener('click', filterProducts); // 點擊篩選按鈕時觸發篩選
});

// 獲取篩選資料筆數(修改後)(符合條件產品數量: 500，隨缺陷選擇變化)

document.getElementById('filterBtn').addEventListener('click', async () => {
    try {
        const qualitySelect = document.getElementById('quality');
        const selectedQuality = qualitySelect.value; // 获取选中的质量筛选条件

        // 获取选中的缺陷类型
        const checkedDefects = Array.from(document.querySelectorAll('.checkbox-group input:checked'))
            .map(checkbox => checkbox.value);
        const defectString = checkedDefects.join(',');

        // 获取时间区间
        const startTime = document.getElementById('startTime').value; // 获取开始时间
        const endTime = document.getElementById('endTime').value; // 获取结束时间

        // 构建请求 URL，加入时间区间
        const url = `http://localhost:3001/api/product-count?quality=${encodeURIComponent(selectedQuality)}&defects=${encodeURIComponent(defectString)}&start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`;

        // 发送请求
        const response = await fetch(url);
        const data = await response.json();

        // 显示符合条件的产品数量
        document.getElementById('countting').innerText = `符合條件產品數量: ${data.count}`;
    } catch (error) {
        console.error('获取数据失败', error);
        document.getElementById('countting').innerText = '無法獲取數據';
    }
});
