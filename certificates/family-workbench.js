(() => {
  "use strict";
  const flow = window.YBGFamilyRoutes, page = document.body.dataset.view, ru = !1, t = (en, local) => en, initial = new URLSearchParams(location.search), review = flow.reviewSelection(page, initial.get("certificate") || initial.get("from")), ctx = flow.context(page, initial.get("certificate")), activeCertificate = review?.certificate ?? ctx.certificate, activePage = review?.openResults ? activeCertificate : page, anchor = review?.openResults ? "#results-page" : location.hash === "#results-page" && review?.length === "detailed" ? "" : location.hash, isReplacements = page === "refine-replacements", isCandidate = ctx.family.startsWith("candidate-") && ctx.family !== "candidate-c", isResult = !review && ctx.view === "results", labels = { base: "Original series", portrait: "Portrait statement", program: "Program in focus" };
  for (const [id, design] of Object.entries(window.YBGReplacementDesigns || {})) labels["candidate-" + id] = design.label.en;
  const styles = { classic: "Classic", editorial: "Asymmetric", centered: "Centered" }, root = document.querySelector("#app"), form = document.querySelector("#controls"), scoreField = document.querySelector("#score"), version = [...document.querySelectorAll('link[rel="stylesheet"],script[src]')].map((e) => new URL(e.href || e.src).searchParams.get("v")).filter(Boolean).join(".");
  let certScore = ((v) => ["none", "first", "best", "latest"].includes(v))(initial.get("certScore")) ? initial.get("certScore") === "none" ? "none" : "latest" : isResult ? "none" : scoreField.value, resultScore = "latest";
  function data() {
    return { name: document.querySelector("#student-name").value.trim().replace(/\s+/gu, " "), program: document.querySelector("#program").value, separate: document.querySelector("#separate")?.checked ?? initial.get("separate") !== "0" };
  }
  function parameters(route) {
    const d = data(), chosen = flow.selection(route, activeCertificate), meta = flow.routes[route], p = new URLSearchParams({ ...d, separate: d.separate ? "1" : "0", ...chosen, score: meta?.view === "results" ? resultScore : certScore, certScore, resultScore, preview: version });
    return meta?.view === "results" && p.set("from", chosen.certificate), p;
  }
  function url(route, language = ru) {
    return `${route}${language ? "-ru" : ""}.html?${parameters(route)}`;
  }
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg>', navLink = (route, label, cls = "", active = !1, accessibleLabel = "") => `<a class="${cls}" data-fw-route="${route}" href="${url(route)}"${active ? ' aria-current="page"' : ""}${accessibleLabel ? ` aria-label="${accessibleLabel}"` : ""}>${label}</a>`, familyName = labels[ctx.family] || "", title = review ? "Certificate designs" : isReplacements ? "Third direction alternatives" : familyName, documentChoices = [
    ["compact", "Concise certificate", "Page 1 \xB7 Without the subject list"],
    ["detailed", "Detailed certificate", "Page 1 \xB7 With the subject list"],
    ["results", "Result sheet", "Page 2 \xB7 Average result and subjects"]
  ], selectedMark = '<svg class="fw-selected-mark" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg>';
  function reviewChoices() {
    return `<div class="fw-choices">
      <nav class="fw-layouts fw-review-designs" aria-label="Certificate designs">${flow.reviewDesigns.map((design, index) => navLink(
      design[review.length],
      `<span class="fw-design-prefix" aria-hidden="true">Design&nbsp;</span><span aria-hidden="true">${index + 1}</span>`,
      "fw-layout",
      design === review.design,
      `Design ${index + 1}`
    )).join("")}</nav>
      <section class="fw-choice-row">
        <h2 id="fw-format-label">Subject list</h2>
        <nav class="fw-layouts fw-review-formats" aria-labelledby="fw-format-label">
          ${navLink(review.design.compact, "On the second page", "fw-layout", review.length === "compact")}
          ${navLink(review.design.detailed, "On the certificate", "fw-layout", review.length === "detailed")}
        </nav>
      </section>
    </div>`;
  }
  function choices() {
    return ctx.collection ? "" : `<div class="fw-choices">${ctx.family === "base" ? `<section class="fw-choice-row"><h2 id="fw-layout-label">Layout</h2><nav class="fw-layouts" aria-labelledby="fw-layout-label">${Object.entries(styles).map(([style, label]) => navLink(flow.target(ctx, isResult ? "results" : ctx.length, style), label, "fw-layout", style === ctx.style)).join("")}</nav></section>` : ""}<section class="fw-choice-row"><h2 id="fw-document-label">Document</h2><nav class="fw-documents" aria-labelledby="fw-document-label">${documentChoices.map(([view, label, description]) => navLink(flow.target(ctx, view), `<span class="fw-document-title">${label}${selectedMark}</span><small>${description}</small>`, "fw-document", ctx.view === view, label)).join("")}</nav></section></div>`;
  }
  const shell = document.createElement("header");
  shell.className = "family-workbench", review && shell.classList.add("fw-review"), shell.innerHTML = `<div class="fw-top"><span class="fw-brand">Your Best Grade</span><div class="fw-tools"><a href="/" class="fw-all-mockups">All mockups</a>${review ? "" : '<button id="fw-help-toggle" type="button" aria-expanded="false" aria-controls="fw-help">About the previews</button>'}</div></div>
  <div id="fw-help" class="fw-help" hidden><p>Design previews for team discussion, with fictional data. Certificate wording and issuance rules are not final.</p></div>
  ${review ? "" : `<nav class="fw-back-links" aria-label="Back to selection">${navLink("refine-families", arrow + "All designs", "fw-back")}${isCandidate || ctx.family === "program" ? navLink("refine-replacements", "Compare three replacements", "fw-back") : ""}${isReplacements ? navLink("refine-program", "Previous blue design", "fw-back") : ""}</nav>`}
  <div class="fw-heading"><h1>${title}</h1>${review ? '<button id="fw-settings-toggle" class="fw-settings-toggle" type="button" aria-expanded="false" aria-controls="fw-form-slot">Settings</button>' : ""}</div>
  ${review ? reviewChoices() : choices()}
  <div class="fw-preview-tools" id="fw-form-slot"${review || ctx.collection ? " hidden" : ""}></div>
  ${review || !ctx.collection ? `<p class="fw-score-note"${review ? "" : " hidden"}>Preview uses sample data. The score calculation is still open for discussion.</p>` : ""}`, root.prepend(shell), document.body.classList.add("has-family-workbench"), root.querySelectorAll(".family-link,.base-preview").forEach((e) => e.setAttribute("aria-label", "Open: " + e.querySelector(".caption h3").textContent));
  const settings = shell.querySelector("#fw-form-slot");
  settings.append(form), review && settings.append(shell.querySelector(".fw-score-note"));
  const nameField = form.querySelector("#student-name"), nameControl = nameField.closest(".control"), programControl = form.querySelector("#program").closest(".control"), scoreControl = scoreField.closest(".control"), identity = document.createElement("div");
  identity.className = "fw-identity", identity.append(programControl, nameControl), form.prepend(identity), nameControl.classList.add("fw-name-control"), programControl.classList.add("fw-program-control"), form.querySelector(".name-presets")?.remove(), form.querySelector("#reset")?.remove();
  const nameButton = document.createElement("button");
  nameButton.type = "button", nameButton.className = "fw-name-button", nameButton.setAttribute("aria-expanded", "false"), nameButton.setAttribute("aria-controls", "fw-name-editor"), nameButton.innerHTML = '<strong id="fw-name-value"></strong><span class="fw-name-action"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z"/></svg>Edit</span>';
  const nameEditor = document.createElement("div");
  nameEditor.id = "fw-name-editor", nameEditor.className = "fw-name-editor", nameEditor.hidden = !0;
  const done = document.createElement("button");
  done.type = "button", done.className = "fw-name-done", done.textContent = "Done", nameEditor.append(nameField, done), nameControl.append(nameButton, nameEditor);
  let savedName = nameField.value;
  function startNameEdit() {
    savedName = nameField.value, nameButton.hidden = !0, nameEditor.hidden = !1, nameButton.setAttribute("aria-expanded", "true"), nameField.focus(), nameField.select();
  }
  function finishNameEdit(cancel = !1, returnFocus = !1) {
    nameEditor.hidden || (nameField.value = cancel ? savedName : nameField.value.trim().replace(/\s+/gu, " ") || savedName, nameField.dispatchEvent(new Event("input", { bubbles: !0 })), nameEditor.hidden = !0, nameButton.hidden = !1, nameButton.setAttribute("aria-expanded", "false"), returnFocus && nameButton.focus());
  }
  nameButton.addEventListener("click", startNameEdit), nameControl.querySelector("label").addEventListener("click", (e) => {
    e.preventDefault(), startNameEdit();
  }), done.addEventListener("click", () => finishNameEdit(!1, !0)), nameEditor.addEventListener("keydown", (e) => {
    (e.key === "Enter" || e.key === "Escape") && (e.preventDefault(), finishNameEdit(e.key === "Escape", !0));
  }), nameEditor.addEventListener("focusout", (e) => {
    nameEditor.contains(e.relatedTarget) || finishNameEdit();
  });
  const scoreOptions = document.createElement("div");
  scoreOptions.className = "fw-score-options", scoreOptions.append(scoreControl), form.append(scoreOptions), scoreOptions.hidden = isResult;
  const placement = form.querySelector(".result-setting");
  if (placement) {
    const placementControl = document.createElement("div");
    placementControl.className = "control fw-placement-control", placementControl.hidden = review?.length === "detailed";
    const heading = document.createElement("span");
    heading.className = "fw-control-label", heading.textContent = "Score placement";
    const help = document.createElement("p");
    help.className = "fw-field-help", help.id = "fw-placement-help";
    const checkbox = placement.querySelector("input");
    checkbox.setAttribute("aria-describedby", help.id), checkbox.setAttribute("aria-label", "Keep the score on page 2 only"), placement.append(checkbox), placementControl.append(heading, placement, help), scoreOptions.append(placementControl);
  }
  document.querySelectorAll(".toolbar,.page-actions,.alternative-links,.collection-heading,.result-callout").forEach((e) => e.hidden = !0);
  const scoreLabel = form.querySelector('label[for="score"]');
  scoreLabel.textContent = "Score on certificate";
  const separateLabel = form.querySelector('label[for="separate"]');
  separateLabel && (separateLabel.textContent = "On page 2 only");
  const scoreHelp = document.createElement("p");
  scoreHelp.className = "fw-field-help", scoreHelp.id = "fw-score-help", scoreField.closest(".control").append(scoreHelp), scoreField.setAttribute("aria-describedby", scoreHelp.id);
  function sync() {
    const current = scoreField.value;
    isResult ? (resultScore = current, certScore !== "none" && (certScore = current)) : (certScore = current, current !== "none" && (resultScore = current));
    const d = data(), scoreNote = shell.querySelector(".fw-score-note");
    scoreNote && !review && (scoreNote.hidden = !(isResult || certScore !== "none" && !d.separate)), shell.querySelectorAll("[data-fw-route]").forEach((e) => e.href = url(e.dataset.fwRoute)), root.querySelectorAll("a.preview-link[data-route]").forEach((e) => e.href = url(e.dataset.route));
    const visibleName = d.name || "Student name";
    shell.querySelector("#fw-name-value").textContent = visibleName, nameButton.setAttribute("aria-label", "Edit name: " + visibleName), scoreHelp.textContent = isResult ? certScore === "none" || d.separate ? "The score is shown on this sheet only." : "This option applies to both pages." : certScore === "none" ? "No score on the certificate." : "One average result.", placement && (placement.hidden = !1, placement.dataset.enabled = String(certScore !== "none"), placement.dataset.checked = String(certScore !== "none" && d.separate), form.querySelector("#fw-placement-help").textContent = certScore === "none" ? "Select \u201CShow score\u201D to change its placement." : d.separate ? "Page 1 has no score; the result is on page 2." : "The score is shown on both pages.");
    const p = parameters(activePage);
    history.replaceState(null, "", `${activePage}.html?${p}${anchor}`);
  }
  shell.querySelector("#fw-help-toggle")?.addEventListener("click", (e) => {
    const help = shell.querySelector("#fw-help");
    help.hidden = !help.hidden, e.currentTarget.setAttribute("aria-expanded", String(!help.hidden));
  }), shell.querySelector("#fw-settings-toggle")?.addEventListener("click", (e) => {
    settings.hidden = !settings.hidden, e.currentTarget.setAttribute("aria-expanded", String(!settings.hidden));
  }), form.addEventListener("input", sync), form.addEventListener("change", sync), sync();
})();
