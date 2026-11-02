/**
 * Smart Civic Issue Reporting System - Citizen Management Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  loadCitizens();
  setupCitizenSearch();
  setupCitizenModal();
});

/** Fetch and Render Citizens Table */
async function loadCitizens(search = '') {
  const tbody = document.getElementById('citizensTbody');
  const countBadge = document.getElementById('citizenCountBadge');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="8" style="text-align: center; padding: 32px;">
        <span class="loading-spinner"></span> Loading citizens...
      </td>
    </tr>
  `;

  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await API.get(`/citizens${query}`);

  if (!res || !res.ok || !res.data || !res.data.citizens) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; color: #ef4444; padding: 24px;">
          Failed to load citizen records from database.
        </td>
      </tr>
    `;
    return;
  }

  const citizens = res.data.citizens;
  if (countBadge) countBadge.textContent = `${citizens.length} registered citizens`;

  if (citizens.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <i class="fa-solid fa-users-slash"></i>
            <h4>No citizens found</h4>
            <p>Try searching with another name, email address, or phone number.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = citizens.map(c => `
    <tr>
      <td><strong>#${c.user_id}</strong></td>
      <td>
        <div style="font-weight: 600; color: var(--text-main);">${c.name}</div>
      </td>
      <td>${c.email}</td>
      <td>${c.phone || '<span style="color: var(--text-light);">N/A</span>'}</td>
      <td>
        <span style="font-weight: 700; background: #eff6ff; color: #1d4ed8; padding: 3px 10px; border-radius: 12px; font-size: 12px;">
          ${c.total_complaints || 0}
        </span>
      </td>
      <td>
        <span style="font-weight: 700; background: #ecfdf5; color: #059669; padding: 3px 10px; border-radius: 12px; font-size: 12px;">
          ${c.resolved_complaints || 0}
        </span>
      </td>
      <td style="font-size: 12px; color: var(--text-muted);">${formatDate(c.created_at)}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="viewCitizenDetail(${c.user_id})">
          <i class="fa-solid fa-folder-open"></i>
          <span>Submissions</span>
        </button>
      </td>
    </tr>
  `).join('');
}

/** Setup Search Input */
function setupCitizenSearch() {
  const searchInput = document.getElementById('citizenSearchInput');
  let timer;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        loadCitizens(searchInput.value.trim());
      }, 300);
    });
  }
}

/** View Citizen Details & Complaints Modal */
async function viewCitizenDetail(userId) {
  const modal = document.getElementById('citizenModal');
  const tbody = document.getElementById('citizenComplaintsTbody');
  if (!modal || !tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align: center; padding: 20px;">
        <span class="loading-spinner"></span> Loading citizen submissions...
      </td>
    </tr>
  `;

  modal.classList.add('active');

  const res = await API.get(`/citizens/${userId}`);
  if (!res || !res.ok || !res.data || !res.data.citizen) {
    showToast('Failed to load citizen submissions.', 'error');
    modal.classList.remove('active');
    return;
  }

  const { citizen, complaints } = res.data;

  document.getElementById('modalCitizenTitle').innerHTML = `
    <i class="fa-solid fa-user-circle" style="color: var(--primary);"></i> ${citizen.name}
  `;
  document.getElementById('modalCitizenEmail').textContent = citizen.email;
  document.getElementById('modalCitizenPhone').textContent = citizen.phone || 'N/A';
  document.getElementById('modalCitizenDate').textContent = formatDate(citizen.created_at);
  document.getElementById('modalComplaintsCount').textContent = complaints.length;

  if (complaints.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">
          This citizen has not submitted any civic complaints yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = complaints.map(c => `
    <tr>
      <td><strong>#${c.complaint_id}</strong></td>
      <td>
        <i class="fa-solid ${c.category_icon || 'fa-tag'}" style="color: var(--primary); margin-right: 4px;"></i>
        ${c.category_name}
      </td>
      <td>${getStatusBadge(c.status)}</td>
      <td style="font-size: 11.5px;">${formatDate(c.created_at)}</td>
      <td>
        <a href="complaint-details.html?id=${c.complaint_id}" class="btn btn-outline btn-sm">
          <span>Inspect</span>
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </td>
    </tr>
  `).join('');
}

/** Setup Modal Close Handlers */
function setupCitizenModal() {
  const modal = document.getElementById('citizenModal');
  const closeBtn = document.getElementById('closeCitizenModalBtn');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}
