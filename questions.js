// ============================================
// توابع کمکی
// ============================================
function showNotification(message, type = 'info') {
    const el = document.getElementById('notification');
    if (!el) return;
    el.textContent = message;
    el.className = 'notification';
    if (type) el.classList.add(type);
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3500);
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

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============================================
// بارگذاری اصلی
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    const container = document.getElementById('questionsList');
    const loggedUser = localStorage.getItem('loggedInUser');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    async function loadQuestions() {
        container.innerHTML = '<p style="text-align:center;">🔄 در حال دریافت سوالات...</p>';
        try {
            let questions = await fetchQuestions();
            if (!questions || questions.length === 0) {
                container.innerHTML = '<p style="text-align:center;">📭 هیچ سوالی نیست. اولین سوال را بپرسید!</p>';
                return;
            }

            container.innerHTML = '';
            for (let q of questions) {
                const card = document.createElement('div');
                card.className = 'question-card';
                const answersDivId = `answers-${q.id}`;

                let deleteBtn = '';
                if (isAdmin || (loggedUser && q.asker === loggedUser)) {
                    deleteBtn = `<button class="delete-q" data-id="${q.id}" style="background:#c0392b; color:white; border:none; border-radius:20px; padding:4px 12px; margin-right:10px; cursor:pointer;">🗑️ حذف</button>`;
                }

                const totalAnswers = (q.answers || []).length;

                let answersHtml = `
                    <div class="answers-section" style="margin-top:10px;">
                        <button class="toggle-ans" data-id="${q.id}" style="background:#1f6e8c; color:white; border:none; padding:5px 12px; border-radius:15px; cursor:pointer;">
                            📖 مشاهده پاسخ‌ها (${totalAnswers})
                        </button>
                        <div id="${answersDivId}" style="display:none; margin-top:10px;">
                            <strong>پاسخ‌ها:</strong>
                            ${(q.answers || []).map(ans => `
                                <div class="answer-item" style="margin-bottom:15px; border-bottom:1px dashed #ccc; padding-bottom:10px;">
                                    <div><strong>${escapeHtml(ans.answerer)}:</strong> ${escapeHtml(ans.text)} <small>(${timeAgo(ans.date)})</small></div>
                                    ${ans.replies && ans.replies.length > 0 ? ans.replies.map(reply => `
                                        <div style="margin-right:20px; margin-top:5px; background:#f0f8ff; padding:5px 10px; border-radius:8px; border-right:3px solid #3498db;">
                                            <strong>${escapeHtml(reply.answerer)}:</strong> ${escapeHtml(reply.text)} <small>(${timeAgo(reply.date)})</small>
                                        </div>
                                    `).join('') : ''}
                                    <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:5px; align-items:center;">
                                        <textarea id="reply-to-${ans.id}" rows="1" placeholder="پاسخ یا سوال جدید..." style="flex:1; min-width:150px; padding:5px; border-radius:8px; border:1px solid #ccc; font-family:inherit;"></textarea>
                                        <button class="reply-to-answer" data-qid="${q.id}" data-aid="${ans.id}" style="padding:5px 12px; background:#3498db; color:white; border:none; border-radius:8px; cursor:pointer;">💬 پاسخ</button>
                                    </div>
                                </div>
                            `).join('')}
                            ${(q.answers || []).length === 0 ? '<p>هنوز پاسخی داده نشده است.</p>' : ''}
                        </div>
                    </div>
                `;

                let replyBtn = '';
                if (isAdmin) {
                    replyBtn = `<div style="margin-top:10px;"><textarea id="reply-${q.id}" rows="2" placeholder="پاسخ خود را بنویسید..." style="width:100%; padding:8px; border-radius:12px; border:1px solid #ccc; font-family:inherit;"></textarea><button class="reply-q" data-id="${q.id}" style="margin-top:5px; background:#2ecc71; color:white; border:none; border-radius:15px; padding:6px 12px; cursor:pointer;">✅ ارسال پاسخ (مدیر)</button></div>`;
                } else if (loggedUser) {
                    replyBtn = `<p style="font-size:0.8rem; color:#7f8c8d; margin-top:10px;">💡 فقط مدیران می‌توانند پاسخ دهند.</p>`;
                } else {
                    replyBtn = `<p style="font-size:0.8rem; color:#7f8c8d; margin-top:10px;"><a href="login.html">وارد شوید</a> تا پاسخ دهید.</p>`;
                }

                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
                        <div class="question-title" style="font-size:1.15rem; font-weight:bold; color:#0b3b5f;">${escapeHtml(q.title)}</div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:0.7rem; color:#7f8c8d;">${totalAnswers} پاسخ</span>
                            ${deleteBtn}
                        </div>
                    </div>
                    <div class="question-meta" style="font-size:0.8rem; color:gray; margin:5px 0;">
                        پرسیده شده توسط: ${escapeHtml(q.asker)} | ${timeAgo(q.date)}
                    </div>
                    <div class="question-body" style="margin:8px 0; background:#eef2f7; padding:8px 12px; border-radius:12px;">
                        ${escapeHtml(q.body)}
                    </div>
                    ${answersHtml}
                    ${replyBtn}
                `;
                container.appendChild(card);
            }

            // ===== رویدادها =====
            document.querySelectorAll('.toggle-ans').forEach(btn => {
                btn.onclick = function() {
                    const id = this.getAttribute('data-id');
                    const div = document.getElementById(`answers-${id}`);
                    if (div.style.display === 'none') {
                        div.style.display = 'block';
                        this.textContent = '🙈 مخفی کردن پاسخ‌ها';
                    } else {
                        div.style.display = 'none';
                        this.textContent = `📖 مشاهده پاسخ‌ها (${div.querySelectorAll('.answer-item').length})`;
                    }
                };
            });

            document.querySelectorAll('.delete-q').forEach(btn => {
                btn.onclick = async function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    let questions = await fetchQuestions();
                    const q = questions.find(x => x.id === id);
                    if (!isAdmin && q.asker !== loggedUser) {
                        showNotification('❌ شما فقط سوال خود را می‌توانید حذف کنید.', 'error');
                        return;
                    }
                    if (confirm('آیا از حذف این سوال مطمئن هستید؟')) {
                        const newQ = questions.filter(x => x.id !== id);
                        await saveQuestions(newQ);
                        loadQuestions();
                        showNotification('✅ سوال با موفقیت حذف شد.', 'success');
                    }
                };
            });

            document.querySelectorAll('.reply-q').forEach(btn => {
                btn.onclick = async function() {
                    if (!isAdmin) {
                        showNotification('❌ فقط مدیر می‌تواند پاسخ دهد.', 'error');
                        return;
                    }
                    const id = parseInt(this.getAttribute('data-id'));
                    const textarea = document.getElementById(`reply-${id}`);
                    const answerText = textarea.value.trim();
                    if (!answerText) {
                        showNotification('❌ لطفاً متن پاسخ را بنویسید.', 'error');
                        return;
                    }
                    let questions = await fetchQuestions();
                    const idx = questions.findIndex(x => x.id === id);
                    if (idx === -1) return;
                    questions[idx].answers.push({
                        id: Date.now(),
                        text: answerText,
                        answerer: loggedUser,
                        date: new Date().toISOString(),
                        replies: []
                    });
                    await saveQuestions(questions);
                    loadQuestions();
                    showNotification('✅ پاسخ با موفقیت ثبت شد.', 'success');
                };
            });

            document.querySelectorAll('.reply-to-answer').forEach(btn => {
                btn.onclick = async function() {
                    if (!loggedUser) {
                        showNotification('❌ برای پاسخ باید وارد شوید.', 'error');
                        return;
                    }
                    const questionId = parseInt(this.getAttribute('data-qid'));
                    const answerId = parseInt(this.getAttribute('data-aid'));
                    const textarea = document.getElementById(`reply-to-${answerId}`);
                    const replyText = textarea.value.trim();
                    if (!replyText) {
                        showNotification('❌ لطفاً متن خود را بنویسید.', 'error');
                        return;
                    }
                    let questions = await fetchQuestions();
                    const question = questions.find(q => q.id === questionId);
                    if (!question) return;
                    const answer = question.answers.find(a => a.id === answerId);
                    if (!answer) return;
                    if (!answer.replies) answer.replies = [];
                    answer.replies.push({
                        id: Date.now(),
                        text: replyText,
                        answerer: loggedUser,
                        date: new Date().toISOString()
                    });
                    await saveQuestions(questions);
                    loadQuestions();
                    showNotification('✅ نظر شما ثبت شد.', 'success');
                };
            });

        } catch (error) {
            container.innerHTML = `<p style="color:red; text-align:center;">❌ خطا در بارگذاری اطلاعات: ${error.message}</p>`;
            console.error('❌ loadQuestions:', error);
            showNotification('⚠️ خطا در دریافت سوالات. دوباره تلاش کنید.', 'warning');
        }
    }

    await loadQuestions();
});
