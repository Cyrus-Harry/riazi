const BIN_ID_QUESTIONS = "6a2fc6adda38895dfec2a0ce";
const API_KEY = "$2a$10$ZyhnY/TqvbbO/3oHeIIsYeHsogdxE8fnK8TsDM5qJTH6IZnH5m4uC";

async function fetchQuestions() {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID_QUESTIONS}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
    });
    const data = await res.json();
    return data.record.questions;
}

async function saveQuestions(questions) {
    await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID_QUESTIONS}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY
        },
        body: JSON.stringify({ questions })
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('askForm');
    const msgDiv = document.getElementById('message');
    const loggedUser = localStorage.getItem('loggedInUser');

    if (!loggedUser) {
        msgDiv.innerHTML = '⚠️ برای پرسیدن سوال باید ابتدا <a href="login.html">وارد شوید</a>.';
        msgDiv.style.color = 'red';
        form.style.display = 'none';
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = '⏳ در حال ثبت سوال...';
        submitBtn.disabled = true;

        const title = document.getElementById('questionTitle').value.trim();
        const body = document.getElementById('questionBody').value.trim();

        if (!title || !body) {
            msgDiv.innerHTML = '❌ لطفاً عنوان و متن سوال را پر کنید.';
            msgDiv.style.color = 'red';
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            return;
        }

        try {
            let questions = await fetchQuestions();
            const newQuestion = {
                id: Date.now(),
                title: title,
                body: body,
                asker: loggedUser,
                date: new Date().toLocaleString('fa-IR'),
                answers: []
            };
            questions.unshift(newQuestion);
            await saveQuestions(questions);

            msgDiv.innerHTML = '✅ سوال شما با موفقیت ثبت شد. <a href="questions.html">مشاهده سوالات</a>';
            msgDiv.style.color = 'green';
            form.reset();
        } catch (error) {
            msgDiv.innerHTML = '❌ خطا در ارسال سوال. لطفاً دوباره تلاش کنید.';
            msgDiv.style.color = 'red';
            console.error(error);
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
});