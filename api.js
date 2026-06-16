// فایل مرکزی برای مدیریت ارتباط با دیتابیس JSONBin
// با این کار دیگر نیازی به تکرار آدرس‌ها و کلیدها در فایل‌های مختلف نیست!

const API_KEY = "$2a$10$ZyhnY/TqvbbO/3oHeIIsYeHsogdxE8fnK8TsDM5qJTH6IZnH5m4uC";
const BIN_ID_USERS = "6a2fc556da38895dfec29a7d";
const BIN_ID_QUESTIONS = "6a2fc6adda38895dfec2a0ce";

// --- توابع مربوط به کاربران ---
async function fetchUsers() {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID_USERS}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
    });
    const data = await res.json();
    return data.record.users;
}

async function saveUsers(users) {
    await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID_USERS}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY
        },
        body: JSON.stringify({ users })
    });
}

// --- توابع مربوط به سوالات انجمن ---
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