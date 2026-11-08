"use strict";
const ru = !1, t = (en, local) => en, page = document.body.dataset.view, isResult = page.startsWith("refine-results"), isCompare = ["refine-families", "refine-replacements", "refine-base", "refine-content", "refine-results"].includes(page), newDirections = ["refine-portrait", "refine-portrait-detailed", "refine-program", "refine-program-detailed"], app = document.querySelector("#app"), esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]), clean = (v) => {
  const value = String(v).slice(0, 80).trim().replace(/\s+/gu, " ");
  return /[^\p{Script=Latin}\p{M}\s.'’\-]/u.test(value) ? "Alexandra Morgan" : value;
}, arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>', sampleScore = 84, methods = { none: "No score", latest: "Show score" }, programs = {
  rn: { name: "HESI Exit RN", code: "RN", subjects: [
    "Adult Medical-Surgical Nursing",
    "Pediatric Nursing",
    "Fundamentals of Nursing",
    "Psychiatric / Mental Health Nursing",
    "Maternity & Newborn Nursing",
    "Nursing Leadership / Management",
    "Dosage Calculation / HESI Mathematics",
    "Community Health",
    "Pharmacology",
    "Nutrition",
    "Critical Care",
    "Gerontology",
    "Pathophysiology",
    "Health Assessment",
    "Research",
    "Critical Thinking"
  ] },
  // Source: beta Test Creator → PN → Subject Area, checked 8 November 2026.
  // See PN-SUBJECT-SOURCE-AUDIT-2026-11-08.md; these are subject areas, not issuance requirements.
  pn: { name: "HESI Exit PN", code: "PN", subjects: [
    "Community Health",
    "Critical Care",
    "Critical Thinking",
    "Dosage Calculation",
    "Fundamentals",
    "Gerontology",
    "Health Assessment",
    "Management",
    "Maternity",
    "Medical/Surgical",
    "Nutrition",
    "Pathophysiology",
    "Pediatric",
    "Pharmacology",
    "Professional Issues",
    "Psychology/Mental Health",
    "Research"
  ] },
  // Eight published disciplines; Introduction is a separate introductory section.
  // Source: beta A2 course structure, see A2-SUBJECT-SOURCE-AUDIT-2026-11-08.md.
  a2: { name: "HESI A2 MasterClass", code: "A2", subjects: ["Anatomy and Physiology", "Math", "Reading Comprehension", "Grammar", "Vocabulary", "Biology", "Chemistry", "Critical Thinking"] }
}, names = { short: "Alex Morgan", normal: "Alexandra Morgan", long: "Alexandra Elizabeth Montgomery-Washington" }, q = new URLSearchParams(location.search), defaults = () => ({ name: names.normal, program: "rn", score: isResult ? "latest" : "none", separate: !0, zoom: !1 });
let state = defaults();
q.has("name") && (state.name = clean(q.get("name"))), Object.hasOwn(programs, q.get("program")) && (state.program = q.get("program")), ["none", "first", "best", "latest"].includes(q.get("score")) && (!isResult || q.get("score") !== "none") && (state.score = q.get("score") === "none" ? "none" : "latest"), q.has("separate") && (state.separate = q.get("separate") === "1"), state.zoom = !1;
const resultRoutes = ["refine-results-classic", "refine-results-editorial", "refine-results-table", "refine-results-portrait", "refine-results-program", ...["a", "b", "c"].map((id) => "refine-results-candidate-" + id)], certificateDesigns = [
  { style: "classic", label: "Classic", routes: ["refine-classic-detailed", "refine-classic-compact"] },
  { style: "editorial", label: "Asymmetric", routes: ["refine-detailed", "refine-compact"] },
  { style: "centered", label: "Centered", routes: ["refine-centered-detailed", "refine-centered-compact"] }
], certificateRoutes = certificateDesigns.flatMap((d) => d.routes), allowedOrigins = ["refine-families", "refine-replacements", "refine-base", ...newDirections, ...["a", "b", "c"].flatMap((id) => ["refine-candidate-" + id, "refine-candidate-" + id + "-detailed"]), "refine-content", ...certificateRoutes, "explore", "explore-centered", "explore-editorial", "explore-classic"], origin = allowedOrigins.includes(q.get("from")) ? q.get("from") : "refine-content", resultChoice = resultRoutes.includes(page) ? page : resultRoutes.includes(q.get("result")) ? q.get("result") : "refine-results-classic", routeTitles = {
  "refine-families": "Three certificate directions",
  "refine-replacements": "Third direction alternatives",
  "refine-base": "The original series",
  "refine-portrait": "Portrait statement",
  "refine-portrait-detailed": "Portrait statement \xB7 Detailed certificate",
  "refine-program": "Program in focus",
  "refine-program-detailed": "Program in focus \xB7 Detailed certificate",
  "refine-results-portrait": "Portrait statement \xB7 Result sheet",
  "refine-results-program": "Program in focus \xB7 Result sheet",
  "refine-content": "Certificate content",
  "refine-detailed": "Detailed certificate",
  "refine-compact": "Concise certificate",
  "refine-results": "Three result sheets",
  "refine-results-table": "Table \xB7 Current layout",
  "refine-results-editorial": "Editorial \xB7 Results by test",
  "refine-results-classic": "Classic \xB7 Formal record"
}, descriptions = {
  "refine-detailed": "The learning statement and subjects are on the certificate, with Claire\u2019s signature.",
  "refine-compact": "A short completion statement. Subjects and test results move to the accompanying sheet.",
  "refine-results-table": "One average result and the program subjects.",
  "refine-results-editorial": "An asymmetric layout with one average result and the program subjects.",
  "refine-results-classic": "A centered heading, fine frame and restrained academic typography."
};
for (const id of ["a", "b", "c"]) {
  const label = window.YBGReplacementDesigns[id].label.en;
  for (const [route, suffix] of [[`refine-candidate-${id}`, "Concise"], [`refine-candidate-${id}-detailed`, "Detailed"], [`refine-results-candidate-${id}`, "Result sheet"]]) routeTitles[route] = label + " \xB7 " + suffix;
}
for (const design of certificateDesigns) for (const route of design.routes) {
  const full = route.endsWith("detailed");
  routeTitles[route] = design.label + " \xB7 " + (full ? "Detailed" : "Concise"), descriptions[route] = descriptions[full ? "refine-detailed" : "refine-compact"];
}
const visibleName = () => clean(state.name) || "Student name", number = () => `YBG-DEMO-${programs[state.program].code}-2026-001`, date = "7 November 2026", decimal = (n) => n.toFixed(2).replace(".", ".");
function average() {
  return sampleScore;
}
function params() {
  const p = new URLSearchParams({ name: state.name, program: state.program, score: state.score, separate: state.separate ? "1" : "0", result: resultChoice });
  for (const key of ["certificate", "certScore", "resultScore"]) q.has(key) && p.set(key, q.get(key));
  return p;
}
const publishedRoutes = ["refine-families", "refine-base", "refine-classic-compact", "refine-classic-detailed", "refine-results-classic", "refine-compact", "refine-detailed", "refine-results-editorial", "refine-centered-compact", "refine-centered-detailed", "refine-results-table", "refine-portrait", "refine-portrait-detailed", "refine-results-portrait", "refine-candidate-c", "refine-candidate-c-detailed", "refine-results-candidate-c"];
function href(route) {
  publishedRoutes.includes(route) || (route = "refine-families");
  const p = params();
  return route.startsWith("refine-results") ? (p.set("from", isResult ? origin : page), state.score === "none" && p.set("score", "latest")) : isResult && route.startsWith("refine-") && p.set("from", origin), `${route}.html?${p}`;
}
const link = (route, label, cls = "") => `<a class="${cls}" data-route="${route}" href="${esc(href(route))}">${label}</a>`, logo = () => '<div class="logo-crop"><img src="assets/ybg-hesi.png" width="933" height="368" alt="Your Best Grade"></div>';
function legal() {
  return "HESI is a registered trademark of Elsevier Inc., which was not involved in the production of, and does not endorse, this document or its content.";
}
function subjectList(extra = "") {
  return `<ul class="subject-list ${extra}">${programs[state.program].subjects.map((s) => `<li>${s}</li>`).join("")}</ul>`;
}
function signature() {
  return '<div class="signature"><div class="signature-space"><img class="signature-image" src="assets/claire-signature.png" width="236" height="45" alt="Claire Corter\u2019s signature"></div><strong>Claire Corter</strong><span>Signature \xB7 Your Best Grade</span></div>';
}
function certificate(route) {
  const full = route.endsWith("detailed"), design = certificateDesigns.find((d) => d.routes.includes(route)).style, p = programs[state.program];
  return `<article class="sheet revision-certificate cert-${design} ${full ? "detailed" : "concise"}" aria-label="Certificate for ${esc(visibleName())}">
 <header class="revision-header">${design === "editorial" ? "" : logo()}<h2 class="document-title">Certificate <span>of completion</span></h2></header>
 <div class="cert-body"><p class="presented">This certifies that</p><div class="recipient">${esc(visibleName())}</div><p class="completion">has completed the Your Best Grade study program</p><div class="program-name">${p.name}</div>
 ${full && p.subjects.length ? `<div class="scope"><p>Practice exams covered the following subjects:</p>${subjectList()}</div>` : ""}</div>
 ${design === "editorial" ? `<aside class="revision-brand">${logo()}<p>${p.name}</p><span>Certificate of completion</span></aside>` : ""}
 <footer class="revision-meta"><div><span class="meta-label">Date awarded</span><strong>${date}</strong>${state.score !== "none" && !state.separate ? `<div class="certificate-score"><b>${decimal(average())}%</b><span>Average result</span></div>` : ""}</div><div><span class="meta-label">Certificate number</span><strong>${number()}</strong><span class="issuer-name">Issued by Your Best Grade</span></div>${signature()}</footer>
 <div class="revision-legal"><p>${legal()}</p><span>yourbestgrade.com</span></div></article>`;
}
function resultFooter() {
  return `<div class="cert-meta"><div><span class="meta-label">Record date</span><span class="meta-value">${date}</span></div><div><span class="meta-label">Certificate number</span><span class="meta-value">${number()}</span></div></div><div class="fine-print"><span>yourbestgrade.com</span></div>`;
}
function resultScope() {
  return programs[state.program].subjects.length ? `<section class="result-scope"><h3>Subjects covered</h3>${subjectList()}</section>` : "";
}
function resultSheet(route) {
  const style = route.split("-").at(-1), p = programs[state.program], title = "Study results", summary = `<div class="summary-score"><strong>${decimal(average())}%</strong><span>Average result</span></div>`, identity = `<div class="recipient">${esc(visibleName())}</div><div class="program-name">${p.name}</div>`;
  let content;
  return style === "editorial" ? content = `<header class="sheet-header"><h2 class="document-title">${title}</h2>${logo()}</header><div class="result-identity">${identity}</div>${summary}${resultScope()}` : content = `<header class="sheet-header"><h2 class="document-title">${title}</h2>${logo()}</header>${identity}${summary}${resultScope()}`, `<article class="sheet result-sheet revision-results result-${style}" aria-label="${routeTitles[route]}: ${esc(visibleName())}">${content}${resultFooter()}</article>`;
}
function replacementFor(route) {
  const match = route.match(/^refine-(?:results-)?candidate-([abc])(?:-detailed)?$/);
  return match ? window.YBGReplacementDesigns?.[match[1]] : null;
}
function renderDocument(route) {
  const info = { ru: !1, name: visibleName(), program: programs[state.program], subjects: programs[state.program].subjects, number: number(), date, variant: route.endsWith("detailed") ? "detailed" : "compact", score: state.score !== "none" && !state.separate ? { value: decimal(average()), method: "" } : null }, replacement = replacementFor(route);
  return replacement ? route.startsWith("refine-results-") ? replacement.results({ ...info, result: { average: decimal(average()), methodLabel: "" } }) : replacement.certificate(info) : ["refine-results-portrait", "refine-results-program"].includes(route) ? window.YBGDirections.renderResults(route.endsWith("portrait") ? "portrait" : "program", { ...info, result: { average: decimal(average()), methodLabel: "" } }) : route.startsWith("refine-results-") ? resultSheet(route) : newDirections.includes(route) ? window.YBGDirections.render(route.startsWith("refine-portrait") ? "portrait" : "program", info) : certificate(route);
}
function stage(route) {
  const replacement = replacementFor(route), format = replacement ? route.startsWith("refine-results-") ? replacement.resultFormat : replacement.format : null, portrait = format ? format.height > format.width : route.startsWith("refine-results-") || route.startsWith("refine-portrait");
  return `<div class="stage${portrait ? " portrait" : ""}" data-route-sheet="${route}" data-width="${format?.width || (portrait ? 794 : 1123)}">${renderDocument(route)}</div>`;
}
function families() {
  return `<main class="collection family-collection"><div class="compositions family-compositions">${[
    ["refine-base", "refine-classic-compact", "Original series", "Three layouts \xB7 two certificate lengths \xB7 matching results", "Classic, Asymmetric and Centered blue-and-white layouts."],
    ["refine-portrait", "refine-portrait", routeTitles["refine-portrait"], "Two certificate lengths \xB7 matching result sheet", "Warm paper, expressive serif typography and a personal completion statement."],
    ["refine-candidate-c", "refine-candidate-c", "Modern diploma", "Two certificate lengths \xB7 matching result sheet", "A white portrait sheet with a compact title, centered recipient and signature below."]
  ].map(([route, preview, title, meta, description], i) => `<section class="composition family-card">${link(route, `<div class="family-frame ${i > 0 ? "family-frame-portrait" : ""}">${stage(preview)}</div><div class="caption"><h3>${title}</h3></div><span class="fw-open">${i === 0 ? "Open original series" : "Open direction"}${arrow}</span>`, "preview-link family-link")}<p class="family-meta">${meta}</p><p>${description}</p></section>`).join("")}</div></main>`;
}
function replacements() {
  return `<main class="collection family-collection replacement-collection"><div class="compositions family-compositions">${["a", "b", "c"].map((id) => {
    const design = window.YBGReplacementDesigns[id], route = "refine-candidate-" + id;
    return `<section class="composition family-card">${link(route, `<div class="family-frame ${design.format.height > design.format.width ? "family-frame-portrait" : ""}">${stage(route)}</div><div class="caption"><h3>${esc(design.label.en)}</h3></div><span class="fw-open">Open the complete set${arrow}</span>`, "preview-link family-link")}<p class="family-meta">Concise \xB7 detailed \xB7 result sheet</p><p>${esc(design.description.en)}</p></section>`;
  }).join("")}</div></main>`;
}
function baseSeries() {
  return `<main class="collection base-collection"><div class="compositions">${certificateDesigns.map((d) => `<section class="composition">${link(d.routes[1], `${stage(d.routes[1])}<div class="caption"><h3>${d.label}</h3></div><span class="fw-open">Open layout${arrow}</span>`, "preview-link base-preview")}<p>Concise or detailed certificate, with a matching result sheet.</p></section>`).join("")}</div></main>`;
}
const option = (v, label, current) => `<option value="${v}"${v === current ? " selected" : ""}>${label}</option>`;
function toolbar() {
  return `<header class="toolbar"><div class="topline">${link(isResult ? isCompare ? origin : "refine-results" : isCompare ? "explore" : "refine-content", "\u2190 Back to comparison", "back")}<h1>${routeTitles[page]}</h1><span class="sample-note">Design preview \xB7 fictional data \xB7 not an issued certificate</span></div><form id="controls" class="controls"><div class="control"><label for="student-name">Student name</label><input id="student-name" maxlength="80" value="${esc(state.name)}" autocomplete="off"><div class="name-presets"><button type="button" id="short-name">Short name</button><button type="button" id="long-name">Long name</button></div></div><div class="control"><label for="program">Program</label><select id="program">${Object.entries(programs).map(([k, p]) => option(k, p.name, state.program)).join("")}</select></div><div class="control"><label for="score">Average result</label><select id="score">${Object.entries(methods).filter(([k]) => !isResult || k !== "none").map(([k, label]) => option(k, label, state.score)).join("")}</select>${isResult ? "" : `<div class="result-setting"><input id="separate" type="checkbox"${state.separate ? " checked" : ""}${state.score === "none" ? " disabled" : ""}><label for="separate">Keep score on the result sheet</label></div>`}</div><button class="reset" id="reset" type="button">Reset sample</button></form><p class="layout-note" id="scope-note"></p></header>`;
}
function contentComparison() {
  return '<main class="collection refinement-collection">' + certificateDesigns.map((design) => `<section class="content-design" aria-labelledby="heading-${design.style}"><h2 id="heading-${design.style}">${design.label}</h2><div class="compositions content-compositions">${design.routes.map((route) => `<section class="composition">${link(route, `${stage(route)}<div class="caption"><h3>${route.endsWith("detailed") ? "Detailed" : "Concise"}</h3>${arrow}</div>`, "preview-link")}<p>${descriptions[route]}</p></section>`).join("")}</div></section>`).join("") + "</main>";
}
function collection() {
  return isResult ? `<main class="collection refinement-collection"><div class="collection-heading"><h2>${isResult ? "Same results. Three ways to present them." : "How much belongs on the certificate?"}</h2><p>${isResult ? "The same sample result and subjects in every version." : "Same design and signature. Different level of detail."}</p></div><div class="compositions ${isResult ? "result-compositions" : "content-compositions"}">${resultRoutes.map((route) => `<section class="composition">${link(route, `${stage(route)}<div class="caption"><h3>${routeTitles[route]}</h3>${arrow}</div>`, "preview-link")}<p>${descriptions[route]}</p></section>`).join("")}</div><section class="result-callout"><div><h2>${isResult ? "The certificate comes first" : "Choose the accompanying result sheet"}</h2><p>${isResult ? "Return with the same name and program." : "Compare the result sheet layouts with the same sample score."}</p></div>${link(isResult ? origin : "refine-results", isResult ? "Back to certificates" : "Compare three result sheets")}</section></main>` : contentComparison();
}
function single() {
  const alternatives = isResult ? resultRoutes : certificateRoutes;
  return `<nav class="page-actions" aria-label="Preview controls">${link("refine-results", "Compare result sheets")}${isResult ? link(origin, "Back to certificate") : link(resultChoice, "Open accompanying sheet")}</nav><nav class="alternative-links" aria-label="Other versions">${alternatives.map((r) => r === page ? `<span aria-current="page">${routeTitles[r]}</span>` : link(r, routeTitles[r])).join("")}</nav><main class="paper-window revision-window${state.zoom ? " full" : ""}" tabindex="0" aria-label="Document preview">${stage(page)}</main>`;
}
app.innerHTML = toolbar() + (page === "refine-families" ? families() : page === "refine-replacements" ? replacements() : page === "refine-base" ? baseSeries() : isCompare ? collection() : single());
function scopeNote() {
  document.querySelector("#scope-note").textContent = state.program === "pn" ? "PN subjects follow the beta Test Creator subject areas, checked on 8 November 2026." : state.program === "rn" ? "RN subjects follow the original certificate." : "A2 includes all eight published disciplines from the beta course structure.";
}
const observer = new ResizeObserver((entries) => entries.forEach(({ target, contentRect }) => target.style.setProperty("--scale", contentRect.width / Number(target.dataset.width))));
function fit() {
  document.querySelectorAll(".stage").forEach((el) => {
    el.style.setProperty("--scale", el.clientWidth / Number(el.dataset.width)), observer.observe(el);
  }), document.querySelectorAll(".sheet").forEach((sheet) => {
    const name = sheet.querySelector(".recipient,.nd-recipient,.rc-recipient");
    if (!name) return;
    name.style.fontSize = "";
    let size = parseFloat(getComputedStyle(name).fontSize);
    const area = sheet.querySelector(".cert-body");
    function fits() {
      if (name.scrollWidth > name.clientWidth + 1) return !1;
      if (name.matches(".rc-recipient")) return name.scrollHeight <= parseFloat(getComputedStyle(name).maxHeight) + 1;
      if (name.matches(".nd-recipient")) return name.scrollHeight <= name.clientHeight + 1;
      if (!area) return name.offsetHeight <= 92;
      const styles = getComputedStyle(area);
      return [...area.children].reduce((sum, el) => {
        const s = getComputedStyle(el);
        return sum + el.offsetHeight + parseFloat(s.marginTop) + parseFloat(s.marginBottom);
      }, 0) <= area.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
    }
    for (; size > 22 && !fits(); )
      size--, name.style.fontSize = size + "px";
  });
}
function sync() {
  document.querySelectorAll("[data-route]").forEach((a) => a.href = href(a.dataset.route));
  const p = params();
  isResult && p.set("from", origin), state.zoom && p.set("zoom", "100"), history.replaceState(null, "", `${page}.html?${p}`), scopeNote();
}
function update() {
  if (state.name = clean(document.querySelector("#student-name").value), document.querySelector("#student-name").value = state.name, state.program = document.querySelector("#program").value, state.score = document.querySelector("#score").value, !isResult) {
    const sep = document.querySelector("#separate");
    state.separate = sep.checked, sep.disabled = state.score === "none";
  }
  document.querySelectorAll(".stage").forEach((el) => {
    el.innerHTML = renderDocument(el.dataset.routeSheet);
  }), sync(), fit();
}
document.querySelector("#controls").addEventListener("submit", (e) => e.preventDefault()), document.querySelector("#student-name").addEventListener("input", update), document.querySelector("#controls").addEventListener("change", (e) => {
  e.target.matches("select,input[type=checkbox]") && update();
});
for (const preset of ["short", "long"]) document.querySelector(`#${preset}-name`).addEventListener("click", () => {
  document.querySelector("#student-name").value = names[preset], update();
});
document.querySelector("#reset").addEventListener("click", () => {
  state = defaults(), document.querySelector("#student-name").value = state.name, document.querySelector("#program").value = state.program, document.querySelector("#score").value = state.score, isResult || (document.querySelector("#separate").checked = state.separate), update();
}), fit(), document.fonts.ready.then(fit), sync();
