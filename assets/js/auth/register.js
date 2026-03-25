const registerForm = document.getElementById("registerForm");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const togglePassword = document.getElementById("togglePassword");
const submitBtn = document.querySelector(".form-btn--submit");

// 👁 Show/Hide Password
togglePassword.addEventListener("click", function () {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    confirmPasswordInput.type = type; // Đổi cả hai cho tiện
    this.textContent = type === "password" ? "👁" : "🙈";
});

// 🚀 Submit logic
registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const pass = passwordInput.value;
    const confirmPass = confirmPasswordInput.value;

    // 1. Kiểm tra trống
    if (!name || !email || !pass) {
        alert("Vui lòng điền đầy đủ các trường!");
        return;
    }

    // 2. Kiểm tra mật khẩu khớp nhau
    if (pass !== confirmPass) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    // 3. Kiểm tra độ dài mật khẩu
    if (pass.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự!");
        return;
    }

    // Giả lập Loading
    submitBtn.textContent = "Creating Account...";
    submitBtn.disabled = true;

    setTimeout(() => {
        alert(`Chúc mừng ${name}! Đăng ký thành công.`);
        
        // Trả về trạng thái cũ hoặc chuyển hướng
        submitBtn.textContent = "Sign Up";
        submitBtn.disabled = false;
        
        // window.location.href = "login.html"; 
    }, 2000);
});