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
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirm = document.getElementById('confirmPassword').value.trim();

    if (!username || !password) return alert('نام کاربری و رمز عبور را پر کنید');
    if (password !== confirm) return alert('رمز عبور مطابقت ندارد');
    if (password.length < 4) return alert('حداقل ۴ کاراکتر');

    let users = await fetchUsers();
    if (users.some(u => u.username === username)) return alert('نام کاربری تکراری است');

    let role = 'user';
    if (username === 'admin' && password === '123456') role = 'admin';

    users.push({ username, password, role });
    await saveUsers(users);

    alert('ثبت‌نام موفق! اکنون وارد شوید.');
    window.location.href = 'login.html';
});