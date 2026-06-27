document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('loginBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const msgDiv = document.getElementById('message');

    // آماده‌سازی
    msgDiv.innerHTML = '';
    btnText.textContent = 'در حال ورود...';
    btnLoader.style.display = 'inline';
    submitBtn.disabled = true;

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.querySelector('input[name="role"]:checked').value;

    if (!username || !password) {
        showNotification('❌ لطفاً نام کاربری و رمز عبور را وارد کنید.', 'error');
        resetBtn();
        return;
    }

    try {
        // هماهنگ‌سازی ادمین‌ها
        await seedAdmins();

        const users = await fetchUsers();
        const user = users.find(u => u.username === username);

        if (!user) {
            showNotification('❌ این نام کاربری ثبت نشده است.', 'error');
            resetBtn();
            return;
        }

        if (user.password !== password) {
            showNotification('❌ رمز عبور اشتباه است.', 'error');
            resetBtn();
            return;
        }

        if (role === 'admin' && user.role !== 'admin') {
            showNotification('❌ شما مدیر نیستید. گزینه عضو عادی را انتخاب کنید.', 'error');
            resetBtn();
            return;
        }
        if (role === 'user' && user.role === 'admin') {
            showNotification('❌ شما مدیر هستید. گزینه مدیر را انتخاب کنید.', 'error');
            resetBtn();
            return;
        }

        localStorage.setItem('loggedInUser', username);
        localStorage.setItem('isAdmin', role === 'admin');

        showNotification(`✅ ورود موفق! خوش آمدید ${username}`, 'success');
        btnText.textContent = '✅ موفق';
        setTimeout(() => window.location.href = 'index.html', 1200);

    } catch (error) {
        showNotification('⚠️ خطا در ارتباط با سرور. دوباره تلاش کنید.', 'warning');
        console.error(error);
        resetBtn();
    }

    function resetBtn() {
        btnText.textContent = 'ورود';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
});
