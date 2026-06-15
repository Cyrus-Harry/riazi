const BIN_ID_USERS = "6a2fc556da38895dfec29a7d";
const API_KEY = "$2a$10$ZyhnY/TqvbbO/3oHeIIsYeHsogdxE8fnK8TsDM5qJTH6IZnH5m4uC";

async function fetchUsers() {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID_USERS}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
    });
    const data = await res.json();
    return data.record.users;
}

async function saveUsers(users) {
    await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID_USERS}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY
        },
        body: JSON.stringify({ users })
    });
}

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = '⏳ در حال ثبت‌نام...';
    submitBtn.disabled = true;

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirm = document.getElementById('confirmPassword').value.trim();

    if (!username || !password) {
        alert('لطفاً نام کاربری و رمز عبور را وارد کنید.');
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        return;
    }
    if (password !== confirm) {
        alert('رمز عبور و تکرار آن مطابقت ندارند.');
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        return;
    }
    if (password.length < 4) {
        alert('رمز عبور باید حداقل ۴ کاراکتر باشد.');
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        return;
    }

    try {
        let users = await fetchUsers();
        if (users.some(u => u.username === username)) {
            alert('❌ این نام کاربری قبلاً ثبت شده است.');
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            return;
        }

        let role = 'user';
        if (username === 'admin' && password === '123456') role = 'admin';

        users.push({ username, password, role });
        await saveUsers(users);

        alert('✅ ثبت‌نام با موفقیت انجام شد. اکنون می‌توانید وارد شوید.');
        window.location.href = 'login.html';
    } catch (error) {
        alert('⚠️ خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
        console.error(error);
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});