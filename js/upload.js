/* EduSubmit submission pages. Demo metadata is stored in localStorage; API adapter can replace load/save later. */
(() => {
  "use strict";
  const STORAGE_KEY = "edusubmit.submissions.v1";
  const assignments = [
    {id:"1",title:"HTML and CSS Portfolio",subject:"Web Technology",deadline:"2026-11-18"},
    {id:"2",title:"Database Management System",subject:"DBMS",deadline:"2026-11-20"},
    {id:"3",title:"Python Programming",subject:"Python",deadline:"2026-11-12"},
    {id:"4",title:"Operating Systems",subject:"Operating Systems",deadline:"2026-11-22"},
    {id:"5",title:"Computer Networks",subject:"Computer Networks",deadline:"2026-11-16"},
    {id:"6",title:"Data Visualization",subject:"Data Analytics",deadline:"2026-11-25"},
    {id:"7",title:"JavaScript Fundamentals",subject:"Web Technology",deadline:"2026-11-15"},
    {id:"8",title:"Cloud Computing Basics",subject:"Cloud Computing",deadline:"2026-11-14"}
  ];
  const validStatuses = ["Pending", "Submitted", "Late", "Reviewed"];
  const allowedExtensions = ["pdf", "zip", "doc", "docx"];
  const $ = id => document.getElementById(id);

  // Keep storage behind small functions so a future API client can replace this adapter.
  function loadSubmissions() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(saved)) return [];
      return saved.filter(item => item && typeof item.id === "string" && typeof item.assignmentId === "string");
    } catch (_) { return []; }
  }
  function saveSubmissions(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString("en-IN", {dateStyle:"medium", timeStyle:"short"});
  }
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[char]));
  }
  function setNotice(element, message, isError=false) {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("error", isError);
    element.hidden = false;
  }
  function badge(status) {
    const normalized = validStatuses.includes(status) ? status : "Submitted";
    return `<span class="status-badge ${normalized.toLowerCase()}">${normalized}</span>`;
  }
  function initializeUpload() {
    const input = $("submission-file");
    if (!input) return;
    const params = new URLSearchParams(location.search);
    const assignmentId = params.get("assignmentId") || "";
    const assignment = assignments.find(item => item.id === assignmentId);
    $("assignment-id").textContent = assignmentId || "Not provided";
    if (assignment) {
      $("assignment-title").textContent = assignment.title;
      $("assignment-subject").textContent = assignment.subject;
      $("assignment-deadline").textContent = new Date(assignment.deadline + "T00:00:00").toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"});
      $("assignment-state").textContent = "Ready to submit";
      $("assignment-state").className = "status-badge submitted";
    } else {
      $("assignment-title").textContent = assignmentId ? "Assignment details unavailable" : "No assignment selected";
      $("assignment-subject").textContent = "—";
      $("assignment-deadline").textContent = "—";
      $("assignment-state").textContent = "ID required";
      $("assignment-state").className = "status-badge pending";
      $("assignment-note").textContent = "An assignment ID is required. Open this page from a valid assignment details page, or use ?assignmentId=1–8.";
    }
    const selected = $("selected-file");
    const message = $("page-message");
    function clearFile() { input.value = ""; selected.hidden = true; }
    input.addEventListener("change", () => {
      message.hidden = true;
      const file = input.files && input.files[0];
      if (!file) { clearFile(); return; }
      const ext = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        clearFile(); setNotice(message, "That file type is not supported. Choose a PDF, ZIP, DOC or DOCX file.", true); return;
      }
      $("file-name").textContent = file.name;
      $("file-size").textContent = file.size < 1024*1024 ? `${(file.size/1024).toFixed(1)} KB` : `${(file.size/(1024*1024)).toFixed(2)} MB`;
      selected.hidden = false;
    });
    $("remove-file").addEventListener("click", () => { clearFile(); input.focus(); });
    $("submit-button").addEventListener("click", () => {
      message.hidden = true;
      const file = input.files && input.files[0];
      if (!assignmentId || !assignment) { setNotice(message, "A valid assignment ID is required before you can save a submission.", true); return; }
      if (!file) { setNotice(message, "Please select a file before continuing.", true); input.focus(); return; }
      if (!allowedExtensions.includes(file.name.split(".").pop().toLowerCase())) { setNotice(message, "Choose a PDF, ZIP, DOC or DOCX file.", true); return; }
      const confirmed = window.confirm(`Save a demo submission for ${assignment.title}?\n\nFile: ${file.name}\nSize: ${$("file-size").textContent}\n\nOnly submission metadata will be saved in this browser. The file itself will not be uploaded.`);
      if (!confirmed) return;
      try {
        const submissions = loadSubmissions();
        const now = new Date();
        const deadline = new Date(assignment.deadline + "T23:59:59");
        const status = now > deadline ? "Late" : "Submitted";
        const record = {id:`SUB-${now.getTime().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`,assignmentId,assignmentTitle:assignment.title,filename:file.name,fileSize:file.size,submittedAt:now.toISOString(),status};
        submissions.unshift(record);
        saveSubmissions(submissions);
        location.href = `submission-status.html?submissionId=${encodeURIComponent(record.id)}`;
      } catch (_) { setNotice(message, "The submission details could not be saved in this browser. Check local storage settings and try again.", true); }
    });
  }
  function initializeStatus() {
    const panel = $("status-panel");
    if (!panel) return;
    const id = new URLSearchParams(location.search).get("submissionId");
    const record = id && loadSubmissions().find(item => item.id === id);
    if (!record) {
      $("status-not-found").hidden = false;
      $("not-found-copy").textContent = id ? `No saved submission matches “${id}”. Check the ID or choose a submission from your history.` : "This page needs a submissionId in the URL. Open a submission from your history.";
      return;
    }
    panel.hidden = false;
    $("submission-id").textContent = record.id;
    $("status-assignment-id").textContent = record.assignmentId;
    $("status-filename").textContent = record.filename || "Filename unavailable";
    $("status-date").textContent = formatDate(record.submittedAt);
    const status = validStatuses.includes(record.status) ? record.status : "Submitted";
    $("submission-status").textContent = status;
    $("submission-status").className = `status-badge ${status.toLowerCase()}`;
    $("status-description").textContent = status === "Reviewed" ? "Your submission has been reviewed." : status === "Pending" ? "Your submission is saved and awaiting processing." : status === "Late" ? "Your submission was saved after the assignment deadline." : "Your submission details are saved in this browser.";
  }
  function initializeHistory() {
    const list = $("history-list");
    if (!list) return;
    const search = $("history-search");
    const filter = $("status-filter");
    function render() {
      const query = search.value.trim().toLowerCase();
      const selectedStatus = filter.value;
      const all = loadSubmissions();
      const records = all.filter(item => {
        const status = validStatuses.includes(item.status) ? item.status : "Submitted";
        const haystack = [item.id,item.assignmentId,item.assignmentTitle,item.filename].join(" ").toLowerCase();
        return (selectedStatus === "All" || status === selectedStatus) && haystack.includes(query);
      });
      $("result-count").textContent = `${records.length} ${records.length === 1 ? "submission" : "submissions"}`;
      $("history-empty").hidden = records.length > 0;
      list.hidden = records.length === 0;
      if (all.length === 0) {
        $("empty-title").textContent = "No submissions yet";
        $("empty-copy").textContent = "Your saved submissions will appear here after you submit an assignment.";
      } else if (records.length === 0) {
        $("empty-title").textContent = "No matching submissions";
        $("empty-copy").textContent = "Try another search term or choose a different status filter.";
      }
      list.innerHTML = records.map(item => {
        const status = validStatuses.includes(item.status) ? item.status : "Submitted";
        return `<article class="submission-row"><div class="submission-cell"><small>Assignment</small><strong>${escapeHTML(item.assignmentTitle || `Assignment ${item.assignmentId}`)} <span class="muted-inline">· ${escapeHTML(item.assignmentId)}</span></strong></div><div class="submission-cell"><small>Filename</small><strong>${escapeHTML(item.filename || "—")}</strong></div><div class="submission-cell"><small>Submitted</small><strong>${escapeHTML(formatDate(item.submittedAt))}</strong></div>${badge(status)}<a class="row-link" href="submission-status.html?submissionId=${encodeURIComponent(item.id)}">View status →</a></article>`;
      }).join("");
    }
    search.addEventListener("input",render);
    filter.addEventListener("change",render);
    render();
  }
  document.addEventListener("DOMContentLoaded", () => { initializeUpload(); initializeStatus(); initializeHistory(); });
})();
