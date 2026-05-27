// js/auth.js

// 密碼顯示/隱藏切換功能
window.togglePassword = function(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈'; // 隱藏密碼的圖示
    } else {
        input.type = 'password';
        btn.textContent = '👁️'; // 顯示密碼的圖示
    }
};

// 顯示錯誤訊息的輔助函數
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    } else {
        alert(message);
    }
}

// 取得資料庫 (從 LocalStorage 讀取)
function getDB() {
    const db = localStorage.getItem('MOCK_DB');
    return db ? JSON.parse(db) : {
        "admin": "admin123" // 預設一組測試帳號
    };
}

// 儲存資料庫 (寫入 LocalStorage)
function saveDB(db) {
    localStorage.setItem('MOCK_DB', JSON.stringify(db));
}

// 當網頁載入完成後執行事件綁定
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 註冊表單處理
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault(); // 阻止表單預設送出行為
            const account = document.getElementById('account').value.trim();
            const password = document.getElementById('password').value;
            const confirm_password = document.getElementById('confirm_password').value;

            if (password !== confirm_password) {
                return showError('兩次輸入的密碼不一致，請重新確認。');
            }

            const db = getDB();
            if (db[account]) {
                return showError('這個學號/信箱已經被註冊過了！');
            }

            // 註冊成功
            db[account] = password;
            saveDB(db);
            alert('註冊成功！即將為您跳轉至登入頁面。');
            window.location.href = 'accountlogin.html';
        });
    }

    // 2. 登入表單處理
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const account = document.getElementById('account').value.trim();
            const password = document.getElementById('password').value;

            const db = getDB();
            if (!db[account]) {
                return showError('找不到此帳號，請確認學號或信箱是否正確。');
            }

            if (db[account] !== password) {
                return showError('密碼錯誤，請重新輸入。');
            }

            // 登入成功
            localStorage.setItem('currentUser', account);
            window.location.href = 'index.html';
        });
    }

    // 3. 忘記密碼表單處理
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const account = document.getElementById('account').value.trim();
            const db = getDB();

            if (!db[account]) {
                return showError('找不到此帳號，請確認輸入是否正確。');
            }

            // 產生 6 位數驗證碼
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            
            // 存入暫存
            localStorage.setItem('reset_account', account);
            localStorage.setItem('reset_code', code);
            
            // 模擬寄信 (用 alert 直接顯示給使用者看)
            alert(`[模擬郵件寄送成功]\n寄送至：${account}\n\n您的驗證碼為：${code}\n\n(請記住此驗證碼，並在下一頁輸入)`);
            window.location.href = 'reset_password.html';
        });
    }

    // 4. 重設密碼表單處理
    const resetForm = document.getElementById('resetForm');
    if (resetForm) {
        resetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const code = document.getElementById('code').value.trim();
            const newPassword = document.getElementById('new_password').value;
            
            const savedAccount = localStorage.getItem('reset_account');
            const savedCode = localStorage.getItem('reset_code');

            if (!savedAccount || !savedCode) {
                return showError('驗證資料遺失，請重新申請忘記密碼。');
            }

            if (code !== savedCode) {
                return showError('驗證碼錯誤。');
            }

            // 重設成功
            const db = getDB();
            db[savedAccount] = newPassword;
            saveDB(db);
            
            // 清除暫存
            localStorage.removeItem('reset_account');
            localStorage.removeItem('reset_code');
            
            alert('密碼重設成功！請使用新密碼重新登入。');
            window.location.href = 'accountlogin.html';
        });
    }
});
