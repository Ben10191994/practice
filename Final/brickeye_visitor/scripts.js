// 取得登入表單和欄位
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

// 監聽表單提交事件
loginForm.addEventListener('submit', function(event) {
    event.preventDefault();  // 防止表單直接提交

    // 取得使用者輸入的資料
    const account = document.getElementById('account').value;
    const password = document.getElementById('password').value;

    // 重置錯誤訊息顯示
    errorMessage.style.display = 'none';
    errorMessage.innerHTML = '';

    // 檢查是否有輸入使用者名稱和密碼
    if (!account || !password) {
        errorMessage.style.display = 'block';
        errorMessage.innerHTML = '請填寫所有欄位。';
        return;
    }

    // 發送登入請求到後端
    fetch('http://localhost:3002/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.redirectUrl) {
            // 如果有返回的跳轉 URL，則進行跳轉
            window.location.href = data.redirectUrl;
        } else {
            // 顯示錯誤訊息
            errorMessage.style.display = 'block';
            errorMessage.innerHTML = data.error;
        }
    })
    .catch(error => {
        console.error('錯誤:', error);
        errorMessage.style.display = 'block';
        errorMessage.innerHTML = '伺服器錯誤，請稍後再試。';
    });
});




// // 取得登入表單和欄位
// const loginForm = document.getElementById('loginForm');
// const errorMessage = document.getElementById('errorMessage');

// // 監聽表單提交事件
// loginForm.addEventListener('submit', function(event) {
//     event.preventDefault();  // 防止表單直接提交

//     // 取得使用者輸入的資料
//     const username = document.getElementById('account').value;
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

//     // 驗證使用者名稱和密碼
//     let redirectUrl = '';
//     if (username === 'user' && password === 'user') {
//         redirectUrl = '../brickeye_user/web_brickeyehome_user.html';
//     } else if (username === 'admin' && password === 'admin') {
//         redirectUrl = '../brickeye_admin/admin-dashboard_org.html';
//     } else if (username === 'supervisor' && password === 'supervisor') {
//         redirectUrl = '../brickeye_supervisor/web_brickeyehome_user.html';
//     } else {
//         errorMessage.style.display = 'block';
//         errorMessage.innerHTML = '無效的使用者名稱或密碼。';
//         return;
//     }

//     // 跳轉至指定頁面
//     window.location.href = redirectUrl;
// });



