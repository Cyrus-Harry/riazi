// ===== اطلاعات دیتابیس جدید =====
const API_KEY = "$2a$10$/5vpvMhVYT3akahPv1wWUOWQmg1ZunHHB2MAf.4QIPDRRrcpKwFRy";
const BIN_ID_USERS = "6a323283da38895dfece25f2";
const BIN_ID_QUESTIONS = "6a3232f2da38895dfece2755";

// ===== گرفتن کاربران =====
async function fetchUsers() {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID_USERS}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
    });
    const data = await res.json();
    return data.record.users || [];
}

// ===== ذخیره کاربران =====
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

// ===== گرفتن سوالات =====
async function fetchQuestions() {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID_QUESTIONS}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
    });
    const data = await res.json();
    return data.record.questions || [];
}

// ===== ذخیره سوالات =====
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

// ===== بررسی اتصال (برای دیباگ) =====
console.log('✅ api.js لود شد با BIN ID جدید');
console.log('📌 BIN_ID_USERS:', BIN_ID_USERS);
console.log('📌 BIN_ID_QUESTIONS:', BIN_ID_QUESTIONS);
