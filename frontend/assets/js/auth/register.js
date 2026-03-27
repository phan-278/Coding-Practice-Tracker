// Bạn có thể import authService nếu đã viết file đó
import { authService } from './authService.js';

const registerForm = document.getElementById("registerForm");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const togglePassword = document.getElementById("togglePassword");
const submitBtn = document.querySelector(".form-btn--submit");

/**
 * Xử lý ẩn/hiện mật khẩu
 */
togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    const newType = isPassword ? "text" : "password";
    
    passwordInput.type = newType;
    confirmPasswordInput.type = newType;
    togglePassword.textContent = isPassword ? "🙈" : "👁";
});

/**
 * Xử lý gửi Form
 */
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Thu thập dữ liệu
    const name = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const pass = passwordInput.value;
    const confirmPass = confirmPasswordInput.value;

    // 1. Validation cơ bản
    if (!name || !email || !pass) {
        alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
        return;
    }

    if (pass.length < 6) {
        alert("Mật khẩu bảo mật phải có ít nhất 6 ký tự!");
        return;
    }

    if (pass !== confirmPass) {
        alert("Xác nhận mật khẩu không trùng khớp. Vui lòng kiểm tra lại!");
        return;
    }

    // 2. Hiệu ứng giao diện khi đang gửi
    setLoading(true);

    try {
        // Giả lập gọi API đăng ký (Chỗ này sau này bạn sẽ dùng fetch hoặc axios)
        await simulateRegisterAPI({ name, email, pass });

        alert(`Tài khoản ${email} đã được tạo thành công!`);
        
        // Điều hướng về trang login sau khi đăng ký xong
        window.location.href = "login.html";

    } catch (error) {
        alert("Đăng ký thất bại: " + error.message);
    } finally {
        setLoading(false);
    }
});

/**
 * Hàm hỗ trợ thay đổi trạng thái nút bấm
 */
function setLoading(isLoading) {
    if (isLoading) {
        submitBtn.textContent = "Creating Account...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";
    } else {
        submitBtn.textContent = "Sign Up";
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
    }
}

/**
 * Hàm giả lập gọi server
 */
function simulateRegisterAPI(data) {
    return new Promise((resolve, reject) => {
        console.log("Gửi dữ liệu lên Server:", data);
        setTimeout(() => {
            // Giả lập thành công
            resolve({ status: 200, message: "Success" });
        }, 2000);
    });
}