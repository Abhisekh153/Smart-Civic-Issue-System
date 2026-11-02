/**
 * Smart Civic Issue Reporting System - Admin Dashboard
 * Core API & UI Helpers
 */

const API = {
  baseUrl: '/api/admin',

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      },
      credentials: 'include' // include session cookies
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      // If unauthorized on a protected page, redirect to login
      if (response.status === 401 && !window.location.pathname.includes('login.html')) {
        sessionStorage.removeItem('adminUser');
        window.location.href = '/login.html?expired=1';
        return null;
      }

      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      return { ok: false, status: 0, error: err.message, data: { success: false, message: 'Network communication error.' } };
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }
};

/** Toast Notification Service */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const iconMap = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info'
  };

  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type] || 'fa-bell'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/** Check Admin Auth Session on Page Load */
async function checkAdminAuth() {
  if (window.location.pathname.includes('login.html')) return;

  const res = await API.get('/me');
  if (!res || !res.ok || !res.data || !res.data.authenticated) {
    window.location.href = '/login.html';
    return;
  }

  // Populate admin name and avatar
  const user = res.data.user;
  sessionStorage.setItem('adminUser', JSON.stringify(user));
  
  const nameEl = document.getElementById('admin-display-name');
  if (nameEl) nameEl.textContent = user.name;
  
  const roleEl = document.getElementById('admin-display-role');
  if (roleEl) roleEl.textContent = user.role.toUpperCase();

  const avatarEl = document.getElementById('admin-avatar-initials');
  if (avatarEl && user.name) {
    avatarEl.textContent = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}

/** Logout Administrator */
async function logoutAdmin() {
  if (!confirm('Are you sure you want to log out of the Admin Portal?')) return;
  
  try {
    await API.post('/logout', {});
    sessionStorage.removeItem('adminUser');
    window.location.href = '/login.html';
  } catch (err) {
    window.location.href = '/login.html';
  }
}

/** Format Date strings */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/** Format Status Badge */
function getStatusBadge(status) {
  const map = {
    'Submitted': { class: 'badge-submitted', icon: 'fa-circle-dot' },
    'Under Review': { class: 'badge-under-review', icon: 'fa-magnifying-glass' },
    'In Progress': { class: 'badge-in-progress', icon: 'fa-screwdriver-wrench' },
    'Resolved': { class: 'badge-resolved', icon: 'fa-circle-check' }
  };
  const item = map[status] || { class: 'badge-submitted', icon: 'fa-circle-dot' };
  return `<span class="status-badge ${item.class}"><i class="fa-solid ${item.icon}"></i> ${status}</span>`;
}

/** Setup Sidebar Navigation Active state & Mobile Toggle */
function setupNavigation() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.endsWith(href) || (href === 'dashboard.html' && (currentPath === '/' || currentPath.endsWith('index.html')))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Mobile toggle
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

// Auto init nav & auth
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  checkAdminAuth();
});
