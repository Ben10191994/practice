// 取得登入表單和欄位
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

// 監聽表單提交事件
loginForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // 防止表單直接提交

    // 取得使用者輸入的資料
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 重置錯誤訊息顯示
    errorMessage.style.display = 'none';
    errorMessage.innerHTML = '';

    // 檢查是否有輸入使用者名稱和密碼
    if (!username || !password) {
        errorMessage.style.display = 'block';
        errorMessage.innerHTML = '請填寫所有欄位。';
        return;
    }

    try {
        // 向後端發送登入請求
        const response = await fetch('http://localhost:3002/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert(result.message);

            // 根據角色跳轉到不同頁面
            if (result.role === 'admin') {
                window.location.href = 'system_administrator/admin-dashboard_org.html';
            } else if (result.role === 'user') {
                window.location.href = 'Final/web_brickeyehome.html';
            } else if (result.role === 'supervisor') {
                window.location.href = 'Final/web_brickeyehome.html';
            } else {
                window.location.href = 'default.html'; // 預設頁面
            }
        } else {
            errorMessage.style.display = 'block';
            errorMessage.innerHTML = result.message;
        }
    } catch (error) {
        console.error('登入失敗:', error);
        errorMessage.style.display = 'block';
        errorMessage.innerHTML = '登入過程中發生錯誤。';
    }
});


// // 取得登入表單和欄位
// const loginForm = document.getElementById('loginForm');
// const errorMessage = document.getElementById('errorMessage');

// // 監聽表單提交事件
// loginForm.addEventListener('submit', function(event) {
//     event.preventDefault();  // 防止表單直接提交

//     // 取得使用者輸入的資料
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;

//     // 重置錯誤訊息顯示
//     errorMessage.style.display = 'none';
//     errorMessage.innerHTML = '';

//     // 檢查是否有輸入使用者名稱和密碼
//     if (!username || !password) {
//         errorMessage.style.display = 'block';
//         errorMessage.innerHTML = '請填寫所有欄位。';
//         return;
//     }

//     // 簡單的登入驗證（這裡可以替換成實際的伺服器驗證邏輯）
//     if (username === 'user' && password === 'user') {
//         // 如果驗證成功，跳轉到指定頁面（例如：首頁）
//         window.location.href = 'Final/web_brickeyehome.html';  // 更改為你想要跳轉的網頁
//     } else {
//         // 如果使用者名稱或密碼錯誤
//         errorMessage.style.display = 'block';
//         errorMessage.innerHTML = '無效的使用者名稱或密碼。';
//     }
//     if (username === 'admin' && password === 'admin') {
//         // 如果驗證成功，跳轉到指定頁面（例如：首頁）
//         window.location.href = 'system_administrator/admin-dashboard_org.html';  // 更改為你想要跳轉的網頁
//     } else {
//         // 如果使用者名稱或密碼錯誤
//         errorMessage.style.display = 'block';
//         errorMessage.innerHTML = '無效的使用者名稱或密碼。';
//     }
//     if (username === 'supervisor' && password === 'supervisor') {
//         // 如果驗證成功，跳轉到指定頁面（例如：首頁）
//         window.location.href = 'Final/web_brickeyehome.html';  // 更改為你想要跳轉的網頁
//     } else {
//         // 如果使用者名稱或密碼錯誤
//         errorMessage.style.display = 'block';
//         errorMessage.innerHTML = '無效的使用者名稱或密碼。';
//     }
// });
