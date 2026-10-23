// Version «Tutor» (YBG-1877, round 4): the page says what to do next. Without the new features it is the next lesson;
// with them it is today's short list built from the student's pace, and a small Ask Claire bar under it.
(function () {
  // Hand-drawn icon set: round caps, slightly uneven lines
  var D = {
    home: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.2 8.6c3.1-.1 5.4 2.4 5.3 5.5-.1 3-2.5 5.3-5.5 5.2-3-.1-5.2-2.6-5.1-5.5.1-2.9 2.4-5.1 5.3-5.2z"/><path d="M14 3.2v2.1M14.1 22.7v2.2M3.3 14.1h2.1M22.6 13.9h2.2M6.4 6.5l1.5 1.4M20.1 20.2l1.6 1.5M6.5 21.6l1.4-1.5M20.2 7.9l1.5-1.5"/></svg>',
    lessons: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.3 6.4c3.3-.9 6.8-.6 9.7 1.3v14.6c-2.9-1.8-6.4-2.2-9.6-1.4z"/><path d="M23.7 6.3c-3.3-.8-6.8-.5-9.7 1.4v14.6c2.9-1.9 6.3-2.3 9.6-1.5z"/></svg>',
    tests: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.6 5.2H6.7c-1 0-1.6.7-1.6 1.7l.2 15.3c0 1 .7 1.6 1.7 1.6h14.2c1 0 1.6-.7 1.6-1.7l-.1-15.3c0-.9-.7-1.6-1.6-1.6h-1.9"/><path d="M10.2 3.9h7.5l.3 3.1h-8z"/><path d="M9.6 13.6l2 2 3.7-4.1M9.8 19.6h8.3"/></svg>',
    forum: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.6 6.8c0-1.3 1-2.2 2.3-2.2h9.6c1.3 0 2.2 1 2.2 2.3l-.1 5.8c0 1.2-1 2.2-2.3 2.2H10l-3.8 3.1.2-3.1h-.7c-.6 0-1.2-.6-1.2-1.3z"/><path d="M21.5 10.4h.6c1.2 0 2.1 1 2.1 2.2l-.1 5.4c0 1.2-.9 2.1-2.1 2.1h-.6l.2 2.9-3.6-2.9h-5.3c-1.1 0-2-.7-2.3-1.7"/></svg>',
    ask: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.3 4.6c5.3-.1 9.4 3.4 9.3 7.9-.1 4.4-4.3 7.8-9.5 7.7-1.2 0-2.3-.2-3.3-.5l-4.6 2.6.9-4.4c-1.6-1.4-2.6-3.3-2.5-5.4.1-4.5 4.4-7.9 9.7-7.9z"/><path d="M13.9 9.1l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.2 12.1h13.4M13.1 6.2l5.9 5.9-6 5.9"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19.2V5.3M6.2 10.9l5.8-5.8 5.9 5.8"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.3 12.6l4.4 4.3 9-9.6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8.6 6.2c0-.8.9-1.3 1.6-.9l8.1 5.1c.7.4.7 1.4 0 1.8l-8.1 5.2c-.7.4-1.6-.1-1.6-.9z"/></svg>',
    gear: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.1 10.3c2.1 0 3.7 1.7 3.7 3.8s-1.7 3.7-3.8 3.7-3.7-1.7-3.7-3.8 1.7-3.7 3.8-3.7z"/><path d="M12.4 3.6h3.3l.6 3 2.4 1.4 2.9-1 1.7 2.9-2.3 2v2.8l2.3 2-1.7 2.9-2.9-1-2.4 1.4-.6 3h-3.3l-.6-3-2.4-1.4-2.9 1-1.7-2.9 2.3-2v-2.8l-2.3-2 1.7-2.9 2.9 1 2.4-1.4z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5.2v13.6M5.2 12h13.6"/></svg>'
  };
  var planOpen = {};

  function rail(m, R, phone) {
    var view = R.state.view;
    var items = [['home', 'Home', ' data-view="home"', view === 'home'], ['lessons', 'Lessons', ' data-view="lessons"', view === 'lessons'],
      ['tests', 'Tests', R.go('The Practice tests page (/a2/practice_tests)'), false], ['ask', 'Questions', ' data-view="questions"', view === 'questions'],
      ['forum', 'Forum', R.go('The Forum (/a2/forums)'), false]];
    var links = items.map(function (it) {
      return '<a href="#" class="tu-ri' + (it[3] ? ' is-on' : '') + '"' + it[2] + (it[3] ? ' aria-current="page"' : '') + '><span class="tu-ri-ic">' + D[it[0]] + '</span><span>' + it[1] + '</span></a>';
    }).join('');
    if (phone) return '<nav class="tu-tabbar" aria-label="Member area">' + links + '</nav>';
    return '<nav class="tu-rail" aria-label="Member area">' + links + '<div class="tu-ri-me-w"><button type="button" class="tu-ri tu-ri-me" data-pop="profile" aria-expanded="' + (R.state.pop === 'profile') + '">' +
      '<img src="assets/avatar.png" alt=""><span>' + R.NAME + '</span></button>' + (R.state.pop === 'profile' ? R.profileMenu() : '') + '</div></nav>';
  }

  function topbar(m, R, phone) {
    var S = m.S, exam = '';
    // The exam capsule is the only exam detail on the page; it opens Exam settings
    if (m.nf) {
      exam = S.exam
        ? '<a href="#" class="tu-exam" data-view="settings"><b>' + R.days(S.exam.days) + (phone ? ' left' : '') + '</b>' + (phone ? '' : '<span>to your exam, ' + S.exam.date + '</span><em>Change</em>') + '</a>'
        : '<a href="#" class="tu-exam is-empty" data-view="settings">' + D.plus + '<span>' + (phone ? 'Exam date' : 'Add your exam date') + '</span></a>';
    }
    var me = phone ? '<div class="tu-me-w"><button type="button" class="tu-me" data-pop="profile" aria-expanded="' + (R.state.pop === 'profile') + '" aria-label="Your account"><img src="assets/avatar.png" alt="">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
      (R.state.pop === 'profile' ? R.profileMenu() : '') + '</div>' : '';
    return '<header class="tu-top"><a href="#" class="tu-logo" data-view="home"><img src="assets/a2-logo.png" alt="Your Best Grade, HESI A2 MasterClass"></a>' +
      '<div class="tu-tools">' + exam + '' + me + '</div></header>';
  }

  function planStrip(m, R, phone) {
    var open = planOpen[m.key] != null ? planOpen[m.key] : m.done === 0 && !phone;
    var dots = m.steps.map(function (st, n) {
      return '<span class="tu-pd is-' + st.state + '">' + (st.state === 'done' ? D.check : n + 1) + '</span>';
    }).join('<i aria-hidden="true"></i>');
    var cs = m.cur > -1 ? m.steps[m.cur] : null, cp = cs ? R.PLAN[cs.k] : null;
    var list = open ? '<ol class="tu-plan-list">' + m.steps.map(function (st, n) {
      var p = R.PLAN[st.k];
      return '<li class="is-' + st.state + '"><span class="tu-pd is-' + st.state + '">' + (st.state === 'done' ? D.check : n + 1) + '</span>' +
        '<div><h3>' + p.title + '</h3><p>' + p.text + '</p></div></li>';
    }).join('') + '</ol>' : '';
    return '<section class="tu-plan' + (open ? ' is-open' : '') + '" aria-label="Game plan"><div class="tu-plan-row">' +
      // Claire's line about the plan shows with the plan itself; on its own it read as a slogan
      (open ? '<p class="tu-plan-lead">Here\'s the game plan, simple and stress-free:</p>' : '<div class="tu-pdots" role="img" aria-label="Step ' + (m.cur + 1) + ' of 4">' + dots + '</div>') +
      (cp && !open ? '<p class="tu-plan-now"><span>Claire&#39;s plan, step ' + (m.cur + 1) + ' of 4</span><b>' + cp.title + '</b></p>' : '') +
      '<button type="button" class="tu-plan-tg" data-tplan aria-expanded="' + open + '">' + (open ? 'Hide the plan' : 'Show the plan') + '</button></div>' + list + '</section>';
  }

  // Without the new features: the next lesson, as the live site's Continue learning, in the teal field
  function upNext(m, R) {
    var h, meta, btn, where;
    if (m.next && m.S.done !== 'all') {
      var s = m.next.sec;
      h = m.next.title; meta = (s.intro ? 'Intro section' : s.name) + ' · lesson ' + (m.next.idx + 1) + ' of ' + s.total;
      btn = m.done === 0 ? 'Start learning' : 'Continue learning'; where = 'The lesson page: ' + h;
    } else {
      h = 'Time for the practice tests'; meta = "All lessons are done. Score over 90%, and you're more than ready for the real exam.";
      btn = 'Go to practice tests'; where = 'The Practice tests page (/a2/practice_tests)';
    }
    return '<section class="tu-today is-next" aria-label="Up next"><div class="tu-today-h"><h2>Up next</h2></div>' +
      '<h3 class="tu-next">' + h + '</h3><p class="tu-next-meta">' + meta + '</p>' +
      '<div class="tu-go"><a href="#" class="tu-cta"' + R.go(where) + '><span>' + btn + '</span><i>' + D.arrow + '</i></a>' +
      '<a href="#" class="tu-whole" data-view="lessons">See all lessons</a></div>' + progressLine(m) + '</section>';
  }

  function progressLine(m) {
    if (!m.left) return '';
    if (m.done === 0) return '<p class="tu-sum">' + m.total + ' lessons' + (m.chosen ? ' in your plan' : '') + '. Videos are 6 to 9 minutes, with a short quiz after each.</p>';
    return '<div class="tu-sumbar"><div class="tu-sumbar-t"><span><b>' + m.done + '</b> of ' + m.total + ' lessons' + (m.chosen ? ' in your plan' : '') + '</span><span>' + (m.left ? m.left + ' to go' : 'All done') + '</span></div>' +
      '<span class="tu-sumbar-track"><i style="width:' + (m.done / m.total * 100).toFixed(1) + '%"></i></span></div>';
  }

  // Today (new): the list follows rules a developer can build, nothing is hand-picked.
  // Lessons: the next ones in course order, as many as the pace asks for (2 without an exam date).
  function lessonsAhead(m, n) {
    var out = [], secs = m.mine.filter(function (s) { return s.done < s.total; });
    // The subject in progress comes first, as Continue learning does
    secs.sort(function (a, b) { return (b.done > 0) - (a.done > 0); });
    for (var i = 0; i < secs.length && out.length < n; i++) {
      for (var j = secs[i].done; j < secs[i].total && out.length < n; j++) out.push({ sec: secs[i], idx: j, title: secs[i].lessons[j] });
    }
    return out;
  }

  function tasks(m, R) {
    var items = [];
    if (m.done === 0) {
      var intro = m.secs[0];
      items.push({ kind: 'Lesson', title: intro.lessons[0], why: 'Start here. Claire shows you how everything works around here.', meta: 'Intro section · lesson 1 of 4', where: 'The lesson page: ' + intro.lessons[0] });
      items.push({ kind: 'Quiz', title: 'Diagnostic quiz', why: '40 questions, about 40 minutes. Tomorrow\'s list builds on what it shows.', meta: 'Intro section · lesson 4 of 4', where: 'The lesson page: Diagnostic Test' });
      return { time: 'about 1 hour', items: items, rule: 'Claire\'s plan starts with the intro section and the diagnostic quiz.' };
    }
    if (m.S.done !== 'all' && m.next) {
      var p = R.pace(m), n = p ? Math.min(p.perDay, 4) : 2;
      lessonsAhead(m, n).forEach(function (l, i) {
        var weak = l.sec.diag != null && l.sec.diag <= 2;
        items.push({ kind: 'Lesson', title: l.title, where: 'The lesson page: ' + l.title,
          why: i === 0 ? 'Next in ' + l.sec.name + (weak ? ', a weak spot on your diagnostic quiz.' : '.') : 'Right after it, so you stay at ' + n + ' a day.',
          meta: l.sec.name + ' · lesson ' + (l.idx + 1) + ' of ' + l.sec.total });
      });
      // The pace already says how many a day and why; the list adds only what tomorrow brings
      var rule = (p ? p.text : '2 lessons a day until you add your exam date.') + ' Tomorrow you get the next ' + n + '.';
      return { time: 'about ' + (n * 10) + ' min', items: items, rule: rule };
    }
    var low = m.myTests.filter(function (t) { return t.score != null && t.score < m.PASS; }).sort(function (a, b) { return a.score - b.score; });
    if (m.nextTest && m.nextTest.score == null) {
      var nt = m.nextTest;
      items.push({ kind: 'Test', title: nt.name, q: nt.q, meta: nt.q + ' questions', where: 'The practice test: ' + nt.name, why: 'You have not taken this one yet. ' + R.plural(m.untaken, 'test') + ' in your subjects are still to take.' });
    }
    low.slice(0, items.length ? 1 : 2).forEach(function (t) {
      items.push({ kind: 'Retake', title: t.name, q: t.q, meta: 'Last time ' + t.score + '% · go through the answers and rationales first', where: 'The practice test: ' + t.name,
        why: (m.PASS - t.score) + " points short of Claire's 90%." });
    });
    var mins = items.reduce(function (a, x) { return a + (x.q || 0); }, 0);
    return { time: 'about ' + (mins > 60 ? Math.round(mins / 30) / 2 + ' hours' : mins + ' min'), items: items, rule: 'All lessons are done: one test you have not taken, then the lowest score under 90%.' };
  }

  function today(m, R) {
    var t = tasks(m, R);
    var list = t.items.map(function (x, i) {
      return '<li class="tu-task"><span class="tu-task-n">' + (i + 1) + '</span>' +
        '<div class="tu-task-b"><h3>' + x.title + '</h3><p class="tu-why">' + x.why + '</p>' +
        '<p class="tu-meta">' + x.kind + (x.meta ? ' · ' + x.meta : '') + '</p></div></li>';
    }).join('');
    var first = t.items[0];
    var cta = first ? '<a href="#" class="tu-cta"' + R.go(first.where) + '><span>' + (m.done === 0 ? 'Start learning' : first.kind === 'Lesson' ? 'Continue learning' : first.kind === 'Retake' ? 'Retake the test' : 'Take the test') + '</span><i>' + D.arrow + '</i></a>' : '';
    var p = m.S.done !== 'all' && m.done > 0 ? R.pace(m) : null;
    return '<section class="tu-today" aria-label="Today"><div class="tu-today-h"><h2>Today</h2><span class="tu-time">' + t.time + '</span>' + R.tag('is-light') + '</div>' +
      '<div class="tu-go">' + cta + (m.allLessonsDone ? '<a href="#" class="tu-whole"' + R.go('The Practice tests page (/a2/practice_tests)') + '>See all practice tests</a>'
        : '<a href="#" class="tu-whole" data-view="lessons">See all lessons</a>') + '</div>' +
      '<ol class="tu-tasks">' + list + '</ol>' +
      '<p class="tu-rule' + (p && p.warn ? ' is-warn' : '') + '">' + t.rule + '</p>' + progressLine(m) + '</section>';
  }

  function subjects(m, R) {
    var cur = m.next && m.S.done !== 'all' ? m.next.sec.id : null;
    var rows = m.mine.map(function (s) {
      var pct = s.done / s.total * 100, done = s.done >= s.total;
      return '<li class="tu-subj' + (done ? ' is-done' : '') + (s.id === cur ? ' is-here' : '') + '"><div class="tu-subj-top"><span class="tu-subj-n">' + s.name + '</span>' +
        '<span class="tu-subj-c">' + (done ? D.check + 'All ' + s.total + ' lessons' : s.done === 0 ? s.total + ' lessons' : s.done + ' of ' + s.total) + '</span></div>' +
        (s.done > 0 ? '<span class="tu-bar"><i style="width:' + pct.toFixed(1) + '%"></i></span>' : '') + (m.nf ? R.testsList(s, m) : '') + '</li>';
    }).join('');
    var off = m.nf && m.chosen && m.skipped.length
      ? '<p class="tu-off">Not on your exam: ' + m.skipped.map(function (s) { return s.name; }).join(', ') + '. <a href="#" data-view="settings">Change in Exam settings</a></p>' : '';
    return '<section class="tu-subjects" aria-label="Your subjects"><div class="tu-sec-h"><h2>' + (m.chosen ? 'Subjects on your exam' : 'Your subjects') + '</h2>' +
      (m.nf && m.taken.length ? R.tag() : '') + '<a href="#" class="tu-all" data-view="lessons">All lessons</a></div>' +
      R.testsLegend(m) + '<ul class="tu-subj-list">' + rows + '</ul>' + off + '</section>';
  }

  function remind(m) {
    if (!m.nf || m.setup !== 'skipped') return '';
    return '<a href="#" class="tu-remind" data-view="settings">' + D.plus + '<span><b>Tell us about your exam</b> and Today will count only your subjects.</span></a>';
  }

  // Shared parts on white, like the subjects
  function card(html) { return html ? '<div class="tu-card">' + html + '</div>' : ''; }

  function shell(m, R, phone, inner) {
    return '<div class="tu' + (phone ? ' is-phone' : '') + '">' + (phone ? '' : rail(m, R, false)) +
      '<div class="tu-main">' + topbar(m, R, phone) + inner + '</div>' + (phone ? rail(m, R, true) : '') + '</div>';
  }

  window.R4V = {
    render: function (m, phone) {
      var R = window.R4, v = R.state.view;
      if (v === 'setup') {
        return '<div class="tu is-setup' + (phone ? ' is-phone' : '') + '"><div class="tu-main"><header class="tu-top is-bare"><span class="tu-logo"><img src="assets/a2-logo.png" alt="Your Best Grade, HESI A2 MasterClass"></span></header>' +
          '<div class="tu-sheet">' + R.setupView(m) + '</div></div></div>';
      }
      if (v === 'settings') return shell(m, R, phone, '<div class="tu-sheet">' + R.settingsView(m) + '</div>');
      if (v === 'lessons') return shell(m, R, phone, '<div class="tu-sheet">' + R.lessonsView(m) + '</div>');
      if (v === 'questions') return shell(m, R, phone, '<div class="tu-sheet">' + R.questionsView(m) + '</div>');
      return shell(m, R, phone,
        '<div class="tu-hello"><h1>Hey there, ' + R.NAME + '! <span aria-hidden="true">👋</span></h1></div>' +
        planStrip(m, R, phone) + remind(m) + (m.nf ? today(m, R) : upNext(m, R)) + card(R.answers(m)) + card(R.diagnostic(m)) + subjects(m, R));
    },
    onClick: function (e, R) {
      var tp = e.target.closest('[data-tplan]');
      if (tp) { planOpen[R.state.state] = tp.getAttribute('aria-expanded') !== 'true'; R.rerender(); return true; }
      return false;
    }
  };
})();
