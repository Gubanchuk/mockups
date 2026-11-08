(function() {
  "use strict";
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, function(character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }
  function normalize(input) {
    input = input || {};
    var ru = !1;
    return {
      ru,
      name: String(input.name == null ? "" : input.name).trim().replace(/\s+/gu, " ") || "Student name",
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
    return '<div class="rc-a-logo"><img src="assets/ybg-hesi.png" width="933" height="368" alt="Your Best Grade"></div>';
  }
  function signature(ru) {
    return '<div class="rc-a-signature"><img src="assets/claire-signature.png" width="236" height="45" alt="Claire Corter\u2019s signature"><div><strong>Claire Corter</strong><span>Your Best Grade</span></div></div>';
  }
  function metadata(data, isResult) {
    var score = data.score && !isResult ? '<div class="rc-a-meta-item"><dt>Average result</dt><dd class="rc-a-score">' + percent(data.score.value) + "<span>" + escapeHtml(data.score.method) + "</span></dd></div>" : "";
    return '<dl class="rc-a-metadata"><div class="rc-a-meta-item"><dt>' + (isResult ? "Record date" : "Date awarded") + "</dt><dd>" + escapeHtml(data.date) + '</dd></div><div class="rc-a-meta-item"><dt>Certificate number</dt><dd class="rc-a-number">' + escapeHtml(data.number) + "</dd></div>" + score + "</dl>";
  }
  function title(data, isResult) {
    return isResult ? '<span class="rc-a-title-main">Study</span><span class="rc-a-title-rest">results</span>' : '<span class="rc-a-title-main">Certificate</span><span class="rc-a-title-rest">of completion</span>';
  }
  function titlePage(data, isResult) {
    return '<header class="rc-a-title-page">' + logo() + '<div class="rc-a-heading"><h2 class="rc-a-title">' + title(data, isResult) + '</h2><p class="rc-a-program">' + escapeHtml(data.program.name) + "</p></div>" + metadata(data, isResult) + "</header>";
  }
  function subjectList(subjects) {
    return '<ul class="rc-a-subjects">' + subjects.map(function(subject) {
      return "<li>" + escapeHtml(subject) + "</li>";
    }).join("") + "</ul>";
  }
  function scope(data) {
    return data.subjects.length ? '<section class="rc-a-scope"><h3>Subjects covered</h3>' + subjectList(data.subjects) + "</section>" : '<section class="rc-a-scope" aria-hidden="true"></section>';
  }
  function legal(data, isResult) {
    var disclaimer = "HESI is a registered trademark of Elsevier Inc., which was not involved in the production of, and does not endorse, this document or its content.";
    return '<footer class="rc-a-legal"><div><p>' + disclaimer + '</p></div><span class="rc-a-site">yourbestgrade.com</span></footer>';
  }
  function recipient(data) {
    return '<p class="rc-recipient">' + escapeHtml(data.name) + "</p>";
  }
  function article(data, isResult, content) {
    var classes = "sheet rc-document rc-a" + (isResult ? " rc-results" : " rc-" + data.variant) + (Array.from(data.name).length > 40 ? " rc-a-long-name" : "");
    return '<article class="' + classes + '" lang="en" aria-label="' + (isResult ? "Study results for " : "Certificate for ") + escapeHtml(data.name) + '">' + titlePage(data, isResult) + content + legal(data, isResult) + "</article>";
  }
  function certificate(input) {
    var data = normalize(input), recognition = '<div class="rc-a-recognition"><p class="rc-a-introduction">Your Best Grade confirms that</p>' + recipient(data) + '<p class="rc-a-statement">has completed this Your Best Grade study program.</p></div>';
    return article(data, !1, '<div class="rc-a-content">' + recognition + (data.variant === "detailed" ? scope(data) : "") + signature(data.ru) + "</div>");
  }
  function results(input) {
    var data = normalize(input);
    return article(data, !0, '<div class="rc-a-result-content"><div class="rc-a-result-identity">' + recipient(data) + '</div><div class="rc-a-result-summary"><p>Average result <strong>' + percent(data.result.average) + "</strong></p><span>" + escapeHtml(data.result.methodLabel) + "</span></div>" + scope(data) + "</div>");
  }
  window.YBGReplacementDesigns = window.YBGReplacementDesigns || {}, window.YBGReplacementDesigns.a = {
    label: { en: "Academic folio" },
    description: { en: "A dedicated title page on the left, with the learner and study record on the right. Formal typography and a fine dividing rule." },
    format: { width: 1123, height: 794 },
    resultFormat: { width: 1123, height: 794 },
    certificate,
    results
  };
})();
