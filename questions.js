document.addEventListener('DOMContentLoaded', async function() {
    const container = document.getElementById('questionsList');
    const loggedUser = localStorage.getItem('loggedInUser');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    // ===== توابع کمکی ساده =====
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function timeAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now - past;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMs / 3600000);
        const diffDay = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return 'لحظاتی پیش';
        if (diffMin < 60) return diffMin + ' دقیقه پیش';
        if (diffHour < 24) return diffHour + ' ساعت پیش';
        if (diffDay < 7) return diffDay + ' روز پیش';
        return past.toLocaleDateString('fa-IR');
    }

    // ===== بارگذاری سوالات =====
    async function loadQuestions() {
        container.innerHTML = '🔄 در حال دریافت سوالات...';

        try {
            // 1. دریافت از دیتابیس
            const questions = await fetchQuestions();
            console.log('📦 تعداد سوالات دریافت شده:', questions.length);

            // 2. اگر خالی بود
            if (!questions || questions.length === 0) {
                container.innerHTML = '📭 هیچ سوالی نیست. اولین سوال را بپرسید!';
                return;
            }

            // 3. نمایش سوالات
            container.innerHTML = '';

            for (const q of questions) {
                const card = document.createElement('div');
                card.className = 'question-card';
                card.style.cssText = 'background:#f9f9ff; border-right:5px solid #1f6e8c; padding:15px; border-radius:20px; margin-bottom:15px;';

                // تعداد پاسخ‌ها
                const totalAnswers = (q.answers || []).length;

                // دکمه حذف
                let deleteBtn = '';
                if (isAdmin || (loggedUser && q.asker === loggedUser)) {
                    deleteBtn = `<button onclick="deleteQuestion(${q.id})" style="background:#c0392b; color:white; border:none; border-radius:20px; padding:4px 12px; cursor:pointer;">🗑️ حذف</button>`;
                }

                // ساخت کارت
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="font-size:1.2rem; font-weight:bold; color:#0b3b5f;">${escapeHtml(q.title)}</div>
                        <div>
                            <span style="font-size:0.8rem; color:gray;">${totalAnswers} پاسخ</span>
                            ${deleteBtn}
                        </div>
                    </div>
                    <div style="font-size:0.8rem; color:gray; margin:5px 0;">
                        پرسیده شده توسط: ${escapeHtml(q.asker)} | ${timeAgo(q.date)}
                    </div>
                    <div style="background:#eef2f7; padding:10px; border-radius:12px; margin:8px 0;">
                        ${escapeHtml(q.body)}
                    </div>
                    <div style="margin-top:10px;">
                        <button onclick="toggleAnswers(${q.id})" style="background:#1f6e8c; color:white; border:none; padding:5px 12px; border-radius:15px; cursor:pointer;">
                            📖 مشاهده پاسخ‌ها (${totalAnswers})
                        </button>
                        <div id="answers-${q.id}" style="display:none; margin-top:10px;">
                            ${(q.answers || []).map(ans => `
                                <div style="background:#e0f0e8; padding:8px 12px; border-radius:12px; margin:6px 0;">
                                    <strong>${escapeHtml(ans.answerer)}:</strong> ${escapeHtml(ans.text)} <small>(${timeAgo(ans.date)})</small>
                                </div>
                            `).join('')}
                            ${totalAnswers === 0 ? '<p>هنوز پاسخی داده نشده است.</p>' : ''}
                        </div>
                    </div>
                    ${isAdmin ? `
                        <div style="margin-top:10px;">
                            <textarea id="reply-${q.id}" rows="2" placeholder="پاسخ خود را بنویسید..." style="width:100%; padding:8px; border-radius:12px; border:1px solid #ccc;"></textarea>
                            <button onclick="replyToQuestion(${q.id})" style="margin-top:5px; background:#2ecc71; color:white; border:none; border-radius:15px; padding:6px 12px; cursor:pointer;">✅ ارسال پاسخ</button>
                        </div>
                    ` : (loggedUser ? '<p style="color:gray;">💡 فقط مدیران می‌توانند پاسخ دهند.</p>' : '<p><a href="login.html">وارد شوید</a> تا پاسخ دهید.</p>')}
                `;

                container.appendChild(card);
            }

            // ===== توابع سراسری برای دکمه‌ها =====
            window.toggleAnswers = function(qid) {
                const div = document.getElementById(`answers-${qid}`);
                if (div.style.display === 'none') {
                    div.style.display = 'block';
                } else {
                    div.style.display = 'none';
                }
            };

            window.deleteQuestion = async function(qid) {
                if (!confirm('آیا از حذف این سوال مطمئن هستید؟')) return;
                let questions = await fetchQuestions();
                const q = questions.find(x => x.id === qid);
                if (!isAdmin && q.asker !== loggedUser) {
                    alert('شما فقط سوال خود را می‌توانید حذف کنید.');
                    return;
                }
                const newQ = questions.filter(x => x.id !== qid);
                await saveQuestions(newQ);
                loadQuestions();
                alert('✅ سوال حذف شد.');
            };

            window.replyToQuestion = async function(qid) {
                if (!isAdmin) {
                    alert('فقط مدیر می‌تواند پاسخ دهد.');
                    return;
                }
                const textarea = document.getElementById(`reply-${qid}`);
                const text = textarea.value.trim();
                if (!text) {
                    alert('لطفاً متن پاسخ را بنویسید.');
                    return;
                }
                let questions = await fetchQuestions();
                const idx = questions.findIndex(x => x.id === qid);
                if (idx === -1) return;
                questions[idx].answers.push({
                    id: Date.now(),
                    text: text,
                    answerer: loggedUser,
                    date: new Date().toISOString()
                });
                await saveQuestions(questions);
                loadQuestions();
                alert('✅ پاسخ ثبت شد.');
            };

        } catch (error) {
            container.innerHTML = `❌ خطا: ${error.message}`;
            console.error('❌ خطا در loadQuestions:', error);
        }
    }

    // اجرا
    await loadQuestions();
});
