document.addEventListener('DOMContentLoaded', async function() {
    const loggedUser = localStorage.getItem('loggedInUser');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    // اگه لاگین نیست
    if (!loggedUser) {
        document.getElementById('notLoggedIn').style.display = 'block';
        return;
    }

    document.getElementById('profileContent').style.display = 'block';

    // ---- تنظیم لینک خروج ----
    const logoutLink = document.getElementById('logoutLink');
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('isAdmin');
        window.location.href = 'index.html';
    });

    // ---- سطوح بر اساس امتیاز ----
    const levels = [
        { name: 'مبتدی 🌱',       min: 0,   max: 49  },
        { name: 'یادگیرنده 📚',   min: 50,  max: 99  },
        { name: 'فعال 💡',        min: 100, max: 199 },
        { name: 'ماهر ⚡',        min: 200, max: 349 },
        { name: 'متخصص 🎯',       min: 350, max: 499 },
        { name: 'استاد 🏆',       min: 500, max: Infinity }
    ];

    function getLevel(score) {
        return levels.find(l => score >= l.min && score <= l.max) || levels[0];
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    try {
        // دریافت اطلاعات از سرور
        const [users, questions] = await Promise.all([fetchUsers(), fetchQuestions()]);

        const user = users.find(u => u.username === loggedUser);
        const score = user ? (user.score || 0) : 0;

        // ---- اطلاعات اصلی پروفایل ----
        document.getElementById('profileUsername').textContent = loggedUser;
        document.getElementById('profileScore').textContent = score;

        const badgeEl = document.getElementById('profileBadge');
        if (isAdmin) {
            badgeEl.textContent = '👑 مدیر سایت';
            badgeEl.classList.add('admin');
        } else {
            badgeEl.textContent = '👤 عضو';
        }

        // ---- آمار پاسخ‌ها ----
        let totalAnswers = 0;
        let bestAnswers = 0;
        let totalQuestions = 0;
        const myBestAnswers = [];
        const myRecentAnswers = [];

        for (let q of (questions || [])) {
            // سوالات پرسیده
            if (q.asker === loggedUser) totalQuestions++;

            for (let a of (q.answers || [])) {
                if (a.answerer === loggedUser) {
                    totalAnswers++;
                    if (a.isBest) {
                        bestAnswers++;
                        myBestAnswers.push({ q, a });
                    }
                    myRecentAnswers.push({ q, a });
                }
            }
        }

        // آخرین ۵ پاسخ
        myRecentAnswers.sort((x, y) => y.a.date > x.a.date ? 1 : -1);
        const last5 = myRecentAnswers.slice(0, 5);

        document.getElementById('totalAnswers').textContent = totalAnswers;
        document.getElementById('bestAnswers').textContent = bestAnswers;
        document.getElementById('totalQuestions').textContent = totalQuestions;

        const successRate = totalAnswers > 0 ? Math.round((bestAnswers / totalAnswers) * 100) : 0;
        document.getElementById('successRate').textContent = successRate + '%';

        // ---- سطح و نوار پیشرفت ----
        const currentLevel = getLevel(score);
        const nextLevel = levels[levels.indexOf(currentLevel) + 1];
        document.getElementById('levelName').textContent = currentLevel.name;

        if (nextLevel) {
            const needed = nextLevel.min - currentLevel.min;
            const done = score - currentLevel.min;
            const pct = Math.min(Math.round((done / needed) * 100), 100);
            document.getElementById('progressBar').style.width = pct + '%';
            document.getElementById('progressText').textContent =
                `${done} از ${needed} امتیاز تا سطح "${nextLevel.name}"`;
            document.getElementById('nextLevel').textContent = `→ بعدی: ${nextLevel.name}`;
        } else {
            document.getElementById('progressBar').style.width = '100%';
            document.getElementById('progressText').textContent = 'شما به بالاترین سطح رسیده‌اید! 🎉';
        }

        // ---- پاسخ‌های برگزیده ----
        const bestList = document.getElementById('bestAnswersList');
        if (myBestAnswers.length === 0) {
            bestList.innerHTML = '<p class="empty-msg">هنوز پاسخ برگزیده‌ای ندارید. برو پاسخ بده! 💪</p>';
        } else {
            bestList.innerHTML = myBestAnswers.map(({ q, a }) => `
                <div class="answer-profile-item best">
                    <div class="q-title">⭐ ${escapeHtml(q.title)}</div>
                    <div class="a-text">${escapeHtml(a.text)}</div>
                    <div class="a-meta">${a.date}</div>
                </div>
            `).join('');
        }

        // ---- آخرین پاسخ‌ها ----
        const recentList = document.getElementById('recentAnswersList');
        if (last5.length === 0) {
            recentList.innerHTML = '<p class="empty-msg">هنوز پاسخی نداده‌اید. <a href="questions.html">برو به انجمن</a> 😊</p>';
        } else {
            recentList.innerHTML = last5.map(({ q, a }) => `
                <div class="answer-profile-item ${a.isBest ? 'best' : ''}">
                    <div class="q-title">${a.isBest ? '⭐ ' : '💬 '}${escapeHtml(q.title)}</div>
                    <div class="a-text">${escapeHtml(a.text)}</div>
                    <div class="a-meta">${a.date}${a.isBest ? ' — پاسخ برگزیده' : ''}</div>
                </div>
            `).join('');
        }

    } catch(e) {
        console.error(e);
        document.getElementById('profileContent').innerHTML = '<p style="color:red;text-align:center;">❌ خطا در دریافت اطلاعات از سرور.</p>';
    }
});
