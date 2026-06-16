// =====================================================
// لیست ادمین‌های سایت با نام کاربری و رمز عبور مخصوص
// =====================================================
const ADMINS = [
    { username: "admin", password: "123456" },
    { username: "kazem", password: "12345" },
    // { username: "ali_admin", password: "ali789" },
    // { username: "math_master", password: "math2024" }a
];

// =====================================================
// تابع ثبت خودکار ادمین‌ها در دیتابیس JSONBin
// =====================================================
async function seedAdmins() {
    try {
        // 1. دریافت لیست کاربران از دیتابیس
        const users = await fetchUsers(); // این تابع از api.js می‌آید
        let changed = false;

        // 2. بررسی هر ادمین در لیست
        for (const admin of ADMINS) {
            const exists = users.some(u => u.username === admin.username);
            if (!exists) {
                // اگر ادمین در دیتابیس نبود، اضافه کن
                users.push({
                    username: admin.username,
                    password: admin.password,
                    role: 'admin'
                });
                changed = true;
                console.log(`✅ ادمین ${admin.username} به دیتابیس اضافه شد.`);
            }
        }

        // 3. اگر تغییری ایجاد شده، دیتابیس را به‌روز کن
        if (changed) {
            await saveUsers(users); // این تابع از api.js می‌آید
            console.log('✅ لیست ادمین‌ها با موفقیت در دیتابیس ثبت شد.');
        } else {
            console.log('ℹ️ همه ادمین‌ها قبلاً در دیتابیس وجود داشتند.');
        }
    } catch (error) {
        console.error('❌ خطا در ثبت خودکار ادمین‌ها:', error);
    }
}

// =====================================================
// اجرای خودکار هنگام بارگذاری صفحه
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    // با یک تأخیر کوتاه اجرا کن تا api.js کامل بارگذاری شود
    setTimeout(seedAdmins, 500);
});
