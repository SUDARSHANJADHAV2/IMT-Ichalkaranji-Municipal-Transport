document.getElementById("register-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
        firstName: document.getElementById("first-name").value,
        lastName: document.getElementById("last-name").value,
        email: document.getElementById("register-email").value,
        phone: document.getElementById("phone").value,
        password: document.getElementById("register-password").value
    };

    const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    alert(result.message);

    // Prompt user for OTP (you can improve UI here)
    const otp = prompt("Enter OTP sent to your email:");
    const otpResponse = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, otp })
    });

    const otpResult = await otpResponse.json();
    alert(otpResult.message);
});
