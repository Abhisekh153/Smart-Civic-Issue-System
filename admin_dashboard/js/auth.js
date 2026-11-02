/**
 * Smart Civic Issue Reporting System - Admin Login Handler
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adminLoginForm');
  const emailInput = document.getElementById('adminEmail');
  const passwordInput = document.getElementById('adminPassword');
  const toggleBtn = document.getElementById('togglePasswordBtn');
  const toggleIcon = document.getElementById('togglePasswordIcon');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const alertBox = document.getElementById('login-alert');
  const fillDemoBtn = document.getElementById('fillDemoBtn');

  // Check URL query for session expiration warning
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('expired') === '1') {
    showAlert('Your session has expired. Please log in again to continue.', 'error');
  }

  // Toggle Password Visibility
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      toggleIcon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    });
  }

  // Auto Fill Demo Credentials Helper
  if (fillDemoBtn) {
    fillDemoBtn.addEventListener('click', () => {
      emailInput.value = 'admin@tezu.ac.in';
      passwordInput.value = 'AdminPassword123';
      showToast('Demo administrator credentials filled!', 'info');
    });
  }

  // Alert display helper
  function showAlert(msg, type = 'error') {
    alertBox.style.display = 'block';
    alertBox.textContent = msg;
    if (type === 'error') {
      alertBox.style.backgroundColor = '#fee2e2';
      alertBox.style.color = '#b91c1c';
      alertBox.style.border = '1px solid #fecaca';
    } else {
      alertBox.style.backgroundColor = '#dcfce7';
      alertBox.style.color = '#15803d';
      alertBox.style.border = '1px solid #bbf7d0';
    }
  }

  // Handle Login Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox.style.display = 'none';

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showAlert('Please fill in both your administrator email and password.');
        return;
      }

      // UI Loading state
      submitBtn.disabled = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span class="loading-spinner"></span> Authenticating...`;

      try {
        const res = await API.post('/login', { email, password });

        if (res && res.ok && res.data && res.data.success) {
          showAlert('Login successful! Redirecting to Dashboard...', 'success');
          sessionStorage.setItem('adminUser', JSON.stringify(res.data.user));
          showToast('Welcome back, Administrator!', 'success');
          
          setTimeout(() => {
            window.location.href = '/dashboard.html';
          }, 800);
        } else {
          const errMsg = (res && res.data && res.data.message) || 'Invalid administrator credentials.';
          showAlert(errMsg, 'error');
          showToast(errMsg, 'error');
        }
      } catch (err) {
        showAlert('Unable to reach the backend server. Make sure Flask is running.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
});
