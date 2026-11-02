/**
 * Smart Civic Issue Reporting System - Complaints Controller
 */

let allMapInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  initComplaintsPage();
});

async function initComplaintsPage() {
  await loadCategories();
  await loadComplaints();
  setupFilterEvents();
  setupMapModal();
}

/** Load Categories for Filter Dropdown */
async function loadCategories() {
  const res = await API.get('/categories');
  const select = document.getElementById('categoryFilter');
  if (!select) return;

  if (res && res.ok && res.data && res.data.categories) {
    res.data.categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.category_id;
      opt.textContent = `${cat.category_name} (${cat.complaint_count})`;
      select.appendChild(opt);
    });
  }
}

/** Fetch and Render Complaints Table */
async function loadComplaints() {
  const tbody = document.getElementById('complaintsTbody');
  const countBadge = document.getElementById('resultsCountBadge');
  if (!tbody) return;

  const search = document.getElementById('searchInput').value.trim();
  const categoryId = document.getElementById('categoryFilter').value;
  const status = document.getElementById('statusFilter').value;
  const sort = document.getElementById('sortFilter').value;

  tbody.innerHTML = `
    <tr>
      <td colspan="8" style="text-align: center; padding: 32px;">
        <span class="loading-spinner"></span> Filtering complaints...
      </td>
    </tr>
  `;

  const queryParams = new URLSearchParams({
    search,
    category_id: categoryId,
    status,
    sort
  });

  const res = await API.get(`/complaints?${queryParams.toString()}`);

  if (!res || !res.ok || !res.data || !res.data.complaints) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; color: #ef4444; padding: 24px;">
          Error retrieving complaints from database.
        </td>
      </tr>
    `;
    return;
  }

  const complaints = res.data.complaints;
  if (countBadge) countBadge.textContent = `${complaints.length} records`;

  if (complaints.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <i class="fa-solid fa-folder-open"></i>
            <h4>No complaints found</h4>
            <p>Try adjusting your search query or filter selection.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = complaints.map(c => `
    <tr>
      <td><strong>#${c.complaint_id}</strong></td>
      <td>
        <div style="font-weight: 600; color: var(--text-main);">${c.citizen_name}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${c.citizen_email}</div>
      </td>
      <td>
        <span style="font-size: 13px; font-weight: 500;">
          <i class="fa-solid ${c.category_icon || 'fa-tag'}" style="color: var(--primary); margin-right: 6px;"></i>
          ${c.category_name}
        </span>
      </td>
      <td>
        <span style="font-size: 12.5px; color: #334155;" title="${c.description}">
          ${c.description.length > 40 ? c.description.substring(0, 40) + '...' : c.description}
        </span>
      </td>
      <td>
        <span style="font-size: 12px; color: var(--text-muted);" title="${c.address}">
          <i class="fa-solid fa-location-dot" style="color: #ef4444; margin-right: 4px;"></i>
          ${c.address.length > 25 ? c.address.substring(0, 25) + '...' : c.address}
        </span>
      </td>
      <td style="font-size: 12px; white-space: nowrap;">
        ${formatDate(c.created_at)}
      </td>
      <td>${getStatusBadge(c.status)}</td>
      <td>
        <a href="complaint-details.html?id=${c.complaint_id}" class="btn btn-outline btn-sm">
          <span>Details</span>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </td>
    </tr>
  `).join('');
}

/** Setup Event Listeners for Filters */
function setupFilterEvents() {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const statusFilter = document.getElementById('statusFilter');
  const sortFilter = document.getElementById('sortFilter');
  const resetBtn = document.getElementById('resetFiltersBtn');

  let debounceTimer;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => loadComplaints(), 300);
    });
  }

  if (categoryFilter) categoryFilter.addEventListener('change', () => loadComplaints());
  if (statusFilter) statusFilter.addEventListener('change', () => loadComplaints());
  if (sortFilter) sortFilter.addEventListener('change', () => loadComplaints());

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      searchInput.value = '';
      categoryFilter.value = 'all';
      statusFilter.value = 'all';
      sortFilter.value = 'newest';
      loadComplaints();
      showToast('Filters reset to default.', 'info');
    });
  }
}

/** Setup Map Modal & Leaflet Visualization */
function setupMapModal() {
  const openBtn = document.getElementById('openMapModalBtn');
  const closeBtn = document.getElementById('closeMapModalBtn');
  const modal = document.getElementById('mapModal');

  if (openBtn && modal) {
    openBtn.addEventListener('click', async () => {
      modal.classList.add('active');
      await initCampusMap();
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  // Close when clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

async function initCampusMap() {
  const mapDiv = document.getElementById('leafletAllMap');
  if (!mapDiv) return;

  // Tezpur coordinates fallback
  const tezuLat = 26.7006;
  const tezuLng = 92.8306;

  if (!allMapInstance) {
    allMapInstance = L.map('leafletAllMap').setView([tezuLat, tezuLng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(allMapInstance);
  }

  // Clear existing markers
  allMapInstance.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
      allMapInstance.removeLayer(layer);
    }
  });

  // Re-invalidate size because modal was hidden
  setTimeout(() => {
    allMapInstance.invalidateSize();
  }, 200);

  // Fetch complaint coordinates
  const res = await API.get('/complaints/locations');
  if (!res || !res.ok || !res.data || !res.data.locations) return;

  const locations = res.data.locations;
  const statusColorMap = {
    'Submitted': '#e11d48',
    'Under Review': '#d97706',
    'In Progress': '#2563eb',
    'Resolved': '#16a34a'
  };

  const bounds = [];

  locations.forEach(loc => {
    if (loc.latitude && loc.longitude) {
      const color = statusColorMap[loc.status] || '#2563eb';
      
      const marker = L.circleMarker([loc.latitude, loc.longitude], {
        radius: 9,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(allMapInstance);

      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; min-width: 180px;">
          <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 4px;">
            Complaint #${loc.complaint_id}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            <strong>Category:</strong> ${loc.category_name}
          </div>
          <div style="font-size: 11px; margin-bottom: 8px;">
            ${getStatusBadge(loc.status)}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
            ${loc.address}
          </div>
          <a href="complaint-details.html?id=${loc.complaint_id}" style="display: inline-block; padding: 4px 10px; background: #1d4ed8; color: #fff; font-size: 11px; border-radius: 4px; text-decoration: none; font-weight: 600;">
            Inspect Details &rarr;
          </a>
        </div>
      `;

      marker.bindPopup(popupContent);
      bounds.push([loc.latitude, loc.longitude]);
    }
  });

  if (bounds.length > 0) {
    allMapInstance.fitBounds(bounds, { padding: [40, 40] });
  }
}
