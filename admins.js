// =====================================================
// لیست ادمین‌های سایت با نام کاربری و رمز عبور مخصوص
// =====================================================
const ADMINS = [
    { username: "admin", password: "123456" },
    { username: "cyrus-harry", password: "admin123" },
    { username: "harry", password: "1212" },
    // { username: "ali_admin", password: "ali789" },
    // { username: "math_master", password: "math2024" }
];

// =====================================================
// تابع ثبت خودکار ادمین‌ها در دیتابیس JSONBin
// (این تابع به صورت سراسری در دسترس است)
// =====================================================
async function seedAdmins() {
    try {
        console.log('🔄 در حال بررسی و ثبت ادمین‌ها در دیتابیس...');
        
        // 1. دریافت لیست کاربران از دیتابیس
        const users = await fetchUsers();
        let changed = false;

        // 2. بررسی هر ادمین در لیست
        for (const admin of ADMINS) {
            const exists = users.some(u => u.username === admin.username);
            if (!exists) {
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
            await saveUsers(users);
            console.log('✅ لیست ادمین‌ها با موفقیت در دیتابیس ثبت شد.');
        } else {
            console.log('ℹ️ همه ادمین‌ها قبلاً در دیتابیس وجود داشتند.');
        }
        
        return true; // موفقیت
    } catch (error) {
        console.error('❌ خطا در ثبت خودکار ادمین‌ها:', error);
        return false;
    }
}

// =====================================================
// اجرای خودکار هنگام بارگذاری صفحه
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    // با یک تأخیر کوتاه اجرا کن تا api.js کامل بارگذاری شود
    setTimeout(async () => {
        await seedAdmins();
    }, 1000);
});
