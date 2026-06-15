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
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.querySelector('input[name="role"]:checked').value;

    if (!username || !password) return alert('نام کاربری و رمز را وارد کنید');

    const users = await fetchUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return alert('نام کاربری یا رمز اشتباه است');

    if (role === 'admin' && user.role !== 'admin') return alert('شما مدیر نیستید');
    if (role === 'user' && user.role === 'admin') return alert('شما مدیر هستید؛ گزینه مدیر را انتخاب کنید');

    localStorage.setItem('loggedInUser', username);
    localStorage.setItem('isAdmin', role === 'admin');
    alert(`ورود موفق! خوش آمدید ${username}`);
    window.location.href = 'index.html';
});