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
            let questions = await fetchQuestions(); // فراخوانی از api.js مشترک
            if (!questions || questions.length === 0) {
                container.innerHTML = '<p>هیچ سوالی نیست. اولین سوال را بپرسید.</p>';
                return;
            }

            container.innerHTML = '';
            for (let q of questions) {
                const card = document.createElement('div');
                card.className = 'question-card';
                const answersDivId = `answers-${q.id}`;

                let deleteBtn = '';
                if (isAdmin || (loggedUser && q.asker === loggedUser)) {
                    deleteBtn = `<button class="delete-q" data-id="${q.id}" style="background:#c0392b; color:white; border:none; border-radius:20px; padding:4px 12px; margin-right:10px; cursor:pointer;">🗑️ حذف سوال</button>`;
                }

                let answersHtml = `
                    <div class="answers-section" style="margin-top:10px;">
                        <button class="toggle-ans" data-id="${q.id}" style="background:#1f6e8c; color:white; border:none; padding:5px 12px; border-radius:15px; cursor:pointer;">📖 مشاهده پاسخ‌ها</button>
                        <div id="${answersDivId}" style="display:none; margin-top:10px;">
                            <strong>پاسخ‌ها (${q.answers.length}):</strong>
                            ${q.answers.map(a => `<div class="answer-item"><strong>${escapeHtml(a.answerer)}:</strong> ${escapeHtml(a.text)} <small>(${a.date})</small></div>`).join('')}
                            ${q.answers.length === 0 ? '<p>هنوز پاسخی داده نشده است.</p>' : ''}
                        </div>
                    </div>
                `;

                let replyBtn = '';
                if (isAdmin) {
                    replyBtn = `<div style="margin-top:10px;"><textarea id="reply-${q.id}" rows="2" placeholder="پاسخ خود را بنویسید..." style="width:100%; padding:8px; border-radius:12px; border:1px solid #ccc; font-family:inherit;"></textarea><button class="reply-q" data-id="${q.id}" style="margin-top:5px; background:#2ecc71; color:white; border:none; border-radius:15px; padding:6px 12px; cursor:pointer;">✅ ارسال پاسخ</button></div>`;
                } else if (loggedUser) {
                    replyBtn = `<p style="font-size:0.8rem; color:#7f8c8d; margin-top:10px;">💡 فقط مدیران می‌توانند پاسخ دهند.</p>`;
                } else {
                    replyBtn = `<p style="font-size:0.8rem; color:#7f8c8d; margin-top:10px;"><a href="login.html">وارد شوید</a> تا پاسخ دهید.</p>`;
                }

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

            // رویداد مشاهده پاسخ‌ها
            document.querySelectorAll('.toggle-ans').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.getAttribute('data-id');
                    const div = document.getElementById(`answers-${id}`);
                    if (div.style.display === 'none') {
                        div.style.display = 'block';
                        btn.textContent = '🙈 مخفی کردن پاسخ‌ها';
                    } else {
                        div.style.display = 'none';
                        btn.textContent = '📖 مشاهده پاسخ‌ها';
                    }
                };
            });

            // رویداد حذف سوال
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

            // رویداد پاسخ دادن
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
                    questions[idx].answers.push({
                        text: answerText,
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

    // سوالات نمونه (اگر دیتابیس خالی باشد)
    async function seedSample() {
        try {
            let questions = await fetchQuestions();
            if (!questions || questions.length === 0) {
                const sample = [
                    {
                        id: 1001,
                        title: "چگونه مساحت دایره را محاسبه کنم؟",
                        body: "فرمول مساحت دایره چیست؟ لطفاً با مثال توضیح دهید.",
                        asker: "علی_رضا",
                        date: "۱۴۰۳/۱۱/۲۰ ۱۴:۳۰",
                        answers: [{ text: "مساحت دایره = π × r². مثال: r=2 → مساحت ≈ 12.56", answerer: "مدیر سایت", date: "۱۴۰۳/۱۱/۲۰ ۱۵:۰۰" }]
                    },
                    {
                        id: 1002,
                        title: "نحوه حل معادله 2x + 3 = 7",
                        body: "لطفاً قدم به قدم توضیح دهید.",
                        asker: "سارا_خان",
                        date: "۱۴۰۳/۱۱/۱۹ ۱۰:۱۵",
                        answers: [{ text: "2x+3=7 → 2x=4 → x=2", answerer: "rezamath", date: "۱۴۰۳/۱۱/۱۹ ۱۱:۰۰" }]
                    },
                    {
                        id: 1003,
                        title: "فرمول محیط مثلث متساوی الاضلاع",
                        body: "اگر ضلع مثلث ۵ باشد، محیط چقدر می‌شود؟",
                        asker: "مهسا_احمدی",
                        date: "۱۴۰۳/۱۱/۱۸ ۰۹:۴۵",
                        answers: []
                    }
                ];
                await saveQuestions(sample);
            }
        } catch (e) {
            console.log("ورود اولیه سوالات نمونه با خطا مواجه شد یا دیتابیس پر است.");
        }
    }

    await seedSample();
    await loadQuestions();
});