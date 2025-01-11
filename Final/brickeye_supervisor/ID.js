const tableBody = document.getElementById('resultTableBody'); // 获取表格的tbody
document.getElementById('clear-btn').addEventListener('click', async () => {
    tableBody.innerHTML = ''; // 每次查詢前清空內容，避免數據堆疊
});


// 根據產品ID查詢產品資料
document.getElementById('searchProductBtn').addEventListener('click', async () => {
    const productId = document.getElementById('productId').value.trim(); // 取得產品ID

    if (!productId) {
        alert('請輸入產品ID');
        return;
    }

    try {
        const url = `http://localhost:3001/api/product/${productId}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('查詢失敗');
        }

        const data = await response.json();

        if (data.error) {
            alert(data.error); // 顯示錯誤訊息
        } else {
            // 顯示查詢結果
            renderTable([data]); // 使用 renderTable 函式顯示查詢結果（將其作為陣列傳遞）
        }
    } catch (error) {
        console.error('搜尋失敗', error);
        alert('搜尋失敗');
    }
});
// 渲染數據表格的函數
function renderTable(products) {
    const tableBody = document.getElementById('resultTableBody');
    tableBody.innerHTML = ''; // 每次查詢前清空內容，避免數據堆疊

    if (!products || products.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">無數據</td></tr>`;
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
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





// 初始化
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts(); // 頁面載入時獲取產品資料
    document.getElementById('filterBtn').addEventListener('click', filterProducts); // 點擊篩選按鈕時觸發篩選
});
