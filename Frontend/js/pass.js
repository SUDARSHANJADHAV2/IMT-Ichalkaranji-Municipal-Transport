document.getElementById('passForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
  
    const otp = Math.floor(100000 + Math.random() * 900000); // Simulated OTP
    const mobile = document.getElementById('mobile').value;
  
    const passResult = document.getElementById('passResult');
    passResult.innerHTML = `
      <h3>OTP Sent to ${mobile}</h3>
      <p><strong>Simulated OTP:</strong> ${otp}</p>
      <p>Thank you for applying. You’ll receive a digital pass upon verification.</p>
      <a href="user-dashboard.html">Go to Dashboard</a>
    `;
  });
  