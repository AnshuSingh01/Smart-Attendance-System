document.addEventListener('DOMContentLoaded', function() {
  const generateBtn = document.getElementById('generate-btn');
  const qrContainer = document.getElementById('qr-container');
  const qrElement = document.getElementById('qrcode');
  const timerElement = document.getElementById('timer');
  
  let countdown;
  const duration = 300; // 5 minutes in seconds

  generateBtn.addEventListener('click', function() {
      // Clear previous QR code
      qrElement.innerHTML = '';
      
      // Generate unique data
      const sessionData = `ATTENDANCE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Generate QR code
      try {
          const qrcode = new QRCode(qrElement, {
              text: sessionData,
              width: 180,
              height: 180,
              colorDark: "#000000",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.H
          });
          
          // Show QR container
          qrContainer.style.display = 'block';
          
          // Start timer
          startTimer(duration);
          
          // Store QR code data and expiry time in localStorage
          const expiryTime = new Date().getTime() + (duration * 1000);
          localStorage.setItem('currentQrCode', sessionData);
          localStorage.setItem('qrExpiryTime', expiryTime.toString());
          
          // Get the QR code image data after it's rendered
          setTimeout(() => {
              const qrImg = qrElement.querySelector('img');
              if (qrImg) {
                  localStorage.setItem('qrCodeImage', qrImg.src);
              }
          }, 100);
      } catch (error) {
          console.error("QR Code generation failed:", error);
          qrElement.innerHTML = '<p style="color:red">Error generating QR code</p>';
      }
  });

  function startTimer(seconds) {
      clearInterval(countdown);
      let remaining = seconds;
      
      updateTimer();
      
      countdown = setInterval(function() {
          remaining--;
          updateTimer();
          
          if (remaining <= 0) {
              clearInterval(countdown);
              qrContainer.style.display = 'none';
              timerElement.textContent = "Expired!";
              // Remove QR code from localStorage when expired
              localStorage.removeItem('currentQrCode');
              localStorage.removeItem('qrExpiryTime');
              localStorage.removeItem('qrCodeImage');
          }
      }, 1000);
      
      function updateTimer() {
          const mins = Math.floor(remaining / 60);
          const secs = remaining % 60;
          timerElement.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }
  }
});













// Add these variables at the top with other DOM elements
const manualCodeDisplay = document.getElementById('manual-code');
const refreshCodeBtn = document.getElementById('refresh-code');

// Add this function to generate manual codes
function generateManualCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  manualCodeDisplay.textContent = code;
  storeManualCode(code);
}

// Add this function to store manual codes
async function storeManualCode(code) {
  const session = JSON.parse(localStorage.getItem('teacherSession'));
  const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes
  
  try {
    await fetch('/api/store-manual-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: session.id,
        code: code,
        expiresAt: expiresAt.toISOString()
      })
    });
  } catch (error) {
    console.error("Error storing manual code:", error);
  }
}

// Add this event listener for the refresh button
refreshCodeBtn.addEventListener('click', generateManualCode);

// Modify the existing generateBtn click handler to include manual code generation
generateBtn.addEventListener('click', function() {
  // ... existing QR code generation code ...
  
  // Generate manual code when QR is generated
  generateManualCode();
});

// Initialize manual code on page load
generateManualCode();