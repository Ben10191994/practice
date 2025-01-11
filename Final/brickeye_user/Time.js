//測試修改後
document.getElementById('timeSearchBtn').addEventListener('click', async () => {
    const startTime = document.getElementById('start-Time').value; // 获取开始时间
    const endTime = document.getElementById('end-Time').value; // 获取结束时间

    if (!startTime || !endTime) {
        alert('請選擇時間區間');
        return;
    }

    try {
        // 构建API请求URL，并传递时间区间
        const url = `http://localhost:3001/api/products/time-range?start=${startTime}&end=${endTime}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('查詢失敗');
        }

        const data = await response.json();

        // 顯示符合條件的產品統計信息
        document.getElementById('totalCount').innerText = `產品總數：${data.good + data.defective}`;
        document.getElementById('goodCount').innerText = `良品總數：${data.good}`;
        document.getElementById('defectiveCount').innerText = `劣質品總數：${data.defective}`;
        document.getElementById('defectiveRate').innerText = `劣質品比率：${data.defectiveRate}%`;

        // 渲染符合條件的數據表格
        renderTable(data.products); // 確保後端返回的數據格式符合要求
    } catch (error) {
        console.error('搜尋失敗', error);
        document.getElementById('totalCount').innerText = '無法獲取數據';
        document.getElementById('goodCount').innerText = '無法獲取數據';
        document.getElementById('defectiveCount').innerText = '無法獲取數據';
        document.getElementById('defectiveRate').innerText = '無法獲取數據';
    }
});


// 渲染符合條件的產品數據表格
function renderTable(products) {
    const tableBody = document.getElementById('resultTableBody');
    tableBody.innerHTML = ''; // 每次查询前清空内容，避免数据堆叠

    if (!products || products.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">無數據</td></tr>`;
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');

        // 如果質量字段表示為劣質品，設定背景色為粉紅色
        if (product.quality === '劣質品') {
            row.style.backgroundColor = '#FFC0CB'; // 粉紅色
        }

        row.innerHTML = `
            <td>${product.product_id || 'N/A'}</td>
            <td>${product.quality || 'N/A'}</td>
            <td>${product.defects || '無'}</td>
            <td>${product.detection_time ? new Date(product.detection_time).toLocaleString() : '無'}</td>
            <td>${product.image_data 
                ? `<img src="http://localhost:3001/${product.image_data}" alt="Product Image" style="max-width:100px;max-height:100px;">`
                : '無圖片'}</td>
        `;
        tableBody.appendChild(row);
    });
}
