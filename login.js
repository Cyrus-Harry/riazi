document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    const msgDiv = document.getElementById('message');
    const originalText = submitBtn.innerText;
    
    msgDiv.innerHTML = '';
    submitBtn.innerText = '⏳ در حال بررسی...';
    submitBtn.disabled = true;

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.querySelector('input[name="role"]:checked').value;

    if (!username || !password) {
        msgDiv.innerHTML = '❌ لطفاً نام کاربری و رمز عبور را وارد کنید.';
        msgDiv.style.color = 'red';
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        return;
    }

    try {
        // ========== مرحله 1: مطمئن شویم ادمین‌ها در دیتابیس هستند ==========
        submitBtn.innerText = '⏳ در حال هماه‌سازی با سرور...';
        await seedAdmins(); // اجرای مجدد برای ثبت ادمین‌ها در صورت نیاز
        // ====================================================================

        // ========== مرحله 2: جستجوی کاربر ==========
        submitBtn.innerText = '⏳ در حال ورود...';
        const users = await fetchUsers();
        const user = users.find(u => u.username === username);
        // ===========================================

        if (!user) {
            msgDiv.innerHTML = '❌ این نام کاربری ثبت نشده است.';
            msgDiv.style.color = 'red';
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            return;
        }

        if (user.password !== password) {
            msgDiv.innerHTML = '❌ رمز عبور اشتباه است.';
            msgDiv.style.color = 'red';
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            return;
        }

        if (role === 'admin' && user.role !== 'admin') {
            msgDiv.innerHTML = '❌ شما مدیر نیستید. لطفاً گزینه «عضو عادی» را انتخاب کنید.';
            msgDiv.style.color = 'red';
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            return;
        }
        if (role === 'user' && user.role === 'admin') {
            msgDiv.innerHTML = '❌ شما مدیر هستید. لطفاً گزینه «مدیر» را انتخاب کنید.';
            msgDiv.style.color = 'red';
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            return;
        }

        localStorage.setItem('loggedInUser', username);
        localStorage.setItem('isAdmin', role === 'admin');
        
        msgDiv.innerHTML = `✅ ورود موفق! خوش آمدید ${username}. در حال انتقال به خانه...`;
        msgDiv.style.color = 'green';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1200);

    } catch (error) {
        msgDiv.innerHTML = '⚠️ خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.';
        msgDiv.style.color = 'orange';
        console.error('خطا در لاگین:', error);
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});
