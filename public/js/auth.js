const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const message = document.getElementById("message");

const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");

// Switch to signup form
showSignup.addEventListener("click", (event) => {
    event.preventDefault();

    loginForm.hidden = true;
    signupForm.hidden = false;

    formTitle.textContent = "Create Account";
    formSubtitle.textContent = "Join your campus community.";

    message.textContent = "";
});

// Switch to login form
showLogin.addEventListener("click", (event) => {
    event.preventDefault();

    signupForm.hidden = true;
    loginForm.hidden = false;

    formTitle.textContent = "Welcome Back!";
    formSubtitle.textContent = "Login to access your campus updates.";

    message.textContent = "";
});

// LOGIN
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Login failed.";
            return;
        }

        message.textContent = "Login successful!";

        if (data.user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "dashboard.html";
        }

    } catch (error) {
        message.textContent = "Unable to connect to the server.";
    }
});

// SIGNUP
signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    try {
        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Signup failed.";
            return;
        }

        message.textContent = "Account created! Please log in.";

        document.getElementById("loginEmail").value = email;

        signupForm.hidden = true;
        loginForm.hidden = false;

        formTitle.textContent = "Welcome Back!";
        formSubtitle.textContent = "Login to access your campus updates.";

        signupForm.reset();

    } catch (error) {
        message.textContent = "Unable to connect to the server.";
    }
});