document.addEventListener('DOMContentLoaded', function() {
  // Load student info
  const studentSession = JSON.parse(localStorage.getItem('studentSession'));
  if (!studentSession) {
      window.location.href = 'student_login.html';
      return;
  }
  
  document.getElementById('student-name').textContent = studentSession.name;
  document.getElementById('student-usn').textContent = studentSession.usn;

  // QR Scanner Setup
  const scanner = new Instascan.Scanner({ 
      video: document.getElementById('qr-video'),
      mirror: false // Disable mirroring for better UX
  });
  const toggleBtn = document.getElementById('toggle-scanner');
  const scanStatus = document.getElementById('scan-status');
  let cameraOn = false;

  // Camera Toggle
  toggleBtn.addEventListener('click', async () => {
      if (cameraOn) {
          scanner.stop();
          document.getElementById('qr-video').style.display = 'none';
          toggleBtn.innerHTML = '<i class="fas fa-camera"></i> Enable Camera';
          scanStatus.textContent = 'Camera is currently off';
          cameraOn = false;
      } else {
          try {
              const cameras = await Instascan.Camera.getCameras();
              if (cameras.length > 0) {
                  // Use back camera by default if available
                  const backCamera = cameras.find(c => c.name.toLowerCase().includes('back')) || cameras[0];
                  scanner.start(backCamera);
                  document.getElementById('qr-video').style.display = 'block';
                  toggleBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Camera';
                  scanStatus.textContent = 'Point camera at QR code';
                  cameraOn = true;
              } else {
                  scanStatus.textContent = 'No cameras found';
                  showResult('No camera detected', false);
              }
          } catch (error) {
              console.error('Camera error:', error);
              scanStatus.textContent = 'Camera access denied';
              showResult('Camera permission required', false);
          }
      }
  });

  // QR Scan Handler
  scanner.addListener('scan', async (content) => {
      scanStatus.textContent = 'Processing attendance...';
      try {
          await markAttendance(content);
      } finally {
          scanner.stop();
          cameraOn = false;
          document.getElementById('qr-video').style.display = 'none';
          toggleBtn.innerHTML = '<i class="fas fa-camera"></i> Enable Camera';
      }
  });

  // Manual Code Submission
  document.getElementById('submit-manual-code').addEventListener('click', async () => {
      const code = document.getElementById('manual-code-input').value.trim().toUpperCase();
      if (!code) {
          showResult('Please enter an attendance code', false);
          return;
      }
      await markAttendance(code);
  });

  // Allow Enter key to submit manual code
  document.getElementById('manual-code-input').addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
          const code = document.getElementById('manual-code-input').value.trim().toUpperCase();
          if (!code) {
              showResult('Please enter an attendance code', false);
              return;
          }
          await markAttendance(code);
      }
  });

  // Format manual code input (uppercase and remove spaces)
  document.getElementById('manual-code-input').addEventListener('input', function(e) {
      this.value = this.value.toUpperCase().replace(/\s/g, '');
  });

  // Shared attendance marking function
  async function markAttendance(code) {
      showResult('Processing...', true);
      try {
          const response = await fetch('http://localhost:3000/api/mark-attendance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  studentUsn: studentSession.usn,
                  qrData: code
              })
          });
          
          const result = await response.json();
          
          if (result.success) {
              showResult('Attendance recorded successfully!', true);
              document.getElementById('manual-code-input').value = '';
          } else {
              showResult(result.message || 'Failed to mark attendance', false);
          }
      } catch (error) {
          console.error('Error:', error);
          showResult('Network error - please try again', false);
      }
  }

  function showResult(message, isSuccess) {
      const resultEl = document.getElementById('attendance-result');
      resultEl.innerHTML = `
          <div class="result-message ${isSuccess ? 'success' : 'error'}">
              <i class="fas fa-${isSuccess ? 'check-circle' : 'exclamation-circle'}"></i>
              <span>${message}</span>
          </div>
          ${isSuccess ? '<div class="timestamp">Last marked at: ' + new Date().toLocaleTimeString() + '</div>' : ''}
      `;
      
      // Auto-clear success message after 5 seconds
      if (isSuccess) {
          setTimeout(() => {
              if (resultEl.innerHTML.includes(message)) {
                  resultEl.innerHTML = '<p>No attendance recorded yet</p>';
              }
          }, 5000);
      }
  }
});