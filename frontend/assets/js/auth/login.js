const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const submitBtn = document.querySelector(".form-btn--submit");

// 👁 show / hide password
togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.textContent = "🙈";
    } else {
        passwordInput.type = "password";
        togglePassword.textContent = "👁";
    }
});

// 🚀 submit form
loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    if (emailValue === "" || passwordValue === "") {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    if (!emailValue.includes("@")) {
        alert("Email chưa đúng định dạng!");
        return;
    }

    // 👉 đổi nút thành loading
    submitBtn.textContent = "Loading...";
    submitBtn.disabled = true;

    // giả lập gọi server (2 giây)
    setTimeout(() => {
        alert("Đăng nhập thành công! (demo)");

        // 👉 trả lại trạng thái ban đầu
        submitBtn.textContent = "Sign In";
        submitBtn.disabled = false;
    }, 2000);
});