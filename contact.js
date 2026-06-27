document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (isAdmin) {
        document.getElementById('adminMessages').style.display = 'block';
        loadAdminMessages();
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('senderName').value.trim();
        const email = document.getElementById('senderEmail').value.trim();
        const message = document.getElementById('messageText').value.trim();

        if (!name || !message) {
            formMessage.innerHTML = '❌ لطفاً نام و متن پیام را وارد کنید.';
            formMessage.style.color = 'red';
            return;
        }

        try {
            let messages = await fetchMessages();
            messages.push({
                id: Date.now(),
                name: name,
                email: email,
                message: message,
                date: new Date().toISOString()
            });
            await saveMessages(messages);

            formMessage.innerHTML = '✅ پیام شما با موفقیت ارسال شد. به زودی پاسخ داده می‌شود.';
            formMessage.style.color = 'green';
            form.reset();
            if (isAdmin) loadAdminMessages();
        } catch (error) {
            formMessage.innerHTML = '❌ خطا در ارسال پیام. دوباره تلاش کنید.';
            formMessage.style.color = 'red';
            console.error('❌ خطا در ارسال پیام:', error);
        }
    });

    async function loadAdminMessages() {
        try {
            const messages = await fetchMessages();
            const container = document.getElementById('messagesList');
            if (messages.length === 0) {
                container.innerHTML = '<p>هیچ پیامی تاکنون ارسال نشده است.</p>';
                return;
            }
            container.innerHTML = messages.map(msg => `
                <div class="message-item">
                    <strong>${escapeHtml(msg.name)}</strong> (${msg.email || 'ایمیل ندارد'})<br>
                    <small>${new Date(msg.date).toLocaleString('fa-IR')}</small><br>
                    ${escapeHtml(msg.message)}
                </div>
            `).join('');
        } catch (error) {
            console.error('❌ خطا در بارگذاری پیام‌ها:', error);
        }
    }

    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
});
