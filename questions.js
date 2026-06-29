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

                // ---- دکمه حذف سوال (ادمین یا صاحب سوال) ----
                let deleteBtn = '';
                if (isAdmin || (loggedUser && q.asker === loggedUser)) {
                    deleteBtn = `<button class="delete-q" data-id="${q.id}" style="background:#c0392b;color:white;border:none;border-radius:20px;padding:4px 12px;margin-right:10px;cursor:pointer;">🗑️ حذف سوال</button>`;
                }

                // ---- نمایش پاسخ‌ها (پاسخ برگزیده اول) ----
                const allAnswers = q.answers || [];
                const sortedAnswers = [...allAnswers].sort((a, b) => {
                    if (a.isBest) return -1;
                    if (b.isBest) return 1;
                    return 0;
                });

                const answersHtml = `
                    <div class="answers-section" style="margin-top:10px;">
                        <button class="toggle-ans" data-id="${q.id}" style="background:#1f6e8c;color:white;border:none;padding:5px 12px;border-radius:15px;cursor:pointer;">
                            📖 مشاهده پاسخ‌ها (${allAnswers.length})
                        </button>
                        <div id="${answersDivId}" style="display:none;margin-top:10px;">
                            ${sortedAnswers.length === 0
                                ? '<p style="color:#888;padding:8px;">هنوز پاسخی داده نشده است.</p>'
                                : sortedAnswers.map((a, idx) => {
                                    const isBest = a.isBest === true;
                                    // ایندکس اصلی در آرایه اصلی برای pick-best
                                    const origIdx = allAnswers.findIndex(x => x.answerer === a.answerer && x.date === a.date && x.text === a.text);
                                    const bestBadge = isBest
                                        ? `<span style="background:#f1c40f;color:#333;border-radius:10px;padding:2px 8px;font-size:0.75rem;margin-right:6px;">⭐ پاسخ برگزیده</span>`
                                        : '';
                                    const bestBtn = isAdmin && !isBest
                                        ? `<button class="pick-best" data-qid="${q.id}" data-aidx="${origIdx}" style="background:#f39c12;color:white;border:none;border-radius:10px;padding:3px 10px;font-size:0.75rem;cursor:pointer;margin-top:6px;">⭐ انتخاب به عنوان پاسخ برگزیده</button>`
                                        : '';
                                    return `
                                        <div class="answer-item" style="${isBest ? 'background:#fff9e0;border:2px solid #f1c40f;' : ''}">
                                            <div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;margin-bottom:4px;">
                                                ${bestBadge}
                                                <strong style="color:#1f6e8c;">${escapeHtml(a.answerer)}</strong>
                                                <small style="color:#888;">(${a.date})</small>
                                            </div>
                                            <p style="margin:4px 0;">${escapeHtml(a.text)}</p>
                                            ${bestBtn}
                                        </div>
                                    `;
                                }).join('')
                            }
                        </div>
                    </div>
                `;

                // ---- فرم ارسال پاسخ (همه کاربران لاگین‌کرده) ----
                let replySection = '';
                if (loggedUser) {
                    replySection = `
                        <div style="margin-top:12px;">
                            <textarea id="reply-${q.id}" rows="2" placeholder="پاسخ خود را بنویسید..." style="width:100%;padding:8px;border-radius:12px;border:1px solid #ccc;font-family:inherit;font-size:0.95rem;resize:vertical;"></textarea>
                            <button class="reply-q" data-id="${q.id}" style="margin-top:5px;background:#2ecc71;color:white;border:none;border-radius:15px;padding:6px 14px;cursor:pointer;font-size:0.95rem;">✅ ارسال پاسخ</button>
                        </div>
                    `;
                } else {
                    replySection = `<p style="font-size:0.85rem;color:#7f8c8d;margin-top:10px;"><a href="login.html">وارد شوید</a> تا بتوانید پاسخ دهید.</p>`;
                }

                card.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                        <div class="question-title">${escapeHtml(q.title)}</div>
                        ${deleteBtn}
                    </div>
                    <div class="question-meta">پرسیده شده توسط: ${escapeHtml(q.asker)} | ${q.date}</div>
                    <div class="question-body">${escapeHtml(q.body)}</div>
                    ${answersHtml}
                    ${replySection}
                `;
                container.appendChild(card);
            }

            // ---- رویداد: نمایش/مخفی پاسخ‌ها ----
            document.querySelectorAll('.toggle-ans').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.getAttribute('data-id');
                    const div = document.getElementById(`answers-${id}`);
                    if (div.style.display === 'none') {
                        div.style.display = 'block';
                        btn.textContent = '🙈 مخفی کردن پاسخ‌ها';
                    } else {
                        div.style.display = 'none';
                        const q = questions ? questions.find(x => String(x.id) === String(id)) : null;
                        btn.textContent = `📖 مشاهده پاسخ‌ها (${q ? (q.answers || []).length : 0})`;
                    }
                };
            });

            // ---- رویداد: حذف سوال ----
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

            // ---- رویداد: ارسال پاسخ (همه کاربران لاگین‌کرده) ----
            document.querySelectorAll('.reply-q').forEach(btn => {
                btn.onclick = async () => {
                    const id = parseInt(btn.getAttribute('data-id'));
                    const textarea = document.getElementById(`reply-${id}`);
                    const answerText = textarea.value.trim();
                    if (!answerText) {
                        alert('لطفاً متن پاسخ را بنویسید.');
                        return;
                    }

                    btn.disabled = true;
                    btn.textContent = '⏳ در حال ارسال...';

                    try {
                        let questions = await fetchQuestions();
                        const idx = questions.findIndex(x => x.id === id);
                        if (idx === -1) return;
                        questions[idx].answers.push({
                            text: answerText,
                            answerer: loggedUser,
                            date: new Date().toLocaleString('fa-IR'),
                            isBest: false
                        });
                        await saveQuestions(questions);
                        textarea.value = '';
                        loadQuestions();
                    } catch(e) {
                        alert('خطا در ارسال پاسخ. دوباره تلاش کنید.');
                        btn.disabled = false;
                        btn.textContent = '✅ ارسال پاسخ';
                    }
                };
            });

            // ---- رویداد: انتخاب پاسخ برگزیده (فقط ادمین) + امتیازدهی ----
            document.querySelectorAll('.pick-best').forEach(btn => {
                btn.onclick = async () => {
                    if (!isAdmin) return;
                    const qid = parseInt(btn.getAttribute('data-qid'));
                    const aidx = parseInt(btn.getAttribute('data-aidx'));

                    btn.disabled = true;
                    btn.textContent = '⏳ در حال ثبت...';

                    try {
                        let questions = await fetchQuestions();
                        const qIdx = questions.findIndex(x => x.id === qid);
                        if (qIdx === -1) return;

                        // isBest همه پاسخ‌ها رو false کن
                        questions[qIdx].answers.forEach(a => a.isBest = false);

                        // پاسخ انتخاب‌شده رو best کن
                        const chosenAnswer = questions[qIdx].answers[aidx];
                        if (!chosenAnswer) return;
                        chosenAnswer.isBest = true;

                        // ---- +۱۰ امتیاز به صاحب پاسخ ----
                        const winnerId = chosenAnswer.answerer;
                        let users = await fetchUsers();
                        const uIdx = users.findIndex(u => u.username === winnerId);
                        if (uIdx !== -1) {
                            users[uIdx].score = (users[uIdx].score || 0) + 10;
                            await saveUsers(users);
                        }

                        await saveQuestions(questions);
                        loadQuestions();
                    } catch(e) {
                        alert('خطا در ثبت پاسخ برگزیده. دوباره تلاش کنید.');
                        btn.disabled = false;
                        btn.textContent = '⭐ انتخاب به عنوان پاسخ برگزیده';
                    }
                };
            });

        } catch (err) {
            container.innerHTML = `<p style="color:red;text-align:center;">❌ خطا در بارگذاری اطلاعات از سرور.</p>`;
            console.error(err);
        }
    }

    await seedSample();
    await loadQuestions();
});
