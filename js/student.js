
// ==========================================
// EDUSUBMIT - STUDENT DASHBOARD
// ==========================================

// Sample assignment data
// Later, this can be connected to the backend.

const assignments = [
    {
        id: 1,
        title: "HTML and CSS Portfolio",
        subject: "Web Technology",
        description: "Create a responsive personal portfolio using HTML and CSS.",
        deadline: "2026-11-18",
        status: "Pending"
    },
    {
        id: 2,
        title: "Database Management System",
        subject: "DBMS",
        description: "Design and implement database tables with SQL queries.",
        deadline: "2026-11-20",
        status: "Submitted"
    },
    {
        id: 3,
        title: "Python Programming",
        subject: "Python",
        description: "Solve programming problems using functions and OOP concepts.",
        deadline: "2026-11-12",
        status: "Overdue"
    },
    {
        id: 4,
        title: "Operating Systems",
        subject: "Operating Systems",
        description: "Explain process scheduling and memory management.",
        deadline: "2026-11-22",
        status: "Pending"
    },
    {
        id: 5,
        title: "Computer Networks",
        subject: "Computer Networks",
        description: "Prepare a report on network protocols and architectures.",
        deadline: "2026-11-16",
        status: "Submitted"
    },
    {
        id: 6,
        title: "Data Visualization",
        subject: "Data Analytics",
        description: "Create charts and visual reports using a sample dataset.",
        deadline: "2026-11-25",
        status: "Pending"
    },
    {
        id: 7,
        title: "JavaScript Fundamentals",
        subject: "Web Technology",
        description: "Develop interactive web pages using JavaScript.",
        deadline: "2026-11-15",
        status: "Submitted"
    },
    {
        id: 8,
        title: "Cloud Computing Basics",
        subject: "Cloud Computing",
        description: "Write a report on cloud service models and deployment models.",
        deadline: "2026-11-14",
        status: "Submitted"
    }
];

// Get today's date without time
function getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

// Format deadline
function formatDate(dateString) {
    return new Date(dateString + "T00:00:00").toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

// Determine assignment status
function getAssignmentStatus(assignment) {
    if (assignment.status === "Submitted") {
        return "Submitted";
    }

    const deadline = new Date(assignment.deadline + "T00:00:00");

    if (deadline < getToday()) {
        return "Overdue";
    }

    return "Pending";
}

// Calculate dashboard statistics
function updateStatistics() {
    const total = assignments.length;

    const submitted = assignments.filter(
        assignment => getAssignmentStatus(assignment) === "Submitted"
    ).length;

    const overdue = assignments.filter(
        assignment => getAssignmentStatus(assignment) === "Overdue"
    ).length;

    const pending = total - submitted - overdue;

    document.getElementById("total-count").textContent = total;
    document.getElementById("submitted-count").textContent = submitted;
    document.getElementById("pending-count").textContent = pending;
    document.getElementById("overdue-count").textContent = overdue;

    const percentage = total === 0
        ? 0
        : Math.round((submitted / total) * 100);

    document.getElementById("progress-percentage").textContent =
        percentage + "%";

    const progressCircle = document.querySelector(".progress-circle");

    progressCircle.style.background = `
        conic-gradient(
            #5145CD 0% ${percentage}%,
            #EBEAF5 ${percentage}% 100%
        )
    `;
}

// Display recent assignments
function displayRecentAssignments() {
    const container = document.getElementById("recent-assignments");

    const recentAssignments = [...assignments]
        .sort((a, b) => b.id - a.id)
        .slice(0, 4);

    container.innerHTML = recentAssignments.map(assignment => {
        const status = getAssignmentStatus(assignment);

        return `
            <div class="assignment-card">

                <div class="assignment-top">
                    <span class="subject-tag">
                        ${assignment.subject}
                    </span>

                    <span class="status ${status.toLowerCase()}">
                        ${status}
                    </span>
                </div>

                <h3>${assignment.title}</h3>

                <p>${assignment.description}</p>

                <div class="assignment-footer">
                    <span>📅 ${formatDate(assignment.deadline)}</span>

                    <a href="assignment-details.html?id=${assignment.id}">
                        View Details →
                    </a>
                </div>

            </div>
        `;
    }).join("");
}

// Display upcoming deadlines
function displayUpcomingDeadlines() {
    const container = document.getElementById("upcoming-deadlines");

    const upcoming = assignments
        .filter(assignment => {
            const deadline = new Date(assignment.deadline + "T00:00:00");

            return (
                getAssignmentStatus(assignment) === "Pending" &&
                deadline >= getToday()
            );
        })
        .sort((a, b) => a.deadline.localeCompare(b.deadline))
        .slice(0, 4);

    if (upcoming.length === 0) {
        container.innerHTML = "<p>No upcoming deadlines.</p>";
        return;
    }

    container.innerHTML = upcoming.map(assignment => `
        <div class="deadline-item">

            <div>
                <h4>${assignment.title}</h4>
                <p>${assignment.subject}</p>
            </div>

            <span class="deadline-date">
                ${formatDate(assignment.deadline)}
            </span>

        </div>
    `).join("");
}

// Start dashboard
function initializeDashboard() {
    updateStatistics();
    displayRecentAssignments();
    displayUpcomingDeadlines();
}


// ==========================================
// MY ASSIGNMENTS PAGE FUNCTIONALITY
// ==========================================

let currentFilter = "All";

function updateAssignmentSummary() {
    const counts = {
        total: assignments.length,
        pending: 0,
        submitted: 0,
        overdue: 0
    };

    assignments.forEach(assignment => {
        const status = getAssignmentStatus(assignment);

        if (status === "Pending") counts.pending++;
        if (status === "Submitted") counts.submitted++;
        if (status === "Overdue") counts.overdue++;
    });

    document.getElementById("page-total").textContent = counts.total;
    document.getElementById("page-pending").textContent = counts.pending;
    document.getElementById("page-submitted").textContent = counts.submitted;
    document.getElementById("page-overdue").textContent = counts.overdue;
}

function displayAllAssignments() {
    const container = document.getElementById("all-assignments");
    const searchInput = document.getElementById("assignment-search");

    const searchText = searchInput.value.toLowerCase().trim();

    const filteredAssignments = assignments.filter(assignment => {
        const status = getAssignmentStatus(assignment);

        const matchesFilter =
            currentFilter === "All" || status === currentFilter;

        const matchesSearch =
            assignment.title.toLowerCase().includes(searchText) ||
            assignment.subject.toLowerCase().includes(searchText);

        return matchesFilter && matchesSearch;
    });

    document.getElementById("visible-count").textContent =
        filteredAssignments.length;

    if (filteredAssignments.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <span>🔍</span>
                <h3>No assignments found</h3>
                <p>Try changing your search or filter.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredAssignments.map(assignment => {
        const status = getAssignmentStatus(assignment);

        return `
            <div class="assignment-card">

                <div class="assignment-top">
                    <span class="subject-tag">
                        ${assignment.subject}
                    </span>

                    <span class="status ${status.toLowerCase()}">
                        ${status}
                    </span>
                </div>

                <h3>${assignment.title}</h3>

                <p>${assignment.description}</p>

                <div class="assignment-footer">
                    <span>📅 ${formatDate(assignment.deadline)}</span>

                    <a href="assignment-details.html?id=${assignment.id}">
                        View Details →
                    </a>
                </div>

            </div>
        `;
    }).join("");
}

function initializeAssignmentsPage() {
    const searchInput = document.getElementById("assignment-search");

    if (!searchInput) return;

    updateAssignmentSummary();
    displayAllAssignments();

    searchInput.addEventListener("input", displayAllAssignments);

    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", () => {
            currentFilter = button.dataset.filter;

            document.querySelectorAll(".filter-btn").forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");
            displayAllAssignments();
        });
    });
}


function initializeAssignmentDetails() {

    const titleElement = document.getElementById("detail-title");

    if (!titleElement) return;

    const params = new URLSearchParams(window.location.search);
    const assignmentId = Number(params.get("id"));

    const assignment = assignments.find(
        item => item.id === assignmentId
    );

    if (!assignment) {
        titleElement.textContent = "Assignment Not Found";

        document.getElementById("detail-subject").textContent =
            "This assignment could not be found.";

        document.getElementById("detail-description").textContent =
            "Please return to My Assignments and select a valid assignment.";

        document.getElementById("detail-deadline").textContent = "--";

        document.getElementById("detail-status").textContent = "Unavailable";

        document.getElementById("submit-assignment-btn").classList.add("disabled");

        return;
    }

    const status = getAssignmentStatus(assignment);

    titleElement.textContent = assignment.title;

    document.getElementById("detail-subject").textContent =
        assignment.subject;

    document.getElementById("detail-description").textContent =
        assignment.description;

    document.getElementById("detail-deadline").textContent =
        formatDate(assignment.deadline);

    const statusElement = document.getElementById("detail-status");

    statusElement.textContent = status;
    statusElement.className = "status " + status.toLowerCase();

    const submitButton = document.getElementById("submit-assignment-btn");

    if (status === "Submitted" || status === "Overdue") {
        submitButton.classList.add("disabled");

        submitButton.textContent =
            status === "Submitted" ? "Already Submitted" : "Deadline Passed";

        submitButton.removeAttribute("href");
    } else {
        // Connect this to Member 3's upload page when agreed.
        submitButton.href = "upload.html?assignmentId=" + assignment.id;
    }
}

// Initialize the correct page
document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("recent-assignments")) {
        initializeDashboard();
    }

    if (document.getElementById("all-assignments")) {
        initializeAssignmentsPage();
    }

    if (document.getElementById("detail-title")) {
        initializeAssignmentDetails();
    }

});


