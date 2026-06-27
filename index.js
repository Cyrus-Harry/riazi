// فقط برای نمایش وضعیت ورود در کنسول یا تغییر جزئی در صفحه اصلی (اختیاری)
document.addEventListener('DOMContentLoaded', () => {
    // بررسی می‌کنیم آیا کاربر قبلاً وارد شده یا خیر (با استفاده از localStorage ساده)
    const loggedInUser = localStorage.getItem('loggedInUser');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (loggedInUser) {
        // می‌توانیم یک پیام خوش‌آمدگویی در کنسول بنویسیم یا در صفحه نمایش دهیم
        console.log(`خوش برگشتی ${loggedInUser}${isAdmin ? ' (مدیر)' : ''}`);
        
        // اختیاری: اضافه کردن یک المان اعلان در هدر
        const header = document.querySelector('header');
        const welcomeDiv = document.createElement('div');
        welcomeDiv.style.backgroundColor = '#1f6e8c';
        welcomeDiv.style.padding = '5px';
        welcomeDiv.style.borderRadius = '20px';
        welcomeDiv.style.marginTop = '10px';
        welcomeDiv.style.textAlign = 'center';
        welcomeDiv.style.fontSize = '0.9rem';
        welcomeDiv.innerText = `👋 خوش آمدی ${loggedInUser}${isAdmin ? ' (مدیر)' : ''}`;
        header.appendChild(welcomeDiv);
    } else {
        // می‌توانیم یک لینک سریع به لاگین نشان دهیم
        console.log('کاربر مهمان - لطفاً وارد شوید');
    }
});
