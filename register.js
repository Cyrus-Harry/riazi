document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    const msgDiv = document.getElementById('message');
    const originalText = submitBtn.innerText;
    
    msgDiv.innerHTML = '';
    submitBtn.innerText = '⏳ در حال ثبت‌نام...';
    submitBtn.disabled = true;

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirm = document.getElementById('confirmPassword').value.trim();

    // اعتبارسنجی اولیه
    if (!username || !password) {
        msgDiv.innerHTML = '❌ لطفاً نام کاربری و رمز عبور را وارد کنید.';
        msgDiv.style.color = 'red';
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        return;
    }
    if (password !== confirm) {
        msgDiv.innerHTML = '❌ رمز عبور و تکرار آن مطابقت ندارند.';
        msgDiv.style.color = 'red';
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        return;
    }
    if (password.length < 4) {
        msgDiv.innerHTML = '❌ رمز عبور باید حداقل ۴ کاراکتر باشد.';
        msgDiv.style.color = 'red';
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        return;
    }

    try {
        // دریافت لیست کاربران از دیتابیس
        let users = await fetchUsers();

        // 1. بررسی تکراری بودن در دیتابیس
        if (users.some(u => u.username === username)) {
            msgDiv.innerHTML = '❌ این نام کاربری قبلاً ثبت شده است.';
            msgDiv.style.color = 'red';
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            return;
        }

        // 2. بررسی تکراری بودن در لیست ادمین‌ها (حتی اگر در دیتابیس نباشد)
        if (ADMINS.some(a => a.username === username)) {
            msgDiv.innerHTML = '❌ این نام کاربری به عنوان ادمین رزرو شده است.';
            msgDiv.style.color = 'red';
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            return;
        }

        // ثبت کاربر جدید با نقش 'user'
        const newUser = { username, password, role: 'user' };
        users.push(newUser);
        await saveUsers(users);

        msgDiv.innerHTML = '✅ ثبت‌نام با موفقیت انجام شد! در حال انتقال به صفحه ورود...';
        msgDiv.style.color = 'green';
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        msgDiv.innerHTML = '⚠️ خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.';
        msgDiv.style.color = 'orange';
        console.error('خطا:', error);
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});
