// ===== سیستم نوتیفیکیشن =====
function showNotification(message, type = 'info') {
    const el = document.getElementById('notification');
    if (!el) return;
    el.textContent = message;
    el.className = 'notification';
    if (type) el.classList.add(type);
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => el.classList.remove('show'), 3500);
}

// ===== حالت تاریک =====
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    showNotification(newTheme === 'dark' ? '🌙 حالت تاریک فعال شد' : '☀️ حالت روشن فعال شد', 'success');
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

document.addEventListener('DOMContentLoaded', () => {
    // بارگذاری تم ذخیره شده
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // دکمه تغییر تم
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) toggleBtn.addEventListener('click', toggleTheme);

    // ===== پیام خوش‌آمدگویی =====
    const loggedUser = localStorage.getItem('loggedInUser');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (loggedUser) {
        const header = document.querySelector('header');
        const welcomeDiv = document.createElement('div');
        welcomeDiv.style.cssText = `
            background: var(--accent);
            padding: 6px 12px;
            border-radius: 20px;
            margin-top: 8px;
            text-align: center;
            font-size: 0.85rem;
            color: white;
            opacity: 0.9;
        `;
        welcomeDiv.innerText = `👋 خوش آمدی ${loggedUser}${isAdmin ? ' (مدیر)' : ''}`;
        header.appendChild(welcomeDiv);
        showNotification(`خوش برگشتی ${loggedUser}!`, 'success');
    }
});

// ===== توابع کمکی برای تاریخ نسبی =====
function timeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'لحظاتی پیش';
    if (diffMin < 60) return `${diffMin} دقیقه پیش`;
    if (diffHour < 24) return `${diffHour} ساعت پیش`;
    if (diffDay < 7) return `${diffDay} روز پیش`;
    return past.toLocaleDateString('fa-IR');
}
