(function () {
  var F = window.FORUM;
  var VERSION = document.body.getAttribute('data-version');
  var PER_PAGE = 25;
  var TEAM = { 'Patrick': 'Your Best Grade Support', 'Claire Corter': 'Your Best Grade' };
  var state = { page: 'list', topic: '2038', screen: 'laptop', q: '', filter: 'all' };

  // ---------- icons: one stroke family, 24px grid ----------
  function svg(d, fill) { return '<svg viewBox="0 0 24 24" fill="' + (fill ? 'currentColor' : 'none') + '" stroke="' + (fill ? 'none' : 'currentColor') + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; }
  var I = {
    search: svg('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
    pen: svg('<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>'),
    pin: svg('<path d="M9 4h6l-1 6 3 3H7l3-3-1-6Z"/><path d="M12 13v7"/>'),
    bubble: svg('<path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-4 3.5V16H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>'),
    bubbleFill: svg('<path d="M5 4.2h14A1.8 1.8 0 0 1 20.8 6v9a1.8 1.8 0 0 1-1.8 1.8h-7.7l-4.6 3.9V16.8H5A1.8 1.8 0 0 1 3.2 15V6A1.8 1.8 0 0 1 5 4.2Z"/>', true),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    back: svg('<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>'),
    prev: svg('<path d="m15 18-6-6 6-6"/>'),
    next: svg('<path d="m9 18 6-6-6-6"/>'),
    down: svg('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),
    logout: svg('<path d="M4 12h15"/><path d="m14 7 5 5-5 5"/>'),
    burger: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    mail: svg('<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="m4 7 8 6 8-6"/>'),
    bold: svg('<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7V5Z"/><path d="M7 12h7a3.5 3.5 0 0 1 0 7H7v-7Z"/>'),
    italic: svg('<path d="M14 5h-4M14 19h-4M14.5 5l-5 14"/>'),
    link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    quote: svg('<path d="M9 7H6a1 1 0 0 0-1 1v4h4V8a1 1 0 0 0-1-1Z"/><path d="M9 12c0 3-1 4.5-4 5.5"/><path d="M18 7h-3a1 1 0 0 0-1 1v4h4V8a1 1 0 0 0-1-1Z"/><path d="M18 12c0 3-1 4.5-4 5.5"/>'),
    ul: svg('<path d="M9 7h11M9 12h11M9 17h11"/><circle cx="4.5" cy="7" r=".8"/><circle cx="4.5" cy="12" r=".8"/><circle cx="4.5" cy="17" r=".8"/>'),
    ol: svg('<path d="M10 7h10M10 12h10M10 17h10"/><path d="M4 6h1v4M4 10h2"/><path d="M4 14h2l-2 3h2"/>'),
    undo: svg('<path d="M9 7 5 11l4 4"/><path d="M5 11h9a5 5 0 0 1 0 10h-2"/>'),
    redo: svg('<path d="m15 7 4 4-4 4"/><path d="M19 11h-9a5 5 0 0 0 0 10h2"/>')
  };

  // ---------- data helpers ----------
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(n) { return n.toLocaleString('en-US'); }
  function isTeam(by) { return Object.prototype.hasOwnProperty.call(TEAM, by); }
  function item(id) { return F.list.filter(function (t) { return String(t.id) === String(id); })[0]; }
  function thread(id) { return F.threads[id]; }
  function replies(t) { var n = t.posts - 1; return n === 0 ? 'No replies yet' : fmt(n) + (n === 1 ? ' reply' : ' replies'); }
  function pages(total) { return Math.max(1, Math.ceil(total / PER_PAGE)); }
  function initials(name) {
    if (!name) return '';
    var parts = String(name).split(/[.\s]+/).filter(function (p) { return /^[a-z]/i.test(p); });
    return (parts[0] ? parts[0][0] : '?').toUpperCase() + (parts[1] ? parts[1][0].toUpperCase() : '');
  }
  function face(by, size) {
    return '<span class="face' + (isTeam(by) ? ' is-team' : '') + '"' + (size ? ' style="width:' + size + 'px;height:' + size + 'px"' : '') + ' aria-hidden="true"><span>' + initials(by) + '</span></span>';
  }
  function when(th, p) { return th.hideDate || !p.ago ? '' : p.ago; }
  function starter(id) { var th = thread(id); return th ? th.posts[0] : null; }
  // The first reply from the team, if any (index > 0). Pinned stories never lift a reply.
  function teamAnswer(id) {
    var th = thread(id), t = item(id); if (!th || (t && t.pinned)) return -1;
    for (var i = 1; i < th.posts.length; i++) if (isTeam(th.posts[i].by)) return i;
    return -1;
  }
  function excerpt(text, max) {
    var s = text.replace(/\s+/g, ' ').trim();
    if (s.length <= max) return s;
    s = s.slice(0, max); return s.slice(0, s.lastIndexOf(' ')).replace(/[\s,.;:–—-]+$/, '') + '…';
  }
  function linkify(s) { return s.replace(/hesistudy\.com\/forums\/1\/topics\/\d+/g, function (m) { return '<a href="#">' + m + '</a>'; }).replace(/\[link\]/g, '<a href="#">link</a>'); }
  // Post text: every line of the source is its own paragraph (the site stores them as <p>), "- " or "• " lines make a list
  function paras(text) {
    var out = [], list = [];
    function flushL() { if (list.length) { out.push('<ul>' + list.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>'); list = []; } }
    text.split('\n').forEach(function (raw) {
      var line = raw.trim();
      if (!line) { flushL(); return; }
      var m = line.match(/^(?:[-•])\s+(.*)$/);
      if (m) { list.push(linkify(esc(m[1]))); return; }
      flushL(); out.push('<p>' + linkify(esc(line)) + '</p>');
    });
    flushL();
    return out.join('');
  }
  function matches(t) { return !state.q || t.title.toLowerCase().indexOf(state.q.toLowerCase()) !== -1; }
  function hasData(id) { return !!thread(id); }

  // ---------- frame: the HESI member area as it is ----------
  var MENU = ['Orientation', 'HESI Exit Practice', 'Specialty Exams', 'Test Creator', 'CAT Self Assessment', 'Exam Review', 'Study Forum', 'Recommended Resources', 'Performance', 'My Account and Support'];
  function header(phone) {
    return '<header class="hdr"><div class="hdr-in"><img class="hdr-logo" src="assets/header__logo.png" alt="Your Best Grade, HESI Exam Study">' +
      (phone ? '<button class="burger" aria-label="Menu">' + I.burger + '</button>'
        : '<div class="hdr-tools"><div class="rnpn" aria-label="Exam type"><span class="on">RN</span><span>PN</span></div><a class="logout" href="#">Logout ' + I.logout + '</a></div>') +
      '</div></header>';
  }
  function menu() {
    return '<nav class="card menu" aria-label="Member Area"><h2>Member Area</h2><ul>' +
      MENU.map(function (m) { return '<li><a href="#"' + (m === 'Study Forum' ? ' class="on" aria-current="page" data-back' : '') + '>' + m + '</a></li>'; }).join('') +
      '</ul><hr><h2>Passed the HESI?</h2><ul><li><a href="#">NCLEX Study</a></li><li><a href="#">Test Creator</a></li><li><a href="#">Performance</a></li></ul></nav>';
  }
  function footer() {
    return '<footer class="ftr"><img class="ftr-logo" src="assets/header__logo.png" alt="Your Best Grade, HESI Exam Study">' +
      '<div class="ftr-links"><a href="#">Terms and Conditions</a><a href="#">Privacy Policy</a><a href="#">' + I.mail + 'support@yourbestgrade.com</a></div>' +
      '<p>Copyright © 2026 Your Best Grade, Inc. All Rights Reserved.</p>' +
      '<p>HESI is a registered trademark of Elsevier Inc. NCLEX is a registered trademark of the National Council of State Boards of Nursing, Inc.</p></footer>';
  }
  function frame(phone, inner) {
    return '<div class="site' + (phone ? ' is-phone' : '') + ' v-' + VERSION + '">' + header(phone) +
      '<div class="wrap">' + (phone ? '' : menu()) + '<main class="card content">' + inner + '</main></div>' + footer() + '</div>';
  }

  // ---------- shared blocks ----------
  function listHead(phone) {
    return '<h1 class="h1">' + esc(F.name) + '</h1><p class="counts num">' + fmt(F.topics) + ' topics · ' + fmt(F.posts) + ' posts</p>' +
      '<div class="tools"><label class="search">' + I.search + '<input type="search" placeholder="Search topics" aria-label="Search topics" value="' + esc(state.q) + '"></label>' +
      '<a class="btn" href="#">' + I.pen + '<span>New topic</span></a></div>';
  }
  function listPager(pos) {
    return '<nav class="pager num' + (pos === 'top' ? ' pager--top' : '') + '" aria-label="Pages"><span class="wide off">' + I.prev + 'Previous</span><span class="on" aria-current="page">1</span><a href="#">2</a><a href="#">3</a><a href="#">4</a><a href="#">5</a><span class="gap">…</span><a href="#">' + F.pages + '</a><a class="wide" href="#">Next' + I.next + '</a></nav>';
  }
  function topicPager(th, label, pos) {
    var n = pages(th.total); if (n < 2) return '';
    var nums = '<span class="on" aria-current="page">1</span>';
    for (var i = 2; i <= Math.min(n, 4); i++) nums += '<a href="#">' + i + '</a>';
    if (n > 5) nums += '<span class="gap">…</span>';
    if (n > 4) nums += '<a href="#">' + n + '</a>';
    return '<nav class="pager num' + (pos === 'top' ? ' pager--top' : '') + '" aria-label="Pages of this topic">' + (label ? '<span class="pg-label">Page 1 of ' + n + '</span>' : '') + nums + '<a class="wide" href="#">Next page' + I.next + '</a></nav>';
  }
  function composer(title) {
    return '<section class="composer" id="reply"><h2>' + title + '</h2><div class="editor">' +
      '<div class="ed-bar" role="toolbar" aria-label="Formatting">' +
      ['undo', 'redo'].map(function (k) { return '<button type="button" aria-label="' + k + '">' + I[k] + '</button>'; }).join('') + '<i></i>' +
      [['bold', 'Bold'], ['italic', 'Italic'], ['link', 'Link'], ['quote', 'Quote'], ['ul', 'Bulleted list'], ['ol', 'Numbered list']].map(function (k) { return '<button type="button" aria-label="' + k[1] + '">' + I[k[0]] + '</button>'; }).join('') +
      '</div><textarea placeholder="Write your reply…" aria-label="Your reply" data-reply></textarea></div>' +
      '<div class="composer-foot"><button class="btn" type="button" disabled data-post>Post reply</button></div></section>';
  }
  function emptyNote() { return '<div class="empty" data-empty hidden>No topics match “<span data-q></span>”. <button type="button" data-clear>Clear search</button></div>'; }
  // Short form for the narrow Last post column: "7 months ago" -> "7 mo", "over 1 year ago" -> "1 yr"
  function shortAgo(s) { return s.replace(/^(\d+) months? ago$/, '$1 mo').replace(/^(?:about |over |almost )?(\d+) years? ago$/, '$1 yr'); }
  // Distinct authors, only when the whole thread is loaded (long threads carry their first posts only)
  function people(th) { if (th.posts.length < th.total) return ''; var u = {}; th.posts.forEach(function (p) { u[p.by] = 1; }); var n = Object.keys(u).length; return ' · ' + n + (n === 1 ? ' person' : ' people'); }
  function byName(n) { return '<span class="nw">by ' + esc(n) + '</span>'; }
  function lastLine(t) { return 'last reply ' + (t.lastAgo ? t.lastAgo + ' ' : '') + byName(t.lastBy); }

  // ================= Version: Conversation =================
  var conversation = {
    list: function (phone) {
      var pinned = F.list.filter(function (t) { return t.pinned; }), rest = F.list.filter(function (t) { return !t.pinned; });
      function row(t, pin) {
        return '<li data-row data-title="' + esc(t.title) + '"' + (matches(t) ? '' : ' hidden') + '><a class="cv-row' + (t.read ? '' : ' is-unread') + '" href="#" data-open="' + t.id + '">' +
          '<span class="cv-dot" aria-hidden="true"></span>' +
          '<span class="cv-main"><span class="cv-title">' + esc(t.title) + '</span>' +
          '<span class="cv-meta num">' + (pin ? replies(t) + ' · ' + fmt(t.views) + ' views' : replies(t) + ' · ' + fmt(t.views) + ' views' + (t.posts > 1 ? ' · ' + lastLine(t) : '')) + '</span></span>' +
          (t.read ? '' : '<span class="sr">Unread</span>') + '</a></li>';
      }
      return listHead(phone) +
        '<section class="cv-group" data-group><h2 class="cv-h2">Pinned</h2><ul class="cv-rows cv-rows--pinned">' + pinned.map(function (t) { return row(t, true); }).join('') + '</ul></section>' +
        '<section class="cv-group" data-group><h2 class="cv-h2">Recent activity</h2><ul class="cv-rows">' + rest.map(function (t) { return row(t, false); }).join('') + '</ul></section>' +
        emptyNote() + listPager();
    },
    topic: function (phone) {
      var id = state.topic, t = item(id), th = thread(id), first = th.posts[0];
      var started = 'started ' + (when(th, first) ? when(th, first) + ' ' : '') + (first.by ? byName(first.by) : '');
      var posts = th.posts.map(function (p, i) {
        var team = isTeam(p.by);
        return '<li class="cv-post' + (team ? ' is-team' : '') + '" id="post-' + i + '"><div class="cv-who">' + face(p.by, phone ? 32 : 36) +
          '<span class="cv-who-line"><span class="who-name">' + esc(p.by) + '</span>' + (when(th, p) ? '<span class="who-when">' + when(th, p) + '</span>' : '') +
          (team ? '<span class="team-tag">Your Best Grade team</span>' : '') + '</span></div>' +
          '<div class="ptext cv-text">' + paras(p.text) + '</div></li>';
      }).join('');
      return '<a class="back" href="#" data-back>' + I.back + esc(F.name) + '</a>' +
        '<h1 class="h1 cv-topic-title">' + esc(t.title) + '</h1>' +
        '<p class="counts num">' + fmt(th.total) + (th.total === 1 ? ' post' : ' posts') + ' · ' + started + '</p>' +
        topicPager(th, true, 'top') + '<ol class="cv-posts">' + posts + '</ol>' + topicPager(th, true) + composer('Reply to this topic');
    }
  };

  // ================= Version: Answer first =================
  var answer = {
    status: function (t) {
      if (!hasData(t.id)) return { k: 'n', html: replies(t) };
      var th = thread(t.id);
      if (teamAnswer(t.id) > 0) return { k: 'answered', html: '<span class="af-state is-answered">' + I.check + 'Answered by the team</span>' };
      if (t.posts === 1) return { k: 'none', html: '<span class="af-state is-none">No replies yet</span>' };
      return { k: 'n', html: '<span class="af-state">' + replies(t) + '</span>' };
    },
    list: function (phone) {
      var self = this;
      var pinned = F.list.filter(function (t) { return t.pinned; }), rest = F.list.filter(function (t) { return !t.pinned; });
      function show(t) { return matches(t); }
      function row(t) {
        var s = starter(t.id), th = thread(t.id), st = self.status(t);
        var meta = s ? byName(s.by) + (isTeam(s.by) ? ' · Your Best Grade team' : '') : '';
        var ago = t.posts > 1 ? t.lastAgo : (s ? when(th, s) : '');
        if (ago) meta += (t.posts > 1 ? ' · last reply ' : ' · ') + ago;
        // Phone: the state leads and the time follows, so a row stays two lines and never starts a line with a separator
        if (phone) meta = st.html + (ago ? ' <span class="nw">· ' + (t.posts > 1 ? 'last reply ' : 'posted ') + shortAgo(ago) + ' ago</span>' : '');
        return '<li data-row data-title="' + esc(t.title) + '" data-k="' + st.k + '"' + (show(t) ? '' : ' hidden') + '><a class="af-row' + (t.read ? '' : ' is-unread') + '" href="#" data-open="' + t.id + '">' +
          '<span class="af-main"><span class="af-title">' + esc(t.title) + '</span><span class="af-meta">' + meta + '</span></span>' +
          (phone ? '' : st.html) + (t.read ? '' : '<span class="sr">Unread</span>') + '</a></li>';
      }
      return listHead(phone) +
        '<section data-group><h2 class="af-h2">Pinned</h2><ul class="af-rows">' + pinned.map(row).join('') + '</ul></section>' +
        '<section data-group><h2 class="af-h2">Recent activity</h2><ul class="af-rows">' + rest.map(row).join('') + '</ul></section>' +
        emptyNote() + listPager();
    },
    topic: function (phone) {
      var id = state.topic, t = item(id), th = thread(id), first = th.posts[0], ai = teamAnswer(id);
      var opener = isTeam(first.by);
      var verb = 'posted';
      function who(p, i, tag) {
        return '<div class="af-who">' + face(p.by, phone ? 30 : 32) + '<span class="af-who-line"><span class="who-name">' + esc(p.by) + '</span>' +
          (when(th, p) ? '<span class="who-when">' + when(th, p) + '</span>' : '') +
          (isTeam(p.by) ? '<span class="team-tag">' + (tag || 'Your Best Grade team') + '</span>' : '') + '</span></div>';
      }
      var lift = ai > 0 ? '<section class="af-answer" aria-labelledby="af-ans-h"><h2 id="af-ans-h">Answer from the team</h2>' +
        '<div class="af-who">' + face(th.posts[ai].by, 32) + '<span class="af-who-line"><span class="who-name">' + esc(th.posts[ai].by) + '</span><span class="af-role">' + TEAM[th.posts[ai].by] + '</span>' +
        (when(th, th.posts[ai]) ? '<span class="who-when">' + when(th, th.posts[ai]) + '</span>' : '') + '</span></div>' +
        '<div class="ptext">' + paras(th.posts[ai].text) + '</div>' +
        '</section>' : '';
      var rest = th.posts.slice(1).map(function (p, j) {
        var i = j + 1;
        if (i === ai) return '';
        return '<li class="af-reply' + (isTeam(p.by) ? ' is-team' : '') + '" id="post-' + i + '">' + who(p, i) +
          '<div class="ptext af-rtext">' + paras(p.text) + '</div></li>';
      }).join('');
      var n = th.total - 1;
      return '<a class="back" href="#" data-back>' + I.back + esc(F.name) + '</a>' +
        '<h1 class="h1 af-q-title">' + esc(t.title) + '</h1>' +
        '<div class="af-asker">' + face(first.by, 28) + '<span>' + esc(first.by) + (opener ? ' <span class="team-tag">Your Best Grade team</span>' : '') + ' ' + verb + (when(th, first) ? ' ' + when(th, first) : '') + '</span></div>' +
        '<div class="ptext af-question">' + paras(first.text) + '</div>' + lift +
        (n > 0 && (ai < 0 || n > 1) ? '<h2 class="af-h2 af-h2--replies">' + (ai > 0 ? (n - 1 === 1 ? '1 other reply' : fmt(n - 1) + ' other replies') : (n === 1 ? '1 reply' : fmt(n) + ' replies')) + '</h2><ol class="af-replies">' + rest + '</ol>' + topicPager(th, true)
          : '<p class="af-noreply">No replies yet.</p>') +
        composer(t.pinned || opener ? 'Reply to this topic' : 'Your answer');
    }
  };

  // ================= Version: Compact table =================
  var table = {
    list: function (phone) {
      var pinned = F.list.filter(function (t) { return t.pinned; }), rest = F.list.filter(function (t) { return !t.pinned; });
      function icon(t) { return '<span class="tb-ic' + (t.read ? '' : ' is-unread') + '">' + (t.pinned ? I.pin : t.read ? I.bubble : I.bubbleFill) + '</span>'; }
      if (phone) {
        var li = function (t) {
          return '<li data-row data-title="' + esc(t.title) + '"' + (matches(t) ? '' : ' hidden') + '><a class="tb-item' + (t.read ? '' : ' is-unread') + (t.pinned ? ' is-pinned' : '') + '" href="#" data-open="' + t.id + '">' + icon(t) +
            '<span class="tb-main"><span class="tb-t">' + esc(t.title) + '</span><span class="tb-m num">' + replies(t) + ' · ' + (t.lastAgo ? shortAgo(t.lastAgo) + ' · ' : '') + esc(t.lastBy) + '</span></span></a></li>';
        };
        return listHead(phone) + '<div class="tb-phone"><ul class="tb-list" data-group>' + pinned.map(li).join('') + '</ul><ul class="tb-list" data-group>' + rest.map(li).join('') + '</ul></div>' + emptyNote() + listPager();
      }
      function tr(t) {
        return '<tr data-row data-title="' + esc(t.title) + '" class="' + (t.read ? '' : 'is-unread ') + (t.pinned ? 'is-pinned' : '') + '"' + (matches(t) ? '' : ' hidden') + ' data-open="' + t.id + '">' +
          '<td><div class="tb-topic">' + icon(t) + '<a href="#" data-open="' + t.id + '">' + esc(t.title) + '</a></div></td>' +
          '<td class="r num">' + fmt(t.posts - 1) + '</td><td class="r num">' + fmt(t.views) + '</td>' +
          '<td class="tb-last" title="' + (t.lastAgo ? t.lastAgo + ' by ' : 'by ') + esc(t.lastBy) + '">' + (t.lastAgo ? '<span class="tb-ago">' + shortAgo(t.lastAgo) + '</span> · ' : '') + '<span class="tb-by">' + esc(t.lastBy) + '</span></td></tr>';
      }
      return listHead(phone) + listPager('top') + '<table class="tb"><colgroup><col><col class="c-n"><col class="c-v"><col class="c-l"></colgroup>' +
        '<thead><tr><th scope="col">Topic</th><th scope="col" class="r">Replies</th><th scope="col" class="r">Views</th><th scope="col">Last post</th></tr></thead>' +
        '<tbody class="tb-pinned" data-group>' + pinned.map(tr).join('') + '</tbody><tbody data-group>' + rest.map(tr).join('') + '</tbody></table>' + emptyNote() + listPager();
    },
    topic: function (phone) {
      var id = state.topic, t = item(id), th = thread(id);
      var posts = th.posts.map(function (p, i) {
        var team = isTeam(p.by);
        return '<li class="tb-post' + (team ? ' is-team' : '') + '" id="post-' + i + '"><header class="tb-ph">' + face(p.by, 28) +
          '<span class="who-name">' + esc(p.by) + '</span>' + (team ? '<span class="team-tag">Your Best Grade team</span>' : '<span class="tb-count num">' + fmt(p.n) + (p.n === 1 ? ' post' : ' posts') + '</span>') +
          '<span class="tb-ph-r">' + (when(th, p) ? '<span class="who-when">' + (phone ? shortAgo(when(th, p)) : when(th, p)) + '</span>' : '') + '<span class="tb-no num">#' + (i + 1) + '</span></span></header>' +
          '<div class="ptext tb-text">' + paras(p.text) + '</div></li>';
      }).join('');
      return '<nav class="tb-crumb" aria-label="Breadcrumb"><a href="#" data-back>' + esc(F.name) + '</a>' + I.next + '<span>' + esc(t.title) + '</span></nav>' +
        '<h1 class="h1">' + esc(t.title) + '</h1>' +
        '<div class="tb-bar"><span class="counts num">' + fmt(th.total) + (th.total === 1 ? ' post' : ' posts') + people(th) + '</span>' + topicPager(th, false) + '<a class="btn btn--ghost" href="#reply" data-jump="reply">' + I.pen + 'Reply</a></div>' +
        '<ol class="tb-posts">' + posts + '</ol>' + topicPager(th, true) + composer('Reply to topic');
    }
  };

  // ================= Version: Front page =================
  var frontpage = {
    list: function (phone) {
      var pinned = F.list.filter(function (t) { return t.pinned; }), rest = F.list.filter(function (t) { return !t.pinned; });
      function pin(t) {
        var s = starter(t.id);
        return '<li data-row data-title="' + esc(t.title) + '"' + (matches(t) ? '' : ' hidden') + '><a class="fp-pin' + (t.read ? '' : ' is-unread') + '" href="#" data-open="' + t.id + '">' +
          '<span class="fp-pin-t">' + esc(t.title) + '</span>' + (s && !phone ? '<span class="fp-pin-x">' + esc(excerpt(s.text, 96)) + '</span>' : '') + (t.read ? '' : '<span class="sr">Unread</span>') +
          '<span class="fp-pin-m num">' + replies(t) + '</span></a></li>';
      }
      function story(t) {
        var s = starter(t.id), th = thread(t.id);
        var meta = (s ? esc(s.by) + (when(th, s) ? ' · ' + when(th, s) : '') + ' · ' : '') + replies(t) + (!phone && t.posts > 1 && t.lastAgo ? ' · last reply ' + t.lastAgo : '');
        return '<li data-row data-title="' + esc(t.title) + '"' + (matches(t) ? '' : ' hidden') + '><a class="fp-story' + (t.read ? '' : ' is-unread') + '" href="#" data-open="' + t.id + '">' +
          '<span class="fp-hl">' + esc(t.title) + '</span>' + (t.read ? '' : '<span class="sr">Unread</span>') + (s ? '<span class="fp-ex">' + esc(excerpt(s.text, 210)) + '</span>' : '') +
          '<span class="fp-meta num">' + meta + '</span></a></li>';
      }
      return listHead(phone) +
        '<section class="fp-pinned" data-group><h2 class="fp-h2">Pinned</h2><ul>' + pinned.map(pin).join('') + '</ul></section>' +
        '<section data-group><h2 class="fp-h2">Recent activity</h2><ul class="fp-stories">' + rest.map(story).join('') + '</ul></section>' +
        emptyNote() + listPager();
    },
    topic: function (phone) {
      var id = state.topic, t = item(id), th = thread(id), first = th.posts[0];
      var letters = th.posts.slice(1).map(function (p, j) {
        var team = isTeam(p.by);
        return '<li class="fp-letter' + (team ? ' is-team' : '') + '" id="post-' + (j + 1) + '"><p class="fp-from"><span class="who-name">' + esc(p.by) + '</span>' +
          (when(th, p) ? '<span class="who-when">' + when(th, p) + '</span>' : '') + (team ? '<span class="team-tag">Your Best Grade team</span>' : '') + '</p>' +
          '<div class="ptext fp-ltext">' + paras(p.text) + '</div></li>';
      }).join('');
      var n = th.total - 1;
      return '<a class="back" href="#" data-back>' + I.back + esc(F.name) + '</a>' +
        '<h1 class="fp-title">' + esc(t.title) + '</h1>' +
        '<div class="fp-byline">' + face(first.by, 32) + '<span><span class="who-name">' + esc(first.by) + '</span>' + (isTeam(first.by) ? ' <span class="team-tag">Your Best Grade team</span>' : '') +
        (when(th, first) ? '<span class="who-when">' + when(th, first) + '</span>' : '') + '</span></div>' +
        '<div class="ptext fp-lead">' + paras(first.text) + '</div>' +
        (n > 0 ? '<h2 class="fp-h2 fp-h2--letters">' + (n === 1 ? '1 reply' : fmt(n) + ' replies') + '</h2><ol class="fp-letters">' + letters + '</ol>' + topicPager(th, true) : '') +
        composer('Reply to this topic');
    }
  };

  // ================= Version: Updated original =================
  // The list students know (the compact table) and the topic read as one column
  var original = { list: table.list, topic: conversation.topic };

  var V = { original: original, conversation: conversation, answer: answer, table: table, frontpage: frontpage }[VERSION];
  function page(phone) { return frame(phone, state.page === 'topic' ? V.topic(phone) : V.list(phone)); }

  // ---------- render ----------
  var stage = document.getElementById('stage');
  function render() {
    if (state.screen === 'phone' && document.body.getAttribute('data-solo') === '1') {
      stage.innerHTML = page(true);
    } else if (state.screen === 'laptop') {
      stage.innerHTML = page(false);
    } else {
      stage.innerHTML = [390, 446].map(function (w) {
        return '<figure class="device"><div class="bezel"><div class="screen" style="width:' + w + 'px;height:705px"><div class="scroller">' + page(true) + '</div></div></div><figcaption>' + w + ' × 705</figcaption></figure>';
      }).join('');
    }
    applyFilter();
    document.querySelectorAll('.mock-seg').forEach(function (seg) {
      var k = seg.getAttribute('data-key');
      seg.querySelectorAll('button').forEach(function (b) {
        var v = b.getAttribute('data-value');
        b.setAttribute('aria-pressed', String(k === 'topic' ? state.page === 'topic' && v === state.topic : v === state[k]));
      });
    });
  }
  function toTop() {
    if (state.screen === 'phone' && document.body.getAttribute('data-solo') !== '1') stage.querySelectorAll('.scroller').forEach(function (s) { s.scrollTop = 0; });
    else window.scrollTo(0, 0);
  }
  // Search filters the rows in place, so the field keeps focus while typing
  function applyFilter() {
    stage.querySelectorAll('.content').forEach(function (root) {
      var shown = 0;
      root.querySelectorAll('[data-row]').forEach(function (r) {
        var t = item(r.querySelector('[data-open]') ? r.querySelector('[data-open]').getAttribute('data-open') : r.getAttribute('data-open'));
        var ok = t && matches(t);
        if (ok && VERSION === 'answer' && state.filter !== 'all') { var k = r.getAttribute('data-k'); ok = (state.filter === 'answered' && k === 'answered') || (state.filter === 'none' && k === 'none'); }
        r.hidden = !ok; if (ok) shown++;
      });
      root.querySelectorAll('[data-group]').forEach(function (g) {
        var any = [].some.call(g.querySelectorAll('[data-row]'), function (r) { return !r.hidden; });
        g.hidden = !any;
      });
      var e = root.querySelector('[data-empty]');
      if (e) { e.hidden = shown > 0 || !state.q; var q = e.querySelector('[data-q]'); if (q) q.textContent = state.q; }
      var tb = root.querySelector('table.tb'); if (tb) tb.hidden = shown === 0;
      var pg = root.querySelector('[data-row]') && root.querySelector(':scope > .pager'); if (pg) pg.hidden = !!state.q;
    });
  }

  document.querySelector('.mock-bar').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-value]'); if (!b) return;
    var k = b.parentNode.getAttribute('data-key'), v = b.getAttribute('data-value');
    if (k === 'topic') { state.topic = v; state.page = 'topic'; }
    else state[k] = v;
    writeHash(); render(); toTop();
  });
  stage.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]');
    if (o) { e.preventDefault(); state.topic = o.getAttribute('data-open'); state.page = 'topic'; writeHash(); render(); toTop(); return; }
    var bk = e.target.closest('[data-back]');
    if (bk) { e.preventDefault(); state.page = 'list'; writeHash(); render(); toTop(); return; }
    var f = e.target.closest('[data-filter]');
    if (f) { state.filter = f.getAttribute('data-filter'); render(); return; }
    var x = e.target.closest('[data-expand]');
    if (x) { var li = x.closest('li'); li.querySelector('.af-rtext').hidden = false; x.parentNode.remove(); return; }
    var c = e.target.closest('[data-clear]');
    if (c) { state.q = ''; stage.querySelectorAll('.search input').forEach(function (i) { i.value = ''; }); applyFilter(); return; }
    var j = e.target.closest('[data-jump]');
    if (j) {
      e.preventDefault();
      var key = j.getAttribute('data-jump'), root = j.closest('.scroller') || document;
      var el = root.querySelector(key === 'reply' ? '#reply' : '#post-' + key);
      if (el) {
        var sc = j.closest('.scroller');
        if (sc) sc.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' });
        else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (document.querySelector('.mock-bar').offsetHeight + 16), behavior: 'smooth' });
        el.classList.remove('is-flash'); void el.offsetWidth; el.classList.add('is-flash');
      }
      return;
    }
    var a = e.target.closest('a[href^="#"]'); if (a) e.preventDefault();
  });
  stage.addEventListener('input', function (e) {
    if (e.target.matches('.search input')) {
      state.q = e.target.value.trim();
      stage.querySelectorAll('.search input').forEach(function (i) { if (i !== e.target) i.value = e.target.value; });
      applyFilter();
    }
    if (e.target.matches('[data-reply]')) {
      var btn = e.target.closest('.composer').querySelector('[data-post]');
      btn.disabled = !e.target.value.trim();
    }
  });

  function readHash() {
    var h = new URLSearchParams(location.hash.slice(1));
    if (h.get('page') === 'topic' || h.get('page') === 'list') state.page = h.get('page');
    if (h.get('topic') && F.threads[h.get('topic')]) state.topic = h.get('topic');
    if (h.get('screen') === 'phone' || h.get('screen') === 'laptop') state.screen = h.get('screen');
    document.body.setAttribute('data-solo', h.get('solo') === '1' ? '1' : '0');
  }
  function writeHash() {
    var h = new URLSearchParams(location.hash.slice(1));
    h.set('page', state.page); h.set('topic', state.topic); h.set('screen', state.screen);
    history.replaceState(null, '', '#' + h.toString());
    document.body.setAttribute('data-screen', state.screen);
  }
  readHash(); document.body.setAttribute('data-screen', state.screen); render();
  addEventListener('hashchange', function () { readHash(); document.body.setAttribute('data-screen', state.screen); render(); toTop(); });
})();
