document.addEventListener('DOMContentLoaded', async function() {
    const container = document.getElementById('questionsList');
    const loggedUser = localStorage.getItem('loggedInUser');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m] || m);
    }

    async function loadQuestions() {
        container.innerHTML = '<p style="text-align:center;">🔄 در حال دریافت...</p>';
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
                    deleteBtn = `<button class="delete-q" data-id="${q.id}">🗑️ حذف</button>`;
                }

                const totalAnswers = q.answers.length;
                const answersCount = totalAnswers > 0 ? ` (${totalAnswers} پاسخ)` : '';

                let answersHtml = `
                    <div class="answers-section">
                        <button class="toggle-ans" data-id="${q.id}">📖 مشاهده پاسخ‌ها${answersCount}</button>
                        <div id="${answersDivId}" style="display:none; margin-top:10px;">
                            <strong>پاسخ‌ها:</strong>
                            ${q.answers.map(ans => `
                                <div class="answer-item">
                                    <div><span class="answerer">${escapeHtml(ans.answerer)}:</span> ${escapeHtml(ans.text)} <small>(${timeAgo(ans.date)})</small></div>
                                    ${ans.replies && ans.replies.length > 0 ? ans.replies.map(reply => `
                                        <div class="reply-item">
                                            <strong>${escapeHtml(reply.answerer)}:</strong> ${escapeHtml(reply.text)} <small>(${timeAgo(reply.date)})</small>
                                        </div>
                                    `).join('') : ''}
                                    <div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:5px; align-items:center;">
                                        <textarea id="reply-to-${ans.id}" rows="1" placeholder="پاسخ یا سوال جدید..." style="flex:1; min-width:120px; padding:4px 8px; border-radius:8px; border:1px solid var(--border); font-family:inherit; background:var(--input-bg); color:var(--text-primary);"></textarea>
                                        <button class="reply-to-answer" data-qid="${q.id}" data-aid="${ans.id}">💬 پاسخ</button>
                                    </div>
                                </div>
                            `).join('')}
                            ${q.answers.length === 0 ? '<p>هنوز پاسخی داده نشده است.</p>' : ''}
                        </div>
                    </div>
                `;

                let replyBtn = '';
                if (isAdmin) {
                    replyBtn = `
                        <div style="margin-top:10px;">
                            <textarea id="reply-${q.id}" rows="2" placeholder="پاسخ خود را بنویسید..." style="width:100%; padding:8px; border-radius:12px; border:1px solid var(--border); font-family:inherit; background:var(--input-bg); color:var(--text-primary);"></textarea>
                            <button class="reply-q" data-id="${q.id}">✅ ارسال پاسخ (مدیر)</button>
                        </div>
                    `;
                } else if (loggedUser) {
                    replyBtn = `<p style="font-size:0.8rem; color:var(--text-secondary); margin-top:8px;">💡 فقط مدیران می‌توانند پاسخ دهند.</p>`;
                } else {
                    replyBtn = `<p style="font-size:0.8rem; color:var(--text-secondary); margin-top:8px;"><a href="login.html">وارد شوید</a> تا پاسخ دهید.</p>`;
                }

                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                        <div class="question-title">${escapeHtml(q.title)}</div>
                        <div style="display:flex; gap:4px; align-items:center;">
                            <span style="font-size:0.7rem; color:var(--text-secondary);">${totalAnswers} پاسخ</span>
                            ${deleteBtn}
                        </div>
                    </div>
                    <div class="question-meta">پرسیده شده توسط: ${escapeHtml(q.asker)} | ${timeAgo(q.date)}</div>
                    <div class="question-body">${escapeHtml(q.body)}</div>
                    ${answersHtml}
                    ${replyBtn}
                `;
                container.appendChild(card);
            }

            // رویدادها
            document.querySelectorAll('.toggle-ans').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.getAttribute('data-id');
                    const div = document.getElementById(`answers-${id}`);
                    if (div.style.display === 'none') {
                        div.style.display = 'block';
                        btn.textContent = '🙈 مخفی کردن پاسخ‌ها';
                    } else {
                        div.style.display = 'none';
                        const count = div.querySelectorAll('.answer-item').length;
                        btn.textContent = `📖 مشاهده پاسخ‌ها (${count})`;
                    }
                };
            });

            document.querySelectorAll('.delete-q').forEach(btn => {
                btn.onclick = async () => {
                    const id = parseInt(btn.getAttribute('data-id'));
                    let questions = await fetchQuestions();
                    const q = questions.find(x => x.id === id);
                    if (!isAdmin && q.asker !== loggedUser) {
                        showNotification('شما فقط سوال خود را می‌توانید حذف کنید.', 'error');
                        return;
                    }
                    if (confirm('آیا از حذف این سوال مطمئن هستید؟')) {
                        const newQ = questions.filter(x => x.id !== id);
                        await saveQuestions(newQ);
                        loadQuestions();
                        showNotification('سوال با موفقیت حذف شد.', 'success');
                    }
                };
            });

            document.querySelectorAll('.reply-q').forEach(btn => {
                btn.onclick = async () => {
                    if (!isAdmin) {
                        showNotification('فقط مدیر می‌تواند پاسخ دهد.', 'error');
                        return;
                    }
                    const id = parseInt(btn.getAttribute('data-id'));
                    const textarea = document.getElementById(`reply-${id}`);
                    const answerText = textarea.value.trim();
                    if (!answerText) {
                        showNotification('لطفاً متن پاسخ را بنویسید.', 'error');
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
                    showNotification('پاسخ با موفقیت ثبت شد.', 'success');
                };
            });

            document.querySelectorAll('.reply-to-answer').forEach(btn => {
                btn.onclick = async () => {
                    if (!loggedUser) {
                        showNotification('برای پاسخ باید وارد شوید.', 'error');
                        return;
                    }
                    const questionId = parseInt(btn.getAttribute('data-qid'));
                    const answerId = parseInt(btn.getAttribute('data-aid'));
                    const textarea = document.getElementById(`reply-to-${answerId}`);
                    const replyText = textarea.value.trim();
                    if (!replyText) {
                        showNotification('لطفاً متن خود را بنویسید.', 'error');
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
                    showNotification('نظر شما ثبت شد.', 'success');
                };
            });

        } catch (err) {
            container.innerHTML = `<p style="color:red; text-align:center;">❌ خطا در بارگذاری اطلاعات.</p>`;
            console.error(err);
        }
    }

    await loadQuestions();
});
