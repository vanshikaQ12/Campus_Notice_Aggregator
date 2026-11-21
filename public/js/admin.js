
const noticeForm = document.getElementById("noticeForm");
const noticeList = document.getElementById("noticeList");
const message = document.getElementById("message");
const welcomeMessage = document.getElementById("welcomeMessage");

const logoutBtn = document.getElementById("logoutBtn");

let editingNoticeId = null;

// CHECK ADMIN LOGIN
async function loadAdmin() {
    try {
        const response = await fetch("/api/auth/me", {
            credentials: "same-origin"
        });

        const data = await response.json();

        if (!response.ok) {
            window.location.href = "index.html";
            return false;
        }

        if (data.user.role !== "admin") {
            window.location.href = "dashboard.html";
            return false;
        }

        welcomeMessage.textContent = `Welcome, ${data.user.name}!`;
        return true;

    } catch (error) {
        window.location.href = "index.html";
        return false;
    }
}

// PUBLISH OR UPDATE NOTICE
noticeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const notice = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        category: document.getElementById("category").value,
        semester: Number(document.getElementById("semester").value),
        expiryDate: document.getElementById("expiryDate").value || null,
        isPinned: document.getElementById("isPinned").checked
    };

    try {
        const url = editingNoticeId
            ? `/api/notices/${editingNoticeId}`
            : "/api/notices";

        const response = await fetch(url, {
            method: editingNoticeId ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify(notice)
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Unable to save notice.";
            return;
        }

        message.textContent = editingNoticeId
    ? "Notice updated successfully! ✓"
    : "Notice published successfully! ✓";

message.style.color = "#FFFFFF";
message.style.fontWeight = "bold";
message.style.padding = "12px";
message.style.background = "rgba(45, 21, 61, 0.55)";
message.style.borderRadius = "8px";
message.style.display = "block";

        editingNoticeId = null;
        noticeForm.reset();

        const submitButton = noticeForm.querySelector("button[type='submit']");
        submitButton.textContent = "Publish Notice →";

        loadNotices();

    } catch (error) {
        message.textContent = "Server connection failed.";
    }
});

// LOAD PUBLISHED NOTICES
async function loadNotices() {
    noticeList.innerHTML = "<p>Loading notices...</p>";

    try {
        const response = await fetch("/api/notices", {
            credentials: "same-origin"
        });

        const data = await response.json();

        if (!response.ok) {
            noticeList.innerHTML = "<p>Unable to load notices.</p>";
            return;
        }

        displayNotices(data.notices || []);

    } catch (error) {
        noticeList.innerHTML = "<p>Server connection failed.</p>";
    }
}

// DISPLAY NOTICE CARDS
function displayNotices(notices) {
    noticeList.innerHTML = "";

    if (notices.length === 0) {
        noticeList.innerHTML = "<p>No notices published yet.</p>";
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
        meta.textContent =
            `Semester ${notice.semester} • ${new Date(notice.createdAt).toLocaleDateString()}`;

        const actions = document.createElement("div");
        actions.className = "notice-actions";

        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editNotice(notice);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteNotice(notice._id);
        });

        actions.append(editButton, deleteButton);
        card.append(category);

        if (notice.isPinned) {
            const pinned = document.createElement("p");
            pinned.textContent = "📌 Pinned Notice";
            card.append(pinned);
        }

        card.append(title, description, meta, actions);
        noticeList.appendChild(card);
    });
}

// EDIT NOTICE
function editNotice(notice) {
    editingNoticeId = notice._id;

    document.getElementById("title").value = notice.title;
    document.getElementById("description").value = notice.description;
    document.getElementById("category").value = notice.category;
    document.getElementById("semester").value = notice.semester;

    document.getElementById("expiryDate").value =
        notice.expiryDate ? notice.expiryDate.split("T")[0] : "";

    document.getElementById("isPinned").checked = notice.isPinned;

    noticeForm.querySelector("button[type='submit']").textContent =
        "Update Notice →";

    noticeForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    message.textContent = "Editing notice...";
}

// DELETE NOTICE
async function deleteNotice(id) {
    const confirmed = confirm("Are you sure you want to delete this notice?");

    if (!confirmed) return;

    try {
        const response = await fetch(`/api/notices/${id}`, {
            method: "DELETE",
            credentials: "same-origin"
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to delete notice.");
            return;
        }

        loadNotices();

    } catch (error) {
        alert("Server connection failed.");
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
        alert("Unable to log out.");
    }
});

// START ADMIN DASHBOARD
// START ADMIN DASHBOARD
async function startAdminDashboard() {
    const isAdmin = await loadAdmin();

    if (isAdmin) {
        await loadNotices();
    }
}

startAdminDashboard();
