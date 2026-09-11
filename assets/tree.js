// Course tree behaviour for the mockup: expand/collapse, "..." menus, Publish toggle, Reorder switch with drag and drop,
// Edit mode switch (variant 1.1), "Hide unpublished" checkbox, premoderation switch.
// Drill-in (07.09): a lesson row (or Edit) opens the lesson page, Edit on a section opens the section page; both replace
// the tree inside the same frame (.a2-view-lesson / .a2-view-section vs .a2-view-tree). A part is edited in the modal.
// Deleting lives inside: "Delete lesson" on the lesson page, "Delete section" on the section page, "Delete part" in the
// part form. Variant 1 also keeps Delete in the "..." menu. No real navigation anywhere.
(function () {
  function qs(el, s) { return el.querySelector(s); }
  function qsa(el, s) { return Array.prototype.slice.call(el.querySelectorAll(s)); }
  function nameOf(node) { return qs(node, ':scope > .a2-row .a2-name').textContent; }
  function typeOf(node) { return node.getAttribute('data-type'); }
  function isPub(node) { return node.getAttribute('data-published') !== '0'; }
  function sectionOf(el) { return el.closest('.a2-section'); }
  function partOf(node) { return node.parentElement ? node.parentElement.closest('.a2-part') : null; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  function closeMenus(root) { qsa(root || document, '.a2-acts-kebab.open').forEach(function (m) { m.classList.remove('open'); }); }

  // Reorder keeps a snapshot of every list; the new order is kept only on "Save new order",
  // "Cancel" (or switching Reorder off) puts every list back.
  function snapshot(tree) {
    tree.__order = qsa(tree, '.a2-list').map(function (l) { return { list: l, kids: Array.prototype.slice.call(l.children) }; });
  }
  function restore(tree) {
    (tree.__order || []).forEach(function (e) {
      e.kids.forEach(function (k) { if (k.parentElement === e.list) e.list.appendChild(k); });
    });
    tree.__order = null;
    recount(tree);
  }

  // state = 'reorder' (drag handles + Save/Cancel bar) or 'on' (Edit mode, variant 1.1); each has its own switch.
  function setState(tree, state, on, keep) {
    if (state === 'reorder') {
      if (on) snapshot(tree); else if (keep) tree.__order = null; else restore(tree);
    }
    tree.classList.toggle(state, on);
    var sw = qs(tree, '.a2-toggle[data-state="' + state + '"] .a2-switch');
    if (sw) sw.classList.toggle('on', on);
    if (state === 'reorder') qsa(tree, '.a2-node').forEach(function (n) { if (on) n.setAttribute('draggable', 'true'); else n.removeAttribute('draggable'); });
    closeMenus(tree);
  }

  function recount(tree) {
    qsa(tree, '.a2-section').forEach(function (s) {
      var parts = qsa(s, '.a2-part').length, lessons = qsa(s, '.a2-lesson').length;
      qs(s, ':scope > .a2-row .a2-count').textContent = (parts ? parts + ' parts · ' : '') + lessons + ' lessons';
    });
    qsa(tree, '.a2-part').forEach(function (p) {
      qs(p, ':scope > .a2-row .a2-count').textContent = qsa(p, '.a2-lesson').length + ' lessons';
    });
    ['sections', 'parts', 'lessons'].forEach(function (k) {
      var el = qs(tree, '[data-count="' + k + '"]');
      if (el) el.textContent = qsa(tree, '.a2-' + k.slice(0, -1)).length;
    });
  }

  function syncPublishLabel(acts) {
    var node = acts.closest('.a2-node'), a = qs(acts, '[data-act="publish"]');
    if (a) a.textContent = node.getAttribute('data-published') === '0' ? 'Publish' : 'Unpublish';
  }

  // A section without an icon of its own shows the default one, as the student sidebar does (/images/icons/folder-section.png).
  var DEFAULT_ICON = '<svg class="a2-icon-default" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 8h2.5a2.5 2.5 0 1 1 3 0H15a1 1 0 0 1 1 1v3.5a2.5 2.5 0 1 1 0 3V19a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"/></svg>';

  function makeNode(tree, type, title, pub) {
    var proto = qs(tree, '.a2-' + type);
    var node = proto.cloneNode(true);
    node.classList.remove('collapsed', 'dragging', 'drop-above', 'drop-below');
    qsa(node, '.a2-lessons, .a2-parts').forEach(function (l) { l.innerHTML = ''; });
    qsa(node, '.a2-acts-kebab.open').forEach(function (m) { m.classList.remove('open'); });
    qs(node, ':scope > .a2-row .a2-name').textContent = title;
    if (type !== 'part') node.setAttribute('data-published', pub);
    if (type === 'section') { var ic = qs(node, ':scope > .a2-row .a2-icon'); if (ic) ic.innerHTML = DEFAULT_ICON; }
    return node;
  }

  // Views: tree / lesson page / section page --------------------------------------------------
  var pageState = null; // { tree, type: 'lesson' | 'section', node: existing node or null for a new one }

  function showView(tree, name) {
    qsa(tree, ':scope > .a2-view').forEach(function (v) { v.hidden = !v.classList.contains('a2-view-' + name); });
    closeMenus(tree);
  }

  // Variants 2-4 browse the same data as flat lists. The tree is still in the page, hidden: it holds the
  // lessons, sections and parts, and a row of a list points at its node by id.
  function isLists(tree) { return tree.classList.contains('a2-lists'); }

  // The navbar of a variant sits above its .a2tree, and the one-page build holds every variant at
  // once, so both are found by walking up from the element that was clicked, never by taking the first.
  function upFrom(el, sel) {
    for (var n = el; n && n !== document.body; n = n.parentElement) {
      var hit = n.querySelector && n.querySelector(sel);
      if (hit) return hit;
    }
    return document.querySelector(sel);
  }

  function a2Drop(tree) { return upFrom(tree, '.a2-drop'); }

  function showList(tree, key) {
    qsa(tree, ':scope > .a2-view').forEach(function (v) { v.hidden = true; });
    var view = key === 'hub' ? qs(tree, '.a2-view-hub') : qs(tree, '.a2-view-list[data-list="' + key + '"]');
    if (!view) return;
    view.hidden = false;
    tree.__list = key;
    qsa(tree, '.a2-tabs a, .a2-drop a').forEach(function (a) {
      a.classList.toggle('current', a.getAttribute('data-list') === key);
    });
    var drop = a2Drop(tree);
    if (drop) drop.hidden = true;
    closeMenus(tree);
    recount(tree);
  }

  function nodeById(tree, id) {
    return qs(tree, '.a2-data [data-lid="' + id + '"], .a2-data [data-sid="' + id + '"], .a2-data [data-pid="' + id + '"]');
  }

  function dropRows(tree, id) { qsa(tree, '[data-row="' + id + '"]').forEach(function (r) { r.remove(); }); }

  function backToTree(tree) {
    pageState = null;
    if (isLists(tree)) { showList(tree, tree.__list || tree.getAttribute('data-home')); return; }
    showView(tree, 'tree');
  }

  // What Cancel has to answer for: the fields of the lesson itself, snapshotted when the page opened.
  function lessonSnapshot(v) {
    return [qs(v, '[data-f="title"]').value, qs(v, '[data-f="body"]').innerHTML,
            qs(v, '[data-f="video"]').textContent, qs(v, '[data-f="status"]').checked].join('|');
  }
  function lessonChanged(tree) {
    var v = qs(tree, '.a2-view-lesson');
    return v.__snapshot !== undefined && v.__snapshot !== lessonSnapshot(v);
  }

  function lessonsList(node) { return qs(node, ':scope > .a2-body > .a2-lessons'); }

  function idOf(node) {
    return node.getAttribute('data-lid') || node.getAttribute('data-sid') || node.getAttribute('data-pid');
  }

  // A lesson shows up in three lists (Lessons, Videos, Lesson Questions); a rename has to reach all of them.
  function syncLessonRow(tree, node) {
    if (!isLists(tree)) return;
    var lid = idOf(node);
    if (!lid) { lid = 'l' + Date.now(); node.setAttribute('data-lid', lid); }
    var name = nameOf(node), sec = nameOf(sectionOf(node)), part = partOf(node);
    var body = qs(tree, '.a2-view-list[data-list="lessons"] tbody');
    var row = qs(body, '[data-row="' + lid + '"]');
    if (!row) {
      row = qs(body, '[data-row]').cloneNode(true);
      row.setAttribute('data-row', lid);
      qsa(row, '[data-open-lesson]').forEach(function (a) { a.setAttribute('data-open-lesson', lid); });
      qsa(row, '[data-del-node]').forEach(function (a) { a.setAttribute('data-del-node', lid); });
      body.appendChild(row);
    }
    var tds = qsa(row, 'td');
    qs(tds[0], 'a').textContent = name;
    tds[1].textContent = sec;
    tds[2].textContent = part ? nameOf(part) : '\u2014';
    qsa(tree, '[data-row="' + lid + '"]').forEach(function (r) {
      if (r === row) return; // a video and a question set are named "Section - Lesson", then the lesson itself
      var links = qsa(r, '[data-open-lesson]');
      if (links[0]) links[0].textContent = sec + ' - ' + name;
      if (links[1]) links[1].textContent = name;
    });
  }

  function syncSectionRows(tree, node) {
    if (!isLists(tree)) return;
    var row = qs(tree, '.a2-view-list[data-list="sections"] [data-row="' + idOf(node) + '"]');
    if (row) qs(row, 'td a').textContent = nameOf(node);
    qsa(node, '.a2-lesson').forEach(function (l) { syncLessonRow(tree, l); });
    qsa(node, '.a2-part').forEach(function (p) { syncPartRow(tree, p); });
  }

  function syncPartRow(tree, node) {
    if (!isLists(tree)) return;
    var row = qs(tree, '.a2-view-list[data-list="parts"] [data-row="' + idOf(node) + '"]');
    if (row) qs(row, 'td a').textContent = nameOf(node);
    qsa(node, '.a2-lesson').forEach(function (l) { syncLessonRow(tree, l); });
  }

  // Deleting a node takes the rows of everything inside it with it
  function dropRowsOf(tree, node) {
    if (!isLists(tree)) return;
    var ids = [idOf(node)];
    qsa(node, '[data-lid], [data-pid]').forEach(function (n) { ids.push(idOf(n)); });
    ids.forEach(function (id) { if (id) dropRows(tree, id); });
  }

  // The tree moves a lesson by dragging; a flat list has nowhere to drag, so the form asks instead.
  function fillWhereParts(tree, v, part) {
    var ss = qs(v, '[data-f="where-section"]'), ps = qs(v, '[data-f="where-part"]');
    var section = qs(tree, '.a2-data [data-sid="' + ss.value + '"]');
    ps.innerHTML = '<option value="">No part</option>';
    qsa(section, '.a2-part').forEach(function (p) {
      var o = document.createElement('option');
      o.value = idOf(p);
      o.textContent = nameOf(p);
      o.selected = p === part;
      ps.appendChild(o);
    });
    ps.disabled = ps.options.length < 2;
  }

  function fillWhere(tree, v, section, part) {
    var ss = qs(v, '[data-f="where-section"]');
    if (!ss) return;
    ss.innerHTML = '';
    qsa(tree, '.a2-data .a2-section').forEach(function (sn) {
      var o = document.createElement('option');
      o.value = idOf(sn);
      o.textContent = nameOf(sn);
      o.selected = sn === section;
      ss.appendChild(o);
    });
    fillWhereParts(tree, v, part);
  }

  // Lesson page ------------------------------------------------------------------------------
  // Reworked after the 08.09 call: no Section / Part (dragging in the tree moves a lesson), no Page type (a lesson
  // either has a video or it has not), body above video as on the student page, questions edited right here.
  function openLesson(tree, cfg) { // cfg.node = existing lesson, or cfg.listEl = list to add a new one to
    var v = qs(tree, '.a2-view-lesson');
    var section = sectionOf(cfg.node || cfg.listEl);
    var part = cfg.node ? partOf(cfg.node) : cfg.listEl.closest('.a2-part');
    var name = cfg.node ? nameOf(cfg.node) : '';
    var full = nameOf(section) + ' - ' + name; // video and question-set names follow the A2 admin ("Grammar - VERBS - Video 7: ...")
    qs(v, '[data-crumb-section]').textContent = nameOf(section);
    var cp = qs(v, '[data-crumb-part]');
    cp.hidden = !part;
    qs(cp, 'span').textContent = part ? nameOf(part) : '';
    qs(v, '[data-crumb-cur]').textContent = name || 'New lesson';
    qs(v, '[data-page-title]').textContent = name || 'New lesson';
    qs(v, '[data-f="title"]').value = name;
    qs(v, '[data-f="video"]').textContent = cfg.node ? full : 'No video yet';
    qs(v, '[data-f="subs"]').innerHTML = cfg.node
      ? 'Subtitles: ' + esc(slug(full)) + '.srt &nbsp;·&nbsp; <a href="#">Replace</a> &nbsp;·&nbsp; <a href="#">Remove</a>'
      : 'Subtitles: none &nbsp;·&nbsp; <a href="#">Upload (.srt)</a>';
    qs(v, '[data-f="video-replace"]').textContent = cfg.node ? 'Replace video (.mp4)' : 'Upload video (.mp4)';
    qs(v, '[data-f="video-details"]').hidden = !cfg.node;
    qs(v, '[data-f="vd-id"]').textContent = cfg.node ? '1a4f' + slug(full).replace(/[^a-z0-9]/g, '').slice(0, 24) : '';
    qs(v, '[data-f="vd-subs"]').textContent = cfg.node ? slug(full) + '.srt' : 'none';
    qs(v, '.a2-vdet').hidden = true;
    qs(v, '[data-f="body"]').innerHTML = cfg.node
      ? '<p>In this lesson we go through the key terms of the topic step by step and finish with a short set of practice questions.</p>' : '';
    qs(v, '[data-f="quiz-name"]').textContent = cfg.node ? full : 'No questions yet';
    v.classList.toggle('a2-lesson-new', !cfg.node);
    resetQuestions(v);
    qs(v, '[data-f="status"]').checked = cfg.node ? isPub(cfg.node) : true;
    qs(v, '[data-page-delete]').hidden = !cfg.node;
    if (isLists(tree)) fillWhere(tree, v, section, part);
    v.__snapshot = lessonSnapshot(v);
    pageState = { tree: tree, type: 'lesson', node: cfg.node || null, listEl: cfg.listEl || null };
    showView(tree, 'lesson');
    qs(v, '[data-f="title"]').focus();
  }

  // Questions block: the head folds the whole block, a question row folds its details, a group folds its questions.
  // Both modes start folded (10.09): a lesson opens as a short page, questions are opened when they are the point.
  // The instruction text is typed straight into the page, so it says when it was changed and kept.
  function instrBox(v) { return qs(v, '.a2-qinstr-text'); }

  function keepInstr(v) {
    v.__instr = instrBox(v).innerHTML;
    qs(v, '.a2-qinstr-foot').hidden = true;
  }

  function settleInstr(v, keep) {
    if (!keep) instrBox(v).innerHTML = v.__instr;
    else v.__instr = instrBox(v).innerHTML;
    qs(v, '.a2-qinstr-foot').hidden = true;
  }

  function resetQuestions(v) {
    var block = qs(v, '.a2-qblock');
    qsa(block, '.a2-q').forEach(function (q) {
      var ed = qs(q, '.a2-q-editor');
      if (ed) { ed.setAttribute('data-qtype', q.getAttribute('data-qtype')); renumberAnswers(ed); }
      renderPreview(q);
      syncRationale(q);
    });
    block.classList.add('folded');
    qsa(block, '.a2-q-detail').forEach(function (d) { d.hidden = true; });
    qsa(block, '.a2-q').forEach(function (q) { q.classList.remove('open'); });
    qsa(block, '.a2-qgroup').forEach(function (g) { g.classList.add('collapsed'); });
    keepInstr(v);
  }

  function saveLesson(tree) {
    var v = qs(tree, '.a2-view-lesson'), st = pageState;
    var input = qs(v, '[data-f="title"]'), title = input.value.trim();
    if (!title) { input.focus(); return; }
    var pub = qs(v, '[data-f="status"]').checked ? '1' : '0';
    var node = st.node;
    if (!node) {
      var section = sectionOf(st.listEl), part = st.listEl.closest('.a2-part');
      node = makeNode(tree, 'lesson', title, pub);
      st.listEl.appendChild(node);
      if (tree.classList.contains('reorder')) node.setAttribute('draggable', 'true');
      section.classList.remove('collapsed');
      if (part) part.classList.remove('collapsed');
    } else {
      qs(node, ':scope > .a2-row .a2-name').textContent = title;
      node.setAttribute('data-published', pub);
    }
    if (isLists(tree)) { // the selects of the form decide where the lesson ends up
      var sid = qs(v, '[data-f="where-section"]').value, pid = qs(v, '[data-f="where-part"]').value;
      var target = pid ? qs(tree, '.a2-data [data-pid="' + pid + '"]') : qs(tree, '.a2-data [data-sid="' + sid + '"]');
      var dst = target ? lessonsList(target) : null;
      if (dst && node.parentElement !== dst) dst.appendChild(node);
      syncLessonRow(tree, node);
    }
    recount(tree);
    backToTree(tree);
  }

  // Section page -----------------------------------------------------------------------------
  function openSection(tree, cfg) { // cfg.node = existing section, or nothing for a new one
    var v = qs(tree, '.a2-view-section'), name = cfg.node ? nameOf(cfg.node) : '';
    qs(v, '[data-crumb-cur]').textContent = name || 'New section';
    qs(v, '[data-page-title]').textContent = name || 'New section';
    qs(v, '[data-f="title"]').value = name;
    var ic = cfg.node ? qs(cfg.node, ':scope > .a2-row .a2-icon') : null, own = !!(ic && ic.innerHTML.trim() && !qs(ic, '.a2-icon-default'));
    qs(v, '[data-f="icon"]').innerHTML = own ? ic.innerHTML : DEFAULT_ICON;
    qs(v, '[data-f="icon-remove"]').hidden = !own;
    qs(v, '[data-f="status"]').checked = cfg.node ? isPub(cfg.node) : true;
    qs(v, '[data-page-delete]').hidden = !cfg.node;
    pageState = { tree: tree, type: 'section', node: cfg.node || null };
    showView(tree, 'section');
    qs(v, '[data-f="title"]').focus();
  }

  function saveSection(tree) {
    var v = qs(tree, '.a2-view-section'), st = pageState;
    var input = qs(v, '[data-f="title"]'), title = input.value.trim();
    if (!title) { input.focus(); return; }
    var pub = qs(v, '[data-f="status"]').checked ? '1' : '0', node = st.node;
    if (!node) {
      node = makeNode(tree, 'section', title, pub);
      qs(tree, '.a2-sections').appendChild(node);
      if (tree.classList.contains('reorder')) node.setAttribute('draggable', 'true');
    } else {
      qs(node, ':scope > .a2-row .a2-name').textContent = title;
      node.setAttribute('data-published', pub);
      var ic = qs(node, ':scope > .a2-row .a2-icon'); if (ic) ic.innerHTML = qs(v, '[data-f="icon"]').innerHTML;
    }
    syncSectionRows(tree, node);
    recount(tree);
    backToTree(tree);
  }

  // Questions live inside groups: a lesson has one group by default and can have more (Tima, 10.09).
  // The order of questions is kept only when it is confirmed, as in the tree (Tima 11.09:
  // "почему нету кнопки сейв или отмена, они должны появиться когда я случайно переместил").
  function orderBar(v) { return qs(v, '.a2-qorder'); }

  function snapshotOrder(v) {
    if (v.__qorder) return;
    v.__qorder = qsa(v, '.a2-qgroup-body').map(function (b) {
      return { body: b, kids: qsa(b, ':scope > .a2-q') };
    });
    orderBar(v).hidden = false;
  }

  function settleOrder(v, keep) {
    if (!v.__qorder) return;
    if (!keep) {
      v.__qorder.forEach(function (e) {
        e.kids.forEach(function (k) { e.body.insertBefore(k, qs(e.body, '.a2-qgroup-foot')); });
      });
    }
    v.__qorder = null;
    orderBar(v).hidden = true;
    renumberQuestions(v);
  }

  // Clicking the name of a group has to open it; the pencil beside it is what renames (11.09).
  function startRename(group) {
    var label = qs(group, '.a2-qgroup-name'), field = qs(group, '.a2-qgroup-rename');
    field.value = label.textContent;
    label.hidden = true;
    qs(group, '.a2-qpen').hidden = true;
    field.hidden = false;
    qs(group, '.a2-rename-acts').hidden = false;
    field.focus();
    field.select();
  }

  function stopRename(field, keep) {
    var group = field.closest('.a2-qgroup'), label = qs(group, '.a2-qgroup-name');
    var name = field.value.trim();
    if (keep && name) label.textContent = name;
    field.hidden = true;
    qs(group, '.a2-rename-acts').hidden = true;
    label.hidden = false;
    qs(group, '.a2-qpen').hidden = false;
  }

  function renumberQuestions(v) {
    qsa(v, '.a2-qgroup-body').forEach(function (list) {
      qsa(list, ':scope > .a2-q').forEach(function (q, i) { qs(q, '.a2-q-idx').textContent = (i + 1) + '.'; });
    });
    qsa(v, '.a2-qgroup').forEach(function (g, i) {
      qs(g, '.a2-qgroup-count').textContent = qsa(g, '.a2-q').length + ' questions';
      var dep = qs(g, '.a2-qdep'); // the first group has nothing to depend on
      if (dep) dep.hidden = i === 0;
    });
    qs(v, '.a2-qcount').textContent = qsa(v, '.a2-q').length + ' questions';
  }

  // Answers behave as they do in the A2 admin: the text cell is edited in place, Remove drops the row,
  // Add answer appends one and starts editing it. Choice questions also get the "Correct" column.
  var CHOICE = ['Single Choice', 'Multiple Choice', 'Underline Incorrect', 'Drag And Drop'];
  var MULTI = ['Multiple Choice', 'Underline Incorrect'];

  function isChoice(q) { return CHOICE.indexOf(q.getAttribute('data-qtype')) >= 0; }

  // Letters for choice types, "Blank N" for gaps, plain numbers elsewhere - as the admin shows them.
  function answerIndex(qtype, i) {
    if (CHOICE.indexOf(qtype) >= 0) return String.fromCharCode(65 + i);
    if (qtype === 'Fill In Blank') return 'Blank ' + (i + 1);
    return String(i + 1);
  }

  // The rationale is written in the question form, so the details only show it
  function syncRationale(q) {
    var box = qs(q, '.a2-q-rat'), none = qs(q, '.a2-q-rat-none'), text = box.textContent.trim();
    box.hidden = !text;
    if (none) none.hidden = !!text;
  }

  // Live values live on the DOM properties, not the attributes, so a clone would lose them.
  function freezeFields(root) {
    qsa(root, 'input, select').forEach(function (f) {
      if (f.tagName === 'SELECT') {
        qsa(f, 'option').forEach(function (o) {
          if (o.selected) o.setAttribute('selected', 'selected'); else o.removeAttribute('selected');
        });
      } else if (f.type === 'checkbox' || f.type === 'radio') {
        if (f.checked) f.setAttribute('checked', 'checked'); else f.removeAttribute('checked');
      } else {
        f.setAttribute('value', f.value);
      }
    });
  }

  // The preview is built from the editor of the question, so what is shown and what is edited
  // can never say different things.
  var PV_DROP = '.a2-ans-drag, .a2-q-ans-acts, .a2-ans-correct, .a2-ans-hint, .a2-q-addans, ' +
                '.a2-ansgroup-del, .a2-ansgroup-add, .a2-imgq-acts, .a2-imgq-size, .a2-ans-mode, .a2-studypics';

  function renderPreview(q) {
    var ed = qs(q, '.a2-q-editor'), pv = qs(q, '.a2-q-preview');
    if (!ed || !pv) return;
    freezeFields(ed);
    var out = ed.cloneNode(true);
    out.hidden = false;
    out.className = 'a2-preview-body' + (ed.classList.contains('choice') ? ' choice' : '');
    qsa(out, PV_DROP).forEach(function (n) { n.remove(); });
    qsa(out, 'input[type="text"], select').forEach(function (f) {
      var span = document.createElement('span');
      span.className = f.classList.contains('a2-ansgroup-name') ? 'a2-pv-group' : 'a2-pv-text';
      span.textContent = f.tagName === 'SELECT'
        ? (f.options[f.selectedIndex] ? f.options[f.selectedIndex].text : '')
        : f.value;
      f.replaceWith(span);
    });
    pv.replaceChildren(out);
  }

  // Every type of question has a blank editor kept in the page, so changing the type in the form
  // swaps in the right one instead of pretending every type is a list of answers.
  function protoEditor(tree, qtype) {
    var proto = qs(tree, '.a2-qed-library [data-qtype="' + qtype + '"]');
    if (!proto) return null;
    var node = proto.cloneNode(true);
    node.className = 'a2-q-editor';
    node.hidden = false;
    return node;
  }

  function renumberAnswers(q) {
    var qtype = q.getAttribute('data-qtype'), choice = isChoice(q);
    q.classList.toggle('choice', choice);
    q.classList.toggle('a2-q-choice', choice);
    // every table numbers its own rows: blocks and answer groups each start from one
    qsa(q, '.a2-q-ans tbody').forEach(function (body, ti) {
      qsa(body, '.a2-ans').forEach(function (tr, i) {
        qs(tr, '.a2-ans-idx').textContent = answerIndex(qtype, i);
        var inp = qs(tr, '.a2-ans-correct input'); // a study card has no correct answer to tick
        if (inp) {
          inp.type = MULTI.indexOf(qtype) >= 0 ? 'checkbox' : 'radio';
          inp.name = 'correct-' + q.getAttribute('data-qkey') + '-' + ti;
          inp.title = 'Mark this answer as correct';
          tr.classList.toggle('correct', inp.checked); // the ticked answer says so in words, not just by a dot
        }
      });
    });
    qsa(q, '.a2-imgq-pt').forEach(function (p, i) { qs(p, '.a2-imgq-num').textContent = i + 1; });
    var empty = qs(q, '.a2-ans-empty');
    if (empty) empty.hidden = qsa(q, '.a2-ans').length > 0;
  }

  // A point of an Image Question and its answer are one thing: the row number is the number on the picture.
  function pointOf(tr) {
    var q = tr.closest('.a2-q-editor'), i = q ? qsa(q, '.a2-ans').indexOf(tr) : -1;
    return qsa(q, '.a2-imgq-pt')[i] || null;
  }

  function addPoint(q, x, y) {
    var stage = qs(q, '.a2-imgq-stage'), pt = qs(q, '.a2-imgq-pt');
    if (!stage) return null;
    var node;
    if (pt) { node = pt.cloneNode(true); } else {
      node = document.createElement('span');
      node.className = 'a2-imgq-pt';
      node.setAttribute('data-pt', '');
      node.innerHTML = '<i class="a2-imgq-num"></i><i class="a2-imgq-size" data-pt-size></i>';
    }
    node.style.width = '20%';
    node.style.height = '18%';
    node.style.left = Math.max(0, Math.min(80, x * 100 - 10)) + '%';
    node.style.top = Math.max(0, Math.min(82, y * 100 - 9)) + '%';
    stage.appendChild(node);
    return node;
  }

  function makeAnswerRow(q, tbody) {
    // the last resort must come from an editor: a row of a preview carries text, not fields
    var proto = qs(tbody, '.a2-ans') || qs(q, '.a2-ans') || qs(q.closest('.a2tree'), '.a2-q-editor .a2-ans');
    var row = proto.cloneNode(true);
    qsa(row, 'input[type="text"]').forEach(function (i) { i.value = ''; });
    var c = qs(row, '.a2-ans-correct input');
    if (c) c.checked = false;
    row.classList.remove('correct', 'dragging');
    row.draggable = false;
    return row;
  }

  function focusRow(row) { var f = qs(row, '.a2-ans-inp'); if (f) f.focus(); }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // A point is moved and resized over the picture with the mouse, as jquery-ui does it in the A2 admin
  var ptDrag = null, skipStageClick = false;

  function onPointDown(e) {
    var pt = e.target.closest('.a2-imgq-pt');
    // a preview only shows where the points are; they are moved in the form (11.09)
    if (!pt || !pt.closest('.a2-q-editor')) return;
    e.preventDefault();
    var stage = pt.parentElement, r = stage.getBoundingClientRect();
    ptDrag = { pt: pt, r: r, size: !!e.target.closest('[data-pt-size]'), x: e.clientX, y: e.clientY, moved: false,
      left: pt.offsetLeft / r.width * 100, top: pt.offsetTop / r.height * 100,
      w: pt.offsetWidth / r.width * 100, h: pt.offsetHeight / r.height * 100 };
    pt.classList.add('dragging');
  }

  function onPointMove(e) {
    if (!ptDrag) return;
    var dx = (e.clientX - ptDrag.x) / ptDrag.r.width * 100, dy = (e.clientY - ptDrag.y) / ptDrag.r.height * 100;
    if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) ptDrag.moved = true;
    if (ptDrag.size) {
      ptDrag.pt.style.width = clamp(ptDrag.w + dx, 7, 100 - ptDrag.left) + '%';
      ptDrag.pt.style.height = clamp(ptDrag.h + dy, 7, 100 - ptDrag.top) + '%';
    } else {
      ptDrag.pt.style.left = clamp(ptDrag.left + dx, 0, 100 - ptDrag.w) + '%';
      ptDrag.pt.style.top = clamp(ptDrag.top + dy, 0, 100 - ptDrag.h) + '%';
    }
  }

  function onPointUp() {
    if (!ptDrag) return;
    ptDrag.pt.classList.remove('dragging');
    skipStageClick = ptDrag.moved; // a point dropped on the picture must not create another one
    ptDrag = null;
  }

  function makeQuestion(v, key, text, type, rat, editor) {
    var node = qs(v, '.a2-q').cloneNode(true);
    node.setAttribute('data-qkey', key);
    node.classList.remove('open');
    qs(node, '.a2-q-text').textContent = text;
    qs(node, '.a2-q-type').textContent = type;
    qs(node, '.a2-q-rat').textContent = rat || '';
    node.setAttribute('data-qtype', type);
    var ed = editor || protoEditor(v.closest('.a2tree'), type);
    if (ed) qs(node, '.a2-q-editor').replaceWith(ed);
    qs(node, '.a2-q-editor').hidden = true;
    qs(node, '.a2-q-editor').setAttribute('data-qtype', type);
    qs(node, '.a2-q-detail').hidden = true;
    renumberAnswers(qs(node, '.a2-q-editor'));
    renderPreview(node);
    syncRationale(node);
    return node;
  }

  // Which fields a question type needs: the drawing pad belongs to a text question, the block placeholder to the
  // types that put answers inside the text, the picture to the types built around one.
  var DRAW_TYPES = ['Text'];
  var BLOCK_TYPES = ['Underline Incorrect', 'Drag And Drop'];

  function syncQuestionForm(m) {
    var type = qs(m, '.a2-field-qtype select').value;
    var notes = qs(m, '.a2-qtype-notes');
    var note = qsa(notes, 'option').filter(function (o) { return o.value === type; })[0];
    qs(m, '[data-f="qtype-note"]').textContent = note ? note.textContent : '';
    qs(m, '.a2-field-qdraw').hidden = DRAW_TYPES.indexOf(type) < 0;
    qs(m, '.a2-field-qblockhint').hidden = BLOCK_TYPES.indexOf(type) < 0;
    qs(m, '.a2-field-qratimg').hidden = false;
  }

  // A question is moved to another group by dragging it there, so the form has no "Group" select (Tima 11.09).
  function openQuestionForm(tree, q) {
    var ed = qs(q, '.a2-q-editor');
    freezeFields(ed);
    var copy = ed.cloneNode(true);
    copy.hidden = false;
    openModal(tree, { kind: 'question', title: 'Edit question', okText: 'Save', qnode: q,
      qtext: qs(q, '.a2-q-text').textContent, qtype: qs(q, '.a2-q-type').textContent,
      qrat: qs(q, '.a2-q-rat').textContent, editor: copy });
  }

  // Tima 11.09: the block of answers gets its own Save, shown once something in it changed.
  function markAnswersChanged(m) {
    var foot = qs(m, '.a2-qans-foot');
    if (foot && !qs(m, '.a2-field-qans').hidden) foot.hidden = false;
  }

  function keepAnswersSnapshot(m) {
    var ed = qs(m, '.a2-qans-slot > .a2-q-editor');
    if (!ed) { m.__ans = null; return; }
    freezeFields(ed);
    m.__ans = ed.cloneNode(true);
  }

  function revertAnswersBlock(m) {
    if (!m.__ans) return;
    var back = m.__ans.cloneNode(true);
    back.hidden = false;
    qs(m, '.a2-qans-slot').replaceChildren(back);
    renumberAnswers(back);
    qs(m, '.a2-qans-foot').hidden = true;
  }

  function saveAnswersBlock(tree, m) {
    var st = modalState, edited = qs(m, '.a2-qans-slot > .a2-q-editor');
    if (st && st.qnode && edited) { // the question keeps them at once, the form stays open
      freezeFields(edited);
      var keep = edited.cloneNode(true);
      keep.hidden = true;
      qs(st.qnode, '.a2-q-editor').replaceWith(keep);
      renumberAnswers(qs(st.qnode, '.a2-q-editor'));
      renderPreview(st.qnode);
    }
    keepAnswersSnapshot(m); // Cancel now goes back to what was just saved
    var btn = qs(m, '[data-ans-save]'), was = btn.textContent;
    btn.textContent = 'Saved';
    setTimeout(function () { btn.textContent = was; qs(m, '.a2-qans-foot').hidden = true; }, 900);
  }

  // The answers of the form: a copy of the editor, or a blank one of the chosen type
  function fillFormAnswers(tree, m, editor, qtype) {
    var slot = qs(m, '.a2-qans-slot'), ed = editor || protoEditor(tree, qtype);
    slot.replaceChildren();
    if (!ed) { qs(m, '.a2-field-qans').hidden = true; return; }
    ed.className = 'a2-q-editor';
    ed.hidden = false;
    ed.setAttribute('data-qtype', qtype);
    slot.appendChild(ed);
    renumberAnswers(ed);
    qs(m, '.a2-field-qans').hidden = false;
    qs(m, '.a2-qans-foot').hidden = true;
    keepAnswersSnapshot(m);
  }

  // Modal: part form, question form and delete confirmations ---------------------------------
  var modalState = null;

  function openModal(tree, cfg) {
    var m = qs(tree, '.a2-modal');
    qs(m, '.a2-modal-title').textContent = cfg.title;
    var fTitle = qs(m, '.a2-field-title');
    fTitle.hidden = cfg.kind === 'delete';
    qs(fTitle, 'input').value = cfg.kind === 'edit' ? cfg.name : '';
    fTitle.hidden = (fTitle.hidden || cfg.kind === 'question') && cfg.kind !== 'qgroup';
    if (cfg.kind === 'qgroup') qs(fTitle, 'input').value = cfg.name || '';
    // Question form: type, text and rationale, as in the question form of the A2 admin
    var isQ = cfg.kind === 'question';
    qs(m, '.a2-field-qtype').hidden = !isQ;
    qs(m, '.a2-field-qtext').hidden = !isQ;
    qs(m, '.a2-field-qrat').hidden = !isQ;
    if (isQ) {
      qs(m, '.a2-field-qtype select').value = cfg.qtype || 'Fill In Blank';
      qs(m, '.a2-field-qtext .a2-editor-body').textContent = cfg.qtext || '';
      qs(m, '.a2-field-qrat .a2-editor-body').textContent = cfg.qrat || '';
      fillFormAnswers(tree, m, cfg.editor, cfg.qtype || 'Fill In Blank');
      syncQuestionForm(m);
    }
    qs(m, '.a2-modal-box').classList.toggle('a2-modal-wide', isQ);
    m.classList.toggle('wide', isQ); // a tall form starts at the top, a short confirmation is centred
    qs(m, '.a2-modal-grow').hidden = !isQ; // only a form has enough in it to need the whole screen
    setModalFull(m, false);
    if (!isQ) qs(m, '.a2-field-qans').hidden = true;
    qsa(m, '.a2-field-qblockhint, .a2-field-qdraw, .a2-field-qratimg')
      .forEach(function (f) { if (!isQ) f.hidden = true; });
    var text = qs(m, '.a2-modal-text');
    text.hidden = !cfg.text; text.textContent = cfg.text || '';
    var note = qs(m, '.a2-modal-note');
    note.hidden = !cfg.note; note.textContent = cfg.note || '';
    var chk = qs(m, '.a2-modal-check');
    chk.hidden = !cfg.check; qs(chk, 'span').textContent = cfg.check || ''; qs(chk, 'input').checked = false;
    var ok = qs(m, '[data-modal="ok"]');
    ok.textContent = cfg.okText || (cfg.kind === 'delete' ? 'Delete' : (cfg.kind === 'add' ? 'Add' : 'Save'));
    ok.classList.toggle('a2-btn-danger', cfg.kind === 'delete');
    ok.classList.toggle('a2-btn-primary', cfg.kind !== 'delete');
    // The part form carries its own Delete, like "Delete Part" on the part page of the A2 admin.
    qs(m, '[data-modal="delete"]').hidden = !(cfg.kind === 'edit' && cfg.type === 'part');
    cfg.tree = tree;
    modalState = cfg;
    m.hidden = false;
    // focus must not scroll the form: the title was being pulled above the top of the window
    m.scrollTop = 0;
    if (cfg.kind === 'edit' || cfg.kind === 'add' || cfg.kind === 'qgroup') {
      var inp = qs(fTitle, 'input');
      inp.focus({ preventScroll: true });
      inp.select();
    }
    if (cfg.kind === 'question') qs(m, '.a2-field-qtext .a2-editor-body').focus({ preventScroll: true });
  }

  // Tima and Max on the call of 11.09: a form of a question is cramped, especially a picture one.
  // It opens wide and can take the whole window.
  function setModalFull(m, on) {
    m.classList.toggle('full', on);
    qs(m, '.a2-modal-box').classList.toggle('a2-modal-full', on);
    var btn = qs(m, '.a2-modal-grow');
    if (btn) btn.title = on ? 'Back to the normal size' : 'Full screen';
  }

  function closeModal() {
    if (!modalState) return;
    qs(modalState.tree, '.a2-modal').hidden = true;
    modalState = null;
  }

  // What deleting does, taken from the models: a section unpublishes its posts (before_destroy) and leaves them
  // without a section; a part nullifies part_id of its posts (they stay in the section); a post takes its comments
  // and progress with it, the video only when asked ("Delete with video" in the A2 admin).
  function openConfirm(tree, node) {
    var type = typeOf(node), name = nameOf(node), n = qsa(node, '.a2-lesson').length;
    var cfg = { kind: 'delete', type: type, node: node, title: 'Delete ' + type, text: 'Delete “' + name + '”?' };
    if (type === 'lesson') {
      cfg.note = 'Its comments and student progress will be removed.';
      cfg.check = 'Also delete its video “' + nameOf(sectionOf(node)) + ' - ' + name + '”';
    } else if (type === 'section') {
      cfg.note = n ? 'Its ' + n + ' lessons will be unpublished and stay without a section.' : '';
    } else {
      cfg.note = n ? 'Its ' + n + ' lessons will move up to ' + nameOf(sectionOf(node)) + '.' : '';
    }
    openModal(tree, cfg);
  }

  function confirmModal() {
    var st = modalState;
    if (!st) return;
    var tree = st.tree, m = qs(tree, '.a2-modal');
    var title = qs(m, '.a2-field-title input').value.trim();
    if (st.kind === 'discard') { closeModal(); backToTree(tree); return; }
    if (st.kind === 'question') {
      var lvw = qs(tree, '.a2-view-lesson');
      var qtext = qs(m, '.a2-field-qtext .a2-editor-body').textContent.trim();
      var qtype = qs(m, '.a2-field-qtype select').value;
      var qrat = qs(m, '.a2-field-qrat .a2-editor-body').textContent.trim();
      if (!qtext) { qs(m, '.a2-field-qtext .a2-editor-body').focus(); return; }
      var edited = qs(m, '.a2-qans-slot > .a2-q-editor');
      if (edited) { freezeFields(edited); edited = edited.cloneNode(true); edited.hidden = true; }
      if (st.qnode) {
        var n = st.qnode;
        qs(n, '.a2-q-text').textContent = qtext;
        qs(n, '.a2-q-type').textContent = qtype;
        qs(n, '.a2-q-rat').textContent = qrat;
        syncRationale(n);
        n.setAttribute('data-qtype', qtype); // the answer table follows the type: letters vs blanks, correct column
        if (edited) qs(n, '.a2-q-editor').replaceWith(edited);
        qs(n, '.a2-q-editor').setAttribute('data-qtype', qtype);
        renumberAnswers(qs(n, '.a2-q-editor'));
        renderPreview(n);
      } else {
        var body = st.groupBody || qsa(lvw, '.a2-qgroup-body').slice(-1)[0];
        var node = makeQuestion(lvw, 'q' + Date.now(), qtext, qtype, qrat, edited);
        body.insertBefore(node, qs(body, '.a2-qgroup-foot'));
      }
      renumberQuestions(lvw);
      closeModal();
      return;
    }
    if (st.kind === 'delete' && st.type === 'question') {
      var lvq = qs(tree, '.a2-view-lesson');
      st.qnode.remove();
      renumberQuestions(lvq);
      closeModal();
      return;
    }
    if (st.kind === 'delete' && st.type === 'qgroup') {
      var lvg = qs(tree, '.a2-view-lesson');
      st.gnode.remove();
      renumberQuestions(lvg);
      closeModal();
      return;
    }
    if (st.kind === 'qgroup') { // add or rename a group of questions
      var lvgn = qs(tree, '.a2-view-lesson');
      var gname = qs(m, '.a2-field-title input').value.trim();
      if (!gname) { qs(m, '.a2-field-title input').focus(); return; }
      if (st.gnode) {
        qs(st.gnode, '.a2-qgroup-name').textContent = gname;
      } else {
        var proto = qs(lvgn, '.a2-qgroup').cloneNode(true);
        proto.classList.add('collapsed');
        qs(proto, '.a2-qgroup-name').textContent = gname;
        qsa(proto, '.a2-q').forEach(function (q) { q.remove(); });
        qs(lvgn, '.a2-qgrouped').appendChild(proto);
      }
      renumberQuestions(lvgn);
      closeModal();
      return;
    }
    if (st.kind === 'delete') {
      var moved = [];
      if (st.type === 'part') { // the lessons of a part move up to its section, they are not deleted
        var dst = lessonsList(sectionOf(st.node));
        moved = qsa(st.node, '.a2-lesson');
        moved.forEach(function (l) { dst.appendChild(l); });
      }
      dropRowsOf(tree, st.node);
      st.node.remove();
      moved.forEach(function (l) { syncLessonRow(tree, l); });
      if (pageState && pageState.node === st.node) backToTree(tree);
    } else if (st.kind === 'edit') {
      if (!title) return;
      qs(st.node, ':scope > .a2-row .a2-name').textContent = title;
      if (typeOf(st.node) === 'part') syncPartRow(tree, st.node);
    } else {
      if (!title) return;
      var node = makeNode(tree, st.type, title, '1');
      st.listEl.appendChild(node);
      var parent = st.listEl.closest('.a2-node');
      if (parent) parent.classList.remove('collapsed');
      if (tree.classList.contains('reorder')) node.setAttribute('draggable', 'true');
    }
    recount(tree);
    closeModal();
  }

  // Everything inside the answers editor, which now lives in the form: add and remove a row,
  // answer groups, points of a picture, the two modes of a study card.
  function answerClick(tree, e) {
    var a;
    if ((a = e.target.closest('[data-ans-remove]'))) {
      e.preventDefault();
      var qr = a.closest('.a2-q-editor'), trr = a.closest('.a2-ans'), ptr = pointOf(trr);
      if (ptr) ptr.remove(); // an answer of an Image Question takes its point off the picture
      trr.remove();
      renumberAnswers(qr);
      return true;
    }
    if ((a = e.target.closest('[data-ans-add]'))) {
      e.preventDefault();
      var qa = a.closest('.a2-q-editor');
      var boxa = a.closest('.a2-ansblock, .a2-ansgroup') || qa; // a block and an answer group own their table
      var tba = qs(boxa, '.a2-q-ans tbody');
      var rowa = makeAnswerRow(qa, tba);
      tba.appendChild(rowa);
      renumberAnswers(qa);
      focusRow(rowa);
      return true;
    }
    // Answer groups of the matching types: a named column of answers is added and dropped here
    if ((a = e.target.closest('.a2-ansgroup-del'))) {
      e.preventDefault();
      var qg = a.closest('.a2-q-editor');
      a.closest('.a2-ansgroup').remove();
      renumberAnswers(qg);
      return true;
    }
    if ((a = e.target.closest('.a2-ansgroup-add'))) {
      e.preventDefault();
      var qag = a.closest('.a2-q-editor'), proto = qs(qag, '.a2-ansgroup').cloneNode(true);
      qs(proto, '.a2-ansgroup-name').value = '';
      qsa(proto, '.a2-ans').slice(1).forEach(function (r) { r.remove(); });
      qsa(proto, 'input[type="text"]').forEach(function (i) { i.value = ''; });
      a.parentElement.insertBefore(proto, a);
      renumberAnswers(qag);
      qs(proto, '.a2-ansgroup-name').focus();
      return true;
    }
    // Image Question: a click on the picture puts a new point and the answer that belongs to it
    if ((a = e.target.closest('.a2-imgq-pt'))) { // picking a point shows the box that moves and resizes it
      e.preventDefault();
      var was = a.classList.contains('picked');
      qsa(a.parentElement, '.a2-imgq-pt').forEach(function (p) { p.classList.remove('picked'); });
      a.classList.toggle('picked', !was);
      return true;
    }
    if ((a = e.target.closest('[data-imgq]'))) {
      e.preventDefault();
      if (skipStageClick) { skipStageClick = false; return true; }
      qsa(a, '.a2-imgq-pt').forEach(function (p) { p.classList.remove('picked'); });
      var qi = a.closest('.a2-q-editor'), ri = a.getBoundingClientRect();
      addPoint(qi, (e.clientX - ri.left) / ri.width, (e.clientY - ri.top) / ri.height);
      var tbi = qs(qi, '.a2-q-ans tbody'), rowi = makeAnswerRow(qi, tbi);
      tbi.appendChild(rowi);
      renumberAnswers(qi);
      focusRow(rowi);
      return true;
    }
    if (e.target.closest('.a2-ans-correct')) { // ticking the correct answer stays inside the row
      var qm = e.target.closest('.a2-q-editor');
      setTimeout(function () { renumberAnswers(qm); }, 0);
      return true;
    }
    return false;
  }

  // Clicks ------------------------------------------------------------------------------------
  function onClick(e) {
    var tree = e.currentTarget, a, node, v;
    if (e.target.classList.contains('a2-modal')) { closeModal(); return; }
    if (e.target.closest('[data-modal-full]')) {
      e.preventDefault();
      var mfull = qs(tree, '.a2-modal');
      setModalFull(mfull, !mfull.classList.contains('full'));
      return;
    }
    if ((a = e.target.closest('[data-modal]'))) {
      e.preventDefault();
      var what = a.getAttribute('data-modal');
      if (what === 'ok') confirmModal();
      else if (what === 'delete' && modalState) { var n = modalState.node; closeModal(); openConfirm(tree, n); }
      else closeModal();
      return;
    }
    if (e.target.closest('.a2-modal')) {
      if (e.target.closest('[data-ans-save]')) { e.preventDefault(); saveAnswersBlock(tree, qs(tree, '.a2-modal')); return; }
      if (e.target.closest('[data-ans-revert]')) { e.preventDefault(); revertAnswersBlock(qs(tree, '.a2-modal')); return; }
      if (answerClick(tree, e)) markAnswersChanged(qs(tree, '.a2-modal'));
      return;
    }
    // Variants 2-4: rows of the lists point at a node of the hidden tree (the navbar is handled below)
    if ((a = e.target.closest('[data-open-lesson]'))) {
      e.preventDefault();
      var ln = nodeById(tree, a.getAttribute('data-open-lesson'));
      if (ln) openLesson(tree, { node: ln });
      return;
    }
    if ((a = e.target.closest('[data-open-section]'))) {
      e.preventDefault();
      var sn = nodeById(tree, a.getAttribute('data-open-section'));
      if (sn) openSection(tree, { node: sn });
      return;
    }
    if ((a = e.target.closest('[data-edit-part]'))) {
      e.preventDefault();
      var pn = nodeById(tree, a.getAttribute('data-edit-part'));
      if (pn) openModal(tree, { kind: 'edit', type: 'part', node: pn, name: nameOf(pn), title: 'Edit part' });
      return;
    }
    if ((a = e.target.closest('[data-del-node]'))) {
      e.preventDefault();
      var dn = nodeById(tree, a.getAttribute('data-del-node'));
      if (dn) openConfirm(tree, dn);
      return;
    }
    if ((a = e.target.closest('[data-list-new]'))) {
      e.preventDefault();
      var kind = a.getAttribute('data-list-new'), first = qs(tree, '.a2-data .a2-section');
      if (kind === 'lesson') openLesson(tree, { listEl: lessonsList(first) });
      else if (kind === 'section') openSection(tree, {});
      else openModal(tree, { kind: 'add', type: 'part', title: 'New part',
        listEl: qs(first, ':scope > .a2-body > .a2-parts') });
      return;
    }
    if ((a = e.target.closest('a[data-list]'))) { // an anchor, not the list view that carries the same attribute
      e.preventDefault();
      showList(tree, a.getAttribute('data-list'));
      return;
    }
    // Pages
    if (e.target.closest('[data-back]')) {
      e.preventDefault();
      // Cancel drops the fields of the lesson only; everything in the questions block keeps its own Save
      if (pageState && pageState.type === 'lesson' && lessonChanged(tree)) {
        openModal(tree, { kind: 'discard', title: 'Discard changes?', okText: 'Discard',
          text: 'The title, body, video or status of this lesson were changed.',
          note: 'Questions and answers are not affected: each of them is kept by its own Save.' });
        return;
      }
      backToTree(tree);
      return;
    }
    if (e.target.closest('[data-page-save]')) { e.preventDefault(); if (pageState) (pageState.type === 'lesson' ? saveLesson : saveSection)(tree); return; }
    if (e.target.closest('[data-page-delete]')) { e.preventDefault(); if (pageState && pageState.node) openConfirm(tree, pageState.node); return; }
    if ((a = e.target.closest('[data-f="icon-remove"]'))) {
      e.preventDefault();
      qs(tree, '.a2-view-section [data-f="icon"]').innerHTML = DEFAULT_ICON;
      a.hidden = true;
      return;
    }
    // Video "Details": a tooltip next to the link. The team picked this over the modal, so the modal is gone.
    if (e.target.closest('[data-f="video-details"]')) {
      e.preventDefault();
      var vdet = qs(tree, '.a2-vdet');
      vdet.hidden = !vdet.hidden;
      return;
    }
    // Questions block: head folds the block, a group folds its questions, a row folds the details of one question.
    if (e.target.closest('[data-qhead]')) {
      e.preventDefault();
      qs(tree, '.a2-qblock').classList.toggle('folded');
      return;
    }
    if ((a = e.target.closest('[data-rename]'))) {
      e.preventDefault();
      stopRename(qs(a.closest('.a2-qgroup'), '.a2-qgroup-rename'), a.getAttribute('data-rename') === 'save');
      return;
    }
    if ((a = e.target.closest('[data-qgroup-edit]'))) {
      e.preventDefault();
      startRename(a.closest('.a2-qgroup'));
      return;
    }
    if ((a = e.target.closest('[data-instr]'))) {
      e.preventDefault();
      settleInstr(qs(tree, '.a2-view-lesson'), a.getAttribute('data-instr') === 'save');
      return;
    }
    if ((a = e.target.closest('[data-qorder]'))) {
      e.preventDefault();
      settleOrder(qs(tree, '.a2-view-lesson'), a.getAttribute('data-qorder') === 'save');
      return;
    }
    if ((a = e.target.closest('[data-qgroup-del]'))) {
      e.preventDefault();
      var gd = a.closest('.a2-qgroup'), qn2 = qsa(gd, '.a2-q').length;
      openModal(tree, { kind: 'delete', type: 'qgroup', gnode: gd, title: 'Delete group',
        text: 'Delete \u201c' + qs(gd, '.a2-qgroup-name').textContent + '\u201d?',
        note: qn2 ? 'Its ' + qn2 + ' questions will be deleted with it.' : '' });
      return;
    }
    if ((a = e.target.closest('[data-q-edit]'))) {
      e.preventDefault();
      openQuestionForm(tree, a.closest('.a2-q'));
      return;
    }
    if ((a = e.target.closest('[data-q-del]'))) {
      e.preventDefault();
      var qd = a.closest('.a2-q');
      openModal(tree, { kind: 'delete', type: 'question', qnode: qd, title: 'Delete question',
        text: 'Delete this question?', note: qs(qd, '.a2-q-text').textContent });
      return;
    }
    if ((a = e.target.closest('[data-qgroup-open]'))) {
      if (e.target.closest('.a2-qdep, .a2-qpen, .a2-qgroup-rename, .a2-rename-acts')) {
        if (e.target.closest('a')) e.preventDefault();
        return;
      }
      e.preventDefault();
      a.closest('.a2-qgroup').classList.toggle('collapsed');
      return;
    }
    if ((a = e.target.closest('[data-q-add]'))) {
      e.preventDefault();
      openModal(tree, { kind: 'question', title: 'New question', okText: 'Add',
        groupBody: a.closest('.a2-qgroup-body') });
      return;
    }
    if (e.target.closest('[data-qgroup-add]')) {
      e.preventDefault();
      openModal(tree, { kind: 'qgroup', title: 'New group', okText: 'Add' });
      return;
    }
    if ((a = e.target.closest('[data-q-open]'))) {
      if (e.target.closest('.a2-q-acts, .a2-q-drag')) { e.preventDefault(); return; }
      e.preventDefault();
      var q = a.closest('.a2-q'), d = qs(q, '.a2-q-detail');
      d.hidden = !d.hidden;
      q.classList.toggle('open', !d.hidden);
      return;
    }
    var det = qs(tree, '.a2-vdet');
    if (det && !det.hidden && !e.target.closest('.a2-vdet')) det.hidden = true; // a click elsewhere closes the tooltip
    if (e.target.closest('.a2-view-lesson, .a2-view-section')) { if (e.target.closest('a[href="#"]')) e.preventDefault(); return; }
    // Tree
    if ((a = e.target.closest('.a2-toggle'))) {
      e.preventDefault();
      var state = a.getAttribute('data-state');
      setState(tree, state, !tree.classList.contains(state));
      return;
    }
    if ((a = e.target.closest('[data-reorder]'))) {
      e.preventDefault();
      setState(tree, 'reorder', false, a.getAttribute('data-reorder') === 'save');
      return;
    }
    if ((a = e.target.closest('.a2-kebab'))) {
      e.preventDefault();
      var acts = a.parentElement, was = acts.classList.contains('open');
      closeMenus();
      if (!was) { syncPublishLabel(acts); acts.classList.add('open'); }
      return;
    }
    if ((a = e.target.closest('[data-act]'))) {
      e.preventDefault();
      node = a.closest('.a2-node');
      var act = a.getAttribute('data-act'), type = typeOf(node);
      closeMenus();
      if (act === 'publish') {
        node.setAttribute('data-published', node.getAttribute('data-published') === '0' ? '1' : '0');
      } else if (act === 'edit') {
        if (type === 'lesson') openLesson(tree, { node: node });
        else if (type === 'section') openSection(tree, { node: node });
        else openModal(tree, { kind: 'edit', type: 'part', node: node, name: nameOf(node), title: 'Edit part' });
      } else if (act === 'delete') {
        openConfirm(tree, node);
      }
      return;
    }
    if ((a = e.target.closest('[data-add]'))) {
      e.preventDefault();
      var addType = a.getAttribute('data-add'), container = a.closest('.a2-node');
      if (addType === 'section') { openSection(tree, {}); return; }
      var listEl = qs(container, ':scope > .a2-body > .a2-' + addType + 's');
      if (addType === 'lesson') openLesson(tree, { listEl: listEl });
      else openModal(tree, { kind: 'add', type: 'part', listEl: listEl, title: 'New part' });
      return;
    }
    if (e.target.closest('.a2-hide')) return;
    var row = e.target.closest('.a2-row');
    if (row) {
      e.preventDefault();
      node = row.parentElement;
      closeMenus();
      if (node.classList.contains('a2-lesson')) {
        // A lesson row opens the lesson page. Variant 1.1: only in Edit mode.
        if (tree.getAttribute('data-variant') === 'mode' && !tree.classList.contains('on')) return;
        openLesson(tree, { node: node });
        return;
      }
      node.classList.toggle('collapsed');
      return;
    }
    if (e.target.closest('a')) e.preventDefault();
    closeMenus();
  }

  // Drag and drop ------------------------------------------------------------------------------
  // Three kinds: a row of the tree (only while Reorder is on), an answer inside its table, a question inside
  // its group or into another one. A grip arms the drag, so a field can still be selected with the mouse.
  var dragged = null, dragKind = null, armed = null;

  function elOf(e) { var t = e.target; if (t && t.nodeType !== 1) t = t.parentElement; return t; }

  function siblingOver(target) {
    var over = target.closest('.a2-node');
    while (over && over.parentElement !== dragged.parentElement) over = over.parentElement.closest('.a2-node');
    return over;
  }

  function clearDrop() {
    qsa(document, '.drop-above, .drop-below, .drop-into').forEach(function (n) {
      n.classList.remove('drop-above', 'drop-below', 'drop-into');
    });
  }

  function arm(e) {
    if (e.target.closest('.a2-rename-acts')) { e.preventDefault(); return; } // keep the focus in the field
    var g = e.target.closest('[data-drag-ans]');
    if (g) { armed = g.closest('.a2-ans'); armed.draggable = true; return; }
    g = e.target.closest('[data-drag-q]');
    if (g) { armed = g.closest('.a2-q'); armed.draggable = true; return; }
    onPointDown(e);
  }

  function disarm() { if (armed) { armed.draggable = false; armed = null; } }

  function startDrag(e, node, kind) {
    dragged = node;
    dragKind = kind;
    node.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', 'a2'); } catch (_) {}
  }

  function onDragStart(e) {
    var tree = e.currentTarget, t = elOf(e);
    if (!t) return;
    var ans = t.closest('.a2-ans');
    if (ans && ans.draggable) { startDrag(e, ans, 'ans'); return; }
    var qn = t.closest('.a2-q');
    if (qn && qn.draggable) { startDrag(e, qn, 'q'); return; }
    var node = t.closest('.a2-node');
    if (!tree.classList.contains('reorder') || !node) { e.preventDefault(); return; }
    startDrag(e, node, 'node');
  }

  function markHalf(e, el, rect) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    el.classList.add(e.clientY < rect.top + rect.height / 2 ? 'drop-above' : 'drop-below');
  }

  function onDragOver(e) {
    if (!dragged) return;
    var t = elOf(e);
    clearDrop();
    if (!t) return;
    if (dragKind === 'ans') {
      var oa = t.closest('.a2-ans'); // an answer stays in its own table
      if (oa && oa !== dragged && oa.parentElement === dragged.parentElement) markHalf(e, oa, oa.getBoundingClientRect());
      return;
    }
    if (dragKind === 'q') {
      var oq = t.closest('.a2-q');
      if (oq && oq !== dragged) { markHalf(e, oq, qs(oq, '.a2-q-row').getBoundingClientRect()); return; }
      var grow = t.closest('.a2-qgroup-row'); // dropping on the name of a group puts the question into it
      if (grow) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; grow.classList.add('drop-into'); return; }
      var gbody = t.closest('.a2-qgroup-body');
      if (gbody && !gbody.contains(dragged)) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; gbody.classList.add('drop-into'); }
      return;
    }
    var over = siblingOver(t);
    if (!over || over === dragged) return;
    markHalf(e, over, qs(over, ':scope > .a2-row').getBoundingClientRect());
  }

  function onDrop(e) {
    if (!dragged) return;
    var t = elOf(e);
    if (!t) { finishDrag(); return; }
    if (dragKind === 'ans') {
      var oa = t.closest('.a2-ans');
      if (oa && oa !== dragged && oa.parentElement === dragged.parentElement) {
        e.preventDefault();
        oa.parentElement.insertBefore(dragged, oa.classList.contains('drop-above') ? oa : oa.nextSibling);
        renumberAnswers(dragged.closest('.a2-q-editor'));
        if (dragged.closest('.a2-qans-slot')) markAnswersChanged(qs(dragged.closest('.a2tree'), '.a2-modal'));
      }
      finishDrag();
      return;
    }
    if (dragKind === 'q') {
      var lv = dragged.closest('.a2-view-lesson'), oq = t.closest('.a2-q'), grow = t.closest('.a2-qgroup-row');
      if (lv) snapshotOrder(lv); // the new order waits for Save, as it does in the tree
      var gbody = grow ? qs(grow.closest('.a2-qgroup'), '.a2-qgroup-body') : t.closest('.a2-qgroup-body');
      if (oq && oq !== dragged) {
        e.preventDefault();
        oq.parentElement.insertBefore(dragged, oq.classList.contains('drop-above') ? oq : oq.nextSibling);
      } else if (gbody && (grow || !gbody.contains(dragged))) {
        e.preventDefault();
        gbody.insertBefore(dragged, qs(gbody, '.a2-qgroup-foot'));
        gbody.closest('.a2-qgroup').classList.remove('collapsed');
      }
      if (lv) renumberQuestions(lv);
      finishDrag();
      return;
    }
    var over = siblingOver(t);
    if (over && over !== dragged) {
      e.preventDefault();
      over.parentElement.insertBefore(dragged, over.classList.contains('drop-above') ? over : over.nextSibling);
    }
    finishDrag();
  }

  function finishDrag() {
    if (dragged) dragged.classList.remove('dragging');
    clearDrop();
    disarm();
    dragged = null;
    dragKind = null;
  }

  // Init --------------------------------------------------------------------------------------
  function init() {
    qsa(document, '.a2tree').forEach(function (tree) {
      tree.addEventListener('click', onClick);
      tree.addEventListener('dragstart', onDragStart);
      tree.addEventListener('dragover', onDragOver);
      tree.addEventListener('drop', onDrop);
      tree.addEventListener('dragend', finishDrag);
      tree.addEventListener('mousedown', arm);
      tree.addEventListener('focusout', function (e) {
        if (e.target.classList && e.target.classList.contains('a2-qgroup-rename') && !e.target.hidden) {
          stopRename(e.target, true);
        }
      });
      tree.addEventListener('input', function (e) {
        if (e.target.closest('.a2-qans-slot')) markAnswersChanged(qs(tree, '.a2-modal'));
        if (e.target.classList && e.target.classList.contains('a2-qinstr-text')) {
          var lvi = e.target.closest('.a2-view-lesson');
          qs(lvi, '.a2-qinstr-foot').hidden = instrBox(lvi).innerHTML === lvi.__instr;
        }
      });
      tree.addEventListener('change', function (e) {
        if (e.target.closest('.a2-qans-slot')) markAnswersChanged(qs(tree, '.a2-modal'));
        if (e.target.matches('.a2-hide input')) tree.classList.toggle('hide-unpub', e.target.checked);
        else if (e.target.matches('.a2-field-qtype select')) {
          var mm = qs(tree, '.a2-modal');
          fillFormAnswers(tree, mm, null, e.target.value); // another type means another kind of answers
          syncQuestionForm(mm);
        }
        else if (e.target.matches('[data-f="where-section"]')) fillWhereParts(tree, qs(tree, '.a2-view-lesson'), null);
        else if (e.target.matches('[data-study-mode]')) { // a study card holds pairs of words or a set of pictures
          var pics = e.target.value === 'Pictures', qst = e.target.closest('.a2-q-editor');
          if (!qst) return;
          qs(qst, '[data-study-list]').hidden = pics;
          qs(qst, '[data-study-add]').hidden = pics;
          qs(qst, '.a2-studypics').hidden = !pics;
        }
      });
      recount(tree);
      if (isLists(tree)) showList(tree, tree.getAttribute('data-home'));
    });
    // The navbar of variants 2-4 is above .a2tree in the page, so its A2 entry is handled here:
    // it opens the dropdown (variant 3) or goes back to the home list (variants 2 and 4).
    document.addEventListener('click', function (e) {
      var tree = upFrom(e.target, '.a2tree.a2-lists');
      if (tree) {
        var drop = a2Drop(tree);
        if (e.target.closest('[data-a2menu]')) {
          e.preventDefault();
          if (drop) drop.hidden = !drop.hidden;
          return;
        }
        var link = e.target.closest('a[data-list]');
        if (link && !link.closest('.a2-view')) { // a view carries the same attribute on itself
          e.preventDefault();
          showList(tree, link.getAttribute('data-list'));
          return;
        }
        if (drop && !drop.hidden && !e.target.closest('.a2-drop')) drop.hidden = true;
      }
      var sw = e.target.closest('.a2-switch');
      if (sw && !sw.closest('.a2-toggle')) {
        sw.classList.toggle('on');
        var lbl = sw.nextElementSibling;
        if (lbl && lbl.classList.contains('a2-switch-label')) lbl.textContent = sw.classList.contains('on') ? 'On' : 'Off';
        return;
      }
      if (!e.target.closest('.a2tree')) closeMenus();
    });
    document.addEventListener('mousemove', onPointMove);
    document.addEventListener('mouseup', function (e) { onPointUp(e); disarm(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && e.target.classList && e.target.classList.contains('a2-qgroup-rename')) {
        stopRename(e.target, false);
        return;
      }
      if (e.key === 'Escape') {
        if (modalState) closeModal();
        else if (pageState) backToTree(pageState.tree);
        closeMenus();
      }
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        // a field of an answer or of an answer group belongs to the questions block, not to the lesson form
        if (e.target.classList.contains('a2-qgroup-rename')) { e.preventDefault(); stopRename(e.target, true); return; }
        if (e.target.closest('.a2-q-ans, .a2-ansgroup-head')) { e.preventDefault(); e.target.blur(); return; }
        if (modalState) { e.preventDefault(); confirmModal(); }
        else if (pageState && e.target.closest('.a2-view-lesson, .a2-view-section')) { e.preventDefault(); (pageState.type === 'lesson' ? saveLesson : saveSection)(pageState.tree); }
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
