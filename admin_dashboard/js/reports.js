/**
 * Smart Civic Issue Reporting System - Reports & Analytics Controller
 */

let monthlyChart = null;
let categoryReportChart = null;
let statusReportChart = null;

document.addEventListener('DOMContentLoaded', () => {
  loadReportsData();
});

async function loadReportsData() {
  const res = await API.get('/reports/stats');
  if (!res || !res.ok || !res.data || !res.data.success) {
    showToast('Failed to load reporting statistics.', 'error');
    return;
  }

  const { summary, category_stats, status_stats, monthly_trends } = res.data;

  // 1. Update KPI Summary
  document.getElementById('rep-total').textContent = summary.total;
  document.getElementById('rep-resolved').textContent = summary.resolved;
  document.getElementById('rep-pending').textContent = summary.pending;
  document.getElementById('rep-rate').textContent = `${summary.resolution_rate}%`;

  // 2. Render Monthly Trends
  renderMonthlyTrends(monthly_trends);

  // 3. Render Category Breakdown
  renderCategoryBreakdown(category_stats);

  // 4. Render Status Breakdown
  renderStatusBreakdown(status_stats);
}

function renderMonthlyTrends(trends) {
  const ctx = document.getElementById('monthlyTrendChart');
  if (!ctx) return;

  const labels = trends && trends.length > 0 ? trends.map(t => t.month_period) : ['Current Month'];
  const data = trends && trends.length > 0 ? trends.map(t => t.count) : [0];

  if (monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Grievances Filed',
        data: data,
        borderColor: '#184e38',
        backgroundColor: 'rgba(24, 78, 56, 0.1)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#184e38',
        pointRadius: 5
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
          ticks: { stepSize: 1, precision: 0 },
          grid: { color: '#f1f5f9' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

function renderCategoryBreakdown(categories) {
  const ctx = document.getElementById('categoryReportChart');
  if (!ctx) return;

  const labels = categories.map(c => c.category_name);
  const data = categories.map(c => c.count);
  const colors = ['#184e38', '#2d7a57', '#4d9b75', '#7cb999', '#b2dec5', '#f6d892'];

  if (categoryReportChart) categoryReportChart.destroy();

  categoryReportChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
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
          labels: { boxWidth: 12, font: { size: 11, family: 'Inter' } }
        }
      }
    }
  });
}

function renderStatusBreakdown(statuses) {
  const ctx = document.getElementById('statusReportChart');
  if (!ctx) return;

  const order = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
  const colorMap = {
    'Submitted': '#b91c1c',
    'Under Review': '#b45309',
    'In Progress': '#0369a1',
    'Resolved': '#15803d'
  };

  const countMap = {};
  statuses.forEach(s => { countMap[s.status] = s.count; });

  const labels = order;
  const data = order.map(s => countMap[s] || 0);
  const colors = order.map(s => colorMap[s]);

  if (statusReportChart) statusReportChart.destroy();

  statusReportChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, font: { size: 11, family: 'Inter' } }
        }
      },
      cutout: '60%'
    }
  });
}
