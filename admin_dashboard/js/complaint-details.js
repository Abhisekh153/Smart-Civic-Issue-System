/**
 * Smart Civic Issue Reporting System - Complaint Details Controller
 */

let complaintId = null;
let currentComplaint = null;
let detailMapInstance = null;
let detailMarker = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  complaintId = params.get('id');

  if (!complaintId) {
    showToast('No complaint ID specified.', 'error');
    setTimeout(() => { window.location.href = 'complaints.html'; }, 1500);
    return;
  }

  loadComplaintDetails();
  setupImageModal();
  setupStatusUpdateForm();
});

/** Fetch and Render Complaint Details & History */
async function loadComplaintDetails() {
  const loader = document.getElementById('pageLoader');
  const content = document.getElementById('complaintContent');

  const res = await API.get(`/complaints/${complaintId}`);

  if (!res || !res.ok || !res.data || !res.data.complaint) {
    if (loader) {
      loader.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i>
          <h4>Complaint Not Found</h4>
          <p>The requested complaint record (#${complaintId}) does not exist in the database.</p>
          <a href="complaints.html" class="btn btn-outline" style="margin-top: 16px;">Back to Complaints</a>
        </div>
      `;
    }
    return;
  }

  currentComplaint = res.data.complaint;
  const history = res.data.history || [];

  // Hide loader, show content
  if (loader) loader.style.display = 'none';
  if (content) content.style.display = 'grid';

  // Populate UI
  document.getElementById('complaintHeaderTitle').textContent = `Complaint #${currentComplaint.complaint_id}`;
  document.getElementById('cardComplaintId').textContent = `Complaint #${currentComplaint.complaint_id}`;
  document.getElementById('cardStatusBadge').innerHTML = getStatusBadge(currentComplaint.status);
  
  document.getElementById('valCategory').innerHTML = `
    <i class="fa-solid ${currentComplaint.category_icon || 'fa-tag'}"></i>
    <span>${currentComplaint.category_name}</span>
  `;

  document.getElementById('valCitizenName').textContent = currentComplaint.citizen_name;
  document.getElementById('valCitizenContact').textContent = `${currentComplaint.citizen_email} | ${currentComplaint.citizen_phone || 'No phone'}`;
  document.getElementById('valDate').textContent = formatDate(currentComplaint.created_at);
  document.getElementById('valDescription').textContent = currentComplaint.description;
  document.getElementById('valAddress').textContent = currentComplaint.address;

  const lat = currentComplaint.latitude || 26.7006;
  const lng = currentComplaint.longitude || 92.8306;
  document.getElementById('valCoordinates').textContent = `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;
  document.getElementById('mapCoordDisplay').textContent = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;

  // Photo
  const imgEl = document.getElementById('complaintImage');
  const photoWrapper = document.getElementById('photoWrapper');
  const photoSrc = currentComplaint.image_path ? `/${currentComplaint.image_path}` : 'assets/placeholder.svg';
  imgEl.src = photoSrc;

  // Pre-select status in dropdown
  const statusSelect = document.getElementById('newStatusSelect');
  if (statusSelect) {
    statusSelect.value = currentComplaint.status;
  }

  // Render Leaflet Map
  initDetailMap(lat, lng, currentComplaint);

  // Render Status History Timeline
  renderTimeline(history);
}

/** Initialize Leaflet Map for Single Complaint */
function initDetailMap(lat, lng, complaint) {
  const mapContainer = document.getElementById('detailMap');
  if (!mapContainer) return;

  if (!detailMapInstance) {
    detailMapInstance = L.map('detailMap').setView([lat, lng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(detailMapInstance);
  } else {
    detailMapInstance.setView([lat, lng], 16);
  }

  if (detailMarker) {
    detailMapInstance.removeLayer(detailMarker);
  }

  // Status color
  const statusColorMap = {
    'Submitted': '#e11d48',
    'Under Review': '#d97706',
    'In Progress': '#2563eb',
    'Resolved': '#16a34a'
  };

  const markerColor = statusColorMap[complaint.status] || '#2563eb';

  detailMarker = L.circleMarker([lat, lng], {
    radius: 10,
    fillColor: markerColor,
    color: '#ffffff',
    weight: 3,
    opacity: 1,
    fillOpacity: 0.95
  }).addTo(detailMapInstance);

  detailMarker.bindPopup(`
    <div style="font-family: 'Inter', sans-serif;">
      <strong>#${complaint.complaint_id} - ${complaint.category_name}</strong><br>
      <span style="font-size: 11.5px; color: #475569;">${complaint.address}</span><br>
      <div style="margin-top: 4px;">${getStatusBadge(complaint.status)}</div>
    </div>
  `).openPopup();

  setTimeout(() => {
    detailMapInstance.invalidateSize();
  }, 250);
}

/** Render Timeline */
function renderTimeline(history) {
  const container = document.getElementById('statusHistoryTimeline');
  if (!container) return;

  if (!history || history.length === 0) {
    container.innerHTML = `
      <div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 16px;">
        No status update records found.
      </div>
    `;
    return;
  }

  // Reverse so latest is on top
  const sorted = [...history].reverse();

  container.innerHTML = sorted.map((item, idx) => `
    <div class="timeline-item">
      <div class="timeline-dot" style="${idx === 0 ? 'background: #16a34a;' : ''}"></div>
      <div class="timeline-header">
        <span class="timeline-status">
          ${item.old_status && item.old_status !== 'None' ? `<span style="color: #64748b; font-size: 12px;">${item.old_status} &rarr;</span> ` : ''}
          <strong>${item.new_status}</strong>
        </span>
        <span class="timeline-time">${formatDate(item.updated_at)}</span>
      </div>
      <div class="timeline-remark">
        "${item.admin_remark || 'No remark entered.'}"
      </div>
      <div class="timeline-author">
        <i class="fa-solid fa-user-check"></i>
        <span>Recorded by ${item.updated_by_name || 'System Admin'}</span>
      </div>
    </div>
  `).join('');
}

/** Setup Form for Status Update */
function setupStatusUpdateForm() {
  const form = document.getElementById('updateStatusForm');
  const statusSelect = document.getElementById('newStatusSelect');
  const remarkText = document.getElementById('adminRemarkText');
  const saveBtn = document.getElementById('saveStatusBtn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newStatus = statusSelect.value;
      const remark = remarkText.value.trim();

      if (!newStatus) {
        showToast('Please select a complaint status.', 'error');
        return;
      }

      if (!remark) {
        showToast('Please provide an administrative remark or action summary.', 'error');
        return;
      }

      saveBtn.disabled = true;
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = `<span class="loading-spinner"></span> Saving...`;

      const res = await API.post(`/complaints/${complaintId}/status`, {
        status: newStatus,
        remark: remark
      });

      if (res && res.ok && res.data && res.data.success) {
        showToast(res.data.message || 'Complaint status updated!', 'success');
        remarkText.value = '';
        // Reload details to refresh timeline and marker
        await loadComplaintDetails();
      } else {
        const errMsg = (res && res.data && res.data.message) || 'Failed to update status.';
        showToast(errMsg, 'error');
      }

      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    });
  }
}

/** Setup Image Zoom Modal */
function setupImageModal() {
  const photoWrapper = document.getElementById('photoWrapper');
  const modal = document.getElementById('imageModal');
  const closeBtn = document.getElementById('closeImageModalBtn');
  const zoomImg = document.getElementById('zoomImage');
  const compImg = document.getElementById('complaintImage');

  if (photoWrapper && modal) {
    photoWrapper.addEventListener('click', () => {
      zoomImg.src = compImg.src;
      modal.classList.add('active');
    });
  }

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
