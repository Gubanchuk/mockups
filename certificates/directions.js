(function() {
  "use strict";
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, function(character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }
  function logo() {
    return '<div class="nd-logo-crop logo-crop"><img class="nd-logo-image" src="assets/ybg-hesi.png" width="933" height="368" alt="Your Best Grade"></div>';
  }
  function signature(ru) {
    return '<div class="nd-signature"><img class="nd-signature-image" src="assets/claire-signature.png" width="236" height="45" alt="Claire Corter\u2019s signature"><strong class="nd-signatory">Claire Corter</strong><span class="nd-issuer">Your Best Grade</span></div>';
  }
  function metadata(data, record) {
    var dateLabel = record ? "Record date" : "Date awarded", numberLabel = "Certificate number", scoreLabel = "Average result", score = data.score == null ? "" : '<div class="nd-meta-item nd-score"><dt class="nd-meta-label">' + scoreLabel + '</dt><dd class="nd-meta-value"><span class="nd-score-value">' + escapeHtml(data.score.value) + '%</span><span class="nd-score-method">' + escapeHtml(data.score.method) + "</span></dd></div>";
    return '<dl class="nd-metadata"><div class="nd-meta-item"><dt class="nd-meta-label">' + dateLabel + '</dt><dd class="nd-meta-value">' + escapeHtml(data.date) + '</dd></div><div class="nd-meta-item"><dt class="nd-meta-label">' + numberLabel + '</dt><dd class="nd-meta-value nd-certificate-number">' + escapeHtml(data.number) + "</dd></div>" + score + "</dl>";
  }
  function legal(ru, detailed) {
    var disclaimer = "HESI is a registered trademark of Elsevier Inc., which was not involved in the production of, and does not endorse, this document or its content.";
    return '<footer class="nd-legal"><p class="nd-legal-copy">' + disclaimer + '</p><span class="nd-site">yourbestgrade.com</span></footer>';
  }
  function subjectList(subjects) {
    return '<ul class="nd-subject-list">' + subjects.map(function(subject) {
      return '<li class="nd-subject">' + escapeHtml(subject) + "</li>";
    }).join("") + "</ul>";
  }
  function studyScope(data) {
    return data.subjects.length ? '<section class="nd-study-scope"><p class="nd-scope-introduction">Practice exams covered the following subjects:</p>' + subjectList(data.subjects) + "</section>" : '<section class="nd-study-scope" aria-hidden="true"></section>';
  }
  function portrait(data) {
    var title = "<span>Certificate</span><span>of completion</span>";
    data.ru && data.variant === "detailed" && (title = "<span>\u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442</span><span>\u043E \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u0438 \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044F</span>");
    var statement = 'has completed the <strong class="nd-study-program">' + escapeHtml(data.program.name) + "</strong> study program.";
    return '<header class="nd-portrait-header">' + logo() + metadata(data) + '</header><h2 class="nd-portrait-title">' + title + '</h2><section class="nd-portrait-body"><p class="nd-introduction">Your Best Grade confirms that</p><p class="nd-recipient">' + escapeHtml(data.name) + '</p><p class="nd-statement">' + statement + "</p>" + (data.variant === "detailed" ? studyScope(data) : "") + signature(data.ru) + "</section>" + legal(data.ru, data.variant === "detailed");
  }
  function programTitle(program2) {
    var code = String(program2.code || "").toUpperCase();
    return (code === "RN" || code === "PN") && program2.name === "HESI Exit " + code ? '<span class="nd-program-main">HESI Exit</span><span class="nd-program-track">' + code + "</span>" : code === "A2" && program2.name === "HESI A2 MasterClass" ? '<span class="nd-program-main">HESI A2</span><span class="nd-program-track nd-program-masterclass">MasterClass</span>' : '<span class="nd-program-main nd-program-full">' + escapeHtml(program2.name) + "</span>";
  }
  function program(data) {
    var statement = "has completed this Your Best Grade study program.", heading = '<header class="nd-program-top"><div class="nd-program-heading"><p class="nd-program-kicker">Study program</p><h2 class="nd-program-display" aria-label="' + escapeHtml(data.program.name) + '">' + programTitle(data.program) + '</h2></div><div class="nd-program-record"><div class="nd-logo-plaque">' + logo() + "</div>" + metadata(data) + "</div></header>", recognition = '<p class="nd-program-document-title">Certificate of completion</p><p class="nd-recipient">' + escapeHtml(data.name) + "</p>";
    return data.variant === "detailed" ? heading + '<section class="nd-program-body"><div class="nd-detailed-recognition">' + recognition + '<p class="nd-statement">' + statement + "</p>" + signature(data.ru) + "</div>" + studyScope(data) + "</section>" + legal(data.ru, !0) : heading + '<section class="nd-program-body">' + recognition + '<div class="nd-program-body-row"><p class="nd-statement">' + statement + "</p>" + signature(data.ru) + "</div></section>" + legal(data.ru);
  }
  function normalize(input) {
    input = input || {};
    var ru = !1, name = String(input.name == null ? "" : input.name).trim().replace(/\s+/gu, " ") || "Student name";
    return {
      ru,
      name,
      program: input.program || { name: "HESI Exit RN", code: "RN" },
      number: input.number || "",
      date: input.date || "",
      score: input.score == null ? null : input.score,
      variant: input.variant === "detailed" ? "detailed" : "compact",
      subjects: Array.isArray(input.subjects) ? input.subjects : [],
      result: input.result || { average: "", methodLabel: "", attempts: [], selected: [] }
    };
  }
  function nameClass(name) {
    return Array.from(name).length > 40 ? " nd-long-name" : "";
  }
  function assertKind(kind) {
    if (kind !== "portrait" && kind !== "program") throw new RangeError("Unknown certificate direction: " + kind);
  }
  function render(kind, input) {
    assertKind(kind);
    var data = normalize(input);
    return '<article class="sheet nd-document nd-' + kind + " nd-" + data.variant + nameClass(data.name) + '" lang="en" aria-label="Certificate for ' + escapeHtml(data.name) + '">' + (kind === "portrait" ? portrait(data) : program(data)) + "</article>";
  }
  function percent(value) {
    return value == null || value === "" ? "\u2014" : escapeHtml(value) + "%";
  }
  function resultScope(data) {
    return data.subjects.length ? '<section class="nd-result-scope"><h3 class="nd-result-scope-title">Subjects covered</h3>' + subjectList(data.subjects) + "</section>" : '<section class="nd-result-scope" aria-hidden="true"></section>';
  }
  function resultFooter(data) {
    var record = { ru: data.ru, date: data.date, number: data.number, score: null };
    return '<footer class="nd-result-footer">' + metadata(record, !0) + '<div class="nd-result-footer-note"><span class="nd-site">yourbestgrade.com</span></div></footer>';
  }
  function renderResults(kind, input) {
    assertKind(kind);
    var data = normalize(input), title = "<span>Study</span><span>results</span>", header = '<header class="nd-results-header"><div class="nd-results-heading"><h2 class="nd-results-title">' + title + "</h2>" + (kind === "program" ? '<p class="nd-results-program">' + escapeHtml(data.program.name) + "</p>" : "") + '</div><div class="nd-results-brand">' + logo() + "</div></header>", identity = '<div class="nd-result-identity"><p class="nd-recipient">' + escapeHtml(data.name) + "</p>" + (kind === "portrait" ? '<p class="nd-results-program">' + escapeHtml(data.program.name) + "</p>" : "") + "</div>", summary = '<div class="nd-result-summary"><div class="nd-result-summary-copy"><p class="nd-result-summary-label">Average result</p><p class="nd-result-method">' + escapeHtml(data.result.methodLabel) + '</p></div><strong class="nd-result-average">' + percent(data.result.average) + "</strong></div>";
    return '<article class="sheet nd-document nd-results nd-results-' + kind + nameClass(data.name) + '" lang="en" aria-label="Study results for ' + escapeHtml(data.name) + '">' + header + '<div class="nd-result-content">' + identity + summary + resultScope(data) + resultFooter(data) + "</div></article>";
  }
  window.YBGDirections = Object.freeze({ render, renderResults });
})();
