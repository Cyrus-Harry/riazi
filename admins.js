const ADMINS = [
    { username: "admin", password: "123456" },
    { username: "cyrus-harry", password: "admin123" },
];

async function seedAdmins() {
    try {
        const users = await fetchUsers();
        let changed = false;
        for (const admin of ADMINS) {
            if (!users.some(u => u.username === admin.username)) {
                users.push({ ...admin, role: 'admin' });
                changed = true;
                console.log('✅ ادمین اضافه شد:', admin.username);
            }
        }
        if (changed) {
            await saveUsers(users);
            console.log('✅ ادمین‌ها ذخیره شدند.');
        }
    } catch (e) {
        console.error('❌ خطا در seedAdmins:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(seedAdmins, 500);
});
