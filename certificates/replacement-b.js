(function() {
  "use strict";
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, function(character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }
  function normalize(input) {
    input = input || {};
    var ru = !1, name = String(input.name == null ? "" : input.name).trim().replace(/\s+/gu, " ");
    return {
      ru,
      name: name || "Student name",
      program: input.program || { name: "HESI Exit RN", code: "RN" },
      subjects: Array.isArray(input.subjects) ? input.subjects : [],
      number: input.number == null ? "" : input.number,
      date: input.date == null ? "" : input.date,
      variant: input.variant === "detailed" ? "detailed" : "compact",
      score: input.score == null ? null : input.score,
      result: input.result || { average: "", methodLabel: "", attempts: [], selected: [] }
    };
  }
  function percent(value) {
    return value == null || value === "" ? "\u2014" : escapeHtml(value) + "%";
  }
  function logo() {
    return '<div class="rc-b-logo-crop"><img class="rc-b-logo-image" src="assets/ybg-hesi.png" width="933" height="368" alt="Your Best Grade"></div>';
  }
  function header(data, result) {
    var title = result ? "Study results" : "Certificate<span>of completion</span>";
    return '<header class="rc-b-header">' + logo() + '<div class="rc-b-heading"><h2 class="rc-b-title">' + title + "</h2>" + (result ? '<p class="rc-b-header-program">' + escapeHtml(data.program.name) + "</p>" : "") + "</div></header>";
  }
  function nameBand(data) {
    return '<section class="rc-b-name-band" aria-label="Certificate recipient"><p class="rc-recipient">' + escapeHtml(data.name) + "</p></section>";
  }
  function signature(ru) {
    return '<div class="rc-b-signature"><img class="rc-b-signature-image" src="assets/claire-signature.png" width="236" height="45" alt="Claire Corter\u2019s signature"><strong class="rc-b-signatory">Claire Corter</strong><span class="rc-b-issuer">Your Best Grade</span></div>';
  }
  function metadata(data, result) {
    var score = result || data.score == null ? "" : '<div class="rc-b-meta-item rc-b-score"><dt>Average result</dt><dd><strong class="rc-b-score-value">' + percent(data.score.value) + '</strong><span class="rc-b-score-method">' + escapeHtml(data.score.method) + "</span></dd></div>";
    return '<dl class="rc-b-metadata' + (score ? " rc-b-with-score" : "") + '"><div class="rc-b-meta-item"><dt>' + (result ? "Record date" : "Date awarded") + "</dt><dd>" + escapeHtml(data.date) + '</dd></div><div class="rc-b-meta-item"><dt>Certificate number</dt><dd class="rc-b-number">' + escapeHtml(data.number) + "</dd></div>" + score + "</dl>";
  }
  function subjectList(data) {
    return '<ul class="rc-b-subject-list">' + data.subjects.map(function(subject) {
      return "<li>" + escapeHtml(subject) + "</li>";
    }).join("") + "</ul>";
  }
  function legal(data, result) {
    var trademark = "HESI is a registered trademark of Elsevier Inc., which was not involved in the production of, and does not endorse, this document or its content.";
    return '<div class="rc-b-legal"><p class="rc-b-trademark">' + trademark + '</p><span class="rc-b-site">yourbestgrade.com</span></div>';
  }
  function articleStart(data, result) {
    var nameClass = /[\u0400-\u052f]/u.test(data.name) ? " rc-b-cyrillic-name" : "";
    return '<article class="sheet rc-document rc-b ' + (result ? "rc-results" : "rc-b-" + data.variant) + nameClass + '" lang="en" aria-label="' + (result ? "Study results for " : "Certificate for ") + escapeHtml(data.name) + '">';
  }
  function certificate(input) {
    var data = normalize(input), detailed = data.variant === "detailed", statement = "has completed the Your Best Grade study program", scope = detailed && data.subjects.length ? '<section class="rc-b-study-scope"><h3 class="rc-b-scope-title">Study and practice activities covered</h3>' + subjectList(data) + "</section>" : "";
    return articleStart(data, !1) + header(data, !1) + nameBand(data) + '<div class="rc-b-learning"><p class="rc-b-statement">' + statement + '</p><p class="rc-b-program">' + escapeHtml(data.program.name) + "</p>" + scope + '</div><div class="rc-b-award">' + metadata(data, !1) + signature(data.ru) + '</div><footer class="rc-b-footer">' + legal(data, !1) + "</footer></article>";
  }
  function results(input) {
    var data = normalize(input);
    return articleStart(data, !0) + header(data, !0) + nameBand(data) + '<div class="rc-b-results-body"><div class="rc-b-result-summary"><div><h3 class="rc-b-average-label">Average result</h3><p class="rc-b-result-method">' + escapeHtml(data.result.methodLabel) + '</p></div><strong class="rc-b-average">' + percent(data.result.average) + '</strong></div><section class="rc-b-result-scope"><h3 class="rc-b-scope-title">' + (data.subjects.length ? "Subjects covered" : "") + "</h3>" + subjectList(data) + '</section></div><footer class="rc-b-results-footer">' + metadata(data, !0) + legal(data, !0) + "</footer></article>";
  }
  window.YBGReplacementDesigns = window.YBGReplacementDesigns || {}, window.YBGReplacementDesigns.b = {
    label: { en: "The personal line" },
    description: { en: "A pale blue sheet with a full-width white name field. The student is the focus of the document." },
    format: { width: 1123, height: 794 },
    resultFormat: { width: 794, height: 1123 },
    certificate,
    results
  };
})();
