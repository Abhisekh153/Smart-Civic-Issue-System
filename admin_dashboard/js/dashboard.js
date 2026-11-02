/**
 * Smart Civic Issue Reporting System - Dashboard Controller
 * Fetches actual database statistics, renders Chart.js charts, recent complaints & activity.
 */

let categoryChartInstance = null;
let statusChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
});

async function loadDashboardData() {
  await Promise.all([
    fetchStats(),
    fetchCharts(),
    fetchRecentComplaints(),
    fetchRecentActivity()
  ]);
}

/** 1. Fetch KPI Statistics from database */
async function fetchStats() {
  const res = await API.get('/dashboard/stats');
  if (res && res.ok && res.data && res.data.success) {
    const s = res.data.stats;
    document.getElementById('stat-total').textContent = s.total;
    document.getElementById('stat-submitted').textContent = s.submitted;
    document.getElementById('stat-under-review').textContent = s.under_review;
    document.getElementById('stat-in-progress').textContent = s.in_progress;
    document.getElementById('stat-resolved').textContent = s.resolved;
  }
}

/** 2. Fetch Chart Aggregations & Render Chart.js */
async function fetchCharts() {
  const res = await API.get('/dashboard/charts');
  if (!res || !res.ok || !res.data || !res.data.success) return;

  const { category_chart, status_chart } = res.data;

  // Render Category Chart (Doughnut)
  renderCategoryChart(category_chart);

  // Render Status Chart (Bar / Doughnut)
  renderStatusChart(status_chart);
}

function renderCategoryChart(data) {
  const ctx = document.getElementById('categoryChart');
  if (!ctx) return;

  const labels = data.map(d => d.category_name);
  const counts = data.map(d => d.count);
  const colors = [
    '#2563eb', // Blue
    '#f59e0b', // Amber
    '#06b6d4', // Cyan
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#10b981'  // Emerald
  ];

  if (categoryChartInstance) categoryChartInstance.destroy();

  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: counts,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            font: { size: 11, family: 'Inter' },
            padding: 12
          }
        }
      },
      cutout: '68%'
    }
  });
}

function renderStatusChart(data) {
  const ctx = document.getElementById('statusChart');
  if (!ctx) return;

  // Order by standard lifecycle
  const order = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
  const statusColorMap = {
    'Submitted': '#e11d48',
    'Under Review': '#d97706',
    'In Progress': '#2563eb',
    'Resolved': '#16a34a'
  };

  const countMap = {};
  data.forEach(item => { countMap[item.status] = item.count; });

  const labels = order;
  const counts = order.map(s => countMap[s] || 0);
  const backgroundColors = order.map(s => statusColorMap[s]);

  if (statusChartInstance) statusChartInstance.destroy();

  statusChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Number of Complaints',
        data: counts,
        backgroundColor: backgroundColors,
        borderRadius: 6,
        barPercentage: 0.6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0, font: { size: 11, family: 'Inter' } },
          grid: { color: '#f1f5f9' }
        },
        x: {
          ticks: { font: { size: 11, family: 'Inter' } },
          grid: { display: false }
        }
      }
    }
  });
}

/** 3. Fetch Recent Complaints Table */
async function fetchRecentComplaints() {
  const res = await API.get('/dashboard/recent-complaints');
  const tbody = document.getElementById('recent-complaints-tbody');
  if (!tbody) return;

  if (!res || !res.ok || !res.data || !res.data.complaints || res.data.complaints.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">
          No civic complaints submitted yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = res.data.complaints.map(c => `
    <tr>
      <td><strong>#${c.complaint_id}</strong></td>
      <td>
        <span style="font-size: 13px; font-weight: 500;">
          <i class="fa-solid ${c.category_icon || 'fa-tag'}" style="color: var(--primary); margin-right: 6px;"></i>
          ${c.category_name}
        </span>
      </td>
      <td>
        <div style="font-weight: 500;">${c.citizen_name}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${c.citizen_email}</div>
      </td>
      <td>
        <span style="font-size: 12.5px; color: var(--text-muted);" title="${c.address}">
          ${c.address.length > 28 ? c.address.substring(0, 28) + '...' : c.address}
        </span>
      </td>
      <td>${getStatusBadge(c.status)}</td>
      <td>
        <a href="complaint-details.html?id=${c.complaint_id}" class="btn btn-outline btn-sm">
          <span>Inspect</span>
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </td>
    </tr>
  `).join('');
}

/** 4. Fetch Recent Activity Feed */
async function fetchRecentActivity() {
  const res = await API.get('/dashboard/activity');
  const feed = document.getElementById('activity-feed');
  if (!feed) return;

  if (!res || !res.ok || !res.data || !res.data.activities || res.data.activities.length === 0) {
    feed.innerHTML = `
      <div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 16px;">
        No status update activity recorded.
      </div>
    `;
    return;
  }

  feed.innerHTML = res.data.activities.map(act => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-header">
        <span class="timeline-status">
          Complaint <a href="complaint-details.html?id=${act.complaint_id}" style="color: var(--primary); text-decoration: none;">#${act.complaint_id}</a>: 
          <strong>${act.new_status}</strong>
        </span>
        <span class="timeline-time">${formatDate(act.updated_at)}</span>
      </div>
      <div class="timeline-remark">
        "${act.admin_remark || 'Status updated.'}"
      </div>
      <div class="timeline-author">
        <i class="fa-solid fa-user-shield"></i>
        <span>Updated by ${act.admin_name}</span>
      </div>
    </div>
  `).join('');
}
