
const profileName = document.getElementById("profileName");
const profileAvatar = document.getElementById("profileAvatar");

const detailName = document.getElementById("detailName");
const detailEmail = document.getElementById("detailEmail");
const detailRole = document.getElementById("detailRole");

const logoutBtn = document.getElementById("logoutBtn");

// LOAD PROFILE
async function loadProfile() {
    try {
        const response = await fetch("/api/auth/me", {
            credentials: "same-origin"
        });

        const data = await response.json();

        if (!response.ok) {
            window.location.href = "index.html";
            return;
        }

        const user = data.user;

        profileName.textContent = user.name;
        profileAvatar.textContent = user.name.charAt(0).toUpperCase();

        detailName.textContent = user.name;
        detailEmail.textContent = user.email;
        detailRole.textContent =
            user.role.charAt(0).toUpperCase() + user.role.slice(1);

    } catch (error) {
        window.location.href = "index.html";
    }
}

// LOGOUT
logoutBtn.addEventListener("click", async () => {
    try {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin"
        });

        window.location.href = "index.html";

    } catch (error) {
        alert("Unable to log out. Please try again.");
    }
});

// START
loadProfile();
