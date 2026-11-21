
const roleScreen = document.getElementById("roleScreen");
const accountScreen = document.getElementById("accountScreen");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const accountTitle = document.getElementById("accountTitle");
const loginHeading = document.getElementById("loginHeading");

const goSignup = document.getElementById("goSignup");
const goLogin = document.getElementById("goLogin");

const changeRole = document.getElementById("changeRole");
const backToAccount = document.getElementById("backToAccount");
const backToLogin = document.getElementById("backToLogin");

const message = document.getElementById("message");

let selectedRole = "";

// SELECT ADMIN OR STUDENT
document.querySelectorAll(".role-btn[data-role]").forEach(button => {
    button.addEventListener("click", () => {
        selectedRole = button.dataset.role;

        roleScreen.hidden = true;
        accountScreen.hidden = false;

        accountTitle.textContent =
            selectedRole === "admin" ? "Admin Account" : "Student Account";

        goSignup.hidden = false;
        message.textContent = "";
    });
});

// CHANGE ROLE
changeRole.addEventListener("click", event => {
    event.preventDefault();

    accountScreen.hidden = true;
    roleScreen.hidden = false;

    selectedRole = "";
    message.textContent = "";
});

// OPEN SIGNUP
goSignup.addEventListener("click", () => {
    accountScreen.hidden = true;
    loginForm.hidden = true;
    signupForm.hidden = false;

    message.textContent = "";
});

// OPEN LOGIN
goLogin.addEventListener("click", () => {
    accountScreen.hidden = true;
    signupForm.hidden = true;
    loginForm.hidden = false;

    loginHeading.textContent =
        selectedRole === "admin" ? "Admin Login" : "Student Login";

    message.textContent = "";
});

// BACK TO ACCOUNT OPTIONS
backToAccount.addEventListener("click", event => {
    event.preventDefault();

    loginForm.hidden = true;
    signupForm.hidden = true;
    accountScreen.hidden = false;

    message.textContent = "";
});

// BACK FROM SIGNUP TO LOGIN
backToLogin.addEventListener("click", event => {
    event.preventDefault();

    signupForm.hidden = true;
    loginForm.hidden = false;

    loginHeading.textContent =
        selectedRole === "admin" ? "Admin Login" : "Student Login";

    message.textContent = "";
});

// LOGIN
loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({
                email,
                password,
                selectedRole
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Login failed.";
            return;
        }

        if (data.user?.role !== selectedRole) {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "same-origin"
            });

            message.textContent =
                "This account does not belong to the selected role.";
            return;
        }

        window.location.href =
            selectedRole === "admin" ? "admin.html" : "dashboard.html";

    } catch (error) {
        message.textContent = "Unable to connect to the server.";
    }
});

// SIGNUP — BOTH ROLES
signupForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!["admin", "student"].includes(selectedRole)) {
        message.textContent = "Please select a role first.";
        return;
    }

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    try {
        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({
                name,
                email,
                password,
                selectedRole
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Signup failed.";
            return;
        }

        // AUTOMATIC LOGIN AFTER SIGNUP
        const loginResponse = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({
                email,
                password,
                selectedRole
            })
        });

        const loginData = await loginResponse.json();

        if (
            !loginResponse.ok ||
            loginData.user?.role !== selectedRole
        ) {
            message.textContent =
                "Account created, but automatic login failed. Please log in.";
            signupForm.hidden = true;
            loginForm.hidden = false;

            loginHeading.textContent =
                selectedRole === "admin" ? "Admin Login" : "Student Login";

            return;
        }

        window.location.href =
            selectedRole === "admin" ? "admin.html" : "dashboard.html";

    } catch (error) {
        message.textContent = "Unable to connect to the server.";
    }
});
