const registerForm = document.getElementById("registerForm");
const fullNameInput = document.getElementById("fullname");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const togglePassword = document.getElementById("togglePassword");
const submitBtn = document.getElementById("registerBtn");
const message = document.getElementById("message");

togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    const newType = isPassword ? "text" : "password";

    passwordInput.type = newType;
    confirmPasswordInput.type = newType;
    togglePassword.textContent = isPassword ? "🙈" : "👁";
});

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!username || !email || !password || !confirmPassword) {
        showMessage("Please fill in all required fields.", "red");
        return;
    }

    if (password.length < 6) {
        showMessage("Password must be at least 6 characters.", "red");
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Confirm password does not match.", "red");
        return;
    }

    setLoading(true);
    showMessage("", "");

    try {
        const response = await fetch("http://localhost:5000/api/v1/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                email,
                password,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || "Register failed.", "red");
            return;
        }

        showMessage("Register successful! Redirecting to login...", "green");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    } catch (error) {
        console.error("Register error:", error);
        showMessage("Cannot connect to server.", "red");
    } finally {
        setLoading(false);
    }
});

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

function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
}