const API_KEY = "$2a$10$/5vpvMhVYT3akahPv1wWUOWQmg1ZunHHB2MAf.4QIPDRRrcpKwFRy";
const BIN_ID_USERS = "6a323283da38895dfece25f2";
const BIN_ID_QUESTIONS = "6a3232f2da38895dfece2755";

// ===== توابع کمکی برای مدیریت خطاهای شبکه =====
async function apiRequest(url, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
    };
    const config = {
        ...options,
        headers: { ...defaultHeaders, ...options.headers }
    };
    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ===== کاربران =====
async function fetchUsers() {
    const data = await apiRequest(`https://api.jsonbin.io/v3/b/${BIN_ID_USERS}/latest`);
    return data.record.users || [];
}

async function saveUsers(users) {
    await apiRequest(`https://api.jsonbin.io/v3/b/${BIN_ID_USERS}`, {
        method: 'PUT',
        body: JSON.stringify({ users })
    });
}

// ===== سوالات =====
async function fetchQuestions() {
    const data = await apiRequest(`https://api.jsonbin.io/v3/b/${BIN_ID_QUESTIONS}/latest`);
    return data.record.questions || [];
}

async function saveQuestions(questions) {
    await apiRequest(`https://api.jsonbin.io/v3/b/${BIN_ID_QUESTIONS}`, {
        method: 'PUT',
        body: JSON.stringify({ questions })
    });
}
