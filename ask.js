document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('askForm');
    const msgDiv = document.getElementById('message');
    const loggedUser = localStorage.getItem('loggedInUser');

    if (!loggedUser) {
        msgDiv.innerHTML = '⚠️ برای پرسیدن سوال باید <a href="login.html">وارد شوید</a>';
        msgDiv.style.color = '#e74c3c';
        form.style.display = 'none';
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('askBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        btnText.textContent = 'در حال ثبت سوال...';
        btnLoader.style.display = 'inline';
        submitBtn.disabled = true;
        msgDiv.innerHTML = '';

        const title = document.getElementById('questionTitle').value.trim();
        const body = document.getElementById('questionBody').value.trim();

        if (!title || !body) {
            showNotification('❌ عنوان و متن سوال را پر کنید.', 'error');
            resetBtn();
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

            showNotification('✅ سوال شما با موفقیت ثبت شد!', 'success');
            btnText.textContent = '✅ ثبت شد';
            form.reset();
            setTimeout(() => window.location.href = 'questions.html', 1200);
        } catch (error) {
            showNotification('❌ خطا در ارسال سوال. دوباره تلاش کنید.', 'error');
            console.error(error);
            resetBtn();
        }

        function resetBtn() {
            btnText.textContent = 'ارسال سوال';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
});
