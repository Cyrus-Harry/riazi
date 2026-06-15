document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const remoteStorage = new RemoteStorage({
        userId: "app-contacts",
        instanceId: "math-forum"
    });

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

        let messages = await remoteStorage.getItem('contactMessages') || [];
        messages.push({
            id: Date.now(),
            name: name,
            email: email,
            message: message,
            date: new Date().toLocaleString('fa-IR')
        });
        await remoteStorage.setItem('contactMessages', messages);

        formMessage.innerHTML = '✅ پیام شما با موفقیت ارسال شد. به زودی پاسخ داده می‌شود.';
        formMessage.style.color = 'green';
        form.reset();
        if (isAdmin) loadAdminMessages();
    });

    async function loadAdminMessages() {
        const messages = await remoteStorage.getItem('contactMessages') || [];
        const container = document.getElementById('messagesList');
        if (messages.length === 0) {
            container.innerHTML = '<p>هیچ پیامی تاکنون ارسال نشده است.</p>';
            return;
        }
        container.innerHTML = messages.map(msg => `
            <div class="message-item">
                <strong>${escapeHtml(msg.name)}</strong> (${msg.email || 'ایمیل ندارد'})<br>
                <small>${msg.date}</small><br>
                ${escapeHtml(msg.message)}
            </div>
        `).join('');
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