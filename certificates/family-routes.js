(function(root) {
  "use strict";
  const base = {
    classic: { compact: "refine-classic-compact", detailed: "refine-classic-detailed", results: "refine-results-classic" },
    editorial: { compact: "refine-compact", detailed: "refine-detailed", results: "refine-results-editorial" },
    centered: { compact: "refine-centered-compact", detailed: "refine-centered-detailed", results: "refine-results-table" }
  }, families = { base, portrait: { portrait: { compact: "refine-portrait", detailed: "refine-portrait-detailed", results: "refine-results-portrait" } }, program: { program: { compact: "refine-program", detailed: "refine-program-detailed", results: "refine-results-program" } } };
  for (const id of ["a", "b", "c"]) families[`candidate-${id}`] = { [id]: { compact: `refine-candidate-${id}`, detailed: `refine-candidate-${id}-detailed`, results: `refine-results-candidate-${id}` } };
  const routes = {};
  for (const [family, styles] of Object.entries(families)) for (const [style, views] of Object.entries(styles)) for (const [view, route] of Object.entries(views)) routes[route] = { family, style, view };
  function context(page, certificate) {
    const current = routes[page], remembered = routes[certificate];
    if (!current) {
      const saved = remembered && remembered.view !== "results" ? remembered : routes[base.classic.compact];
      return { ...saved, page, collection: !0, family: page === "refine-families" ? "home" : page === "refine-replacements" ? "replacements" : "base", style: page === "refine-base" && saved.family !== "base" ? "classic" : saved.style, certificate: remembered && remembered.view !== "results" ? certificate : base.classic.compact };
    }
    const compatible = remembered && remembered.view !== "results" && remembered.family === current.family, chosen = current.view === "results" ? families[current.family][current.style][compatible ? remembered.view : "compact"] : page;
    return { ...current, page, collection: !1, certificate: chosen, length: routes[chosen].view };
  }
  function target(ctx, view, style = ctx.style) {
    return families[ctx.family]?.[style]?.[view] || null;
  }
  function pair(certificate) {
    const meta = routes[certificate];
    return meta ? families[meta.family][meta.style].results : null;
  }
  function selection(targetRoute, currentCertificate) {
    const meta = routes[targetRoute], old = routes[currentCertificate];
    if (meta) {
      const compatible = old && old.view !== "results" && meta.family === old.family, certificate2 = meta.view === "results" ? families[meta.family][meta.style][compatible ? old.view : "compact"] : targetRoute;
      return { certificate: certificate2, result: pair(certificate2) };
    }
    const certificate = targetRoute === "refine-base" && old?.family !== "base" ? base.classic.compact : old && old.view !== "results" ? currentCertificate : base.classic.compact;
    return { certificate, result: pair(certificate) };
  }
  const api = Object.freeze({ families, routes, context, target, pair, selection });
  typeof module < "u" && module.exports ? module.exports = api : root.YBGFamilyRoutes = api;
})(typeof window > "u" ? {} : window);
