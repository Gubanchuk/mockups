// Comment moderation pages of the A2 admin mockup (29.09): two versions of one screen on variant 1 + Edit mode.
//   data-comments="inbox"   - comments on the left, the chosen thread on the right; Approve opens the next one waiting
//   data-comments="lessons" - lessons that have comments, then the threads of one lesson the way a student sees them
// Ways in: "Comments" in the Moderation block, the Comments button of a lesson page, and the page itself
// (data-start="comments"). Data: the JSON in .cm-data written by gen_course.py. Nothing is saved anywhere.
// Views are switched through window.a2Tree (tree.js), so the tree, the lesson page and this screen share one frame.
(function () {
  function qs(el, s) { return el.querySelector(s); }
  function qsa(el, s) { return Array.prototype.slice.call(el.querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function count(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase();
  }
  function stop(e) { e.preventDefault(); e.stopPropagation(); }

  function setup(tree) {
    var data = JSON.parse(qs(tree, '.cm-data').textContent);
    var list = data.comments; // newest first
    var kind = tree.getAttribute('data-comments');
    var view = qs(tree, '.a2-view-comments');
    // tab / lesson / q: filters of the inbox; sel: the thread on the right; from: the lesson page this screen was opened from;
    // open: the lesson on screen (by lesson); reply / confirm: the thread with an open reply box / delete question
    // edit: the comment or reply whose text is open for editing ("c5" or "c5:0"), editError: its Save was pressed empty
    var st = { tab: 'awaiting', lesson: '', q: '', sel: null, from: null, open: null, only: false,
               reply: null, confirm: null, error: null, edit: null, editError: false, lastLesson: null };

    function waiting(c) { return c.status === 'awaiting'; }
    function byId(id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

    // Section and title of any lesson, also one without comments, are read from the tree itself
    function lessonInfo(lid) {
      var node = qs(tree, '.a2-lesson[data-lid="' + lid + '"]');
      if (!node) return { lid: lid, lesson: '', section: '' };
      return { lid: lid, lesson: qs(node, ':scope > .a2-row .a2-name').textContent,
               section: qs(node.closest('.a2-section'), ':scope > .a2-row .a2-name').textContent };
    }

    // Lessons that have comments: waiting ones first, then by the newest comment
    function lessons() {
      var out = [], at = {};
      list.forEach(function (c, i) {
        var l = at[c.lid];
        if (!l) { l = at[c.lid] = { lid: c.lid, lesson: c.lesson, section: c.section, total: 0, waiting: 0, first: i, when: c.when, date: c.date }; out.push(l); }
        l.total += 1;
        if (waiting(c)) l.waiting += 1;
      });
      return out.sort(function (a, b) { return (b.waiting > 0) - (a.waiting > 0) || a.first - b.first; });
    }

    // Counters outside the screen: the Moderation block and the Comments button of the lesson page
    function counters() {
      var n = list.filter(waiting).length;
      var side = qs(tree, '[data-cm-awaiting]');
      if (side) side.textContent = n ? n + ' awaiting review' : 'Nothing awaiting review';
      lessonBadge();
    }
    function lessonBadge() {
      var b = qs(tree, '.a2-view-lesson [data-comments] .a2-badge');
      if (!b || !st.lastLesson) return;
      var n = list.filter(function (c) { return c.lid === st.lastLesson && waiting(c); }).length;
      b.textContent = n;
      b.hidden = !n;
    }

    function flash(text) {
      var f = qs(view, '[data-cm-flash]');
      f.textContent = text || '';
      f.hidden = !text;
    }

    function crumbs() {
      var home = '<a href="#" data-back>A2 MasterClass</a>', sep = ' &rsaquo; ';
      var html;
      if (kind === 'inbox' && st.from && st.lesson === st.from) {
        var l = lessonInfo(st.from);
        html = home + sep + esc(l.section) + sep + '<a href="#" data-cm-lesson-page="' + st.from + '">' + esc(l.lesson) + '</a>' +
               sep + '<span class="a2-crumb-cur">Comments</span>';
      } else if (kind === 'lessons' && st.open) {
        html = home + sep + '<a href="#" data-cm-index>Comments</a>' + sep + '<span class="a2-crumb-cur">' + esc(lessonInfo(st.open).lesson) + '</span>';
      } else {
        html = home + sep + '<span class="a2-crumb-cur">Comments</span>';
      }
      qs(view, '[data-cm-crumbs]').innerHTML = html;
    }

    // One person line: avatar, name, Admin badge, e-mail of a student, status, time
    function who(p, isWaiting) {
      var admin = !!p.admin;
      return '<div class="cm-who"><span class="cm-ava' + (admin ? ' admin' : '') + '" aria-hidden="true">' + esc(initials(p.author)) + '</span>' +
        '<span class="cm-name">' + esc(p.author) + '</span>' + (admin ? '<span class="cm-admin">Admin</span>' : '') +
        (p.email ? '<a class="cm-email" href="#" title="Opens the user card">' + esc(p.email) + '</a>' : '') +
        '<span class="cm-right">' + (isWaiting ? '<span class="cm-chip">Awaiting review</span>' : '') +
        '<span class="cm-when" title="' + esc(p.date) + '">' + esc(p.when) + '</span></span></div>';
    }

    function confirmBox(key, replies, isWaiting) {
      if (st.confirm !== key) return '';
      var what = replies ? 'Delete this comment and its ' + count(replies, 'reply', 'replies') + '?' : 'Delete this comment?';
      var after = isWaiting ? ' It will not be published.' : ' Students will no longer see it.';
      return '<div class="cm-confirm" role="alert"><span>' + what + after + '</span>' +
        '<a href="#" class="a2-btn a2-btn-danger" data-cm-del-yes="' + key + '">Delete</a>' +
        '<a href="#" class="a2-btn" data-cm-del-no>Cancel</a></div>';
    }

    function replyBox(c, withCancel) {
      var label = waiting(c) ? 'Reply and approve' : 'Reply';
      return '<div class="cm-replybox">' +
        '<textarea rows="3" data-cm-text="' + c.id + '" placeholder="Reply as ' + esc(data.admin) + '"' +
        (st.error === c.id ? ' aria-invalid="true"' : '') + '></textarea>' +
        '<div class="cm-replyacts">' + (st.error === c.id ? '<span class="cm-err">Write the reply first.</span>' : '') +
        (withCancel ? '<a href="#" class="a2-btn" data-cm-reply-cancel>Cancel</a>' : '') +
        '<a href="#" class="a2-btn a2-btn-primary" data-cm-reply="' + c.id + '">' + label + '</a></div></div>';
    }

    // Edit (as in the A2 admin today): the text opens in a field right in the card, Save keeps it, Cancel drops it
    function editBox(key, text) {
      return '<div class="cm-edit"><textarea rows="3" data-cm-edit-text="' + key + '"' + (st.editError ? ' aria-invalid="true"' : '') +
        ' aria-label="Comment text">' + esc(text) + '</textarea>' +
        '<div class="cm-replyacts">' + (st.editError ? '<span class="cm-err">The comment cannot be empty.</span>' : '') +
        '<a href="#" class="a2-btn" data-cm-edit-cancel>Cancel</a>' +
        '<a href="#" class="a2-btn a2-btn-primary" data-cm-edit-save="' + key + '">Save</a></div></div>';
    }

    // Text of a comment or a reply, or its field while it is edited; the row of actions below it,
    // replaced by the delete question or hidden while editing, so one set of controls is in view at a time
    function body(key, text, acts, confirm) {
      if (st.edit === key) return editBox(key, text);
      return '<div class="cm-text">' + esc(text) + '</div>' + (st.confirm === key ? confirm : acts);
    }

    // A thread: the comment, its actions, its replies. The inbox always shows the reply box;
    // the lessons version opens it from "Reply", as under a lesson.
    function thread(c) {
      var w = waiting(c), inbox = kind === 'inbox';
      var acts = (w ? '<a href="#" class="a2-btn a2-btn-primary" data-cm-approve="' + c.id + '">Approve</a>' : '') +
        (inbox ? '' : '<a href="#" class="cm-link" data-cm-replyto="' + c.id + '">Reply</a>') +
        '<a href="#" class="cm-link" data-cm-edit="' + c.id + '">Edit</a>' +
        '<a href="#" class="cm-del" data-cm-del="' + c.id + '">Delete</a>';
      var replies = c.replies.map(function (r, i) {
        var key = c.id + ':' + i;
        return '<div class="cm-r">' + who(r, false) +
          body(key, r.text, '<div class="cm-acts cm-acts-r"><a href="#" class="cm-link" data-cm-edit="' + key + '">Edit</a>' +
            '<a href="#" class="cm-del" data-cm-del="' + key + '">Delete</a></div>', confirmBox(key, 0)) + '</div>';
      }).join('');
      return '<div class="cm-c' + (w ? ' wait' : '') + '" data-cm-id="' + c.id + '">' +
        who(c, w) + body(c.id, c.text, '<div class="cm-acts">' + acts + '</div>', confirmBox(c.id, c.replies.length, w)) +
        (replies ? '<div class="cm-replies">' + replies + '</div>' : '') +
        (inbox || st.reply === c.id ? replyBox(c, !inbox) : '') + '</div>';
    }

    // Inbox ------------------------------------------------------------------------------------
    function filtered(tab) {
      var q = st.q.trim().toLowerCase();
      tab = tab || st.tab;
      return list.filter(function (c) {
        if (tab === 'awaiting' && !waiting(c)) return false;
        if (st.lesson && c.lid !== st.lesson) return false;
        if (q) {
          var hay = (c.author + ' ' + c.text + ' ' + c.replies.map(function (r) { return r.text; }).join(' ')).toLowerCase();
          if (hay.indexOf(q) < 0) return false;
        }
        return true;
      });
    }

    function lessonOptions() {
      var sel = qs(view, '[data-cm-lesson]');
      var ls = lessons().slice().sort(function (a, b) { return (a.section + a.lesson).localeCompare(b.section + b.lesson); });
      if (st.lesson && !ls.some(function (l) { return l.lid === st.lesson; })) ls.unshift(lessonInfo(st.lesson));
      sel.innerHTML = '<option value="">All lessons</option>' + ls.map(function (l) {
        return '<option value="' + l.lid + '">' + esc(l.section + ' › ' + l.lesson) + '</option>';
      }).join('');
      sel.value = st.lesson;
    }

    function item(c) {
      return '<a href="#" class="cm-item' + (c.id === st.sel ? ' cur' : '') + (waiting(c) ? ' wait' : '') + '" data-cm-sel="' + c.id + '"' +
        (c.id === st.sel ? ' aria-current="true"' : '') + '>' +
        '<span class="cm-item-top">' + (waiting(c) ? '<span class="cm-dot" title="Awaiting review"></span>' : '<span class="cm-dot cm-dot-off"></span>') +
        '<b>' + esc(c.author) + '</b><span class="cm-when" title="' + esc(c.date) + '">' + esc(c.when) + '</span></span>' +
        '<span class="cm-item-where">' + esc(c.section) + ' &rsaquo; ' + esc(c.lesson) + '</span>' +
        '<span class="cm-item-text">' + esc(c.text) + '</span>' +
        (c.replies.length ? '<span class="cm-item-meta">' + count(c.replies.length, 'reply', 'replies') + '</span>' : '') + '</a>';
    }

    function renderInbox() {
      crumbs();
      qsa(view, '[data-cm-tab]').forEach(function (a) { a.classList.toggle('cur', a.getAttribute('data-cm-tab') === st.tab); });
      lessonOptions();
      // the tabs count what the lesson and search filters leave; the Moderation block keeps the course-wide number
      var nWait = filtered('awaiting').length;
      qsa(view, '.cm-seg [data-cm-count="awaiting"]').forEach(function (el) { el.textContent = nWait; el.hidden = !nWait; });
      qsa(view, '.cm-seg [data-cm-count="all"]').forEach(function (el) { el.textContent = filtered('all').length; });
      var items = filtered(), cols = qs(view, '.cm-cols');
      var L = qs(view, '[data-cm-list]'), P = qs(view, '[data-cm-pane]');
      if (!items.some(function (c) { return c.id === st.sel; })) st.sel = items.length ? items[0].id : null;
      cols.classList.toggle('is-empty', !items.length);
      if (!items.length) {
        var filters = st.lesson || st.q.trim();
        L.innerHTML = filters
          ? '<div class="cm-empty"><b>No comments match</b><a href="#" data-cm-clear>Clear the filters</a></div>'
          : '<div class="cm-empty"><b>Nothing is waiting for review</b><a href="#" data-cm-tab="all">See all comments</a></div>';
        P.innerHTML = '';
        return;
      }
      L.innerHTML = items.map(item).join('');
      P.innerHTML = '<div class="cm-thread"><div class="cm-thread-where"><a href="#" data-cm-lesson-page="' + byId(st.sel).lid + '">' +
        esc(byId(st.sel).section) + ' &rsaquo; ' + esc(byId(st.sel).lesson) + '</a></div>' + thread(byId(st.sel)) + '</div>';
    }

    // By lesson --------------------------------------------------------------------------------
    function renderIndex() {
      var ls = lessons(), waitingAll = list.filter(waiting).length;
      if (st.only) ls = ls.filter(function (l) { return l.waiting; });
      var rows = ls.map(function (l) {
        return '<tr data-cm-row="' + l.lid + '"><td><a href="#" data-cm-open-lesson="' + l.lid + '">' + esc(l.lesson) + '</a>' +
          '<span class="cm-sec">' + esc(l.section) + '</span></td>' +
          '<td>' + (l.waiting ? '<span class="a2-badge">' + l.waiting + '</span>' : '<span class="cm-none">&mdash;</span>') + '</td>' +
          '<td class="cm-num">' + l.total + '</td><td class="cm-last" title="' + esc(l.date) + '">' + esc(l.when) + '</td></tr>';
      }).join('');
      return '<div class="cm-head"><div><div class="a2-title">Comments</div>' +
        '<div class="a2-counts">' + count(list.length, 'comment', 'comments') + ' &middot; ' + (waitingAll ? waitingAll + ' awaiting review' : 'nothing awaiting review') + '</div></div>' +
        '<div class="cm-tools"><label class="a2-check cm-only"><input type="checkbox" data-cm-only' + (st.only ? ' checked' : '') + '> <span>Only lessons with comments awaiting review</span></label></div></div>' +
        (rows
          ? '<table class="a2-ltable cm-ltable"><thead><tr><th>Lesson</th><th>Awaiting review</th><th class="cm-num">Comments</th><th>Latest</th></tr></thead><tbody>' + rows + '</tbody></table>'
          : '<div class="cm-empty"><b>Nothing is waiting for review</b><a href="#" data-cm-only-off>Show every lesson with comments</a></div>');
    }

    function renderLesson(lid) {
      var info = lessonInfo(lid);
      var cs = list.filter(function (c) { return c.lid === lid; });
      cs = cs.filter(waiting).concat(cs.filter(function (c) { return !waiting(c); }));
      var w = cs.filter(waiting).length;
      // "Comments on ...": the lesson page has the lesson title alone, so the two pages do not share a heading
      return '<div class="cm-head"><div><div class="a2-title">Comments on ' + esc(info.lesson) + '</div>' +
        '<div class="a2-counts">' + esc(info.section) + ' &middot; ' + count(cs.length, 'comment', 'comments') + (w ? ' &middot; ' + w + ' awaiting review' : '') + '</div></div>' +
        '<div class="cm-tools"><a href="#" class="a2-btn" data-cm-lesson-page="' + lid + '">Lesson page</a></div></div>' +
        (cs.length ? '<div class="cm-threads">' + cs.map(thread).join('') + '</div>'
                   : '<div class="cm-empty"><b>No comments on this lesson yet</b><a href="#" data-cm-index>All lessons with comments</a></div>');
    }

    function renderLessons() {
      crumbs();
      qs(view, '[data-cm-body]').innerHTML = st.open ? renderLesson(st.open) : renderIndex();
    }

    function render() { if (kind === 'inbox') renderInbox(); else renderLessons(); counters(); }

    function show() {
      window.a2Tree.showView(tree, 'comments');
      render();
      window.scrollTo(0, 0);
    }

    function openFromLesson(lid) {
      flash('');
      st.from = lid; st.reply = null; st.confirm = null; st.error = null; st.edit = null;
      if (kind === 'inbox') {
        st.lesson = lid; st.q = ''; st.sel = null;
        qs(view, '[data-cm-search]').value = '';
        st.tab = list.some(function (c) { return c.lid === lid && waiting(c); }) ? 'awaiting' : 'all';
      } else {
        st.open = lid;
      }
      show();
    }

    // The next thread to show once the current one leaves the awaiting list
    function nextAfter(id) {
      var items = filtered(), i = items.map(function (c) { return c.id; }).indexOf(id);
      var rest = items.slice(i + 1).concat(items.slice(0, Math.max(i, 0)));
      for (var k = 0; k < rest.length; k++) if (rest[k].id !== id) return rest[k].id;
      return null;
    }

    function approve(c, text) {
      var next = kind === 'inbox' && st.tab === 'awaiting' ? nextAfter(c.id) : c.id;
      c.status = 'published';
      st.sel = next; st.confirm = null;
      flash(text || c.author + '’s comment is approved.');
      render();
    }

    function remove(key) {
      var id = key.split(':')[0], c = byId(id);
      if (!c) return;
      if (key.indexOf(':') > 0) {
        c.replies.splice(Number(key.split(':')[1]), 1);
        flash('The reply is deleted.');
      } else {
        var next = nextAfter(id);
        list.splice(list.indexOf(c), 1);
        st.sel = next;
        flash(c.author + '’s comment is deleted.');
      }
      st.confirm = null;
      render();
    }

    function saveEdit(key) {
      var box = qs(view, '[data-cm-edit-text="' + key + '"]'), text = box ? box.value.trim() : '';
      if (!text) {
        // marked in place: a re-render would put the old text back into the field the admin just cleared
        st.editError = true;
        box.setAttribute('aria-invalid', 'true');
        var acts = box.parentElement.querySelector('.cm-replyacts');
        if (!acts.querySelector('.cm-err')) acts.insertAdjacentHTML('afterbegin', '<span class="cm-err">The comment cannot be empty.</span>');
        box.focus();
        return;
      }
      var c = byId(key.split(':')[0]);
      if (key.indexOf(':') > 0) c.replies[Number(key.split(':')[1])].text = text; else c.text = text;
      st.edit = null; st.editError = false;
      flash('The comment is updated.');
      render();
    }

    function reply(c) {
      var box = qs(view, '[data-cm-text="' + c.id + '"]'), text = box ? box.value.trim() : '';
      if (!text) { st.error = c.id; render(); var b = qs(view, '[data-cm-text="' + c.id + '"]'); if (b) b.focus(); return; }
      c.replies.push({ author: data.admin, admin: true, when: 'just now', date: 'Sep 29, 2026', text: text });
      st.error = null; st.reply = null;
      if (waiting(c)) approve(c, c.author + '’s comment is approved and your reply is posted.');
      else { flash('Your reply is posted.'); render(); }
    }

    // Capture phase: the screen handles its own clicks before tree.js looks at them
    tree.addEventListener('click', function (e) {
      var a;
      // remember which lesson the lesson page shows, for its Comments button and its counter
      var lesson = e.target.closest('.a2-view-tree .a2-lesson');
      if (lesson) { st.lastLesson = lesson.getAttribute('data-lid'); setTimeout(lessonBadge, 0); return; }
      if (e.target.closest('[data-cm-open]')) {
        stop(e); flash('');
        st.from = null; st.open = null; st.reply = null; st.confirm = null; st.edit = null;
        if (kind === 'inbox') { st.lesson = ''; st.tab = 'awaiting'; }
        show();
        return;
      }
      if (e.target.closest('.a2-view-lesson [data-comments]')) { stop(e); if (st.lastLesson) openFromLesson(st.lastLesson); return; }
      if (!e.target.closest('.a2-view-comments')) return;

      if ((a = e.target.closest('[data-cm-lesson-page]'))) {
        stop(e);
        var lid = a.getAttribute('data-cm-lesson-page'), node = qs(tree, '.a2-lesson[data-lid="' + lid + '"]');
        if (!node) return;
        st.lastLesson = lid;
        window.a2Tree.openLesson(tree, node);
        lessonBadge();
        window.scrollTo(0, 0);
        return;
      }
      if ((a = e.target.closest('[data-cm-tab]'))) {
        stop(e); flash('');
        st.tab = a.getAttribute('data-cm-tab'); st.sel = null; st.confirm = null; st.error = null; st.edit = null;
        render();
        return;
      }
      if ((a = e.target.closest('[data-cm-sel]'))) {
        stop(e); flash('');
        st.sel = a.getAttribute('data-cm-sel'); st.confirm = null; st.error = null; st.edit = null;
        render();
        return;
      }
      if ((a = e.target.closest('[data-cm-clear]'))) {
        stop(e);
        st.lesson = ''; st.q = ''; st.from = null; qs(view, '[data-cm-search]').value = '';
        render();
        return;
      }
      if ((a = e.target.closest('[data-cm-approve]'))) { stop(e); st.edit = null; approve(byId(a.getAttribute('data-cm-approve'))); return; }
      if ((a = e.target.closest('[data-cm-edit]'))) {
        stop(e);
        st.edit = a.getAttribute('data-cm-edit'); st.editError = false; st.confirm = null; st.reply = null; st.error = null;
        render();
        var ed = qs(view, '[data-cm-edit-text="' + st.edit + '"]');
        if (ed) { ed.focus(); ed.setSelectionRange(ed.value.length, ed.value.length); }
        return;
      }
      if ((a = e.target.closest('[data-cm-edit-save]'))) { stop(e); saveEdit(a.getAttribute('data-cm-edit-save')); return; }
      if (e.target.closest('[data-cm-edit-cancel]')) { stop(e); st.edit = null; st.editError = false; render(); return; }
      if ((a = e.target.closest('[data-cm-del]'))) { stop(e); st.edit = null; st.confirm = a.getAttribute('data-cm-del'); render(); return; }
      if ((a = e.target.closest('[data-cm-del-yes]'))) { stop(e); remove(a.getAttribute('data-cm-del-yes')); return; }
      if (e.target.closest('[data-cm-del-no]')) { stop(e); st.confirm = null; render(); return; }
      if ((a = e.target.closest('[data-cm-replyto]'))) {
        stop(e);
        st.reply = a.getAttribute('data-cm-replyto'); st.error = null; st.confirm = null; st.edit = null;
        render();
        var t = qs(view, '[data-cm-text="' + st.reply + '"]');
        if (t) t.focus();
        return;
      }
      if (e.target.closest('[data-cm-reply-cancel]')) { stop(e); st.reply = null; st.error = null; render(); return; }
      if ((a = e.target.closest('[data-cm-reply]'))) { stop(e); reply(byId(a.getAttribute('data-cm-reply'))); return; }
      if ((a = e.target.closest('[data-cm-open-lesson]')) || (a = e.target.closest('tr[data-cm-row]'))) {
        stop(e); flash('');
        st.open = a.getAttribute('data-cm-open-lesson') || a.getAttribute('data-cm-row');
        st.reply = null; st.confirm = null; st.edit = null;
        render();
        window.scrollTo(0, 0);
        return;
      }
      if (e.target.closest('[data-cm-index]')) { stop(e); flash(''); st.open = null; st.from = null; st.edit = null; render(); return; }
      if (e.target.closest('[data-cm-only-off]')) { stop(e); st.only = false; render(); return; }
      if (e.target.closest('.cm-email')) { stop(e); return; } // the user card lives outside this mockup
    }, true);

    view.addEventListener('input', function (e) {
      if (e.target.matches('[data-cm-search]')) { st.q = e.target.value; flash(''); render(); }
      if (e.target.matches('[data-cm-edit-text]') && st.editError) {
        st.editError = false;
        var eerr = qs(view, '.cm-edit .cm-err');
        if (eerr) eerr.remove();
        e.target.removeAttribute('aria-invalid');
      }
      if (e.target.matches('[data-cm-text]') && st.error) {
        st.error = null;
        var err = qs(view, '.cm-err');
        if (err) err.remove();
        e.target.removeAttribute('aria-invalid');
      }
    });
    view.addEventListener('change', function (e) {
      if (e.target.matches('[data-cm-lesson]')) { st.lesson = e.target.value; st.from = null; st.sel = null; flash(''); render(); }
      if (e.target.matches('[data-cm-only]')) { st.only = e.target.checked; render(); }
    });

    counters();
    if (tree.getAttribute('data-start') === 'comments') show();
  }

  function init() { qsa(document, '.a2tree[data-comments]').forEach(setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
