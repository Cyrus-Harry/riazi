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
        let users = await fetchUsers();
        if (users.some(u => u.username === username)) {
            msgDiv.innerHTML = '❌ این نام کاربری قبلاً ثبت شده است.';
            msgDiv.style.color = 'red';
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            return;
        }

        // ========== تغییر اصلی اینجا ==========
        // بررسی می‌کنیم که آیا نام‌کاربری در لیست ادمین‌ها وجود دارد؟
        let role = 'user';
        if (ADMIN_LIST.includes(username)) {
            role = 'admin';
        }
        // ======================================

        users.push({ username, password, role });
        await saveUsers(users);

        msgDiv.innerHTML = '✅ ثبت‌نام با موفقیت انجام شد! در حال انتقال به صفحه ورود...';
        msgDiv.style.color = 'green';
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    } catch (error) {
        msgDiv.innerHTML = '⚠️ خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.';
        msgDiv.style.color = 'orange';
        console.error(error);
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});