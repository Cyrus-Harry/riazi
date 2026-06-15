const BIN_ID_USERS = "6a2fc556da38895dfec29a7d";
const API_KEY = "$2a$10$ZyhnY/TqvbbO/3oHeIIsYeHsogdxE8fnK8TsDM5qJTH6IZnH5m4uC";

async function fetchUsers() {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID_USERS}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
    });
    const data = await res.json();
    return data.record.users;
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = '⏳ در حال ورود...';
    submitBtn.disabled = true;

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.querySelector('input[name="role"]:checked').value;

    if (!username || !password) {
        alert('لطفاً نام کاربری و رمز عبور را وارد کنید.');
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        return;
    }

    try {
        const users = await fetchUsers();
        const user = users.find(u => u.username === username);

        if (!user) {
            alert('❌ این نام کاربری ثبت نشده است.');
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            return;
        }

        if (user.password !== password) {
            alert('❌ رمز عبور اشتباه است.');
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            return;
        }

        // بررسی نقش
        if (role === 'admin' && user.role !== 'admin') {
            alert('❌ شما مدیر نیستید. لطفاً گزینه «عضو عادی» را انتخاب کنید.');
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            return;
        }
        if (role === 'user' && user.role === 'admin') {
            alert('❌ شما مدیر هستید. لطفاً گزینه «مدیر» را انتخاب کنید.');
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            return;
        }

        localStorage.setItem('loggedInUser', username);
        localStorage.setItem('isAdmin', role === 'admin');
        alert(`✅ ورود موفق! خوش آمدید ${username} (${role === 'admin' ? 'مدیر' : 'عضو عادی'})`);
        window.location.href = 'index.html';
    } catch (error) {
        alert('⚠️ خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
        console.error(error);
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});