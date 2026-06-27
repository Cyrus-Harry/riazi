// ============================================
// لیست ادمین‌ها با رمز عبور
// ============================================
const ADMINS = [
    { username: "admin", password: "123456" },
    { username: "cyrus-harry", password: "admin123" },
    // { username: "harry", password: "1212" },
];

// ============================================
// ثبت خودکار ادمین‌ها در دیتابیس
// ============================================
async function seedAdmins() {
    try {
        const users = await fetchUsers();
        let changed = false;
        for (const admin of ADMINS) {
            if (!users.some(u => u.username === admin.username)) {
                users.push({ ...admin, role: 'admin' });
                changed = true;
                console.log(`✅ ادمین ${admin.username} اضافه شد.`);
            }
        }
        if (changed) {
            await saveUsers(users);
            console.log('✅ لیست ادمین‌ها به‌روز شد.');
        }
    } catch (error) {
        console.error('❌ seedAdmins:', error);
    }
}

// اجرا هنگام بارگذاری صفحه
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(seedAdmins, 500);
});
