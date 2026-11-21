
const welcomeMessage = document.getElementById("welcomeMessage");
const noticeList = document.getElementById("noticeList");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const semesterFilter = document.getElementById("semesterFilter");

const logoutBtn = document.getElementById("logoutBtn");

// Check logged-in user
async function loadUser() {
    try {
        const response = await fetch("/api/auth/me", {
            credentials: "same-origin"
        });

        const data = await response.json();

        if (!response.ok) {
    window.location.href = "index.html";
    return false;
}

if (data.user.role !== "student") {
    window.location.href = "admin.html";
    return false;
}

welcomeMessage.textContent = `Welcome, ${data.user.name}!`;
return true;

    } catch (error) {
        window.location.href = "index.html";
        return false;
    }
}

// Load notices
async function loadNotices() {
    noticeList.innerHTML = "<p>Loading notices...</p>";

    const search = searchInput.value.trim();
    const category = categoryFilter.value;
    const semester = semesterFilter.value;

    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (semester) params.append("semester", semester);

    try {
        const response = await fetch(
            `/api/notices?${params.toString()}`,
            {
                credentials: "same-origin"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            noticeList.innerHTML =
                "<p class='empty-message'>Unable to load notices.</p>";
            return;
        }

        displayNotices(data.notices || []);

    } catch (error) {
        noticeList.innerHTML =
            "<p class='empty-message'>Server connection failed.</p>";
    }
}


// Display notice cards
function displayNotices(notices) {
    noticeList.innerHTML = "";

    if (notices.length === 0) {
        noticeList.innerHTML =
            "<p class='empty-message'>No notices found.</p>";
        return;
    }

    notices.forEach(notice => {
        const card = document.createElement("article");
        card.className = "notice-card";

        const category = document.createElement("span");
        category.className = "notice-category";
        category.textContent = notice.category;

        const title = document.createElement("h3");
        title.textContent = notice.title;

        const description = document.createElement("p");
        description.textContent = notice.description;

        const meta = document.createElement("div");
        meta.className = "notice-meta";

        // Semester badge
        const semester = document.createElement("span");
        semester.className = "notice-semester";
        semester.textContent = `Semester ${notice.semester}`;

        // Expiry date badge
        const expiry = document.createElement("span");
        expiry.className = "notice-expiry";

        expiry.textContent = notice.expiryDate
            ? `Expires: ${new Date(notice.expiryDate).toLocaleDateString("en-GB")}`
            : "No expiry date";

        meta.append(semester, expiry);

        card.append(category);

        if (notice.isPinned) {
            const pinned = document.createElement("span");
            pinned.className = "pinned-label";
            pinned.textContent = " 📌 Pinned";
            card.append(pinned);
        }

        card.append(title, description, meta);
        noticeList.appendChild(card);
    });
}


// Search and filters
searchInput.addEventListener("input", loadNotices);
categoryFilter.addEventListener("change", loadNotices);
semesterFilter.addEventListener("change", loadNotices);

// Logout
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

// Start dashboard
// START STUDENT DASHBOARD
async function startStudentDashboard() {
    const isStudent = await loadUser();

    if (isStudent) {
        await loadNotices();
    }
}

startStudentDashboard();
