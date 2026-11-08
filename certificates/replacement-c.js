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
      date: input.date || "",
      number: input.number || "",
      variant: input.variant === "detailed" ? "detailed" : "compact",
      score: input.score == null ? null : input.score,
      result: input.result || { average: "", methodLabel: "", attempts: [], selected: [] }
    };
  }
  function logo() {
    return '<div class="rc-c-logo"><img src="assets/ybg-hesi.png" width="933" height="368" alt="Your Best Grade"></div>';
  }
  function header(data, result) {
    var title = result ? "Study results" : "Certificate of completion";
    return '<header class="rc-c-header"><h2 class="rc-c-title">' + title + "</h2>" + logo() + "</header>";
  }
  function signature(ru) {
    return '<div class="rc-c-signature"><img src="assets/claire-signature.png" width="236" height="45" alt="Claire Corter\u2019s signature"><strong>Claire Corter</strong><span>Your Best Grade</span></div>';
  }
  function percent(value) {
    return value == null || value === "" ? "\u2014" : escapeHtml(value) + "%";
  }
  function score(data) {
    return data.score == null ? "" : '<div class="rc-c-score"><span>Average result</span><strong>' + percent(data.score.value) + "</strong><span>" + escapeHtml(data.score.method) + "</span></div>";
  }
  function metadata(data, result) {
    return '<dl class="rc-c-metadata"><div><dt>' + (result ? "Record date" : "Date awarded") + "</dt><dd>" + escapeHtml(data.date) + "</dd></div><div><dt>Certificate number</dt><dd>" + escapeHtml(data.number) + "</dd></div></dl>";
  }
  function subjects(data) {
    return '<ul class="rc-c-subjects">' + data.subjects.map(function(subject) {
      return "<li>" + escapeHtml(subject) + "</li>";
    }).join("") + "</ul>";
  }
  function scope(data, result) {
    return data.subjects.length ? '<section class="rc-c-scope"><h3>Subjects covered</h3>' + subjects(data) + "</section>" : '<section class="rc-c-scope" aria-hidden="true"></section>';
  }
  function legal(data) {
    return '<footer class="rc-c-legal"><p>HESI is a registered trademark of Elsevier Inc., which was not involved in the production of, and does not endorse, this document or its content.</p><span>yourbestgrade.com</span></footer>';
  }
  function article(data, result, content) {
    return '<article class="sheet rc-document rc-c ' + (result ? "rc-results" : "rc-c-certificate rc-c-" + data.variant) + (Array.from(data.name).length > 40 ? " rc-c-long-name" : "") + '" lang="en" aria-label="' + (result ? "Study results for " : "Certificate for ") + escapeHtml(data.name) + '">' + content + "</article>";
  }
  function certificate(input) {
    var data = normalize(input), identity = '<section class="rc-c-identity"><p class="rc-c-introduction">Awarded to</p><p class="rc-recipient">' + escapeHtml(data.name) + '</p><p class="rc-c-statement">for completing the Your Best Grade study program</p><p class="rc-c-program">' + escapeHtml(data.program.name) + "</p>" + score(data) + "</section>";
    return article(data, !1, header(data, !1) + identity + (data.variant === "detailed" ? scope(data, !1) : "") + signature(data.ru) + metadata(data, !1) + legal(data));
  }
  function results(input) {
    var data = normalize(input), identity = '<section class="rc-c-result-identity"><p class="rc-recipient">' + escapeHtml(data.name) + '</p><p class="rc-c-program">' + escapeHtml(data.program.name) + "</p></section>", summary = '<div class="rc-c-result-summary"><div><strong>Average result</strong><span>' + escapeHtml(data.result.methodLabel) + "</span></div><b>" + percent(data.result.average) + "</b></div>", footer = '<footer class="rc-c-result-footer"><p>HESI is a registered trademark of Elsevier Inc., which was not involved in the production of, and does not endorse, this document or its content.</p><span>yourbestgrade.com</span><span class="rc-c-page">Page 2</span></footer>';
    return article(data, !0, header(data, !0) + identity + summary + scope(data, !0) + metadata(data, !0) + footer);
  }
  window.YBGReplacementDesigns = window.YBGReplacementDesigns || {}, window.YBGReplacementDesigns.c = {
    label: { en: "Modern diploma" },
    description: { en: "A portrait document with a quiet title, a centered recipient and a signature below." },
    format: { width: 794, height: 1123 },
    resultFormat: { width: 794, height: 1123 },
    certificate,
    results
  };
})();
