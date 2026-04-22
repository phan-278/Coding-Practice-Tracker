const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

// 👁 show / hide password
togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "🙈" : "👁";
});

// 🚀 submit form
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showMessage("Please fill in all fields.", "red");
        return;
    }

    if (!email.includes("@")) {
        showMessage("Invalid email format.", "red");
        return;
    }

    setLoading(true);
    showMessage("", "");

    try {
        const response = await fetch("http://localhost:5000/api/v1/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || "Login failed.", "red");
            return;
        }

        // lưu token + user
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        showMessage("Login successful! Redirecting...", "green");

        setTimeout(() => {
            window.location.href = "../app/dashboard.html";
        }, 1200);
    } catch (error) {
        console.error("Login error:", error);
        showMessage("Cannot connect to server.", "red");
    } finally {
        setLoading(false);
    }
});

function setLoading(isLoading) {
    if (isLoading) {
        loginBtn.textContent = "Signing In...";
        loginBtn.disabled = true;
        loginBtn.style.opacity = "0.7";
    } else {
        loginBtn.textContent = "Sign In";
        loginBtn.disabled = false;
        loginBtn.style.opacity = "1";
    }
}

function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
}