
function getAssignments() {
    return JSON.parse(localStorage.getItem("assignments")) || [];
}

function saveAssignments(data) {
    localStorage.setItem("assignments", JSON.stringify(data));
}

// CREATE ASSIGNMENT
const form = document.getElementById("assignmentForm");

if (form) {
    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        const subject = document.getElementById("subject").value.trim();
        const description = document.getElementById("description").value.trim();
        const deadline = document.getElementById("deadline").value;
        const marks = Number(document.getElementById("marks").value);

        if (!title || !subject || !description || !deadline ||
            !Number.isInteger(marks) || marks < 1) {
            alert("Please enter valid details");
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (new Date(deadline + "T00:00:00") < today) {
            alert("Select a future date or today's date");
            return;
        }

        const assignments = getAssignments();

        assignments.push({
            id: Date.now(),
            title,
            subject,
            description,
            deadline,
            marks
        });

        saveAssignments(assignments);

        alert("Assignment Published Successfully!");
        form.reset();
    });
}

// DISPLAY ASSIGNMENTS
function displayAssignments() {
    const list = document.getElementById("assignmentList");
    if (!list) return;

    const assignments = getAssignments();
    list.innerHTML = "";

    if (assignments.length === 0) {
        list.innerHTML = "<tr><td colspan='6'>No assignments available</td></tr>";
        return;
    }

    assignments.forEach(item => {
        const today = new Date().toLocaleDateString("en-CA");
        const status = item.deadline < today ? "Expired" : "Active";

        const row = document.createElement("tr");

        [item.title, item.subject, item.deadline,
         item.marks, status].forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            row.appendChild(td);
        });

        const actions = document.createElement("td");

        const edit = document.createElement("button");
        edit.textContent = "Edit";
        edit.className = "action-btn edit";
        edit.onclick = () => editAssignment(item.id);

        const del = document.createElement("button");
        del.textContent = "Delete";
        del.className = "action-btn delete";
        del.onclick = () => deleteAssignment(item.id);

        actions.append(edit, del);
        row.appendChild(actions);
        list.appendChild(row);
    });
}

// EDIT ASSIGNMENT
function editAssignment(id) {
    const assignments = getAssignments();
    const item = assignments.find(a => a.id === id);

    const title = prompt("Enter new title:", item.title);
    if (title === null) return;

    const subject = prompt("Enter new subject:", item.subject);
    if (subject === null) return;

    const description = prompt("Enter new description:", item.description);
    if (description === null) return;

    const deadline = prompt("Enter deadline YYYY-MM-DD:", item.deadline);
    if (deadline === null) return;

    const marks = prompt("Enter marks:", item.marks);
    if (marks === null) return;

    if (!title.trim() || !subject.trim() || !description.trim() ||
        !/^\d{4}-\d{2}-\d{2}$/.test(deadline) ||
        !Number.isInteger(Number(marks)) || Number(marks) < 1) {
        alert("Invalid details");
        return;
    }

    const date = new Date(deadline + "T00:00:00");

    if (isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== deadline) {
        alert("Invalid date");
        return;
    }

    item.title = title.trim();
    item.subject = subject.trim();
    item.description = description.trim();
    item.deadline = deadline;
    item.marks = Number(marks);

    saveAssignments(assignments);
    displayAssignments();
    updateDashboard();

    alert("Assignment Updated!");
}

// DELETE ASSIGNMENT
function deleteAssignment(id) {
    if (!confirm("Delete this assignment?")) return;

    const assignments = getAssignments();
    const updated = assignments.filter(a => a.id !== id);

    saveAssignments(updated);
    displayAssignments();
    updateDashboard();

    alert("Assignment Deleted!");
}

// DASHBOARD STATISTICS
function updateDashboard() {
    const assignments = getAssignments();

    const total = document.getElementById("total");
    const active = document.getElementById("active");
    const expired = document.getElementById("expired");

    if (!total || !active || !expired) return;

    const today = new Date().toLocaleDateString("en-CA");

    total.textContent = assignments.length;

    active.textContent = assignments.filter(
        a => a.deadline >= today
    ).length;

    expired.textContent = assignments.filter(
        a => a.deadline < today
    ).length;
}

displayAssignments();
updateDashboard();
