/* Faculty evaluation demo. Reads the shared submission metadata key and stores evaluations separately. */
(() => {
  "use strict";
  const SUBMISSIONS_KEY = "edusubmit.submissions.v1";
  const EVALUATIONS_KEY = "edusubmit.evaluations.v1";
  const MAX_MARKS = 100;
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
  const demoSubmissions = [
    {id:"DEMO-SUB-1001",assignmentId:"1",assignmentTitle:"HTML and CSS Portfolio",filename:"portfolio-final.pdf",fileSize:842752,submittedAt:"2026-11-10T09:20:00.000Z",status:"Submitted",studentName:"Aarav Sharma"},
    {id:"DEMO-SUB-1002",assignmentId:"2",assignmentTitle:"Database Management System",filename:"dbms-project.zip",fileSize:1482752,submittedAt:"2026-11-11T14:10:00.000Z",status:"Reviewed",studentName:"Diya Patel"},
    {id:"DEMO-SUB-1003",assignmentId:"4",assignmentTitle:"Operating Systems",filename:"os-assignment.docx",fileSize:226304,submittedAt:"2026-11-12T07:45:00.000Z",status:"Pending",studentName:"Kabir Rao"},
    {id:"DEMO-SUB-1004",assignmentId:"3",assignmentTitle:"Python Programming",filename:"python-solutions.pdf",fileSize:510000,submittedAt:"2026-11-09T18:32:00.000Z",status:"Late",studentName:"Mira Iyer"}
  ];
  const $ = id => document.getElementById(id);
  const validStatuses = ["Pending", "Submitted", "Late", "Reviewed"];
  function readArray(key) {
    try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value : []; }
    catch (_) { return []; }
  }
  function writeArray(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function escapeHTML(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[c])); }
  function formatDate(value) {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString("en-IN", {day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"});
  }
  function getAssignment(record) { return assignments.find(item => item.id === String(record.assignmentId)); }
  function getTitle(record) { return record.assignmentTitle || getAssignment(record)?.title || `Assignment ${record.assignmentId || "—"}`; }
  function getStatus(record, evaluations) { return evaluations.some(item => item.submissionId === record.id) ? "Reviewed" : (validStatuses.includes(record.status) ? record.status : "Submitted"); }
  function getSubmissionRecords() {
    const stored = readArray(SUBMISSIONS_KEY).filter(item => item && typeof item.id === "string");
    const demos = stored.length ? [] : demoSubmissions;
    return [...stored, ...demos].map(item => ({...item, studentName:item.studentName || "Student Name"}));
  }
  function badge(status) { const safe = validStatuses.includes(status) ? status : "Submitted"; return `<span class="badge ${safe.toLowerCase()}">${safe}</span>`; }
  function initializeSubmissions() {
    const body = $("submissions-body");
    if (!body) return;
    const search = $("submission-search"), filter = $("submission-filter"), empty = $("submissions-empty");
    const evaluations = readArray(EVALUATIONS_KEY);
    const records = getSubmissionRecords().map(record => ({...record, status:getStatus(record,evaluations)}));
    $("data-source-note").textContent = readArray(SUBMISSIONS_KEY).length ? "Shared student submission metadata" : "Sample demo entries · no student submissions saved yet";
    const countStatus = status => records.filter(record => record.status === status).length;
    $("total-count").textContent = records.length;
    $("submitted-count").textContent = countStatus("Submitted") + countStatus("Late");
    $("pending-count").textContent = countStatus("Pending") + countStatus("Submitted") + countStatus("Late");
    $("reviewed-count").textContent = countStatus("Reviewed");
    function render() {
      const query = search.value.trim().toLowerCase();
      const filtered = records.filter(record => {
        const matchesFilter = filter.value === "All" || record.status === filter.value;
        const haystack = [record.studentName,getTitle(record),record.filename,record.assignmentId,record.id].join(" ").toLowerCase();
        return matchesFilter && haystack.includes(query);
      });
      $("result-count").textContent = `${filtered.length} ${filtered.length === 1 ? "submission" : "submissions"}`;
      empty.hidden = filtered.length !== 0;
      body.innerHTML = filtered.map(record => {
        const initials = record.studentName.split(/\s+/).map(part => part[0]).join("").slice(0,2).toUpperCase();
        return `<tr><td><div class="student-cell"><span class="student-avatar" aria-hidden="true">${escapeHTML(initials)}</span><span><strong>${escapeHTML(record.studentName)}</strong><small>${escapeHTML(record.id)}</small></span></div></td><td>${escapeHTML(getTitle(record))}</td><td>${escapeHTML(formatDate(record.submittedAt))}</td><td>${badge(record.status)}</td><td><a class="action-link" href="review-assignment.html?submissionId=${encodeURIComponent(record.id)}">Review →</a></td></tr>`;
      }).join("");
    }
    search.addEventListener("input",render); filter.addEventListener("change",render); render();
  }
  function getSelectedSubmission() {
    const id = new URLSearchParams(location.search).get("submissionId");
    return id ? getSubmissionRecords().find(record => record.id === id) : null;
  }
  function initializeReview() {
    const content = $("review-content");
    if (!content) return;
    const record = getSelectedSubmission();
    if (!record) { $("review-error").textContent = "Submission not found. Return to the submissions list and choose a valid record."; $("review-error").hidden = false; return; }
    const evaluated = readArray(EVALUATIONS_KEY).some(item => item.submissionId === record.id);
    const status = evaluated ? "Reviewed" : (validStatuses.includes(record.status) ? record.status : "Submitted");
    const assignment = getAssignment(record);
    content.hidden = false;
    $("review-assignment-title").textContent = getTitle(record);
    $("review-subject").textContent = assignment?.subject || "Assignment details from saved submission";
    $("review-status").textContent = status;
    $("review-status").className = `badge ${status.toLowerCase()}`;
    $("review-student").textContent = record.studentName || "Student Name (not included in saved metadata)";
    $("review-assignment-id").textContent = record.assignmentId || "—";
    $("review-submission-id").textContent = record.id;
    $("review-date").textContent = formatDate(record.submittedAt);
    $("review-filename").textContent = record.filename || "No filename recorded";
    $("review-filesize").textContent = record.fileSize ? `${(record.fileSize / 1024 / 1024).toFixed(2)} MB · metadata only` : "File contents are not available in this demo";
    const downloadButton = $("download-button");
    downloadButton.disabled = true;
    downloadButton.title = "The original file was not saved by the frontend demo.";
    $("download-note").textContent = "Download is unavailable: the student upload module stores file metadata only, not file contents.";
    const query = `submissionId=${encodeURIComponent(record.id)}`;
    $("feedback-link").href = `feedback.html?${query}`;
    if (evaluated) $("feedback-link").textContent = "Update evaluation →";
  }
  function initializeFeedback() {
    const form = $("evaluation-form");
    if (!form) return;
    const record = getSelectedSubmission();
    if (!record) {
      $("feedback-content").hidden = true;
      $("feedback-not-found").hidden = false;
      return;
    }
    const query = `submissionId=${encodeURIComponent(record.id)}`;
    $("feedback-content").hidden = false;
    $("feedback-assignment").textContent = getTitle(record);
    $("feedback-student").textContent = record.studentName || "Student Name";
    $("feedback-file").textContent = record.filename || "No filename recorded";
    $("feedback-back").href = `review-assignment.html?${query}`;
    $("feedback-review-link").href = `review-assignment.html?${query}`;
    $("cancel-feedback").href = `review-assignment.html?${query}`;
    const oldEvaluation = readArray(EVALUATIONS_KEY).find(item => item.submissionId === record.id);
    if (oldEvaluation) { $("marks").value = oldEvaluation.marks; $("feedback-text").value = oldEvaluation.feedback || ""; }
    $("character-count").textContent = `${$("feedback-text").value.length} / 2000`;
    $("feedback-text").addEventListener("input", () => { $("character-count").textContent = `${$("feedback-text").value.length} / 2000`; });
    form.addEventListener("submit", event => {
      event.preventDefault();
      const rawMarks = $("marks").value.trim();
      const marks = Number(rawMarks);
      const feedback = $("feedback-text").value.trim();
      let valid = true;
      $("marks-error").textContent = ""; $("feedback-error").textContent = "";
      if (!rawMarks || !Number.isFinite(marks)) { $("marks-error").textContent = "Enter a mark."; valid = false; }
      else if (marks < 0 || marks > MAX_MARKS) { $("marks-error").textContent = `Marks must be between 0 and ${MAX_MARKS}.`; valid = false; }
      if (!feedback) { $("feedback-error").textContent = "Enter written feedback before saving."; valid = false; }
      else if (feedback.length < 5) { $("feedback-error").textContent = "Feedback must be at least 5 characters."; valid = false; }
      if (!valid) return;
      const saveButton = form.querySelector('[type="submit"]'); saveButton.disabled = true;
      try {
        const evaluations = readArray(EVALUATIONS_KEY);
        const evaluation = {submissionId:record.id,assignmentId:String(record.assignmentId || ""),marks,maximumMarks:MAX_MARKS,feedback,evaluatedAt:new Date().toISOString()};
        const index = evaluations.findIndex(item => item.submissionId === record.id);
        if (index >= 0) evaluations[index] = evaluation; else evaluations.unshift(evaluation);
        writeArray(EVALUATIONS_KEY,evaluations);
        const storedSubmissions = readArray(SUBMISSIONS_KEY);
        const submissionIndex = storedSubmissions.findIndex(item => item.id === record.id);
        if (submissionIndex >= 0) { storedSubmissions[submissionIndex] = {...storedSubmissions[submissionIndex],status:"Reviewed"}; writeArray(SUBMISSIONS_KEY,storedSubmissions); }
        $("feedback-success").textContent = `Evaluation saved for ${record.studentName}. Marks: ${marks} / ${MAX_MARKS}.`;
        $("feedback-success").hidden = false;
        $("feedback-success").scrollIntoView({behavior:"smooth",block:"nearest"});
      } catch (_) {
        $("feedback-error").textContent = "The evaluation could not be saved. Check local storage availability and try again.";
        $("feedback-error").hidden = false;
      } finally { saveButton.disabled = false; }
    });
  }
  document.addEventListener("DOMContentLoaded", () => { initializeSubmissions(); initializeReview(); initializeFeedback(); });
})();
