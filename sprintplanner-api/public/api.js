// Auth helpers
function getToken() {
    return localStorage.getItem('token');
}

function checkAuth() {
    return !!getToken();
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

// Theme
function getTheme() {
    return localStorage.getItem('theme') || 'dark';
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.body.classList.toggle('light-mode', theme === 'light');
}

function toggleTheme() {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

// Avatar
const AVATAR_COLORS = ['#e94560', '#4ade80', '#fbbf24', '#60a5fa', '#a78bfa', '#f472b6', '#34d399', '#fb923c'];

function getAvatarColor(name) {
    if (!name) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function createAvatarElement(user, size = 32) {
    if (!user) return '';
    const color = getAvatarColor(user.name || user.email);
    const initials = getInitials(user.name || user.email);
    if (user.avatarUrl) {
        return `<img src="${user.avatarUrl}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;">`;
    }
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:${size * 0.4}px;font-weight:600;color:white;">${initials}</div>`;
}

// API
const api = {
    fetch: async (url, options = {}) => {
        const token = getToken();
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || res.statusText);
        return res.json();
    },
    getMe: () => api.fetch('/api/me'),
    getBoard: (id) => api.fetch(`/api/boards/${id}`),
    updateBoard: (id, data) => api.fetch(`/api/boards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getMembers: (id) => api.fetch(`/api/boards/${id}/members`),
    inviteMember: (id, email, role) => api.fetch(`/api/boards/${id}/members`, { method: 'POST', body: JSON.stringify({ email, role }) }),
    removeMember: (id, memberId) => api.fetch(`/api/boards/${id}/members/${memberId}`, { method: 'DELETE' }),
    setVisibility: (id, isPublic) => api.fetch(`/api/boards/${id}`, { method: 'PUT', body: JSON.stringify({ isPublic }) }),
};

// User Menu
function renderUserMenu(container, user) {
    if (!container) return;
    window.currentUser = user;
    const theme = getTheme();
    container.innerHTML = `
        <div style="position:relative;">
            <div onclick="toggleUserDropdown()" style="cursor:pointer;">
                ${createAvatarElement(user, 36)}
            </div>
            <div id="userDropdown" style="display:none;position:absolute;top:100%;right:0;margin-top:8px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;min-width:220px;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:100;">
                <div style="padding:12px;display:flex;gap:12px;align-items:center;border-bottom:1px solid var(--border);">
                    ${createAvatarElement(user, 40)}
                    <div>
                        <div style="font-weight:500;">${user?.name || 'User'}</div>
                        <div style="font-size:12px;color:var(--text-secondary);">${user?.email || ''}</div>
                    </div>
                </div>
                <label style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;cursor:pointer;">
                    <span>🌙 Dark Mode</span>
                    <input type="checkbox" ${theme === 'dark' ? 'checked' : ''} onchange="toggleTheme()">
                </label>
                <div style="height:1px;background:var(--border);"></div>
                <button onclick="logout()" style="width:100%;padding:10px 12px;background:none;border:none;color:var(--text-primary);cursor:pointer;text-align:left;">Logout</button>
            </div>
        </div>
    `;
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown && !e.target.closest('#userMenuContainer')) {
        dropdown.style.display = 'none';
    }
});
