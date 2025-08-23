// static/js/auth.js
document.getElementById("register-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const data = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        phone: form.phone.value,
        password: form.password.value
    };

    const res = await fetch("/register", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message);

    const userOtp = prompt("Enter the OTP sent to your email:");
    if (userOtp) {
        const verifyRes = await fetch("/verify", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({...data, otp: userOtp})
        });
        const verifyResult = await verifyRes.json();
        alert(verifyResult.message || verifyResult.error);
    }
});
