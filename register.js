document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('registerBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const msgDiv = document.getElementById('message');

    msgDiv.innerHTML = '';
    btnText.textContent = 'در حال ثبت‌نام...';
    btnLoader.style.display = 'inline';
    submitBtn.disabled = true;

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirm = document.getElementById('confirmPassword').value.trim();

    if (!username || !password) {
        showNotification('❌ نام کاربری و رمز عبور را وارد کنید.', 'error');
        resetBtn();
        return;
    }
    if (password !== confirm) {
        showNotification('❌ رمز عبور و تکرار آن مطابقت ندارند.', 'error');
        resetBtn();
        return;
    }
    if (password.length < 4) {
        showNotification('❌ رمز عبور باید حداقل ۴ کاراکتر باشد.', 'error');
        resetBtn();
        return;
    }

    try {
        await seedAdmins();
        let users = await fetchUsers();

        if (users.some(u => u.username === username)) {
            showNotification('❌ این نام کاربری قبلاً ثبت شده است.', 'error');
            resetBtn();
            return;
        }

        if (ADMINS.some(a => a.username === username)) {
            showNotification('❌ این نام کاربری به عنوان ادمین رزرو شده است.', 'error');
            resetBtn();
            return;
        }

        const newUser = { username, password, role: 'user' };
        users.push(newUser);
        await saveUsers(users);

        showNotification('✅ ثبت‌نام موفق! در حال انتقال...', 'success');
        btnText.textContent = '✅ موفق';
        setTimeout(() => window.location.href = 'login.html', 1200);

    } catch (error) {
        showNotification('⚠️ خطا در ارتباط با سرور.', 'warning');
        console.error(error);
        resetBtn();
    }

    function resetBtn() {
        btnText.textContent = 'ثبت‌نام';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
});
