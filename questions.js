document.addEventListener('DOMContentLoaded', async function() {
    const container = document.getElementById('questionsList');
    const loggedUser = localStorage.getItem('loggedInUser');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // ==============================================
    // تابع بارگذاری سوالات با قابلیت پاسخ به پاسخ‌ها
    // ==============================================
    async function loadQuestions() {
        container.innerHTML = '<p style="text-align:center;">🔄 در حال دریافت سوالات از سرور...</p>';
        try {
            let questions = await fetchQuestions();
            if (!questions || questions.length === 0) {
                container.innerHTML = '<p>هیچ سوالی نیست. اولین سوال را بپرسید.</p>';
                return;
            }

            container.innerHTML = '';
            for (let q of questions) {
                const card = document.createElement('div');
                card.className = 'question-card';
                const answersDivId = `answers-${q.id}`;

                // دکمه حذف سوال (برای مدیر یا صاحب سوال)
                let deleteBtn = '';
                if (isAdmin || (loggedUser && q.asker === loggedUser)) {
                    deleteBtn = `<button class="delete-q" data-id="${q.id}" style="background:#c0392b; color:white; border:none; border-radius:20px; padding:4px 12px; margin-right:10px; cursor:pointer;">🗑️ حذف سوال</button>`;
                }

                // ========== بخش پاسخ‌ها با قابلیت پاسخ به پاسخ ==========
                let answersHtml = `
                    <div class="answers-section" style="margin-top:10px;">
                        <button class="toggle-ans" data-id="${q.id}" style="background:#1f6e8c; color:white; border:none; padding:5px 12px; border-radius:15px; cursor:pointer;">📖 مشاهده پاسخ‌ها (${q.answers.length})</button>
                        <div id="${answersDivId}" style="display:none; margin-top:10px;">
                            <strong>پاسخ‌ها:</strong>
                            ${q.answers.map(ans => `
                                <div class="answer-item" style="margin-bottom:15px; border-bottom:1px dashed #ccc; padding-bottom:10px;">
                                    <div><strong>${escapeHtml(ans.answerer)}:</strong> ${escapeHtml(ans.text)} <small>(${ans.date})</small></div>
                                    
                                    ${ans.replies && ans.replies.length > 0 ? ans.replies.map(reply => `
                                        <div style="margin-right:20px; margin-top:5px; background:#f0f8ff; padding:5px 10px; border-radius:8px; border-right:3px solid #3498db;">
                                            <strong>${escapeHtml(reply.answerer)}:</strong> ${escapeHtml(reply.text)} <small>(${reply.date})</small>
                                        </div>
                                    `).join('') : ''}
                                    
                                    <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:5px; align-items:center;">
                                        <textarea id="reply-to-${ans.id}" rows="1" placeholder="پاسخ یا سوال جدید..." style="flex:1; min-width:150px; padding:5px; border-radius:8px; border:1px solid #ccc; font-family:inherit;"></textarea>
                                        <button class="reply-to-answer" data-qid="${q.id}" data-aid="${ans.id}" style="padding:5px 12px; background:#3498db; color:white; border:none; border-radius:8px; cursor:pointer;">💬 پاسخ</button>
                                    </div>
                                </div>
                            `).join('')}
                            ${q.answers.length === 0 ? '<p>هنوز پاسخی داده نشده است.</p>' : ''}
                        </div>
                    </div>
                `;
                // ======================================================

                // دکمه پاسخ به سوال (فقط برای مدیر)
                let replyBtn = '';
                if (isAdmin) {
                    replyBtn = `<div style="margin-top:10px;"><textarea id="reply-${q.id}" rows="2" placeholder="پاسخ خود را بنویسید..." style="width:100%; padding:8px; border-radius:12px; border:1px solid #ccc; font-family:inherit;"></textarea><button class="reply-q" data-id="${q.id}" style="margin-top:5px; background:#2ecc71; color:white; border:none; border-radius:15px; padding:6px 12px; cursor:pointer;">✅ ارسال پاسخ</button></div>`;
                } else if (loggedUser) {
                    replyBtn = `<p style="font-size:0.8rem; color:#7f8c8d; margin-top:10px;">💡 فقط مدیران می‌توانند پاسخ دهند.</p>`;
                } else {
                    replyBtn = `<p style="font-size:0.8rem; color:#7f8c8d; margin-top:10px;"><a href="login.html">وارد شوید</a> تا پاسخ دهید.</p>`;
                }

                // ساخت کارت سوال
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div class="question-title">${escapeHtml(q.title)}</div>
                        ${deleteBtn}
                    </div>
                    <div class="question-meta">پرسیده شده توسط: ${escapeHtml(q.asker)} | ${q.date}</div>
                    <div class="question-body">${escapeHtml(q.body)}</div>
                    ${answersHtml}
                    ${replyBtn}
                `;
                container.appendChild(card);
            }

            // ==============================================
            // رویدادها (دکمه‌ها)
            // ==============================================

            // 1. دکمه مشاهده/مخفی کردن پاسخ‌ها
            document.querySelectorAll('.toggle-ans').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.getAttribute('data-id');
                    const div = document.getElementById(`answers-${id}`);
                    if (div.style.display === 'none') {
                        div.style.display = 'block';
                        btn.textContent = '🙈 مخفی کردن پاسخ‌ها';
                    } else {
                        div.style.display = 'none';
                        btn.textContent = `📖 مشاهده پاسخ‌ها (${div.querySelectorAll('.answer-item').length})`;
                    }
                };
            });

            // 2. دکمه حذف سوال
            document.querySelectorAll('.delete-q').forEach(btn => {
                btn.onclick = async () => {
                    const id = parseInt(btn.getAttribute('data-id'));
                    let questions = await fetchQuestions();
                    const q = questions.find(x => x.id === id);
                    if (!isAdmin && q.asker !== loggedUser) {
                        alert('شما فقط سوال خودتان را می‌توانید حذف کنید.');
                        return;
                    }
                    if (confirm('آیا از حذف این سوال مطمئن هستید؟')) {
                        const newQ = questions.filter(x => x.id !== id);
                        await saveQuestions(newQ);
                        loadQuestions();
                    }
                };
            });

            // 3. دکمه پاسخ به سوال (فقط مدیر)
            document.querySelectorAll('.reply-q').forEach(btn => {
                btn.onclick = async () => {
                    if (!isAdmin) {
                        alert('فقط مدیر می‌تواند پاسخ دهد.');
                        return;
                    }
                    const id = parseInt(btn.getAttribute('data-id'));
                    const textarea = document.getElementById(`reply-${id}`);
                    const answerText = textarea.value.trim();
                    if (!answerText) {
                        alert('لطفاً متن پاسخ را بنویسید.');
                        return;
                    }
                    let questions = await fetchQuestions();
                    const idx = questions.findIndex(x => x.id === id);
                    if (idx === -1) return;
                    
                    // پاسخ جدید با قابلیت دریافت زیرپاسخ
                    questions[idx].answers.push({
                        id: Date.now(),
                        text: answerText,
                        answerer: loggedUser,
                        date: new Date().toLocaleString('fa-IR'),
                        replies: []  // ← اینجا آرایه خالی برای پاسخ‌های بعدی
                    });
                    await saveQuestions(questions);
                    loadQuestions();
                };
            });

            // 4. دکمه پاسخ به پاسخ (برای همه کاربران وارد شده)
            document.querySelectorAll('.reply-to-answer').forEach(btn => {
                btn.onclick = async () => {
                    if (!loggedUser) {
                        alert('برای نظر دادن باید وارد شوید.');
                        return;
                    }
                    const questionId = parseInt(btn.getAttribute('data-qid'));
                    const answerId = parseInt(btn.getAttribute('data-aid'));
                    const textarea = document.getElementById(`reply-to-${answerId}`);
                    const replyText = textarea.value.trim();
                    if (!replyText) {
                        alert('لطفاً متن خود را بنویسید.');
                        return;
                    }

                    let questions = await fetchQuestions();
                    const question = questions.find(q => q.id === questionId);
                    if (!question) return;

                    const answer = question.answers.find(a => a.id === answerId);
                    if (!answer) return;

                    // اگر آرایه replies وجود نداشت، بساز
                    if (!answer.replies) answer.replies = [];

                    answer.replies.push({
                        id: Date.now(),
                        text: replyText,
                        answerer: loggedUser,
                        date: new Date().toLocaleString('fa-IR')
                    });

                    await saveQuestions(questions);
                    loadQuestions();
                };
            });

        } catch (err) {
            container.innerHTML = `<p style="color:red; text-align:center;">❌ خطا در بارگذاری اطلاعات از سرور.</p>`;
            console.error(err);
        }
    }

    // ==============================================
    // بارگذاری اولیه سوالات (بدون سوالات نمونه)
    // ==============================================
    await loadQuestions();
});
