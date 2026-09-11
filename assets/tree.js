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
  function backToTree(tree) { pageState = null; showView(tree, 'tree'); }

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
    v.__snapshot = lessonSnapshot(v);
    pageState = { tree: tree, type: 'lesson', node: cfg.node || null, listEl: cfg.listEl || null };
    showView(tree, 'lesson');
    qs(v, '[data-f="title"]').focus();
  }

  // Questions block: the head folds the whole block, a question row folds its details, a group folds its questions.
  // Both modes start folded (10.09): a lesson opens as a short page, questions are opened when they are the point.
  function resetQuestions(v) {
    var block = qs(v, '.a2-qblock');
    qsa(block, '.a2-q').forEach(function (q) { renumberAnswers(q); syncRationale(q); });
    block.classList.add('folded');
    qsa(block, '.a2-q-detail').forEach(function (d) { d.hidden = true; });
    qsa(block, '.a2-q').forEach(function (q) { q.classList.remove('open'); });
    qsa(block, '.a2-qgroup').forEach(function (g) { g.classList.add('collapsed'); });
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
    recount(tree);
    backToTree(tree);
  }

  // Questions live inside groups: a lesson has one group by default and can have more (Tima, 10.09).
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

  function renumberAnswers(q) {
    var qtype = q.getAttribute('data-qtype'), choice = isChoice(q);
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
    var q = tr.closest('.a2-q'), i = qsa(q, '.a2-ans').indexOf(tr);
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
    var proto = qs(tbody, '.a2-ans') || qs(q, '.a2-ans') || qs(q.closest('.a2-view-lesson'), '.a2-ans');
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
    if (!pt) return;
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

  function makeQuestion(v, key, text, type, rat) {
    var node = qs(v, '.a2-q').cloneNode(true);
    node.setAttribute('data-qkey', key);
    node.classList.remove('open');
    qs(node, '.a2-q-text').textContent = text;
    qs(node, '.a2-q-type').textContent = type;
    qs(node, '.a2-q-rat').textContent = rat || '';
    node.setAttribute('data-qtype', type);
    qs(node, '.a2-q-ans tbody').innerHTML = ''; // a new question starts without answers
    qs(node, '.a2-q-detail').hidden = true;
    renumberAnswers(node);
    syncRationale(node);
    return node;
  }

  // Which fields a question type needs: the drawing pad belongs to a text question, the block placeholder to the
  // types that put answers inside the text, the picture to the types built around one.
  var DRAW_TYPES = ['Text'];
  var BLOCK_TYPES = ['Underline Incorrect', 'Drag And Drop'];
  var IMAGE_TYPES = ['Image Question', 'Study Question'];

  function syncQuestionForm(m) {
    var type = qs(m, '.a2-field-qtype select').value;
    var notes = qs(m, '.a2-qtype-notes');
    var note = qsa(notes, 'option').filter(function (o) { return o.value === type; })[0];
    qs(m, '[data-f="qtype-note"]').textContent = note ? note.textContent : '';
    qs(m, '.a2-field-qdraw').hidden = DRAW_TYPES.indexOf(type) < 0;
    qs(m, '.a2-field-qblockhint').hidden = BLOCK_TYPES.indexOf(type) < 0;
    qs(m, '.a2-field-qimage').hidden = IMAGE_TYPES.indexOf(type) < 0;
    qs(m, '.a2-field-qratimg').hidden = false;
  }

  // A question is moved to another group by dragging it there, so the form has no "Group" select (Tima 11.09).
  function openQuestionForm(tree, q) {
    openModal(tree, { kind: 'question', title: 'Edit question', okText: 'Save', qnode: q,
      qtext: qs(q, '.a2-q-text').textContent, qtype: qs(q, '.a2-q-type').textContent,
      qrat: qs(q, '.a2-q-rat').textContent });
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
      syncQuestionForm(m);
    }
    qsa(m, '.a2-field-qblockhint, .a2-field-qdraw, .a2-field-qimage, .a2-field-qratimg')
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
    if (cfg.kind === 'edit' || cfg.kind === 'add' || cfg.kind === 'qgroup') { var inp = qs(fTitle, 'input'); inp.focus(); inp.select(); }
    if (cfg.kind === 'question') qs(m, '.a2-field-qtext .a2-editor-body').focus();
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
      if (st.qnode) {
        var n = st.qnode;
        qs(n, '.a2-q-text').textContent = qtext;
        qs(n, '.a2-q-type').textContent = qtype;
        qs(n, '.a2-q-rat').textContent = qrat;
        syncRationale(n);
        n.setAttribute('data-qtype', qtype); // the answer table follows the type: letters vs blanks, correct column
        renumberAnswers(n);
      } else {
        var body = st.groupBody || qsa(lvw, '.a2-qgroup-body').slice(-1)[0];
        var node = makeQuestion(lvw, 'q' + Date.now(), qtext, qtype, qrat);
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
      if (st.type === 'part') { var dst = lessonsList(sectionOf(st.node)); qsa(st.node, '.a2-lesson').forEach(function (l) { dst.appendChild(l); }); }
      st.node.remove();
      if (pageState && pageState.node === st.node) backToTree(tree);
    } else if (st.kind === 'edit') {
      if (!title) return;
      qs(st.node, ':scope > .a2-row .a2-name').textContent = title;
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

  // Clicks ------------------------------------------------------------------------------------
  function onClick(e) {
    var tree = e.currentTarget, a, node, v;
    if (e.target.classList.contains('a2-modal')) { closeModal(); return; }
    if ((a = e.target.closest('[data-modal]'))) {
      e.preventDefault();
      var what = a.getAttribute('data-modal');
      if (what === 'ok') confirmModal();
      else if (what === 'delete' && modalState) { var n = modalState.node; closeModal(); openConfirm(tree, n); }
      else closeModal();
      return;
    }
    if (e.target.closest('.a2-modal')) return;
    // Pages
    if (e.target.closest('[data-back]')) {
      e.preventDefault();
      // Cancel drops the fields of the lesson only; questions and answers are saved by their own block
      if (pageState && pageState.type === 'lesson' && lessonChanged(tree)) {
        openModal(tree, { kind: 'discard', title: 'Discard changes?', okText: 'Discard',
          text: 'The title, body, video or status of this lesson were changed.',
          note: 'Questions and answers are not affected: they are saved with their own block.' });
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
    if ((a = e.target.closest('[data-qgroup-edit]'))) {
      e.preventDefault();
      var gn = a.closest('.a2-qgroup');
      openModal(tree, { kind: 'qgroup', title: 'Edit group', okText: 'Save', gnode: gn,
        name: qs(gn, '.a2-qgroup-name').textContent });
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
      if (e.target.closest('.a2-q-acts, .a2-qdep')) { if (e.target.closest('a')) e.preventDefault(); return; }
      e.preventDefault();
      a.closest('.a2-qgroup').classList.toggle('collapsed');
      return;
    }
    if ((a = e.target.closest('[data-ans-remove]'))) {
      e.preventDefault();
      var qr = a.closest('.a2-q'), trr = a.closest('.a2-ans'), ptr = pointOf(trr);
      if (ptr) ptr.remove(); // an answer of an Image Question takes its point off the picture
      trr.remove();
      renumberAnswers(qr);
      return;
    }
    if ((a = e.target.closest('[data-ans-add]'))) {
      e.preventDefault();
      var qa = a.closest('.a2-q');
      var boxa = a.closest('.a2-ansblock, .a2-ansgroup') || qa; // a block and an answer group own their table
      var tba = qs(boxa, '.a2-q-ans tbody');
      var rowa = makeAnswerRow(qa, tba);
      tba.appendChild(rowa);
      renumberAnswers(qa);
      focusRow(rowa);
      return;
    }
    // Answer groups of the matching types: a named column of answers is added and dropped here
    if ((a = e.target.closest('.a2-ansgroup-del'))) {
      e.preventDefault();
      var qg = a.closest('.a2-q');
      a.closest('.a2-ansgroup').remove();
      renumberAnswers(qg);
      return;
    }
    if ((a = e.target.closest('.a2-ansgroup-add'))) {
      e.preventDefault();
      var qag = a.closest('.a2-q'), proto = qs(qag, '.a2-ansgroup').cloneNode(true);
      qs(proto, '.a2-ansgroup-name').value = '';
      qsa(proto, '.a2-ans').slice(1).forEach(function (r) { r.remove(); });
      qsa(proto, 'input[type="text"]').forEach(function (i) { i.value = ''; });
      a.parentElement.insertBefore(proto, a);
      renumberAnswers(qag);
      qs(proto, '.a2-ansgroup-name').focus();
      return;
    }
    // Image Question: a click on the picture puts a new point and the answer that belongs to it
    if ((a = e.target.closest('[data-imgq]'))) {
      e.preventDefault();
      if (e.target.closest('.a2-imgq-pt') || skipStageClick) { skipStageClick = false; return; }
      var qi = a.closest('.a2-q'), ri = a.getBoundingClientRect();
      addPoint(qi, (e.clientX - ri.left) / ri.width, (e.clientY - ri.top) / ri.height);
      var tbi = qs(qi, '.a2-q-ans tbody'), rowi = makeAnswerRow(qi, tbi);
      tbi.appendChild(rowi);
      renumberAnswers(qi);
      focusRow(rowi);
      return;
    }
    if (e.target.closest('.a2-ans-correct')) { // ticking the correct answer stays inside the row
      var qm = e.target.closest('.a2-q');
      setTimeout(function () { renumberAnswers(qm); }, 0);
      return;
    }
    if ((a = e.target.closest('[data-q-add]'))) {
      e.preventDefault();
      openModal(tree, { kind: 'question', title: 'New question', okText: 'Add',
        groupBody: a.closest('.a2-qgroup-body') });
      return;
    }
    if (e.target.closest('[data-q-save]')) { // the questions block saves on its own: it is another entity in the base
      e.preventDefault();
      var qsave = qs(tree, '[data-q-save]');
      var was = qsave.textContent;
      qsave.textContent = 'Saved';
      setTimeout(function () { qsave.textContent = was; }, 1200);
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
        renumberAnswers(dragged.closest('.a2-q'));
      }
      finishDrag();
      return;
    }
    if (dragKind === 'q') {
      var lv = dragged.closest('.a2-view-lesson'), oq = t.closest('.a2-q'), grow = t.closest('.a2-qgroup-row');
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
      tree.addEventListener('change', function (e) {
        if (e.target.matches('.a2-hide input')) tree.classList.toggle('hide-unpub', e.target.checked);
        else if (e.target.matches('.a2-field-qtype select')) syncQuestionForm(qs(tree, '.a2-modal'));
        else if (e.target.matches('[data-study-mode]')) { // a study card holds pairs of words or a set of pictures
          var pics = e.target.value === 'Pictures', qst = e.target.closest('.a2-q');
          qs(qst, '[data-study-list]').hidden = pics;
          qs(qst, '[data-study-add]').hidden = pics;
          qs(qst, '.a2-studypics').hidden = !pics;
        }
      });
      recount(tree);
    });
    document.addEventListener('click', function (e) {
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
      if (e.key === 'Escape') {
        if (modalState) closeModal();
        else if (pageState) backToTree(pageState.tree);
        closeMenus();
      }
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        // a field of an answer or of an answer group belongs to the questions block, not to the lesson form
        if (e.target.closest('.a2-q-ans, .a2-ansgroup-head')) { e.preventDefault(); e.target.blur(); return; }
        if (modalState) { e.preventDefault(); confirmModal(); }
        else if (pageState && e.target.closest('.a2-view-lesson, .a2-view-section')) { e.preventDefault(); (pageState.type === 'lesson' ? saveLesson : saveSection)(pageState.tree); }
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
