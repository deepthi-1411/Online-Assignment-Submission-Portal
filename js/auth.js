// Registration functionality
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("fullName").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const userId = document.getElementById("userId").value.trim();
        const department = document.getElementById("department").value.trim();
        const role = document.getElementById("registerRole").value;
        const password = document.getElementById("regPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const message = document.getElementById("registerMessage");

        if (!name || !email || !userId || !department || !role || !password) {
            message.textContent = "Please fill all fields";
            return;
        }

        if (password.length < 6) {
            message.textContent = "Password must contain at least 6 characters";
            return;
        }

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match";
            return;
        }

        const users = JSON.parse(localStorage.getItem("users")) || [];

        if (users.some(user => user.email === email)) {
            message.textContent = "Email already registered";
            return;
        }

        users.push({
            name,
            email,
            userId,
            department,
            role,
            password
        });

        localStorage.setItem("users", JSON.stringify(users));

        message.style.color = "green";
        message.textContent = "Registration successful! Please login.";

        registerForm.reset();
    });
}


// Login functionality
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const role = document.getElementById("loginRole").value;
        const message = document.getElementById("loginMessage");

        const users = JSON.parse(localStorage.getItem("users")) || [];

        const user = users.find(u =>
            u.email === email &&
            u.password === password &&
            u.role === role
        );

        if (!user) {
            message.textContent = "Invalid email, password or role";
            return;
        }

        localStorage.setItem("currentUser", JSON.stringify(user));

        if (role === "student") {
            window.location.href = "student-dashboard.html";
        } else {
            window.location.href = "faculty-dashboard.html";
        }
    });
}