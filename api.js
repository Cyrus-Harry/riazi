// ============================================
// تنظیمات دیتابیس JSONBin (جدید)
// ============================================
const API_KEY = "$2a$10$/5vpvMhVYT3akahPv1wWUOWQmg1ZunHHB2MAf.4QIPDRRrcpKwFRy";
const BIN_ID_USERS = "6a323283da38895dfece25f2";
const BIN_ID_QUESTIONS = "6a3232f2da38895dfece2755";

// ============================================
// توابع کاربران
// ============================================
async function fetchUsers() {
    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID_USERS}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        if (!res.ok) throw new Error('خطا در دریافت کاربران');
        const data = await res.json();
        return data.record.users || [];
    } catch (error) {
        console.error('❌ fetchUsers:', error);
        return [];
    }
}

async function saveUsers(users) {
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID_USERS}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ users })
        });
    } catch (error) {
        console.error('❌ saveUsers:', error);
    }
}

// ============================================
// توابع سوالات
// ============================================
async function fetchQuestions() {
    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID_QUESTIONS}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        if (!res.ok) throw new Error('خطا در دریافت سوالات');
        const data = await res.json();
        return data.record.questions || [];
    } catch (error) {
        console.error('❌ fetchQuestions:', error);
        return [];
    }
}

async function saveQuestions(questions) {
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID_QUESTIONS}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ questions })
        });
    } catch (error) {
        console.error('❌ saveQuestions:', error);
    }
}
